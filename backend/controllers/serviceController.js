const pool = require('../config/db');

// Get all services for a specific provider
const getProviderServices = async (req, res) => {
    try {
        const providerId = req.user.id; // Assuming auth middleware sets req.user
        
        const query = `
            SELECT s.*, c.name as category_name 
            FROM services s 
            LEFT JOIN categories c ON s.category_id = c.id 
            WHERE s.provider_id = ?
            ORDER BY s.created_at DESC
        `;
        
        // Use pool.execute for prepared statements (mysql2) or pool.query depending on the driver.
        const [services] = await pool.query(query, [providerId]);
        
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        console.error('Error fetching provider services:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Create a new service
const createService = async (req, res) => {
    try {
        const providerId = req.user.id;
        // image_url is optional — populated after a separate POST /api/upload/service-image call
        const { category_id, name, description, base_price, image_url = null } = req.body;

        if (!category_id || !name || base_price === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const query = `
            INSERT INTO services (provider_id, category_id, name, description, base_price, image_url) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.query(query, [providerId, category_id, name, description, base_price, image_url]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Service created successfully',
            data: { id: result.insertId, provider_id: providerId, category_id, name, description, base_price, image_url }
        });
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// Update an existing service
const updateService = async (req, res) => {
    try {
        const providerId = req.user.id;
        const serviceId = req.params.id;
        // image_url is optional — pass it to update the image, omit to leave it unchanged
        const { category_id, name, description, base_price, image_url } = req.body;

        if (!category_id || !name || base_price === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Only include image_url in the SET clause if the caller explicitly sent it
        const hasImage = image_url !== undefined;
        const query = hasImage
            ? `UPDATE services SET category_id = ?, name = ?, description = ?, base_price = ?, image_url = ? WHERE id = ? AND provider_id = ?`
            : `UPDATE services SET category_id = ?, name = ?, description = ?, base_price = ? WHERE id = ? AND provider_id = ?`;
        const params = hasImage
            ? [category_id, name, description, base_price, image_url, serviceId, providerId]
            : [category_id, name, description, base_price, serviceId, providerId];

        const [result] = await pool.query(query, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Service not found or unauthorized' });
        }
        
        res.status(200).json({ success: true, message: 'Service updated successfully' });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// Delete a service
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
        
        res.status(200).json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const searchServices = async (req, res) => {
  try {
    const { keyword, category_id, min_price, max_price, sort, zone } = req.query;

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
        4.8 AS provider_rating,
        12 AS total_reviews
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      LEFT JOIN users u ON s.provider_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Dynamic zone filter
    if (zone && zone.trim()) {
      sql += ` AND s.provider_id IN (SELECT provider_id FROM provider_service_zones WHERE zone_name = ?)`;
      params.push(zone.trim());
    }

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

    console.log('SQL:', sql, params);
    const [services] = await pool.query(sql, params);
    console.log('Services length:', services.length);

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
        4.8 AS provider_rating,
        12 AS total_reviews
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



module.exports = {
  getProviderServices,
  createService,
  updateService,
  deleteService,
  searchServices,
  getServiceById
};

