const nodemailer = require('nodemailer');

// Create transporter (you can configure this based on your email service)
const createTransporter = () => {
  // Check if email configuration is set up
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email configuration not found. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
    return null;
  }

  // For development, you can use Gmail or other services
  // You'll need to set up environment variables for production
  return nodemailer.createTransport({
    service: 'gmail', // or 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, resetUrl) => {
  try {
    const transporter = createTransporter();
    
    // If email is not configured, log the reset URL for development
    if (!transporter) {
      console.log('Email not configured. Reset URL for development:', resetUrl);
      console.log('Reset token:', resetToken);
      return true; // Return true to not block the password reset process
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - Job Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; margin: 0;">Password Reset Request</h2>
          </div>
          <p>Hello,</p>
          <p>You have requested to reset your password for your Job Portal account. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
          </div>
          <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">Best regards,<br><strong>Job Portal Team</strong></p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email: ', error);
    return false;
  }
};

// Send password reset confirmation email
const sendPasswordResetConfirmation = async (email) => {
  try {
    const transporter = createTransporter();
    
    // If email is not configured, just log for development
    if (!transporter) {
      console.log('Email not configured. Password reset confirmation for:', email);
      return true; // Return true to not block the password reset process
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Successful - Job Portal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #28a745; margin: 0;">Password Reset Successful</h2>
          </div>
          <p>Hello,</p>
          <p>Your password has been successfully reset for your Job Portal account.</p>
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #155724;"><strong>Success:</strong> You can now log in with your new password.</p>
          </div>
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;"><strong>Security Notice:</strong> If you didn't perform this action, please contact our support team immediately.</p>
          </div>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">Best regards,<br><strong>Job Portal Team</strong></p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent successfully: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email: ', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendPasswordResetConfirmation
}; 