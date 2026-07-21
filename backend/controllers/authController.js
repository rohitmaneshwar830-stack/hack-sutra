const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fallbackStore = require('../utils/fallbackStore');

/**
 * Generate JWT token for a user.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * POST /api/auth/register
 * Create a new user account.
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let existingUser;
    try {
      existingUser = await User.findOne({ email: normalizedEmail });
    } catch (error) {
      existingUser = fallbackStore.findUserByEmail(normalizedEmail);
    }

    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const validRoles = ['citizen', 'industry', 'government_officer', 'admin'];
    let userRole = 'citizen';

    if (role && validRoles.includes(role)) {
      if (role === 'admin' || role === 'government_officer') {
        return res.status(403).json({ error: 'Only an existing administrator can create privileged accounts.' });
      }
      userRole = role;
    }

    let user;
    try {
      user = new User({
        name,
        email: normalizedEmail,
        passwordHash: password,
        role: userRole,
      });
      await user.save();
    } catch (error) {
      user = fallbackStore.createUser({
        name,
        email: normalizedEmail,
        passwordHash: password,
        role: userRole,
      });
    }

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        phone: user.phone || '',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

/**
 * POST /api/auth/login
 * Authenticate and return JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user;
    try {
      user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    } catch (error) {
      user = fallbackStore.findUserByEmail(normalizedEmail);
      if (!user || user.passwordHash !== password) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || '',
        phone: user.phone || '',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

module.exports = { register, login };
