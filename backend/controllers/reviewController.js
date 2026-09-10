// Feature 4 (Customer Feedback & Text Review System) — Rohan (Week4_Rohan_CONTRACT.md)
// All DB interactions use raw SQL via the mysql2 pool — no ORM.
const pool = require('../config/db');

/**
 * POST /api/reviews
 * Authenticated: Customer only.
 *
 * Body: { booking_id, review_text }
 *
 * Business rules (enforced via SQL):
 *  1. The booking must exist and have status = 'Completed'.
 *  2. The logged-in user must be the customer of that booking (IDOR guard).
 *  3. Only one review is allowed per booking (UNIQUE constraint on booking_id).
 */
exports.submitReview = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { booking_id, review_text } = req.body;

    // --- Input validation ---
    if (!booking_id || !review_text || typeof review_text !== 'string') {
      return res.status(400).json({ success: false, message: 'booking_id and review_text are required.' });
    }

    const trimmed = review_text.trim();
    if (trimmed.length < 20) {
      return res.status(400).json({ success: false, message: 'Review must be at least 20 characters.' });
    }
    if (trimmed.length > 1000) {
      return res.status(400).json({ success: false, message: 'Review must not exceed 1000 characters.' });
    }

    // --- Verify booking ownership & completion status (one query, IDOR + state guard) ---
    const [bookings] = await pool.query(
      `SELECT id, provider_id, status
       FROM bookings
       WHERE id = ? AND customer_id = ?`,
      [booking_id, customer_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found or you are not the customer.' });
    }

    const booking = bookings[0];

    if (booking.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Reviews can only be submitted for completed bookings. Current status: ${booking.status}.`
      });
    }

    // --- Check for existing review (prevent duplicate before hitting the UNIQUE constraint) ---
    const [existing] = await pool.query(
      `SELECT id FROM reviews WHERE booking_id = ?`,
      [booking_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already submitted a review for this booking.' });
    }

    // --- Insert review ---
    const [result] = await pool.query(
      `INSERT INTO reviews (booking_id, customer_id, provider_id, review_text)
       VALUES (?, ?, ?, ?)`,
      [booking_id, customer_id, booking.provider_id, trimmed]
    );

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: {
        id: result.insertId,
        booking_id,
        provider_id: booking.provider_id,
        review_text: trimmed
      }
    });
  } catch (err) {
    console.error('submitReview error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while submitting review.' });
  }
};

/**
 * GET /api/reviews/provider/:providerId
 * Public — no authentication required.
 *
 * Returns all text reviews for a given provider, joined with the reviewer's
 * name and the service name for display context.
 */
exports.getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const [reviews] = await pool.query(
      `SELECT r.id,
              r.booking_id,
              r.review_text,
              r.created_at,
              u.name  AS customer_name,
              s.name  AS service_name
       FROM   reviews r
       JOIN   users    u ON u.id = r.customer_id
       JOIN   bookings b ON b.id = r.booking_id
       JOIN   services s ON s.id = b.service_id
       WHERE  r.provider_id = ?
       ORDER  BY r.created_at DESC`,
      [providerId]
    );

    return res.status(200).json({ success: true, data: reviews });
  } catch (err) {
    console.error('getProviderReviews error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching reviews.' });
  }
};

/**
 * GET /api/reviews/my-reviews
 * Authenticated: Customer only.
 *
 * Returns an array of booking_ids that the logged-in customer has already reviewed.
 * Used by the dashboard to disable the "Write a Review" button on reviewed bookings.
 */
exports.getMyReviewedBookingIds = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const [rows] = await pool.query(
      `SELECT booking_id FROM reviews WHERE customer_id = ?`,
      [customer_id]
    );

    const bookingIds = rows.map((r) => r.booking_id);

    return res.status(200).json({ success: true, data: bookingIds });
  } catch (err) {
    console.error('getMyReviewedBookingIds error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching reviewed bookings.' });
  }
};
