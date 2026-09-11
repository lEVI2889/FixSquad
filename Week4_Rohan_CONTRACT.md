# Week 4 Contract - Rohan

## Assigned Features
*   **Feature 4 (Customer Operations - Customer Feedback & Text Review System):** Build the accompanying text-based review system. This includes creating the frontend form for customers to write detailed feedback on completed jobs and the backend raw SQL logic to insert and fetch these comments on the Provider's profile.

---

## Implementation Details

### Database Schema (Raw SQL)
Execute the following SQL migration on the database:

```sql
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
);
```

*Note: `booking_id` is marked `UNIQUE` to strictly ensure only one review can be submitted per completed booking.*

---

### API Endpoints
*   `POST /api/reviews` — Submit a text review for a completed booking.
    *   **Auth:** Required (Customer JWT).
    *   **Body:** `{ "booking_id": 12, "review_text": "Great service and prompt work!" }`
    *   **Validation & Business Rules (Raw SQL):**
        *   Checks that `booking_id` exists, belongs to the authenticated customer (`customer_id = req.user.id`), and is in `'Completed'` status.
        *   Checks that `review_text` is between 20 and 1000 characters.
        *   Rejects duplicate review submissions with `409 Conflict`.
*   `GET /api/reviews/provider/:providerId` — Fetch all text reviews for a specific provider.
    *   **Auth:** Public (No token required).
    *   **Response:** List of reviews with customer name, service name, review text, and timestamp.
*   `GET /api/reviews/my-reviews` — Fetch IDs of bookings already reviewed by the logged-in customer.
    *   **Auth:** Required (Customer JWT).
    *   **Response:** Array of `booking_id`s already reviewed, used by the dashboard UI to disable duplicate review submissions.

---

### Backend & Frontend Implementation
*   **Backend:**
    *   `backend/controllers/reviewController.js`: Implements raw SQL queries using `mysql2/promise` pool for `submitReview`, `getProviderReviews`, and `getMyReviewedBookingIds`.
    *   `backend/routes/reviewRoutes.js`: Exposes the review endpoints with appropriate `protect` middleware.
    *   `backend/server.js`: Mounted at `/api/reviews`.
*   **Frontend:**
    *   `frontend/src/components/ReviewFormModal.jsx`: Interactive modal with character length counter (min 20, max 1000), client-side validation, error handling, and submit button.
    *   `frontend/src/pages/CustomerBookingDashboard.jsx`: Updated `BookingCard` to include a "Write a Review" button for `Completed` bookings, automatically switching to "Review Submitted ✓" if already reviewed.
    *   `frontend/src/pages/ProviderPublicProfile.jsx`: Public profile view (`/provider/:providerId/profile`) showing provider details, services offered, and customer text review list.
    *   `frontend/src/services/api.js`: Added helper functions `submitReview`, `fetchProviderReviews`, and `fetchMyReviewedBookingIds`.
    *   `frontend/src/App.jsx`: Added public route for `/provider/:providerId/profile`.

---

### Local Test Verification
*   **Backend Server:** Verified load and initialization using Node.js (`SERVER_LOADED_OK`).
*   **Frontend Build:** Production build passed cleanly with Vite (`✓ built in 12.24s`, 0 errors).

---

## Status
*   **TESTED LOCALLY & PAUSED** — Ready for manual review and approval before committing or pushing to `feature/customer-text-reviews`.
