const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { analyzeRootCause } = require('../controllers/rootCauseController');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/root-cause/analyze
router.post('/analyze', verifyToken, asyncHandler(analyzeRootCause));

module.exports = router;
