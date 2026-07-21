const express = require('express');
const router = express.Router();
const { runSimulation } = require('../controllers/digitalTwinController');

// POST /api/digital-twin/simulate — run policy simulation
router.post('/simulate', runSimulation);

module.exports = router;
