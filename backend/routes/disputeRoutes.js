const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const disputeController = require('../controllers/disputeController');

router.post('/', protect, disputeController.createDispute);
router.get('/mine', protect, disputeController.getUserDisputes);

module.exports = router;
