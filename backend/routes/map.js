const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const asyncHandler = require('../middleware/asyncHandler');
const { getLayers } = require('../controllers/mapController');

const router = express.Router();
router.get('/layers', verifyToken, asyncHandler(getLayers));
module.exports = router;
