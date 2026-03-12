const userService = require('../services/userService');

const getUsers = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.role) filters.role = req.query.role;
    if (req.query.status) filters.status = req.query.status;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const { data, total } = await userService.getUsersPaginated(filters, { page, limit });
    const totalPages = Math.ceil(total / limit);
    res.status(200).json({ success: true, data, total, page, limit, totalPages });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.status(201).json({ success: true, data: userObj, message: 'User created' });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.status(200).json({ success: true, data: userObj, message: 'User updated' });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
