# Sprint 2: Customer Dashboard & Job Workflow — API & Component Contract (v2)

**AUTHOR:** Shan
**BRANCH:** `feature/dashboards-and-workflow` (off `sprint-2-staging`)
**Builds on:** Week1_Shan_CONTRACT.md, Week2_Rohan_CONTRACT.md (already shipped on this branch)

> Not for Git — see `.gitignore`.

This version is structured to be **additive only**. Nothing here overwrites
`controllers/bookingController.js`, `routes/bookingRoutes.js`, or
`sql/schema.sql` — those are Rohan's already-shipped Sprint 2 work. Two
small, precise edits to existing files are called out explicitly below;
everything else is a new file.

---

## 1. New Files (safe to add as-is, no conflicts)

- `utils/bookingStatusTransitions.js` — shared status-transition rules (`Pending → Accepted/Rejected → In-Progress → Completed/Disputed`, plus `Cancelled` off `Accepted`) and their success messages.
- `controllers/bookingDashboardController.js` — `getCustomerBookings`, `getProviderBookings`.
- `routes/bookingDashboardRoutes.js` — exposes those two as `GET /customer/mine` and `GET /provider/mine`.
- `frontend/src/api/bookingApi.js`, `frontend/src/pages/CustomerBookingDashboard.jsx`, `frontend/src/pages/ProviderJobWorkflow.jsx` — unchanged from the last draft, since the API shape they depend on hasn't changed.

## 2. New Endpoints

### GET `/api/bookings/customer/mine`
**Auth:** Required. All bookings for `customer_id = req.user.id`, joined with `provider_name` and `service_name`. Powers the Customer Booking Dashboard.

### GET `/api/bookings/provider/mine`
**Auth:** Required. **All** of a provider's bookings (not just Pending), ordered Pending → Accepted → In-Progress → Disputed → Completed → Rejected → Cancelled. Powers the Job Workflow board.

---

## 3. Integration Notes (the only two edits to existing files)

### `server.js` — one line
Mount the new router alongside the existing one (order doesn't matter, paths don't collide):
```javascript
const bookingDashboardRoutes = require('./routes/bookingDashboardRoutes');
app.use('/api/bookings', protect, bookingDashboardRoutes);
```

### `controllers/bookingController.js` — extend `updateBookingStatus`
Rohan's shipped version handles `Accepted`/`Rejected`. To sequentially
support `In-Progress` and `Completed` (and `Cancelled`/`Disputed`), import
the helper and use it in place of whatever inline check currently guards
the status value:

```javascript
const { isKnownStatus, isValidTransition, messageFor } = require('../utils/bookingStatusTransitions');

// after loading the booking row, before the UPDATE:
if (!isKnownStatus(newStatus)) {
  return res.status(400).json({ success: false, message: 'A valid status value is required' });
}
if (!isValidTransition(booking.status, newStatus)) {
  return res.status(400).json({
    success: false,
    message: `Cannot move booking from '${booking.status}' to '${newStatus}'`
  });
}

// ...existing UPDATE query stays exactly as-is...

return res.status(200).json({ success: true, message: messageFor(newStatus) });
```

This doesn't change the route, the request/response shape, or the
authorization check already in place — it only widens which status
values are accepted and validates that the move is legal for the
booking's current status.

---

## 4. Database

No schema changes. `provider_availability` and `bookings` already exist on this branch per Rohan's contract.

---

## 5. Frontend Integration (for Naim)

```jsx
import CustomerBookingDashboard from './pages/CustomerBookingDashboard';
import ProviderJobWorkflow from './pages/ProviderJobWorkflow';

<Route path="/customer/bookings" element={<CustomerBookingDashboard />} />
<Route path="/provider/jobs" element={<ProviderJobWorkflow />} />
```

Both are prop-less. `bookingApi.js` reads the JWT from `localStorage.getItem('token')` and calls relative `/api/...` paths only.

---

## 6. Still Open

- I haven't seen the actual current contents of `bookingController.js` on `sprint-2-staging`, so the patch above is written against the contract's documented behavior, not the real file. Whoever applies it should sanity-check that the existing authorization check (only the assigned provider can update) is still in place after merging.
- No live test was run against a real database or the actual staging branch — I don't have access to either from this environment.
