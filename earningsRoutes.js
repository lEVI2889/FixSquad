const express = require('express');
const router = express.Router();
const { getProviderEarningsSummary } = require('../controllers/earningsController');

router.get('/summary', getProviderEarningsSummary);

module.exports = router;
