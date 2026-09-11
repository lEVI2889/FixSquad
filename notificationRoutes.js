const express = require('express');
const router = express.Router();
const { getMyNotifications, markNotificationRead } = require('../controllers/notificationController');

router.get('/', getMyNotifications);
router.put('/:id/read', markNotificationRead);

module.exports = router;
