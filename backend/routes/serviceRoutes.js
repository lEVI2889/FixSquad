const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Assuming an authMiddleware exists to verify tokens and populate req.user
// const { protect } = require('../middleware/authMiddleware'); 
// For now, we will map them directly; the team will apply the auth middleware centrally or here.
// e.g., router.use(protect);

router.route('/')
    .get(serviceController.getProviderServices)
    .post(serviceController.createService);

router.route('/:id')
    .put(serviceController.updateService)
    .delete(serviceController.deleteService);

module.exports = router;
