const express = require('express');
const router = express.Router();
const {
  getUnverifiedProviders,
  updateProviderVerification,
  toggleUserSuspension,
  getAllUsers,
  getDisputedBookings,
  resolveDispute,
  getAnalyticsOverview
} = require('../controllers/adminController');

router.get('/providers/unverified', getUnverifiedProviders);
router.put('/providers/:id/verify', updateProviderVerification);
router.put('/users/:id/suspend', toggleUserSuspension);
router.get('/users', getAllUsers);
router.get('/disputes', getDisputedBookings);
router.put('/disputes/:id/resolve', resolveDispute);

router.get('/analytics', getAnalyticsOverview);

module.exports = router;
