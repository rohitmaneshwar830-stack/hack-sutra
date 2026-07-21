const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { createReport, getReports, updateReportStatus } = require('../controllers/reportController');

let upload;
try {
  ({ upload } = require('../config/cloudinary'));
} catch (e) {
  // Fallback if Cloudinary is not configured — use memory storage
  const multer = require('multer');
  upload = multer({ storage: multer.memoryStorage() });
  console.warn('Cloudinary not configured. Image uploads will not be persisted.');
}

// POST /api/reports — citizen submits report (with optional image)
router.post('/', verifyToken, requireRole('citizen'), upload.single('image'), createReport);

// GET /api/reports — citizens see own, admins see all
router.get('/', verifyToken, getReports);

// PATCH /api/reports/:id — admin updates status
router.patch('/:id', verifyToken, requireRole('admin'), updateReportStatus);

module.exports = router;
