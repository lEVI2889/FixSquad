const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createReview, getBookingReview, getProviderReviews, getMyReviewedBookingIds } = require('../controllers/reviewController');

router.post('/', protect, createReview);
router.get('/booking/:bookingId', protect, getBookingReview);
router.get('/provider/:providerId', getProviderReviews);
router.get('/my-reviews', protect, getMyReviewedBookingIds);

module.exports = router;
