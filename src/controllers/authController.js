const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/generateToken');
const userService = require('../services/userService');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: !email ? 'Email is required' : 'Password is required'
      });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    if (user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }
    const token = generateToken(user._id, user.role);
    const populated = await User.findById(user._id)
      .select('-passwordHash')
      .populate({ path: 'studentId', select: 'firstName lastName email programId', populate: { path: 'programId' } })
      .lean();
    res.status(200).json({
      success: true,
      token,
      user: populated,
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    const userObj = user.toObject();
    delete userObj.passwordHash;
    res.status(201).json({
      success: true,
      user: userObj,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash')
      .populate({ path: 'studentId', select: 'firstName lastName email programId', populate: { path: 'programId' } })
      .lean();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getMe };
