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
        const { category_id, name, description, base_price } = req.body;

        if (!category_id || !name || base_price === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const query = `
            INSERT INTO services (provider_id, category_id, name, description, base_price) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await pool.query(query, [providerId, category_id, name, description, base_price]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Service created successfully',
            data: { id: result.insertId, provider_id: providerId, category_id, name, description, base_price }
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

module.exports = {
    getProviderServices,
    createService,
    updateService,
    deleteService
};
