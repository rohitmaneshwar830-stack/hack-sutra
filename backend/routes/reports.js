const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { createReport, getReports, updateReportStatus } = require('../controllers/reportController');
const asyncHandler = require('../middleware/asyncHandler');

const { upload, isConfigured } = require('../config/cloudinary');
const requireUploadStorage = (req, res, next) => {
  if (req.file && !isConfigured) return res.status(503).json({ error: { code: 'UPLOAD_NOT_CONFIGURED', message: 'Image storage is not configured for photo uploads.' } });
  next();
};

// POST /api/reports — citizen submits report (with optional image)
router.post('/', verifyToken, requireRole('citizen'), upload.single('image'), requireUploadStorage, asyncHandler(createReport));

// GET /api/reports — citizens see own, admins see all
router.get('/', verifyToken, asyncHandler(getReports));

// PATCH /api/reports/:id — admin updates status
router.patch('/:id', verifyToken, requireRole('admin', 'government_officer'), asyncHandler(updateReportStatus));

module.exports = router;
