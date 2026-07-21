const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getPrediction } = require('../controllers/predictionController');

// GET /api/predictions/:location — 5-day BOD forecast
router.get('/:location', verifyToken, getPrediction);

module.exports = router;
