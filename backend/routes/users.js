const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { param } = require('express-validator');
const validate = require('../middleware/validate');

// Admin/Gov get all users
router.get('/', verifyToken, requireRole('admin', 'government_officer'), getUsers);

// User updates their own profile, or Admin updates anyone
router.put('/:id', 
  verifyToken, 
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  updateUser
);

// Admin deletes user
router.delete('/:id',
  verifyToken,
  requireRole('admin'),
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  deleteUser
);

module.exports = router;
