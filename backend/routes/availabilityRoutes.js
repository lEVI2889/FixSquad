const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

// Provider availability management (Week2_Rohan_CONTRACT.md Feature 8)
router.get('/', protect, bookingController.getProviderAvailability);
router.post('/', protect, bookingController.createProviderAvailability);
router.delete('/:id', protect, bookingController.deleteProviderAvailability);

module.exports = router;
