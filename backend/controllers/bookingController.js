const pool = require('../db');

/**
 * Standard business hour time slots (9 AM to 6 PM)
 */
const DEFAULT_SLOTS = [
  '09:00:00',
  '10:00:00',
  '11:00:00',
  '12:00:00',
  '14:00:00',
  '15:00:00',
  '16:00:00',
  '17:00:00',
  '18:00:00'
];

/**
 * Format 24h time to 12h readable string
 */
function formatTimeLabel(timeStr) {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

/**
 * @desc    Check available time slots for a provider on a specific date (Feature 2)
 * @route   GET /api/bookings/check-availability
 * @access  Public / Customer
 */
const checkAvailability = async (req, res) => {
  try {
    const { provider_id, date } = req.query;

    if (!provider_id || !date) {
      return res.status(400).json({
        success: false,
        message: 'provider_id and date (YYYY-MM-DD) query parameters are required'
      });
    }

    const pId = Number(provider_id);
    const dateStr = String(date).split('T')[0];

    // 1. Fetch blocked ranges from provider_availability
    const availSql = `
      SELECT start_time, end_time, is_blocked 
      FROM provider_availability 
      WHERE provider_id = ? AND date = ? AND is_blocked = 1
    `;
    const [blockedRecords] = await pool.query(availSql, [pId, dateStr]);

    // 2. Fetch existing active bookings on that date
    const bookingsSql = `
      SELECT scheduled_time 
      FROM bookings 
      WHERE provider_id = ? AND scheduled_date = ? AND status NOT IN ('Rejected', 'Cancelled')
    `;
    const [existingBookings] = await pool.query(bookingsSql, [pId, dateStr]);

    const bookedTimes = existingBookings.map(b => String(b.scheduled_time).substring(0, 8));

    // 3. Map slot availability
    const slots = DEFAULT_SLOTS.map((time) => {
      let isAvailable = true;
      let reason = 'Available';

      // Check if slot falls into any blocked time window
      for (const block of blockedRecords) {
        const start = block.start_time ? String(block.start_time).substring(0, 8) : '00:00:00';
        const end = block.end_time ? String(block.end_time).substring(0, 8) : '23:59:59';
        if (time >= start && time < end) {
          isAvailable = false;
          reason = 'Provider Unavailable / Blocked';
          break;
        }
      }

      // Check if slot is already booked by another customer
      if (isAvailable && bookedTimes.includes(time)) {
        isAvailable = false;
        reason = 'Already Booked';
      }

      return {
        time,
        label: formatTimeLabel(time),
        available: isAvailable,
        reason
      };
    });

    return res.status(200).json({
      success: true,
      provider_id: pId,
      date: dateStr,
      slots
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return res.status(500).json({ success: false, message: 'Server error checking availability' });
  }
};

/**
 * @desc    Create a new customer booking (Feature 2)
 * @route   POST /api/bookings
 * @access  Protected (Customer)
 */
const createBooking = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { service_id, provider_id, scheduled_date, scheduled_time, notes } = req.body;

    if (!service_id || !scheduled_date || !scheduled_time) {
      return res.status(400).json({
        success: false,
        message: 'service_id, scheduled_date and scheduled_time are required'
      });
    }

    // 1. Fetch service to verify existence, provider_id, and base_price
    const [services] = await pool.query('SELECT * FROM services WHERE id = ?', [Number(service_id)]);
    if (!services || services.length === 0) {
      return res.status(404).json({ success: false, message: 'Selected service does not exist' });
    }

    const service = services[0];
    const targetProviderId = Number(provider_id || service.provider_id);
    const dateStr = String(scheduled_date).split('T')[0];
    const timeStr = String(scheduled_time).length === 5 ? `${scheduled_time}:00` : scheduled_time;
    const totalPrice = Number(service.base_price);

    // 2. Conflict Check: verify provider availability blocks
    const [blocked] = await pool.query(`
      SELECT * FROM provider_availability 
      WHERE provider_id = ? AND date = ? AND is_blocked = 1
    `, [targetProviderId, dateStr]);

    for (const b of blocked) {
      const start = b.start_time ? String(b.start_time).substring(0, 8) : '00:00:00';
      const end = b.end_time ? String(b.end_time).substring(0, 8) : '23:59:59';
      if (timeStr >= start && timeStr < end) {
        return res.status(409).json({
          success: false,
          message: 'The selected provider is unavailable during this time slot. Please choose another time.'
        });
      }
    }

    // 3. Conflict Check: verify existing booking
    const [existing] = await pool.query(`
      SELECT * FROM bookings 
      WHERE provider_id = ? AND scheduled_date = ? AND scheduled_time = ? AND status NOT IN ('Rejected', 'Cancelled')
    `, [targetProviderId, dateStr, timeStr]);

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose an alternative slot.'
      });
    }

    // 4. Insert into bookings table with status 'Pending' (adhering strictly to Week2_Rohan_CONTRACT.md)
    const insertSql = `
      INSERT INTO bookings (customer_id, provider_id, service_id, status, scheduled_date, scheduled_time, total_price, notes)
      VALUES (?, ?, ?, 'Pending', ?, ?, ?, ?)
    `;

    const [result] = await pool.query(insertSql, [
      customer_id,
      targetProviderId,
      Number(service_id),
      dateStr,
      timeStr,
      totalPrice,
      notes || ''
    ]);

    const newBookingId = result.insertId;

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully! Your request is pending provider confirmation.',
      data: {
        id: newBookingId,
        customer_id,
        provider_id: targetProviderId,
        service_id: Number(service_id),
        service_name: service.name,
        status: 'Pending',
        scheduled_date: dateStr,
        scheduled_time: timeStr,
        total_price: totalPrice,
        notes: notes || ''
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating booking' });
  }
};

/**
 * @desc    Fetch all bookings for the currently authenticated customer
 * @route   GET /api/bookings/customer/mine
 * @access  Protected (Customer)
 */
const getCustomerBookings = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const query = `
      SELECT 
        b.id,
        b.customer_id,
        b.provider_id,
        b.service_id,
        b.status,
        b.scheduled_date,
        b.scheduled_time,
        b.total_price,
        b.notes,
        b.created_at,
        b.updated_at,
        s.name AS service_name,
        c.name AS category_name,
        c.icon AS category_icon,
        u.name AS provider_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN users u ON b.provider_id = u.id
      WHERE b.customer_id = ?
      ORDER BY b.scheduled_date DESC, b.scheduled_time DESC
    `;

    const [bookings] = await pool.query(query, [customer_id]);
    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

/**
 * =========================================================================
 * Rohan Contract Compatibility Endpoints (Week2_Rohan_CONTRACT.md)
 * =========================================================================
 */

/**
 * @desc    Fetch all 'Pending' bookings for the currently authenticated provider
 * @route   GET /api/bookings/provider/pending
 * @access  Protected (Provider)
 */
const getProviderPendingBookings = async (req, res) => {
  try {
    const provider_id = req.user.id;
    const query = `
      SELECT 
        b.id,
        b.customer_id,
        b.provider_id,
        b.service_id,
        b.status,
        b.scheduled_date,
        b.scheduled_time,
        b.total_price,
        b.notes,
        b.created_at,
        b.updated_at,
        u.name AS customer_name,
        s.name AS service_name
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.provider_id = ? AND b.status = 'Pending'
      ORDER BY b.scheduled_date ASC
    `;

    const [bookings] = await pool.query(query, [provider_id]);
    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching provider pending bookings:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Updates the status of a specific booking (e.g. Accepting / Rejecting)
 * @route   PUT /api/bookings/:id/status
 * @access  Protected (Provider)
 */
const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const [result] = await pool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, Number(bookingId)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({
      success: true,
      message: `Booking status updated to ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Fetches all blocked availability records for authenticated provider
 * @route   GET /api/availability
 * @access  Protected (Provider)
 */
const getProviderAvailability = async (req, res) => {
  try {
    const provider_id = req.user.id;
    const [records] = await pool.query(
      'SELECT id, provider_id, date, start_time, end_time, is_blocked, created_at FROM provider_availability WHERE provider_id = ? ORDER BY date ASC',
      [provider_id]
    );

    return res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Inserts a new block-out date and time range for authenticated provider
 * @route   POST /api/availability
 * @access  Protected (Provider)
 */
const createProviderAvailability = async (req, res) => {
  try {
    const provider_id = req.user.id;
    const { date, start_time, end_time } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'date is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO provider_availability (provider_id, date, start_time, end_time, is_blocked) VALUES (?, ?, ?, ?, 1)',
      [provider_id, date, start_time || '00:00:00', end_time || '23:59:59']
    );

    return res.status(201).json({
      success: true,
      message: 'Availability block added',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating availability block:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Deletes a specific block-out record
 * @route   DELETE /api/availability/:id
 * @access  Protected (Provider)
 */
const deleteProviderAvailability = async (req, res) => {
  try {
    const provider_id = req.user.id;
    const id = req.params.id;

    const [result] = await pool.query(
      'DELETE FROM provider_availability WHERE id = ? AND provider_id = ?',
      [Number(id), provider_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Availability block not found or unauthorized' });
    }

    return res.status(200).json({
      success: true,
      message: 'Availability block removed'
    });
  } catch (error) {
    console.error('Error removing availability block:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  checkAvailability,
  createBooking,
  getCustomerBookings,
  getProviderPendingBookings,
  updateBookingStatus,
  getProviderAvailability,
  createProviderAvailability,
  deleteProviderAvailability
};
