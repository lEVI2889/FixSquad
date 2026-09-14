const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const messageController = require('../controllers/messageController');

const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 30, // limit each IP to 30 requests per windowMs
  message: { success: false, message: 'Too many messages sent from this IP, please try again after a minute' }
});

router.get('/:bookingId', messageController.getMessages);
router.post('/:bookingId', messageLimiter, messageController.sendMessage);

module.exports = router;
