const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { logActivity } = require('../utils/logger');

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'User account is inactive or suspended.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logActivity({
        action: 'FAILED_LOGIN_ATTEMPT',
        category: 'AUTH',
        userName: email,
        details: 'Failed authentication attempt with invalid credentials',
        status: 'WARNING'
      });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    await logActivity({
      action: 'USER_LOGIN',
      category: 'AUTH',
      userId: user._id,
      userName: user.name,
      details: `User ${user.email} (${user.role}) logged in successfully.`
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role === 'ADMIN' ? 'ADMIN' : 'ANALYST',
      status: 'ACTIVE'
    });

    await logActivity({
      action: 'USER_REGISTER',
      category: 'AUTH',
      userId: user._id,
      userName: user.name,
      details: `New account registered for ${user.email} with role ${user.role}.`
    });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase().trim() });
  if (!user) {
    return res.status(404).json({ success: false, message: 'No account associated with that email.' });
  }
  res.json({
    success: true,
    message: 'Password reset link generated. (Use default admin credentials or use reset password API)'
  });
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and newPassword are required.' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    await logActivity({
      action: 'PASSWORD_RESET',
      category: 'AUTH',
      userId: user._id,
      userName: user.name,
      details: `Password reset for user ${user.email}.`
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getProfile, forgotPassword, resetPassword };
