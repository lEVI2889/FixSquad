// Feature 4 (Customer Feedback & Text Review System) — Rohan (Week4_Rohan_CONTRACT.md)
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { submitReview, getProviderReviews, getMyReviewedBookingIds } = require('../controllers/reviewController');

// Public: fetch all text reviews for a provider profile page
// GET /api/reviews/provider/:providerId
router.get('/provider/:providerId', getProviderReviews);

// Protected (Customer): fetch the booking IDs the current user has already reviewed
// GET /api/reviews/my-reviews
router.get('/my-reviews', protect, getMyReviewedBookingIds);

// Protected (Customer): submit a text review for a completed booking
// POST /api/reviews
router.post('/', protect, submitReview);

module.exports = router;
