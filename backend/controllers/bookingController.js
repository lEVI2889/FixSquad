const pool = require('../config/db');

exports.getProviderBookings = async (req, res) => {
    try {
        const [bookings] = await pool.query(
            `SELECT b.*, u.name as customer_name, s.name as service_name 
             FROM bookings b
             JOIN users u ON b.customer_id = u.id
             JOIN services s ON b.service_id = s.id
             WHERE b.provider_id = ? AND b.status = 'Pending'
             ORDER BY b.scheduled_date ASC, b.scheduled_time ASC`,
            [req.user.id]
        );
        res.json({ success: true, data: bookings });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Ensure status is valid
        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const [result] = await pool.query(
            `UPDATE bookings SET status = ? WHERE id = ? AND provider_id = ?`,
            [status, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
        }

        res.json({ success: true, message: `Booking ${status.toLowerCase()} successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
