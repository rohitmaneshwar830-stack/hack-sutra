const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const asyncHandler = require('../middleware/asyncHandler');
const { getSpeciesAlerts } = require('../controllers/speciesController');
const router = express.Router();
router.get('/', verifyToken, asyncHandler(getSpeciesAlerts));
module.exports = router;
