const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { analyzeRootCause } = require('../controllers/rootCauseController');

// POST /api/root-cause/analyze
router.post('/analyze', verifyToken, analyzeRootCause);

module.exports = router;
