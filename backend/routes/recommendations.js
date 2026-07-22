const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getRecommendations } = require('../controllers/recommendationController');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/recommendations/:location
router.get('/:location', verifyToken, asyncHandler(getRecommendations));

module.exports = router;
