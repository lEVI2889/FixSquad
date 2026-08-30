# Integration Contract: Feature 6 (Service Portfolio Manager)

**AUTHOR:** Rohan  
**FEATURE BRANCH:** `feature/service-portfolio`

> [!IMPORTANT]
> This document acts as a strict, immutable contract for the integration of Feature 6. All team members (Shan, Wasik, Naim) and their respective AI agents MUST strictly adhere to the constraints and signatures defined below to prevent integration conflicts.

---

## 1. Database Schema & Foreign Key Constraints

The `services` table strictly relies on raw SQL foreign key mappings. The following structural constraints are **MANDATORY** for the foundational tables.

### `users` Table (Shan's Responsibility)
The users table MUST include the following exact column definition to support the foreign key `provider_id`:
- Column Name: `id`
- Data Type: `INT`
- Constraint: `PRIMARY KEY`

### `categories` Table (Wasik's Responsibility)
The categories table MUST include the following exact column definition to support the foreign key `category_id`:
- Column Name: `id`
- Data Type: `INT`
- Constraint: `PRIMARY KEY`
- *(Optional but expected for UI)* Column Name: `name` (Type: `VARCHAR`)

### The `services` Table Structure (My Implementation)
If you need to query services, the schema is explicitly:
- `id` (INT, Primary Key)
- `provider_id` (INT, Foreign Key -> `users(id)`)
- `category_id` (INT, Foreign Key -> `categories(id)`)
- `name` (VARCHAR)
- `description` (TEXT)
- `base_price` (DECIMAL(10,2))

---

## 2. API Routes & Authentication Signatures

The backend controllers execute raw SQL using the `mysql2` driver (accessed via `pool.query`).

### Authentication Middleware State (MANDATORY)
The central Express router MUST implement an authentication middleware (e.g., `protect`) that runs *before* the service routes are invoked. 
- The middleware MUST attach the authenticated provider's ID to the request object exactly as: `req.user.id`

### API Endpoints
The main application file (e.g., `app.js` or `server.js`) MUST mount my routes precisely at the `/api/services` path:
```javascript
const serviceRoutes = require('./routes/serviceRoutes');
app.use('/api/services', protectMiddleware, serviceRoutes);
```

#### GET `/api/services/`
- **Method:** `GET`
- **Auth:** Required (`req.user.id`)
- **Response Structure:** `{ "success": true, "data": [{...service details with category_name}] }`

#### POST `/api/services/`
- **Method:** `POST`
- **Auth:** Required (`req.user.id`)
- **Request Body Payload MUST include:** 
  - `category_id` (INT)
  - `name` (String)
  - `description` (String)
  - `base_price` (Number/Decimal)
- **Response Structure:** `{ "success": true, "message": "...", "data": {...} }`

#### PUT `/api/services/:id`
- **Method:** `PUT`
- **Auth:** Required (`req.user.id`)
- **URL Parameter:** `id` (The ID of the service to edit)
- **Request Body Payload MUST include:** Same as POST.

#### DELETE `/api/services/:id`
- **Method:** `DELETE`
- **Auth:** Required (`req.user.id`)
- **URL Parameter:** `id` (The ID of the service to delete)

---

## 3. Frontend Integration Points

The frontend React components are decoupled and ready to be stitched into the main application shell.

### Main Router Component (Naim's Responsibility)
You MUST import and render the following component for the Provider's Portfolio dashboard route:
- **File Path:** `frontend/src/pages/ProviderPortfolio.jsx`
- **Component Name:** `ProviderPortfolio`
- **Props Required:** `None`

**Example Integration in Router:**
```jsx
import ProviderPortfolio from './pages/ProviderPortfolio';

// Inside your react-router setup:
<Route path="/provider/portfolio" element={<ProviderPortfolio />} />
```

### API Fetcher Target
My `api.js` wrapper is configured to hit the relative path `/api/services`. The frontend server (e.g., Vite or Webpack) MUST either run on the same origin as the backend or include a proxy configuration mapping `/api` to the backend port. No hardcoded localhost ports should remain in production code.
