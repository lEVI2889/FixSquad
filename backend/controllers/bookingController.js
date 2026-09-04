const pool = require('../config/db');
const { isKnownStatus, isValidTransition, messageFor } = require('../utils/bookingStatusTransitions');

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
        
        if (!isKnownStatus(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Fetch current booking to validate transition
        const [bookings] = await pool.query(
            `SELECT status FROM bookings WHERE id = ? AND provider_id = ?`,
            [id, req.user.id]
        );

        if (bookings.length === 0) {
            return res.status(404).json({ success: false, message: 'Booking not found or unauthorized' });
        }

        const currentStatus = bookings[0].status;

        if (!isValidTransition(currentStatus, status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot move booking from '${currentStatus}' to '${status}'`
            });
        }

        await pool.query(
            `UPDATE bookings SET status = ? WHERE id = ?`,
            [status, id]
        );

        res.json({ success: true, message: messageFor(status) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
