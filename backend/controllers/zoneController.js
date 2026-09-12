const pool = require('../config/db');

// POST /api/zones
// Body: { zone_name }
const addZone = async (req, res) => {
  const zoneName = (req.body.zone_name || '').trim();

  if (!zoneName) {
    return res.status(400).json({ success: false, message: 'zone_name is required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO provider_service_zones (provider_id, zone_name) VALUES (?, ?)',
      [req.user.id, zoneName]
    );

    return res.status(201).json({
      success: true,
      message: 'Zone added',
      data: { id: result.insertId, zone_name: zoneName }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'You already cover this zone' });
    }
    console.error('addZone error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error adding zone' });
  }
};

// GET /api/zones/mine
const getMyZones = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, zone_name, created_at FROM provider_service_zones WHERE provider_id = ? ORDER BY zone_name ASC',
      [req.user.id]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('getMyZones error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching zones' });
  }
};

// DELETE /api/zones/:id
const deleteZone = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM provider_service_zones WHERE id = ? AND provider_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Zone not found' });
    }

    return res.status(200).json({ success: true, message: 'Zone removed' });
  } catch (err) {
    console.error('deleteZone error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error removing zone' });
  }
};

// GET /api/zones
// Distinct list of every zone name any provider has tagged themselves
// with — used to populate the search filter dropdown.
const getAllZones = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DISTINCT zone_name FROM provider_service_zones ORDER BY zone_name ASC'
    );

    return res.status(200).json({ success: true, data: rows.map((r) => r.zone_name) });
  } catch (err) {
    console.error('getAllZones error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching zones' });
  }
};

module.exports = { addZone, getMyZones, deleteZone, getAllZones };
