const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { getRecommendations } = require('../controllers/recommendationController');

// GET /api/recommendations/:location
router.get('/:location', verifyToken, getRecommendations);

module.exports = router;
