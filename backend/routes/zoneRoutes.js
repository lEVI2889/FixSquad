const express = require('express');
const router = express.Router();
const { addZone, getMyZones, deleteZone, getAllZones } = require('../controllers/zoneController');

router.post('/', addZone);
router.get('/mine', getMyZones);
router.delete('/:id', deleteZone);
router.get('/', getAllZones);

module.exports = router;
