const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Invite = require('../models/Invite');
const httpError = require('../utils/httpError');

const getToken = (user) => {
  if (!process.env.JWT_SECRET) throw httpError(503, 'Authentication is not configured.', 'AUTH_NOT_CONFIGURED');
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  );
};

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department || '',
  phone: user.phone || '',
  settings: user.settings || {},
});

const hashInvite = (token) => crypto.createHash('sha256').update(token).digest('hex');

const register = async (req, res) => {
  const { name, email, password, inviteToken } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Name, email, and password are required.');
  if (String(password).length < 8) throw httpError(400, 'Password must contain at least 8 characters.');

  const normalizedEmail = email.toLowerCase().trim();
  let role = 'citizen';
  let invite = null;
  if (inviteToken) {
    invite = await Invite.findOne({ tokenHash: hashInvite(inviteToken), email: normalizedEmail, usedAt: null, expiresAt: { $gt: new Date() } });
    if (!invite) throw httpError(400, 'Invitation is invalid or expired.', 'INVALID_INVITE');
    role = invite.role;
  }

  if (await User.exists({ email: normalizedEmail })) throw httpError(409, 'An account with this email already exists.', 'EMAIL_EXISTS');
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: password, role });
  if (invite) await Invite.updateOne({ _id: invite._id }, { usedAt: new Date() });

  res.status(201).json({ token: getToken(user), user: publicUser(user) });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required.');
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await user.comparePassword(password))) throw httpError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
  user.lastLoginAt = new Date();
  await user.save();
  res.json({ token: getToken(user), user: publicUser(user) });
};

const me = async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) throw httpError(401, 'User account no longer exists.', 'USER_NOT_FOUND');
  res.json({ user: publicUser(user) });
};

const createInvite = async (req, res) => {
  const { email, role, expiresInHours = 72 } = req.body;
  if (!email || !['industry', 'government_officer', 'admin'].includes(role)) {
    throw httpError(400, 'Email and a valid privileged role are required.');
  }
  const token = crypto.randomBytes(32).toString('hex');
  await Invite.create({
    email: email.toLowerCase().trim(), role, tokenHash: hashInvite(token), createdBy: req.user.id,
    expiresAt: new Date(Date.now() + Math.min(Number(expiresInHours), 168) * 60 * 60 * 1000),
  });
  res.status(201).json({ email: email.toLowerCase().trim(), role, inviteToken: token });
};

module.exports = { register, login, me, createInvite, publicUser };
