const pool = require('../db');

/**
 * @desc    Dynamic Service Search & Filter (Feature 1)
 * @route   GET /api/services/search
 * @access  Public
 */
const searchServices = async (req, res) => {
  try {
    const { keyword, category_id, min_price, max_price, sort } = req.query;

    let sql = `
      SELECT 
        s.id,
        s.provider_id,
        s.category_id,
        s.name,
        s.description,
        s.base_price,
        s.created_at,
        c.name AS category_name,
        c.icon AS category_icon,
        u.name AS provider_name,
        COALESCE(u.rating, 4.8) AS provider_rating,
        COALESCE(u.total_reviews, 12) AS total_reviews
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN users u ON s.provider_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Dynamic keyword search across service name, description, and category name
    if (keyword && keyword.trim()) {
      const searchTerm = `%${keyword.trim()}%`;
      sql += ` AND (s.name LIKE ? OR s.description LIKE ? OR c.name LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Dynamic category filter
    if (category_id && category_id !== 'all' && !isNaN(category_id)) {
      sql += ` AND s.category_id = ?`;
      params.push(Number(category_id));
    }

    // Dynamic price range filters
    if (min_price && !isNaN(min_price)) {
      sql += ` AND s.base_price >= ?`;
      params.push(Number(min_price));
    }
    if (max_price && !isNaN(max_price)) {
      sql += ` AND s.base_price <= ?`;
      params.push(Number(max_price));
    }

    // Dynamic sorting
    if (sort === 'price_asc') {
      sql += ` ORDER BY s.base_price ASC`;
    } else if (sort === 'price_desc') {
      sql += ` ORDER BY s.base_price DESC`;
    } else if (sort === 'rating_desc') {
      sql += ` ORDER BY u.rating DESC, s.created_at DESC`;
    } else {
      sql += ` ORDER BY s.created_at DESC`;
    }

    const [services] = await pool.query(sql, params);

    // Apply in-memory dynamic filter if running on fallback store
    let filtered = services;
    if (keyword && keyword.trim()) {
      const term = keyword.trim().toLowerCase();
      filtered = filtered.filter(s => 
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.description && s.description.toLowerCase().includes(term)) ||
        (s.category_name && s.category_name.toLowerCase().includes(term))
      );
    }
    if (category_id && category_id !== 'all' && !isNaN(category_id)) {
      filtered = filtered.filter(s => Number(s.category_id) === Number(category_id));
    }
    if (min_price && !isNaN(min_price)) {
      filtered = filtered.filter(s => Number(s.base_price) >= Number(min_price));
    }
    if (max_price && !isNaN(max_price)) {
      filtered = filtered.filter(s => Number(s.base_price) <= Number(max_price));
    }
    if (sort === 'price_asc') {
      filtered.sort((a, b) => Number(a.base_price) - Number(b.base_price));
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => Number(b.base_price) - Number(a.base_price));
    } else if (sort === 'rating_desc') {
      filtered.sort((a, b) => Number(b.provider_rating || 0) - Number(a.provider_rating || 0));
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    console.error('Error searching services:', error);
    return res.status(500).json({ success: false, message: 'Server Error during service search' });
  }
};

/**
 * @desc    Get single service by ID with provider & category details
 * @route   GET /api/services/:id
 * @access  Public
 */
const getServiceById = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const sql = `
      SELECT 
        s.id,
        s.provider_id,
        s.category_id,
        s.name,
        s.description,
        s.base_price,
        s.created_at,
        c.name AS category_name,
        c.icon AS category_icon,
        u.name AS provider_name,
        COALESCE(u.rating, 4.8) AS provider_rating,
        COALESCE(u.total_reviews, 12) AS total_reviews
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN users u ON s.provider_id = u.id
      WHERE s.id = ?
    `;
    const [services] = await pool.query(sql, [serviceId]);

    if (!services || services.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    return res.status(200).json({
      success: true,
      data: services[0]
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Get all services for authenticated provider
 * @route   GET /api/services
 * @access  Protected (Provider)
 */
const getProviderServices = async (req, res) => {
  try {
    const providerId = req.user.id;
    const query = `
      SELECT s.*, c.name as category_name 
      FROM services s 
      LEFT JOIN categories c ON s.category_id = c.id 
      WHERE s.provider_id = ?
      ORDER BY s.created_at DESC
    `;
    const [services] = await pool.query(query, [providerId]);
    return res.status(200).json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching provider services:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Protected (Provider)
 */
const createService = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { category_id, name, description, base_price } = req.body;

    if (!category_id || !name || base_price === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const query = `
      INSERT INTO services (provider_id, category_id, name, description, base_price) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [providerId, category_id, name, description, base_price]);
    
    return res.status(201).json({ 
      success: true, 
      message: 'Service created successfully',
      data: { id: result.insertId, provider_id: providerId, category_id, name, description, base_price }
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update an existing service
 * @route   PUT /api/services/:id
 * @access  Protected (Provider)
 */
const updateService = async (req, res) => {
  try {
    const providerId = req.user.id;
    const serviceId = req.params.id;
    const { category_id, name, description, base_price } = req.body;

    if (!category_id || !name || base_price === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const query = `
      UPDATE services 
      SET category_id = ?, name = ?, description = ?, base_price = ? 
      WHERE id = ? AND provider_id = ?
    `;
    const [result] = await pool.query(query, [category_id, name, description, base_price, serviceId, providerId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
    }
    
    return res.status(200).json({ success: true, message: 'Service updated successfully' });
  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/services/:id
 * @access  Protected (Provider)
 */
const deleteService = async (req, res) => {
  try {
    const providerId = req.user.id;
    const serviceId = req.params.id;

    const query = `
      DELETE FROM services 
      WHERE id = ? AND provider_id = ?
    `;
    const [result] = await pool.query(query, [serviceId, providerId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
    }
    
    return res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  searchServices,
  getServiceById,
  getProviderServices,
  createService,
  updateService,
  deleteService
};
