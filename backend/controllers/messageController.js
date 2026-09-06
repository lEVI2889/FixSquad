const pool = require('../config/db');

exports.getMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Verify user is part of the booking
    const [bookings] = await pool.query(
      'SELECT id FROM bookings WHERE id = ? AND (customer_id = ? OR provider_id = ?)',
      [bookingId, userId, userId]
    );

    if (bookings.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages for this booking.' });
    }

    const [messages] = await pool.query(`
      SELECT m.*, u.name as sender_name, u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.booking_id = ?
      ORDER BY m.created_at ASC
    `, [bookingId]);

    res.json({ success: true, data: messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { message_text } = req.body;
    const userId = req.user.id;

    if (!message_text || message_text.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }

    // Verify user is part of the booking
    const [bookings] = await pool.query(
      'SELECT id FROM bookings WHERE id = ? AND (customer_id = ? OR provider_id = ?)',
      [bookingId, userId, userId]
    );

    if (bookings.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to send messages for this booking.' });
    }

    const [result] = await pool.query(
      'INSERT INTO messages (booking_id, sender_id, message_text) VALUES (?, ?, ?)',
      [bookingId, userId, message_text.trim()]
    );

    const [newMessage] = await pool.query(`
      SELECT m.*, u.name as sender_name, u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?
    `, [result.insertId]);

    res.status(201).json({ success: true, data: newMessage[0] });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
