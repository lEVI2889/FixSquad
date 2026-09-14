# Week 3 Contract - Wasik

## Assigned Features
*   **Feature 4 (Dedicated Rating System):** Built the 1-5 star rating interface and backend SQL logic for customers to review completed bookings and automatically recalculate the provider's aggregate score.
*   **Feature 5 (Dispute & Cancellation):** Built the customer booking cancellation handler for `Pending` requests and the dispute ticket system allowing customers to submit detailed dispute claims for `Completed` jobs.

## Implementation Details

### Database Schema (Raw SQL)
```sql
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    provider_id INT NOT NULL,
    service_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS disputes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Open', 'Under Review', 'Resolved', 'Rejected') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.00;
```

### API Endpoints
*   `POST /api/reviews` - Submits a 1-5 star rating and comment for a completed booking. Recalculates provider aggregate rating (`AVG(rating)`) and updates `users.rating`.
*   `GET /api/reviews/booking/:bookingId` - Fetches review details for a specific booking.
*   `GET /api/reviews/provider/:providerId` - Fetches all reviews for a provider.
*   `POST /api/disputes` - Submits a detailed dispute ticket for a completed booking and transitions booking status to `'Disputed'`.
*   `GET /api/disputes/mine` - Fetches all dispute tickets opened by the logged-in customer.
*   `PUT /api/bookings/:id/cancel` - Cancels a `'Pending'` customer booking request, setting status to `'Cancelled'`.

### Backend & Frontend Logic
*   **Backend:** Added `reviewController.js` and `disputeController.js` with secure authentication checks. Updated `bookingController.js` with `cancelBooking` logic. Registered routes in `server.js`.
*   **Frontend:** Added `RatingModal.jsx` (interactive 1-5 star selector with real-time feedback) and `DisputeModal.jsx` (dispute ticket form). Integrated "Cancel Request", "Rate Service", and "File Dispute" buttons directly into `CustomerBookingDashboard.jsx`. Updated `bookingApi.js` with API endpoints.

## Status
*   **COMPLETED** - Tested locally and code has been committed to the `feature/customer-ratings-disputes` branch.
