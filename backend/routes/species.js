const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getSpeciesAlerts } = require('../controllers/speciesController');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/species-alerts — biodiversity risk data
router.get('/', verifyToken, asyncHandler(getSpeciesAlerts));

module.exports = router;
