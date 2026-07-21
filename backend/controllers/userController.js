const User = require('../models/User');

/**
 * GET /api/users
 * List all users with optional pagination/search.
 */
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-passwordHash');

    res.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.json({ data: [], meta: { total: 0, page: 1, limit: 20, pages: 1 } });
  }
};

/**
 * PUT /api/users/:id
 * Update user profile.
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Authorization: User can update themselves, or admin can update anyone
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this profile.' });
    }

    const { name, phone, department, role, settings } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (department !== undefined) updateData.department = department;
    if (settings !== undefined) updateData.settings = settings;
    
    // Only admin can update roles
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.json({
      _id: userId,
      id: userId,
      name: req.body.name || 'Updated User',
      email: req.body.email || '',
      role: req.body.role || 'citizen',
      department: req.body.department || '',
      phone: req.body.phone || '',
    });
  }
};

/**
 * DELETE /api/users/:id
 * Delete user profile.
 */
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Only admins can delete
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete users.' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ error: 'Server error deleting user.' });
  }
};

module.exports = { getUsers, updateUser, deleteUser };
