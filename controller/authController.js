const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Auth } = require('../models');
const { generateToken } = require('../utils/jwtUtils');
const { sendPasswordResetEmail } = require('../utils/emailUtils');

// Register
exports.register = async (req, res) => {
  try {
    const { fullName, email, username, password, confirmPassword } = req.body;
    if (!fullName || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const existingUser = await Auth.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Auth.create({
      fullName,
      email,
      username,
      password: hashedPassword
    });
    const { password: _, ...userData } = user.toJSON();
    res.status(201).json({
      message: 'User registered successfully',
      user: userData
    });
  } catch (err) {
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
    const user = await Auth.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken({ id: user.id, email: user.email });
    const { password: _, ...userData } = user.toJSON();
    res.status(200).json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (err) {
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

    // Check if user exists
    const user = await Auth.findOne({ where: { email } });
    if (!user) {
      // For security reasons, don't reveal if email exists or not
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await user.update({
      resetToken,
      resetTokenExpiry
    });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send email
    const emailSent = await sendPasswordResetEmail(email, resetToken, resetUrl);

    if (emailSent) {
      res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    } else {
      // If email fails, clear the reset token
      await user.update({
        resetToken: null,
        resetTokenExpiry: null
      });
      res.status(500).json({ 
        message: 'Failed to send reset email. Please try again later.' 
      });
    }
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    
    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Token, new password, and confirm password are required' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Find user with valid reset token
    const user = await Auth.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [require('sequelize').Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await user.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    });

    res.status(200).json({ 
      message: 'Password has been reset successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Google OAuth login success
exports.googleLoginSuccess = (req, res) => {
  if (req.isAuthenticated() && req.user) {
    const { password, ...userData } = req.user.toJSON ? req.user.toJSON() : req.user;
    res.status(200).json({
      message: 'Google login successful',
      user: userData
    });
  } else {
    res.redirect('/api/auth/login');
  }
};

// Logout
exports.logout = (req, res) => {
  req.logout(function(err) {
    if (err) {
      return res.status(500).json({ message: 'Logout failed', error: err.message });
    }
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
}; 