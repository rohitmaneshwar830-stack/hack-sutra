const User = require('../models/User');
const { getPagination, meta } = require('../utils/pagination');
const httpError = require('../utils/httpError');

const getUsers = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const query = {};
  if (req.query.search) query.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }];
  if (req.query.role) query.role = req.query.role;
  const [total, data] = await Promise.all([User.countDocuments(query), User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean()]);
  res.json({ data, meta: meta(page, limit, total) });
};

const updateUser = async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') throw httpError(403, 'Not authorized to update this profile.');
  const update = {};
  for (const field of ['name', 'phone', 'department', 'settings', 'industryId']) if (req.body[field] !== undefined) update[field] = req.body[field];
  if (req.user.role === 'admin' && req.body.role) {
    if (!['citizen', 'industry', 'government_officer', 'admin'].includes(req.body.role)) throw httpError(400, 'Invalid role.');
    update.role = req.body.role;
  }
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select('-passwordHash');
  if (!user) throw httpError(404, 'User not found.', 'USER_NOT_FOUND');
  res.json({ user });
};

const deleteUser = async (req, res) => {
  if (req.user.id === req.params.id) throw httpError(400, 'You cannot delete your own administrator account.');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw httpError(404, 'User not found.', 'USER_NOT_FOUND');
  res.json({ message: 'User deleted successfully.' });
};

module.exports = { getUsers, updateUser, deleteUser };
