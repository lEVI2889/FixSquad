const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Public / Customer availability lookup
router.get('/check-availability', bookingController.checkAvailability);

// Customer endpoints (Feature 2)
router.post('/', protect, bookingController.createBooking);
router.get('/customer/mine', protect, bookingController.getCustomerBookings);

// Provider endpoints (Week2_Rohan_CONTRACT.md Feature 7 compatibility)
router.get('/provider/pending', protect, bookingController.getProviderPendingBookings);
router.put('/:id/status', protect, bookingController.updateBookingStatus);

module.exports = router;
