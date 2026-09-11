# Integration Contract: Features 13 & Media Management (Admin Dispute Desk & Image Upload)

**AUTHOR:** Naim  
**FEATURES:** Image Upload & Media Management + Feature 13 (Admin Dispute Resolution Desk)  
**FEATURE BRANCH:** `feature/admin-media-disputes`  
**BASE BRANCH:** `sprint-3-staging`  
**DATE:** September 6, 2026  

> [!IMPORTANT]
> This document serves as a strict technical contract for the integration of Image Upload/Media Management and Feature 13 (Admin Dispute Resolution Desk). All team members (Rohan, Shan, Wasik) and their respective AI agents MUST adhere to the database schema changes, endpoint signatures, and UI routing defined below.

---

## 1. Database Schema Updates (Raw SQL)

One additive column is added to the `services` table to support media management and service portfolio cover images.

### Exact Raw SQL DDL (Run Once Against Database)

```sql
-- Feature: Image Upload & Media Management
-- Adds image_url to persist uploaded image paths for services
ALTER TABLE services
  ADD COLUMN image_url VARCHAR(500) NULL;
```

### Table Schema Summary (`services`)

| Column Name | Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY AUTO_INCREMENT` | Unique service identifier |
| `provider_id` | `INT` | `FOREIGN KEY -> users(id)` | Associated provider |
| `category_id` | `INT` | `FOREIGN KEY -> categories(id)` | Associated category |
| `name` | `VARCHAR(255)` | `NOT NULL` | Service name |
| `description` | `TEXT` | `NULL` | Service description |
| `base_price` | `DECIMAL(10,2)` | `NOT NULL` | Base price |
| `image_url` | `VARCHAR(500)` | `NULL` | **NEW** — URL to uploaded image file |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Row creation timestamp |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | Last updated timestamp |

---

## 2. Media Upload & Static Serving Architecture

### 2.1 Multer Configuration (`backend/middleware/uploadMiddleware.js`)

- **Storage Engine:** `multer.diskStorage` targeting `backend/uploads/`
- **Naming Strategy:** `${Date.now()}-${sanitizedOriginalName}` to prevent name collisions
- **Allowed MIME Types:** `image/jpeg`, `image/png`, `image/webp` (all other types rejected with HTTP 400)
- **File Size Limit:** 5 MB per file
- **Multipart Field Name:** `serviceImage`

### 2.2 Static Asset Serving

Static files located in `backend/uploads/` are publicly accessible at `/uploads/<filename>`:

```javascript
// Mounted in backend/server.js
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

---

## 3. API Routes & Signatures

### 3.1 POST `/api/upload/service-image` — Upload Service Image

- **Method:** `POST`
- **Access:** Authenticated (`protect` middleware)
- **Content-Type:** `multipart/form-data`
- **Form Field Name:** `serviceImage` (File: `.jpg`, `.jpeg`, `.png`, `.webp`, Max: 5MB)
- **Description:** Uploads a physical picture file to disk and returns its accessible URL.

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Image uploaded successfully.",
  "data": {
    "url": "http://localhost:5000/uploads/1725634500000-kitchen-sink.jpg",
    "filename": "1725634500000-kitchen-sink.jpg",
    "size": 245120
  }
}
```

#### Error Response (`400 Bad Request` — Missing File):
```json
{
  "success": false,
  "message": "No image file provided. Please attach a file using the \"serviceImage\" field."
}
```

#### Error Response (`400 Bad Request` — Invalid File Type):
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
}
```

---

### 3.2 Service Endpoints Extension (`POST /api/services` & `PUT /api/services/:id`)

Both service creation and update endpoints now support `image_url` in the request body payload:

```json
{
  "category_id": 1,
  "name": "Emergency Pipe Repair",
  "description": "Fixing leaking and damaged pipes",
  "base_price": 75.00,
  "image_url": "http://localhost:5000/uploads/1725634500000-kitchen-sink.jpg"
}
```

*Note: `image_url` is optional. Omitting it preserves backward compatibility.*

---

### 3.3 GET `/api/admin/disputes` — Fetch Disputed Bookings

- **Method:** `GET`
- **Access:** Admin only (`protect` + `isAdmin` middleware)
- **Headers:** `Authorization: Bearer <admin_token>`
- **Description:** Retrieves all bookings currently in `'Disputed'` status with full joined details for customer, provider, and service.

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 15,
      "status": "Disputed",
      "scheduled_date": "2026-09-10T00:00:00.000Z",
      "scheduled_time": "14:00:00",
      "total_price": "150.00",
      "created_at": "2026-09-06T10:00:00.000Z",
      "updated_at": "2026-09-06T11:30:00.000Z",
      "customer_name": "Rahim Khan",
      "customer_email": "rahim@example.com",
      "provider_name": "Sultan Electric",
      "provider_email": "sultan@example.com",
      "service_name": "Circuit Breaker Inspection"
    }
  ]
}
```

---

### 3.4 PUT `/api/admin/disputes/:id/resolve` — Forcefully Resolve Dispute

- **Method:** `PUT`
- **Access:** Admin only (`protect` + `isAdmin` middleware)
- **Headers:** `Authorization: Bearer <admin_token>`
- **URL Parameter:** `id` (`INT` — Booking ID)
- **Description:** Forces an administrative override on a disputed booking's status. Allowed target statuses are `'Completed'`, `'Cancelled'`, and `'In-Progress'`. Bypasses standard provider-only transition guards by design.

#### Request Body:
```json
{
  "status": "Cancelled"
}
```
*Allowed values for `status`: `"Completed"` | `"Cancelled"` | `"In-Progress"`*

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Dispute resolved. Booking status set to Cancelled."
}
```

#### Error Response (`400 Bad Request` — Invalid Resolution Status):
```json
{
  "success": false,
  "message": "Invalid resolution status. Must be one of: Completed, Cancelled, In-Progress."
}
```

#### Error Response (`404 Not Found`):
```json
{
  "success": false,
  "message": "Booking with ID 999 not found or is not in a Disputed state."
}
```

---

## 4. Frontend Components & Routing

### 4.1 New Page: `AdminDisputeDesk.jsx`
- **Path:** `frontend/src/pages/AdminDisputeDesk.jsx`
- **Route:** `/admin/disputes`
- **Access:** Authenticated / Admin
- **Features:**
  - Dynamic dispute badge counter & real-time refresh
  - Responsive table showing customer, provider, service, schedule, and price
  - One-click admin resolution action buttons:
    - `Complete`: Marks booking as `Completed`
    - `Cancel`: Marks booking as `Cancelled` (triggers refund policy flow)
    - `Reopen`: Resets booking to `In-Progress` for rework
  - Optimistic UI updates with instant row eviction and toast feedback

### 4.2 Frontend Service Helpers (`frontend/src/services/api.js`)
```javascript
import { fetchDisputedBookings, resolveDispute } from '../services/api';

// Fetch all disputes
const res = await fetchDisputedBookings();

// Resolve a dispute
const res = await resolveDispute(bookingId, 'Completed');
```

---

## 5. File Manifest Summary

| File | Status | Description |
| :--- | :--- | :--- |
| `backend/middleware/uploadMiddleware.js` | **NEW** | Multer disk storage and file type validation middleware |
| `backend/controllers/uploadController.js` | **NEW** | Handles file upload and constructs public file URLs |
| `backend/routes/uploadRoutes.js` | **NEW** | Route definition for `POST /api/upload/service-image` |
| `backend/uploads/.gitkeep` | **NEW** | Preserves local upload directory in Git |
| `backend/controllers/serviceController.js` | **MODIFIED** | Updated `createService` and `updateService` for `image_url` |
| `backend/controllers/adminController.js` | **MODIFIED** | Added `getDisputedBookings` and `resolveDispute` handlers |
| `backend/routes/adminRoutes.js` | **MODIFIED** | Mounted `/disputes` and `/disputes/:id/resolve` |
| `backend/server.js` | **MODIFIED** | Static `/uploads` mount and `/api/upload` route registration |
| `frontend/src/pages/AdminDisputeDesk.jsx` | **NEW** | Full-featured Admin Dispute Resolution Desk page |
| `frontend/src/App.jsx` | **MODIFIED** | Added `/admin/disputes` route inside `ProtectedRoute` |
| `frontend/src/services/api.js` | **MODIFIED** | Added `fetchDisputedBookings` and `resolveDispute` functions |
| `Week3_Naim_CONTRACT.md` | **NEW** | Sprint 3 integration contract |

---

## 6. Verification Checklist

- [x] `multer` dependency installed and configured cleanly in `backend/package.json`
- [x] File upload endpoint enforces image MIME type checking and 5MB size limit
- [x] Static directory `/uploads` served by Express
- [x] Services controller supports optional `image_url`
- [x] Admin dispute endpoints fetch disputed records and override status
- [x] Admin Dispute Desk UI displays data and supports resolution actions
- [x] Frontend routes configured under ProtectedRoute
- [x] All JS files validated without syntax errors
