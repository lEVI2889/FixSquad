# Sprint 3: System Dashboards (Earnings & Notifications) — API & Component Contract

**AUTHOR:** Shan
**BRANCH:** `feature/system-dashboards` (off `sprint-3-staging`)
**Builds on:** Week1/Week2_Shan_CONTRACT.md, Week3_Rohan_CONTRACT.md (messaging + invoicing, already shipped on `feature/sprint-3-cyber-invoicing`)

> Not for Git — see `.gitignore`.

This is fully additive: no existing table, controller, or route from Rohan's Week 3 work (`messages`, `invoices`, `messageController.js`, `invoiceController.js`) is touched.

---

## 1. Provider Earnings Report

### Database
No new table — reads directly from the existing `bookings` table.

### GET `/api/earnings/summary`
**Auth:** Required. Returns aggregated totals plus a 12-month breakdown for the authenticated provider, computed in SQL (`COUNT`/`SUM`/`GROUP BY`), not in application code:

```json
{
  "success": true,
  "data": {
    "completed_jobs": 14,
    "total_earnings": "4200.00",
    "monthly": [
      { "month": "2026-08", "jobs": 5, "earnings": "1500.00" },
      { "month": "2026-07", "jobs": 3, "earnings": "900.00" }
    ]
  }
}
```

### `frontend/src/pages/ProviderEarningsReport.jsx`
Props: none. Fetches the summary on mount and renders two headline stats (total gross earnings, completed job count) plus a simple bar-per-month breakdown — no charting library dependency.

**Integration (for Naim):**
```jsx
import ProviderEarningsReport from './pages/ProviderEarningsReport';
<Route path="/provider/earnings" element={<ProviderEarningsReport />} />
```

---

## 2. System Notification Feed

### Database — new table
```sql
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
File: `sql/sprint3_notifications.sql`. Run it once against the shared DB — it doesn't touch any existing table.

### `utils/notificationService.js`
Exports `createNotification(userId, type, message)`. This is how the "trigger-based" part works: any controller that changes state a user should be told about calls this instead of writing its own `INSERT`.

**Where to call it (integration notes, since I don't own these files):**
- In our existing `updateBookingStatus` (from Sprint 2's patch): after the status UPDATE succeeds, call `createNotification(booking.customer_id, 'booking_status', ...)`. Note that query currently only selects `id, provider_id, status` — you'll need to add `customer_id` to that SELECT to have it available here.
- In Rohan's `messageController.js` (Feature 16): after a message is saved, notify the other party in the booking.
- Optionally in `invoiceController.js`: notify the customer when their invoice is ready.

I haven't made these edits myself since they live in files I don't have — the hooks above are where to add one line each.

### GET `/api/notifications`
**Auth:** Required. Returns the caller's most recent 50 notifications, newest first.

### PUT `/api/notifications/:id/read`
**Auth:** Required. Marks one notification as read; `404` if it doesn't belong to the caller.

### `frontend/src/components/NotificationDropdown.jsx`
Props: none. A bell icon with an unread-count badge; polls every 30s; clicking an item marks it read.

**Integration (for Naim, into the existing Navbar):**
```jsx
import NotificationDropdown from './components/NotificationDropdown';
// drop <NotificationDropdown /> next to the existing nav items
```

---

## 3. `server.js` — two lines to add
```javascript
const earningsRoutes = require('./routes/earningsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/earnings', protect, earningsRoutes);
app.use('/api/notifications', protect, notificationRoutes);
```

---

## 4. Still Open

- Notification triggers aren't wired into `updateBookingStatus` or Rohan's messaging code yet — see the hooks above. Nothing fires automatically until those one-line calls are added.
- Not tested against a live database, Rohan's actual `feature/sprint-3-cyber-invoicing` branch, or the real Navbar — I don't have access to any of them from this environment.
