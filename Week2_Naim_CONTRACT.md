# Integration Contract: Features 11 & 14 (Admin Operations)

**AUTHOR:** Naim  
**FEATURES:** Feature 11 (Provider Verification System) + Feature 14 (System-Wide Access Control)  
**FEATURE BRANCH:** `feature/admin-operations`  
**DATE:** August 30, 2026  

> [!IMPORTANT]
> This document acts as a strict, immutable contract for the integration of Features 11 and 14. All team members (Rohan, Shan, Wasik) and their respective AI agents MUST strictly adhere to the database schema changes, middleware requirements, and endpoint signatures defined below to guarantee seamless integration.

---

## 1. Database Schema Updates (Raw SQL)

Two new columns are added to the existing `users` table via `ALTER TABLE`. These are additive-only changes — they do not alter any existing column and do not break any existing feature.

### Exact Raw SQL DDL (Run Once Against Live DB)

```sql
-- Feature 11: Track provider verification state
ALTER TABLE users
  ADD COLUMN verification_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending';

-- Feature 14: Suspension flag for all user roles
ALTER TABLE users
  ADD COLUMN is_suspended TINYINT(1) DEFAULT 0;
```

### Updated `users` Table Schema (Full Reference)

| Column Name | Data Type | Constraints / Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INT` | `PRIMARY KEY AUTO_INCREMENT` | Unique user identifier |
| `name` | `VARCHAR(100)` | `NOT NULL` | Full name |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | Login email |
| `password` | `VARCHAR(255)` | `NOT NULL` | Bcrypt-hashed password |
| `role` | `VARCHAR(50)` | e.g. `'customer'`, `'provider'`, `'admin'` | User role — already present |
| `verification_status` | `ENUM('Pending','Approved','Rejected')` | `DEFAULT 'Pending'` | **NEW** — provider vetting status |
| `is_suspended` | `TINYINT(1)` | `DEFAULT 0` | **NEW** — `1` = suspended, `0` = active |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Row creation timestamp |

> [!NOTE]
> `verification_status` defaults to `'Pending'` for all users. Its value is only semantically meaningful for `role = 'provider'` accounts. Customer and admin rows carry the default silently without any side-effects.

---

## 2. Middleware Architecture

### 2.1 Sprint 2 Change to `authMiddleware.js`

The `protect` middleware now attaches **both** `id` and `role` to `req.user`:

```javascript
// Before (Sprint 1):
req.user = { id: decoded.id };

// After (Sprint 2):
req.user = { id: decoded.id, role: decoded.role };
```

All existing routes that read `req.user.id` are **unaffected**. This is a purely additive change.

### 2.2 New `isAdmin` Middleware

A second middleware, `isAdmin`, is exported from `authMiddleware.js`. It MUST be placed **after** `protect` in any middleware chain, since it reads `req.user.role` which is only set by `protect`.

```javascript
// Signature (exported from middleware/authMiddleware.js):
const isAdmin = (req, res, next) => { ... };

// Returns 403 Forbidden if req.user.role !== 'admin':
// { "success": false, "message": "Forbidden: Admin access required." }
```

### 2.3 Sprint 2 Change to `authController.js`

`generateToken` now embeds `role` in the JWT payload:

```javascript
// Before:
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// After:
const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
```

Login and register responses are **unchanged** — the `role` field was already returned in `data`.

---

## 3. API Routes & Signatures

All admin endpoints are mounted at `/api/admin`. Every request MUST include a valid Bearer JWT from an account with `role = 'admin'`.

### Base Route Mount (in `server.js`)

```javascript
const { protect, isAdmin } = require('./middleware/authMiddleware');
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', protect, isAdmin, adminRoutes);
```

---

### 3.1 GET `/api/admin/providers/unverified` — Fetch Pending Providers

- **Method:** `GET`
- **Access:** Admin only
- **Headers:** `Authorization: Bearer <admin_token>`
- **Description:** Returns all provider accounts where `verification_status = 'Pending'`, ordered by registration date (oldest first). Passwords are never returned.

#### Response (`200 OK`):
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 5,
      "name": "Ahmed Electrician",
      "email": "ahmed@example.com",
      "role": "provider",
      "verification_status": "Pending",
      "is_suspended": 0,
      "created_at": "2026-08-29T10:00:00.000Z"
    },
    {
      "id": 7,
      "name": "Rina Plumbing",
      "email": "rina@example.com",
      "role": "provider",
      "verification_status": "Pending",
      "is_suspended": 0,
      "created_at": "2026-08-29T14:30:00.000Z"
    }
  ]
}
```

#### Error (`403 Forbidden` — Non-admin token):
```json
{
  "success": false,
  "message": "Forbidden: Admin access required."
}
```

---

### 3.2 PUT `/api/admin/providers/:id/verify` — Approve or Reject a Provider

- **Method:** `PUT`
- **Access:** Admin only
- **Headers:** `Authorization: Bearer <admin_token>`
- **URL Parameter:** `id` (`INT` — the `users.id` of the target provider)
- **Description:** Sets `verification_status` to `'Approved'` or `'Rejected'` for the specified provider.

#### Request Body:
```json
{
  "status": "Approved"
}
```
Valid values for `status`: `"Approved"` | `"Rejected"`

#### Response (`200 OK`):
```json
{
  "success": true,
  "message": "Provider verification status updated to Approved."
}
```

#### Error (`400 Bad Request` — Invalid status value):
```json
{
  "success": false,
  "message": "Invalid status. Must be one of: Approved, Rejected."
}
```

#### Error (`404 Not Found` — ID does not belong to a provider):
```json
{
  "success": false,
  "message": "Provider with ID 999 not found."
}
```

---

### 3.3 PUT `/api/admin/users/:id/suspend` — Suspend or Reactivate a User

- **Method:** `PUT`
- **Access:** Admin only
- **Headers:** `Authorization: Bearer <admin_token>`
- **URL Parameter:** `id` (`INT` — the `users.id` of the target user)
- **Description:** Sets `is_suspended` to `1` (suspend) or `0` (reactivate) for any user account, regardless of role. Admins cannot suspend themselves.

#### Request Body:
```json
{
  "is_suspended": 1
}
```
Valid values for `is_suspended`: `1` (suspend) | `0` (reactivate)

#### Response (`200 OK` — Suspend):
```json
{
  "success": true,
  "message": "User account has been suspended."
}
```

#### Response (`200 OK` — Reactivate):
```json
{
  "success": true,
  "message": "User account has been reactivated."
}
```

#### Error (`400 Bad Request` — Self-suspension attempt):
```json
{
  "success": false,
  "message": "An admin cannot suspend their own account."
}
```

#### Error (`400 Bad Request` — Invalid flag value):
```json
{
  "success": false,
  "message": "Invalid value for is_suspended. Must be 0 (reactivate) or 1 (suspend)."
}
```

#### Error (`404 Not Found`):
```json
{
  "success": false,
  "message": "User with ID 999 not found."
}
```

---

## 4. New File Manifest

| File | Action | Purpose |
| :--- | :--- | :--- |
| `backend/middleware/authMiddleware.js` | MODIFIED | Attaches `role` to `req.user`; adds + exports `isAdmin` |
| `backend/controllers/authController.js` | MODIFIED | `generateToken(id, role)` — JWT now includes `role` |
| `backend/controllers/adminController.js` | NEW | Feature 11 + Feature 14 controller logic (raw SQL) |
| `backend/routes/adminRoutes.js` | NEW | Admin endpoint route definitions |
| `backend/server.js` | MODIFIED | Mounts `/api/admin` with `protect` + `isAdmin` |

---

## 5. Teammate Quick Integration Snippets

### For Shan / Wasik (React Admin Panel — Fetch Pending Providers)

```jsx
// Example: AdminVerificationPage.jsx
import { useEffect, useState } from 'react';
import api from '../services/api'; // Wasik's shared Axios instance

export default function AdminVerificationPage() {
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    api.get('/admin/providers/unverified')
      .then(res => {
        if (res.data.success) setProviders(res.data.data);
      })
      .catch(err => console.error(err));
  }, []);

  const handleVerify = (id, status) => {
    api.put(`/admin/providers/${id}/verify`, { status })
      .then(res => {
        if (res.data.success) {
          // Remove approved/rejected provider from the list
          setProviders(prev => prev.filter(p => p.id !== id));
        }
      });
  };

  return (
    <ul>
      {providers.map(p => (
        <li key={p.id}>
          {p.name} — {p.email}
          <button onClick={() => handleVerify(p.id, 'Approved')}>Approve</button>
          <button onClick={() => handleVerify(p.id, 'Rejected')}>Reject</button>
        </li>
      ))}
    </ul>
  );
}
```

### For Shan / Wasik (React Admin Panel — Suspend/Reactivate User)

```jsx
// toggleSuspension can be called from any user management table
const toggleSuspension = (userId, currentSuspended) => {
  const newFlag = currentSuspended ? 0 : 1;
  api.put(`/admin/users/${userId}/suspend`, { is_suspended: newFlag })
    .then(res => {
      if (res.data.success) {
        // Re-fetch user list or update local state
        console.log(res.data.message);
      }
    });
};
```

> [!NOTE]
> Wasik's `api.js` Axios instance automatically injects `Authorization: Bearer <token>` from `localStorage['token']`, so no manual header management is needed in component code.

---

## 6. Manual DB Setup Checklist for Team

Before testing any admin endpoint, a database admin (or any member with MySQL access) must:

- [ ] Run the two `ALTER TABLE` statements from Section 1 above.
- [ ] Insert at least one user with `role = 'admin'` (can be done via the register endpoint or a direct SQL insert).
- [ ] Ensure at least one `role = 'provider'` user exists with `verification_status = 'Pending'` to test Feature 11.

---

## 7. Summary Checklist for Team Alignment

- [x] **Table Altered:** Strictly `users` (additive columns only — no breaking changes)
- [x] **New Columns:** `verification_status ENUM('Pending','Approved','Rejected')`, `is_suspended TINYINT(1)`
- [x] **ORM Usage:** Zero ORMs. Strictly raw SQL queries with `mysql2` driver (`pool.query`).
- [x] **Base API Endpoint:** Mounted at `/api/admin`
- [x] **Middleware Chain:** `protect` → `isAdmin` → route handler (applied at server.js mount level)
- [x] **JWT Change:** `role` now embedded in JWT payload — all existing `req.user.id` reads are unaffected
- [x] **Git Ignored:** This contract file is added to `.gitignore` and kept local for Discord sharing.
