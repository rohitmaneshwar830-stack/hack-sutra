const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const asyncHandler = require('../middleware/asyncHandler');
const { getCompliance } = require('../controllers/industryController');

const router = express.Router();
router.get('/compliance', verifyToken, requireRole('industry', 'admin', 'government_officer'), asyncHandler(getCompliance));
module.exports = router;
