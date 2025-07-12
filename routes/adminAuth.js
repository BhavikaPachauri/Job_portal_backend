const express = require('express');
const router = express.Router();
const adminAuthController = require('../controller/adminAuthController');

/**
 * @swagger
 * tags:
 *   name: AdminAuth
 *   description: Admin Authentication endpoints
 */

/**
 * @swagger
 * /api/admin/auth/register:
 *   post:
 *     summary: Register a new admin
 *     tags: [AdminAuth]
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
 *               isSuperAdmin:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       400:
 *         description: Required fields missing
 *       409:
 *         description: Admin already exists
 */
router.post('/register', adminAuthController.register);

/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: Login an admin
 *     tags: [AdminAuth]
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
router.post('/login', adminAuthController.login);

/**
 * @swagger
 * /api/admin/auth/forgot-password:
 *   post:
 *     summary: Send admin password reset link
 *     tags: [AdminAuth]
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
 *                 description: Admin email address
 *     responses:
 *       200:
 *         description: Reset link sent successfully (if email exists)
 *       400:
 *         description: Email is required
 *       500:
 *         description: Server error or email sending failed
 */
router.post('/forgot-password', adminAuthController.forgotPassword);

/**
 * @swagger
 * /api/admin/auth/verify-reset-token:
 *   post:
 *     summary: Verify if an admin reset token is valid
 *     tags: [AdminAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token to verify
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.post('/verify-reset-token', adminAuthController.verifyResetToken);

/**
 * @swagger
 * /api/admin/auth/reset-password:
 *   post:
 *     summary: Reset admin password using token
 *     tags: [AdminAuth]
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
 *               newPassword:
 *                 type: string
 *                 description: New password
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm new password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid token, expired token, or passwords don't match
 *       500:
 *         description: Server error
 */
router.post('/reset-password', adminAuthController.resetPassword);


/**
 * @swagger
 * /api/admin/auth/logout:
 *   get:
 *     summary: Logout admin
 *     tags: [AdminAuth]
 *     description: Logs out the admin and destroys the session.
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.get('/logout', adminAuthController.logout);

module.exports = router; 