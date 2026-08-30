const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

// Public Search & Detail endpoints (Feature 1)
router.get('/search', serviceController.searchServices);
router.get('/:id', serviceController.getServiceById);

// Protected Provider Operations (Feature 6 & Sprint Integration)
router.get('/', protect, serviceController.getProviderServices);
router.post('/', protect, serviceController.createService);
router.put('/:id', protect, serviceController.updateService);
router.delete('/:id', protect, serviceController.deleteService);

module.exports = router;
