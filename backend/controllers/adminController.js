const pool = require('../config/db');

// ─────────────────────────────────────────────
// FEATURE 11: Provider Verification System
// ─────────────────────────────────────────────

// GET /api/admin/providers/unverified
// Returns all provider accounts whose verification_status is 'Pending'.
// Passwords are explicitly excluded from the SELECT list.
exports.getUnverifiedProviders = async (req, res) => {
  try {
    const sql = `
      SELECT id, name, email, role, verification_status, is_suspended, created_at
      FROM users
      WHERE role = 'provider'
        AND verification_status = 'Pending'
      ORDER BY created_at ASC
    `;
    const [providers] = await pool.query(sql);

    return res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (err) {
    console.error('getUnverifiedProviders error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching unverified providers.' });
  }
};

// PUT /api/admin/providers/:id/verify
// Updates the verification_status of a specific provider.
// Allowed values: 'Approved' | 'Rejected'
exports.updateProviderVerification = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ALLOWED_STATUSES = ['Approved', 'Rejected'];
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${ALLOWED_STATUSES.join(', ')}.`
    });
  }

  try {
    // Confirm the target user exists and is a provider
    const [rows] = await pool.query(
      `SELECT id FROM users WHERE id = ? AND role = 'provider'`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Provider with ID ${id} not found.`
      });
    }

    await pool.query(
      `UPDATE users SET verification_status = ? WHERE id = ?`,
      [status, id]
    );

    return res.status(200).json({
      success: true,
      message: `Provider verification status updated to ${status}.`
    });
  } catch (err) {
    console.error('updateProviderVerification error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while updating verification status.' });
  }
};

// ─────────────────────────────────────────────
// FEATURE 14: System-Wide Access Control
// ─────────────────────────────────────────────

// PUT /api/admin/users/:id/suspend
// Suspends (is_suspended = 1) or reactivates (is_suspended = 0) any user account.
// An admin cannot suspend their own account (self-suspension guard).
exports.toggleUserSuspension = async (req, res) => {
  const { id } = req.params;
  const { is_suspended } = req.body;

  // Guard: prevent admin from suspending themselves
  if (parseInt(id, 10) === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'An admin cannot suspend their own account.'
    });
  }

  // Validate the flag value — must be exactly 0 or 1
  if (is_suspended !== 0 && is_suspended !== 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid value for is_suspended. Must be 0 (reactivate) or 1 (suspend).'
    });
  }

  try {
    // Confirm the target user exists
    const [rows] = await pool.query(
      `SELECT id, name FROM users WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found.`
      });
    }

    await pool.query(
      `UPDATE users SET is_suspended = ? WHERE id = ?`,
      [is_suspended, id]
    );

    const action = is_suspended === 1 ? 'suspended' : 'reactivated';
    return res.status(200).json({
      success: true,
      message: `User account has been ${action}.`
    });
  } catch (err) {
    console.error('toggleUserSuspension error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while updating suspension status.' });
  }
};

// ─────────────────────────────────────────────
// FEATURE 13: Dispute Resolution Desk
// ─────────────────────────────────────────────

// GET /api/admin/disputes
// Returns all bookings currently in 'Disputed' status with full context
// (customer name, provider name, service name) via SQL JOINs.
exports.getDisputedBookings = async (req, res) => {
  try {
    const sql = `
      SELECT
        b.id,
        b.status,
        b.scheduled_date,
        b.scheduled_time,
        b.total_price,
        b.created_at,
        b.updated_at,
        c.name  AS customer_name,
        c.email AS customer_email,
        p.name  AS provider_name,
        p.email AS provider_email,
        s.name  AS service_name
      FROM bookings b
      JOIN users c ON b.customer_id  = c.id
      JOIN users p ON b.provider_id  = p.id
      JOIN services s ON b.service_id = s.id
      WHERE b.status = 'Disputed'
      ORDER BY b.updated_at DESC
    `;
    const [disputes] = await pool.query(sql);

    return res.status(200).json({
      success: true,
      count: disputes.length,
      data: disputes
    });
  } catch (err) {
    console.error('getDisputedBookings error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching disputed bookings.' });
  }
};

// PUT /api/admin/disputes/:id/resolve
// Forcefully overrides the status of a Disputed booking.
// NOTE: This handler intentionally BYPASSES bookingStatusTransitions.js — admin
// override is designed to escape the normal provider state machine by definition.
// Allowed resolution statuses: 'Completed' | 'Cancelled' | 'In-Progress'
exports.resolveDispute = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const ALLOWED_RESOLUTIONS = ['Completed', 'Cancelled', 'In-Progress'];
  if (!status || !ALLOWED_RESOLUTIONS.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid resolution status. Must be one of: ${ALLOWED_RESOLUTIONS.join(', ')}.`
    });
  }

  try {
    // Ensure the booking exists AND is currently Disputed before overriding
    const [rows] = await pool.query(
      `SELECT id FROM bookings WHERE id = ? AND status = 'Disputed'`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID ${id} not found or is not in a Disputed state.`
      });
    }

    await pool.query(
      `UPDATE bookings SET status = ? WHERE id = ?`,
      [status, id]
    );

    return res.status(200).json({
      success: true,
      message: `Dispute resolved. Booking status set to ${status}.`
    });
  } catch (err) {
    console.error('resolveDispute error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while resolving dispute.' });
  }
};

