const pool = require('../config/db');

/**
 * Submit a rating and review for a completed booking
 * POST /api/reviews
 */
exports.createReview = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { booking_id, rating, comment } = req.body;

    const numRating = Number(rating);
    if (!booking_id || isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Valid booking_id and rating (1-5) are required'
      });
    }

    // 1. Verify booking exists, belongs to customer, and is completed
    const [bookings] = await pool.query(
      `SELECT id, customer_id, provider_id, service_id, status FROM bookings WHERE id = ?`,
      [booking_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bookings[0];

    if (booking.customer_id !== customerId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Not your booking' });
    }

    if (booking.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed bookings'
      });
    }

    // 2. Check if a review already exists for this booking
    const [existing] = await pool.query(
      `SELECT id FROM reviews WHERE booking_id = ?`,
      [booking_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A review has already been submitted for this booking'
      });
    }

    // 3. Insert review
    const [result] = await pool.query(
      `INSERT INTO reviews (booking_id, customer_id, provider_id, service_id, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [booking_id, customerId, booking.provider_id, booking.service_id, numRating, comment ? comment.trim() : null]
    );

    // 4. Recalculate provider aggregate rating
    const [stats] = await pool.query(
      `SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_reviews FROM reviews WHERE provider_id = ?`,
      [booking.provider_id]
    );

    const avgRating = stats[0].avg_rating ? parseFloat(stats[0].avg_rating).toFixed(2) : numRating.toFixed(2);
    const totalReviews = stats[0].total_reviews || 1;

    // Update users table with recalculated score
    try {
      await pool.query(
        `UPDATE users SET rating = ? WHERE id = ?`,
        [avgRating, booking.provider_id]
      );
    } catch (updateErr) {
      console.warn('Could not update users.rating column (may require migration):', updateErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your rating and review have been submitted.',
      data: {
        id: result.insertId,
        booking_id,
        rating: numRating,
        comment,
        provider_aggregate_rating: Number(avgRating),
        total_reviews: totalReviews
      }
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ success: false, message: 'Server error while submitting review' });
  }
};

/**
 * Get review for a specific booking
 * GET /api/reviews/booking/:bookingId
 */
exports.getBookingReview = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.*, u.name AS customer_name 
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.booking_id = ?`,
      [bookingId]
    );

    if (reviews.length === 0) {
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({ success: true, data: reviews[0] });
  } catch (error) {
    console.error('Error fetching booking review:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Get all reviews for a provider
 * GET /api/reviews/provider/:providerId
 */
exports.getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.*, u.name AS customer_name, s.name AS service_name
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       JOIN services s ON r.service_id = s.id
       WHERE r.provider_id = ?
       ORDER BY r.created_at DESC`,
      [providerId]
    );

    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching provider reviews:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};
