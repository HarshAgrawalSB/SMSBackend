const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getUsers = async (filters = {}, options = {}) => {
  const query = User.find(filters)
    .select('-passwordHash')
    .populate('studentId', 'firstName lastName email')
    .sort({ createdAt: -1 });
  if (options.limit) query.limit(options.limit);
  if (options.skip) query.skip(options.skip);
  return query.lean();
};

const getUsersPaginated = async (filters = {}, { page = 1, limit = 10 } = {}) => {
  const skip = Math.max(0, (Number(page) || 1) - 1) * Math.max(1, Math.min(100, Number(limit) || 10));
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 10));
  const [data, total] = await Promise.all([
    getUsers(filters, { skip, limit: safeLimit }),
    User.countDocuments(filters)
  ]);
  return { data, total };
};

const getUserById = async (id) => {
  const user = await User.findById(id)
    .select('-passwordHash')
    .populate('studentId', 'firstName lastName email programId');
  if (!user) throw new Error('User not found');
  return user;
};

const createUser = async (data) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new Error('Email already registered');
  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    role: data.role,
    studentId: data.studentId || null,
    status: data.status || 'ACTIVE'
  });
  return user;
};

const updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');
  if (user.role === 'ADMIN') throw new Error('Admin user cannot be edited');
  if (data.email && data.email !== user.email) {
    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) throw new Error('Email already in use');
    user.email = data.email.toLowerCase();
  }
  if (data.name !== undefined) user.name = data.name;
  if (data.role !== undefined) user.role = data.role;
  if (data.studentId !== undefined) user.studentId = data.studentId;
  if (data.status !== undefined) user.status = data.status;
  if (data.password && data.password.trim()) {
    user.passwordHash = await bcrypt.hash(data.password, 12);
  }
  await user.save();
  return user;
};

const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error('User not found');
  if (user.role === 'ADMIN') throw new Error('Admin user cannot be deleted');
  await User.findByIdAndDelete(id);
  return user;
};

module.exports = {
  getUsers,
  getUsersPaginated,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
