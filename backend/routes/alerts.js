const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { getAlerts, createAlert, updateAlert } = require('../controllers/alertController');

// GET /api/alerts — accessible to all authenticated users
router.get('/', verifyToken, getAlerts);

// POST /api/alerts — admin only
router.post('/', verifyToken, requireRole('admin'), createAlert);

// PATCH /api/alerts/:id — admin or government_officer
router.patch('/:id', verifyToken, requireRole('admin', 'government_officer'), updateAlert);

module.exports = router;
