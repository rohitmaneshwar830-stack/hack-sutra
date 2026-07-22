const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { getAlerts, createAlert, updateAlert } = require('../controllers/alertController');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/alerts — accessible to all authenticated users
router.get('/', verifyToken, asyncHandler(getAlerts));

// POST /api/alerts — admin only
router.post('/', verifyToken, requireRole('admin'), asyncHandler(createAlert));

// PATCH /api/alerts/:id — admin or government_officer
router.patch('/:id', verifyToken, requireRole('admin', 'government_officer'), asyncHandler(updateAlert));

module.exports = router;
