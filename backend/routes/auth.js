const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const verifyToken = require('../middleware/verifyToken');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const { register, login, me, createInvite } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', [body('name').isLength({ min: 2, max: 100 }), body('email').isEmail(), body('password').isLength({ min: 8, max: 128 })], validate, asyncHandler(register));

// POST /api/auth/login
router.post('/login', [body('email').isEmail(), body('password').isString().notEmpty()], validate, asyncHandler(login));
router.get('/me', verifyToken, asyncHandler(me));
router.post('/invites', verifyToken, requireRole('admin'), [body('email').isEmail(), body('role').isIn(['industry', 'government_officer', 'admin'])], validate, asyncHandler(createInvite));

module.exports = router;
