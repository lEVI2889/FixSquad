const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const bookingController2 = require('../controllers/bookingController');
const { getProviderBookings, updateBookingStatus, updateQuote, respondToQuote } = require('../controllers/bookingController');

router.get('/provider/pending', getProviderBookings);
router.put('/:id/status', updateBookingStatus);

router.get('/check-availability', bookingController2.checkAvailability);
router.post('/', protect, bookingController2.createBooking);
router.put('/:id/cancel', protect, bookingController2.cancelBooking);

router.put('/:id/quote', protect, updateQuote);
router.put('/:id/quote-respond', protect, respondToQuote);

module.exports = router;

