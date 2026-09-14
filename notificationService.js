const pool = require('../db');

// Call this from any controller that should raise a notification —
// booking status changes, new messages, invoices, etc. — instead of
// writing an INSERT inline in each place. Keeps the "trigger-based
// record insertion" logic in one auditable spot.
async function createNotification(userId, type, message) {
  await pool.query(
    'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
    [userId, type, message]
  );
}

module.exports = { createNotification };
