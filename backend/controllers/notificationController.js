const pool = require('../config/db');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const [notifications] = await pool.query(
            `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
            [notificationId, req.user.id]
        );
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error marking notification read:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.createNotification = async (userId, message, type = 'info') => {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)`,
            [userId, message, type]
        );
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};
