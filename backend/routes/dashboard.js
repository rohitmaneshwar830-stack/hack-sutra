const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const asyncHandler = require('../middleware/asyncHandler');
const { getStats, getRiverHealth, getSensorReadings } = require('../controllers/dashboardController');

const router = express.Router();
// All dashboard routes require authentication — no public exposure of internal DB metrics.
router.get('/overview', verifyToken, asyncHandler(getStats));
router.get('/river-health/:location', verifyToken, asyncHandler(getRiverHealth));
router.get('/sensor-readings/:location', verifyToken, asyncHandler(getSensorReadings));

module.exports = router;
