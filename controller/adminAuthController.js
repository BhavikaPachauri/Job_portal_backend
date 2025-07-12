const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Admin } = require('../models');
const { generateToken } = require('../utils/jwtUtils');
const { sendPasswordResetEmail, sendPasswordResetConfirmation } = require('../utils/emailUtils');

// Password validation function (reuse from user auth)
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long` };
  }
  if (!hasUpperCase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!hasLowerCase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!hasNumbers) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true };
};

// Register
exports.register = async (req, res) => {
  try {
    const { fullName, email, username, password, confirmPassword, isSuperAdmin } = req.body;
    if (!fullName || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin already exists with this email' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      fullName,
      email,
      username,
      password: hashedPassword,
      isSuperAdmin: !!isSuperAdmin
    });
    const { password: _, ...adminData } = admin.toJSON();
    res.status(201).json({
      message: 'Admin registered successfully',
      admin: adminData
    });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken({ id: admin.id, email: admin.email, isSuperAdmin: admin.isSuperAdmin, admin: true });
    const { password: _, ...adminData } = admin.toJSON();
    res.status(200).json({
      message: 'Login successful',
      token,
      admin: adminData
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000);
    await admin.update({ resetToken, resetTokenExpiry });
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;
    const emailSent = await sendPasswordResetEmail(email, resetToken, resetUrl);
    if (emailSent) {
      res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } else {
      await admin.update({ resetToken: null, resetTokenExpiry: null });
      res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
    }
  } catch (err) {
    console.error('Admin forgot password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify Reset Token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required', valid: false });
    }
    if (typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid token format', valid: false });
    }
    const admin = await Admin.findOne({
      where: {
        resetToken: token.trim(),
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid or expired token', valid: false });
    }
    res.status(200).json({ message: 'Token is valid', valid: true, email: admin.email });
  } catch (err) {
    console.error('Admin verify reset token error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ message: 'Invalid token format' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    const admin = await Admin.findOne({
      where: {
        resetToken: token.trim(),
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });
    if (!admin) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await admin.update({ password: hashedPassword, resetToken: null, resetTokenExpiry: null });
    await sendPasswordResetConfirmation(admin.email);
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Admin reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    // For JWT-based authentication, logout is handled on the client side
    // by removing the token from storage. The server just confirms the logout.
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Admin logout error:', err);
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
}; 