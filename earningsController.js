const pool = require('../db');

// GET /api/earnings/summary
// Aggregation happens in SQL (COUNT/SUM/GROUP BY), not in JS — per the
// task requirement.
const getProviderEarningsSummary = async (req, res) => {
  try {
    const [[totals]] = await pool.query(
      `SELECT
         COUNT(*) AS completed_jobs,
         COALESCE(SUM(total_price), 0) AS total_earnings
       FROM bookings
       WHERE provider_id = ? AND status = 'Completed'`,
      [req.user.id]
    );

    const [monthly] = await pool.query(
      `SELECT
         DATE_FORMAT(scheduled_date, '%Y-%m') AS month,
         COUNT(*) AS jobs,
         COALESCE(SUM(total_price), 0) AS earnings
       FROM bookings
       WHERE provider_id = ? AND status = 'Completed'
       GROUP BY DATE_FORMAT(scheduled_date, '%Y-%m')
       ORDER BY month DESC
       LIMIT 12`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        completed_jobs: totals.completed_jobs,
        total_earnings: totals.total_earnings,
        monthly
      }
    });
  } catch (err) {
    console.error('getProviderEarningsSummary error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching earnings summary' });
  }
};

module.exports = { getProviderEarningsSummary };
