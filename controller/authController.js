const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Auth } = require('../models');
const { generateToken } = require('../utils/jwtUtils');
const { sendPasswordResetEmail, sendPasswordResetConfirmation } = require('../utils/emailUtils');

// Password validation function
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
    const { fullName, email, username, password, confirmPassword } = req.body;
    if (!fullName || !email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
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
    console.error('Registration error:', err);
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
    console.error('Login error:', err);
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    console.log('Processing forgot password request for email:', email);

    // Check if user exists
    const user = await Auth.findOne({ where: { email } });
    if (!user) {
      // For security reasons, don't reveal if email exists or not
      console.log('Email not found in database:', email);
      return res.status(200).json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    console.log('Generated reset token for user:', user.id);

    try {
      // Save reset token to database
      await user.update({
        resetToken,
        resetTokenExpiry
      });

      // Create reset URL
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      console.log('Sending password reset email to:', email);

      // Send email
      const emailSent = await sendPasswordResetEmail(email, resetToken, resetUrl);

      if (emailSent) {
        console.log('Password reset email sent successfully to:', email);
        res.status(200).json({ 
          message: 'If an account with that email exists, a password reset link has been sent.',
          success: true
        });
      } else {
        // If email fails, clear the reset token
        await user.update({
          resetToken: null,
          resetTokenExpiry: null
        });
        console.error('Failed to send password reset email to:', email);
        res.status(500).json({ 
          message: 'Failed to send reset email. Please try again later.' 
        });
      }
    } catch (updateError) {
      console.error('Error updating user with reset token:', updateError);
      res.status(500).json({ 
        message: 'Failed to process password reset request. Please try again later.' 
      });
    }
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Verify Reset Token
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        message: 'Token is required',
        valid: false
      });
    }

    if (typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Invalid token format',
        valid: false
      });
    }

    console.log('Verifying reset token:', token);

    // Find user with valid reset token
    const user = await Auth.findOne({
      where: {
        resetToken: token.trim(),
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      console.log('Invalid or expired reset token:', token);
      return res.status(400).json({ 
        message: 'Invalid or expired token',
        valid: false
      });
    }

    console.log('Reset token is valid for user:', user.id);
    res.status(200).json({ 
      message: 'Token is valid',
      valid: true,
      email: user.email // Return email for frontend use
    });
  } catch (err) {
    console.error('Verify reset token error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      valid: false
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

    if (typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Invalid token format' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    console.log('Processing password reset with token:', token);

    // Find user with valid reset token
    const user = await Auth.findOne({
      where: {
        resetToken: token.trim(),
        resetTokenExpiry: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      console.log('Invalid or expired reset token:', token);
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    console.log('Found user for password reset:', user.id);

    try {
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      await user.update({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      });

      console.log('Password updated successfully for user:', user.id);

      // Send confirmation email
      try {
        await sendPasswordResetConfirmation(user.email);
        console.log('Confirmation email sent to:', user.email);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if confirmation email fails
      }

      res.status(200).json({ 
        message: 'Password has been reset successfully',
        success: true
      });
    } catch (updateError) {
      console.error('Error updating user password:', updateError);
      res.status(500).json({ 
        message: 'Failed to reset password. Please try again later.' 
      });
    }
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};



// Logout
exports.logout = (req, res) => {
  try {
    // For JWT-based authentication, logout is handled on the client side
    // by removing the token from storage. The server just confirms the logout.
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
}; 