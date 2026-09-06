# Week 3 Contract - Rohan

## Assigned Features
*   **Feature 16 (In-Platform Messaging):** Create the localized chat interface and database logic allowing a Customer and a Provider to exchange messages securely tied to an active booking ID.
*   **Feature 18 (Automated Invoicing):** Build the backend logic to compile a completed booking's data into a downloadable PDF receipt (using a library like PDFKit), and create the frontend button to trigger the download.

## Implementation Details

### Database Schema (Raw SQL)
```sql
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    sender_id INT NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);
```

### API Endpoints
*   `GET /api/messages/:bookingId` - Fetches all chat messages for a specific booking. Securely validated to ensure the requester is either the customer or the provider associated with the booking.
*   `POST /api/messages/:bookingId` - Sends a new chat message for a specific booking.
*   `GET /api/invoices/:bookingId` - Compiles and streams a downloadable PDF invoice (using `pdfkit`) for a completed booking.

### Backend & Frontend Logic
*   **Backend:** Added `messageController.js` and `invoiceController.js` logic with secure role validation. Used `pdfkit` to generate and pipe invoice PDFs.
*   **Frontend:** Added `MessagingModal.jsx` for real-time chat. Integrated "Message Provider", "Message Customer", and "Download Invoice" buttons dynamically based on the booking's `status` in `CustomerBookingDashboard.jsx` and `ProviderJobWorkflow.jsx`. Fixed Navbar visibility of "Book a Service" for Providers.

## Status
*   **COMPLETED** - Code has been successfully pushed to the `feature/sprint-3-cyber-invoicing` branch and is ready for integration.
