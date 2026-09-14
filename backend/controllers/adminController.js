const pool = require('../config/db');

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

exports.toggleUserSuspension = async (req, res) => {
  const { id } = req.params;
  const { is_suspended } = req.body;

  if (parseInt(id, 10) === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'An admin cannot suspend their own account.'
    });
  }

  if (is_suspended !== 0 && is_suspended !== 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid value for is_suspended. Must be 0 (reactivate) or 1 (suspend).'
    });
  }

  try {
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

exports.getAllUsers = async (req, res) => {
  try {
    const sql = `
      SELECT id, name, email, role, verification_status, is_suspended, created_at
      FROM users
      ORDER BY created_at DESC
    `;
    const [users] = await pool.query(sql);

    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (err) {
    console.error('getAllUsers error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching users.' });
  }
};

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


exports.getAnalyticsOverview = async (req, res) => {
  try {
    const transactionSql = `
      SELECT SUM(total_price) as total_volume 
      FROM bookings 
      WHERE status = 'Completed'
    `;
    const [transactions] = await pool.query(transactionSql);
    
    const usersSql = `
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `;
    const [users] = await pool.query(usersSql);
    let totalUsers = 0;
    users.forEach(u => totalUsers += u.count);

    const jobsSql = `
      SELECT status, COUNT(*) as count 
      FROM bookings 
      WHERE status IN ('Pending', 'Accepted', 'In-Progress')
      GROUP BY status
    `;
    const [jobs] = await pool.query(jobsSql);
    let activeJobs = 0;
    jobs.forEach(j => activeJobs += j.count);

    return res.status(200).json({
      success: true,
      data: {
        transaction_volume: transactions[0].total_volume || 0,
        total_users: totalUsers,
        active_jobs: activeJobs,
        user_breakdown: users,
        job_breakdown: jobs
      }
    });
  } catch (err) {
    console.error('getAnalyticsOverview error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error while fetching analytics.' });
  }
};
