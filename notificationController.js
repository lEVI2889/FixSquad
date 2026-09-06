const pool = require('../db');

// GET /api/notifications
const getMyNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, type, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('getMyNotifications error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching notifications' });
  }
};

// PUT /api/notifications/:id/read
const markNotificationRead = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (err) {
    console.error('markNotificationRead error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error updating notification' });
  }
};

module.exports = { getMyNotifications, markNotificationRead };
