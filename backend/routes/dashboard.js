const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getStats, getRiverHealth, getSensorReadings } = require('../controllers/dashboardController');

// GET /api/dashboard/stats — aggregate stats (public for the landing page)
router.get('/stats', getStats);

// GET /api/river-health/:location — health score
router.get('/river-health/:location', verifyToken, getRiverHealth);

// GET /api/sensor-readings/:location — raw historical data
router.get('/sensor-readings/:location', verifyToken, getSensorReadings);

module.exports = router;
