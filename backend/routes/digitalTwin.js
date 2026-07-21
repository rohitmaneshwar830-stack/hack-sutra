const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { runSimulation } = require('../controllers/digitalTwinController');

// POST /api/digital-twin/simulate — run policy simulation
router.post('/simulate', verifyToken, requireRole('admin'), runSimulation);

module.exports = router;
