const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getSpeciesAlerts } = require('../controllers/speciesController');

// GET /api/species-alerts — biodiversity risk data
router.get('/', verifyToken, getSpeciesAlerts);

module.exports = router;
