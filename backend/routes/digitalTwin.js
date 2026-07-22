const express = require('express');
const router = express.Router();
const { runSimulation } = require('../controllers/digitalTwinController');
const verifyToken = require('../middleware/verifyToken');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/digital-twin/simulate — run policy simulation
router.post('/simulate', verifyToken, asyncHandler(runSimulation));

module.exports = router;
