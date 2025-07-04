const express = require('express');
const router = express.Router();
const settingController = require('../controller/settingController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = file.fieldname === 'logo' ? 'uploads/settings/logos/' : 'uploads/settings/covers/';
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: User settings management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Location:
 *       type: object
 *       properties:
 *         country:
 *           type: string
 *           example: "United States of America"
 *         city:
 *           type: string
 *           example: "Chicago"
 *         address:
 *           type: string
 *           example: "205 North Michigan Avenue, Suite 810, Chicago, 60601, USA"
 *         latitude:
 *           type: number
 *           example: 41.881832
 *         longitude:
 *           type: number
 *           example: -87.623177
 *         mapUrl:
 *           type: string
 *           example: "https://maps.google.com/?q=41.881832,-87.623177"
 *     Notifications:
 *       type: object
 *       properties:
 *         jobAlert:
 *           type: boolean
 *           example: true
 *         weeklySummary:
 *           type: boolean
 *           example: false
 *         applicationUpdates:
 *           type: boolean
 *           example: true
 *         newsletter:
 *           type: boolean
 *           example: false
 *     Privacy:
 *       type: object
 *       properties:
 *         profileVisibility:
 *           type: string
 *           enum: [public, private, friends]
 *           example: "public"
 *         resumeDownloadable:
 *           type: boolean
 *           example: true
 *         emailVisible:
 *           type: boolean
 *           example: false
 *     Settings:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Settings ID
 *         userId:
 *           type: integer
 *           description: User ID
 *         companyName:
 *           type: string
 *           example: "WillowTree"
 *         email:
 *           type: string
 *           format: email
 *           example: "willowtree@gmail.com"
 *         phone:
 *           type: string
 *           example: "01 - 234 567 89"
 *         website:
 *           type: string
 *           format: uri
 *           example: "https://alithemes.com"
 *         bio:
 *           type: string
 *           example: "We are AliThemes , a creative and dedicated group of individuals who love web development almost as much as we love our customers."
 *         experience:
 *           type: string
 *           example: "1 - 5 Years"
 *         employees:
 *           type: string
 *           example: "1-50 employees"
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *           example: ["English", "French"]
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           example: ["UI/UX", "Web Design", "Brand identity"]
 *         workingTime:
 *           type: string
 *           example: "Full time"
 *         averageWage:
 *           type: string
 *           example: "$3500"
 *         location:
 *           $ref: '#/components/schemas/Location'
 *         logoUrl:
 *           type: string
 *           format: uri
 *           example: "https://yourcdn.com/logo.png"
 *         coverPhotoUrl:
 *           type: string
 *           format: uri
 *           example: "https://yourcdn.com/cover.jpg"
 *         notifications:
 *           $ref: '#/components/schemas/Notifications'
 *         privacy:
 *           $ref: '#/components/schemas/Privacy'
 *         language:
 *           type: string
 *           example: "en"
 *         timezone:
 *           type: string
 *           example: "Asia/Kolkata"
 *         theme:
 *           type: string
 *           enum: [light, dark, auto]
 *           example: "light"
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 settings:
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', settingController.getSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update user settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 example: "WillowTree"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "willowtree@gmail.com"
 *               phone:
 *                 type: string
 *                 example: "01 - 234 567 89"
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: "https://alithemes.com"
 *               bio:
 *                 type: string
 *                 example: "We are AliThemes , a creative and dedicated group of individuals who love web development almost as much as we love our customers."
 *               experience:
 *                 type: string
 *                 example: "1 - 5 Years"
 *               employees:
 *                 type: string
 *                 example: "1-50 employees"
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["English", "French"]
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["UI/UX", "Web Design", "Brand identity"]
 *               workingTime:
 *                 type: string
 *                 example: "Full time"
 *               averageWage:
 *                 type: string
 *                 example: "$3500"
 *               location:
 *                 $ref: '#/components/schemas/Location'
 *               logoUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://yourcdn.com/logo.png"
 *               coverPhotoUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://yourcdn.com/cover.jpg"
 *               notifications:
 *                 $ref: '#/components/schemas/Notifications'
 *               privacy:
 *                 $ref: '#/components/schemas/Privacy'
 *               language:
 *                 type: string
 *                 example: "en"
 *               timezone:
 *                 type: string
 *                 example: "Asia/Kolkata"
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *                 example: "light"
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 settings:
 *                   $ref: '#/components/schemas/Settings'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/', settingController.updateSettings);

/**
 * @swagger
 * /api/settings/upload-logo:
 *   post:
 *     summary: Upload company logo
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *                 description: Company logo image file (jpeg, jpg, png, gif, webp)
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 logoUrl:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: No logo file provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/upload-logo', upload.single('logo'), settingController.uploadLogo);

/**
 * @swagger
 * /api/settings/upload-cover:
 *   post:
 *     summary: Upload cover photo
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               coverPhoto:
 *                 type: string
 *                 format: binary
 *                 description: Cover photo image file (jpeg, jpg, png, gif, webp)
 *     responses:
 *       200:
 *         description: Cover photo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 coverPhotoUrl:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: No cover photo file provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/upload-cover', upload.single('coverPhoto'), settingController.uploadCoverPhoto);

/**
 * @swagger
 * /api/settings/reset:
 *   post:
 *     summary: Reset settings to default
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Settings reset to default successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 settings:
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/reset', settingController.resetSettings);

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Create a new setting
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       201:
 *         description: Setting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 setting:
 *                   $ref: '#/components/schemas/Settings'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', settingController.createSetting);

/**
 * @swagger
 * /api/settings/{id}:
 *   delete:
 *     summary: Delete a setting by ID
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Setting ID
 *     responses:
 *       200:
 *         description: Setting deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', settingController.deleteSetting);

module.exports = router; 