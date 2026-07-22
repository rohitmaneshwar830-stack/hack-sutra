const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { param } = require('express-validator');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');

// Admin/Gov get all users
router.get('/', verifyToken, requireRole('admin', 'government_officer'), asyncHandler(getUsers));

// User updates their own profile, or Admin updates anyone
router.put('/:id', 
  verifyToken, 
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  asyncHandler(updateUser)
);

// Admin deletes user
router.delete('/:id',
  verifyToken,
  requireRole('admin'),
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  asyncHandler(deleteUser)
);

module.exports = router;
