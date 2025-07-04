const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const passport = require('passport');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - username
 *               - password
 *               - confirmPassword
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Required fields missing
 *       409:
 *         description: User already exists
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Required fields missing
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password reset link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to send reset link
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: Reset link sent successfully (if email exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "If an account with that email exists, a password reset link has been sent."
 *       400:
 *         description: Email is required
 *       500:
 *         description: Server error or email sending failed
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token from email
 *                 example: "abc123def456..."
 *               newPassword:
 *                 type: string
 *                 description: New password
 *                 example: "newPassword123"
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm new password
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password has been reset successfully"
 *       400:
 *         description: Invalid token, expired token, or passwords don't match
 *       500:
 *         description: Server error
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Login with Google OAuth
 *     tags: [Auth]
 *     description: Redirects the user to Google for authentication.
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth consent screen
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Auth]
 *     description: Callback endpoint for Google to redirect to after authentication. On success, returns user info; on failure, redirects to login.
 *     responses:
 *       200:
 *         description: Google login successful, returns user info
 *       302:
 *         description: Redirects to login on failure
 */
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/api/auth/login',
}), authController.googleLoginSuccess);

/**
 * @swagger
 * /api/auth/google/success:
 *   get:
 *     summary: Google login success
 *     tags: [Auth]
 *     description: Returns user info if authenticated via Google.
 *     responses:
 *       200:
 *         description: Google login successful, returns user info
 *       401:
 *         description: Not authenticated
 */
router.get('/google/success', authController.googleLoginSuccess);

/**
 * @swagger
 * /api/auth/logout:
 *   get:
 *     summary: Logout user
 *     tags: [Auth]
 *     description: Logs out the user and destroys the session.
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.get('/logout', authController.logout);

module.exports = router; 