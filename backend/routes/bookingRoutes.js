const express = require('express');
const router = express.Router();
const { getProviderBookings, updateBookingStatus } = require('../controllers/bookingController');

router.get('/provider/pending', getProviderBookings);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
