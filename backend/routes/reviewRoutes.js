const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const reviewController = require('../controllers/reviewController');

router.post('/', protect, reviewController.createReview);
router.get('/booking/:bookingId', protect, reviewController.getBookingReview);
router.get('/provider/:providerId', reviewController.getProviderReviews);

module.exports = router;
