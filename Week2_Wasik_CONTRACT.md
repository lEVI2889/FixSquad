# Sprint 2: Customer Operations (Features 1 & 2) - API & Component Contract

**Author:** Wasik  
**Role:** Customer Operations Lead  
**Branch:** `feature/customer-operations`  
**Status:** Completed, Verified & Tested Locally  

> [!IMPORTANT]
> This contract defines all newly established API endpoints, query parameter schemas, and React components for **Feature 1 (Dynamic Service Search & Filter)** and **Feature 2 (Interactive Booking Engine)**. All team members (@Shaan, @Rohan, @cosmos) should adhere to these interfaces for seamless integration.

---

## 1. Backend API Contracts

All endpoints are hosted under `/api`. Protected routes require a valid `Authorization: Bearer <jwt_token>` header.

### Feature 1: Dynamic Service Search & Filter

#### `GET /api/services/search`
* **Access:** Public (No auth required for customer exploration)
* **Description:** Searches and filters available squad services using SQL `LIKE` and parameterized `WHERE` filters with real-time sorting.
* **Query Parameters:**
  | Parameter | Type | Required | Description | Example |
  |---|---|---|---|---|
  | `keyword` | String | Optional | Matches `service.name`, `service.description`, or `category.name` | `fan`, `leak` |
  | `category_id` | Integer | Optional | Filters by primary category ID | `1`, `2` |
  | `min_price` | Number | Optional | Minimum base price filter | `500` |
  | `max_price` | Number | Optional | Maximum base price filter | `2000` |
  | `sort` | String | Optional | Sorting order: `price_asc`, `price_desc`, `rating_desc`, `newest` | `price_asc` |

* **Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "provider_id": 1,
      "category_id": 1,
      "name": "Switch & Socket Installation and Repair",
      "description": "Safe and certified replacement of wall sockets, MCB circuit breakers, and short-circuit repair.",
      "base_price": 800.00,
      "category_name": "Electrical & Wiring",
      "category_icon": "⚡",
      "provider_name": "Arif Rahman",
      "provider_rating": 4.9,
      "total_reviews": 128,
      "created_at": "2026-08-30T10:00:00.000Z"
    }
  ]
}
```

---

### Feature 2: Interactive Booking Engine

#### `GET /api/bookings/check-availability`
* **Access:** Public / Customer
* **Description:** Computes real-time time slot availability for a given provider and date by cross-referencing `provider_availability` (blocked blocks) and existing active `bookings`.
* **Query Parameters:**
  | Parameter | Type | Required | Description |
  |---|---|---|---|
  | `provider_id` | Integer | **Required** | The target service provider's ID |
  | `date` | String | **Required** | Date in `YYYY-MM-DD` format |

* **Response (200 OK):**
```json
{
  "success": true,
  "provider_id": 1,
  "date": "2026-09-15",
  "slots": [
    { "time": "09:00:00", "label": "9:00 AM", "available": true, "reason": "Available" },
    { "time": "10:00:00", "label": "10:00 AM", "available": false, "reason": "Provider Unavailable / Blocked" },
    { "time": "11:00:00", "label": "11:00 AM", "available": true, "reason": "Available" },
    { "time": "14:00:00", "label": "2:00 PM", "available": true, "reason": "Available" },
    { "time": "16:00:00", "label": "4:00 PM", "available": true, "reason": "Available" }
  ]
}
```

---

#### `POST /api/bookings`
* **Access:** Protected (`req.user.id` as customer)
* **Description:** Inserts a new customer booking into the shared `bookings` table with default `status = 'Pending'`. Prevents double-booking and checks provider blocked intervals before insertion.
* **Headers:** `Authorization: Bearer <token>`
* **Request Body (JSON):**
```json
{
  "service_id": 1,
  "provider_id": 1,
  "scheduled_date": "2026-09-15",
  "scheduled_time": "11:00:00",
  "notes": "Please check bedroom switch"
}
```

* **Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking created successfully! Your request is pending provider confirmation.",
  "data": {
    "id": 3,
    "customer_id": 3,
    "provider_id": 1,
    "service_id": 1,
    "service_name": "Switch & Socket Installation and Repair",
    "status": "Pending",
    "scheduled_date": "2026-09-15",
    "scheduled_time": "11:00:00",
    "total_price": 800.00,
    "notes": "Please check bedroom switch"
  }
}
```

* **Error Responses:**
  * `400 Bad Request`: Missing mandatory booking fields (`service_id`, `scheduled_date`, `scheduled_time`).
  * `404 Not Found`: Target service not found.
  * `409 Conflict`: Slot unavailable (blocked in `provider_availability` or already booked in `bookings`).

---

#### `GET /api/bookings/customer/mine`
* **Access:** Protected (`req.user.id` as customer)
* **Description:** Fetches all booking orders placed by the currently logged-in customer, ordered by scheduled date descending.
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 3,
      "customer_id": 3,
      "provider_id": 1,
      "service_id": 1,
      "status": "Pending",
      "scheduled_date": "2026-09-15",
      "scheduled_time": "11:00:00",
      "total_price": 800.00,
      "notes": "Please check bedroom switch",
      "service_name": "Switch & Socket Installation and Repair",
      "category_name": "Electrical & Wiring",
      "category_icon": "⚡",
      "provider_name": "Arif Rahman",
      "created_at": "2026-08-30T10:45:00.000Z"
    }
  ]
}
```

---

## 2. Frontend React Components & Integration

### Routes Registered
| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/services` | `<ServicesPage />` | No | Dynamic Service Search, Category filtering & catalog grid |
| `/dashboard` | `<DashboardPage />` | Yes | Customer booking management and provider quick-actions |

### Component Architecture

1. **`frontend/src/pages/ServicesPage.jsx`**:
   * Real-time search bar with keyword debouncing (200ms).
   * Interactive category pills with instant filtering.
   * Min/Max price filters and sorting dropdown (`price_asc`, `price_desc`, `rating_desc`, `newest`).
   * Dynamic catalog cards displaying provider rating, price badge, and "Book Now" trigger.

2. **`frontend/src/components/BookingModal.jsx`**:
   * Interactive booking dialog triggered from any service card.
   * Dynamic date picker (preventing past date selection).
   * Real-time slot availability grid disabling provider blocked times and occupied slots.
   * Order summary and total payable calculation.
   * Instant booking confirmation view with Reference # and redirect to dashboard.

3. **`frontend/src/services/api.js` Client Exports**:
   * `searchServices(params)`
   * `fetchServiceById(id)`
   * `checkAvailability(providerId, date)`
   * `createBooking(bookingData)`
   * `fetchCustomerBookings()`

---

## 3. Teammate Integration Guide

* **For @Shaan (Customer Dashboard & Job Workflow):**
  * When customers place a booking through the Booking Engine, it creates a row in `bookings` with `status = 'Pending'`.
  * Shaan's workflow engine can transition this booking through `'Pending'` -> `'Accepted'` -> `'In-Progress'` -> `'Completed'`.
  * Shaan's provider view can query Rohan's `/api/bookings/provider/pending` and update status via `PUT /api/bookings/:id/status`.

* **For @Rohan (Provider Operations):**
  * Wasik's `createBooking` strictly adheres to Rohan's `bookings` schema and `provider_availability` schema defined in `Week2_Rohan_CONTRACT.md`.
  * When providers block dates via Rohan's `/api/availability`, Wasik's `checkAvailability` immediately recognizes and disables those slots in the booking UI.
