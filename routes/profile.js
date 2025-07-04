const express = require('express');
const router = express.Router();
const profileController = require('../controller/profileController');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Profile:
 *       type: object
 *       required:
 *         - fullName
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: Profile ID
 *         userId:
 *           type: integer
 *           description: User ID
 *         fullName:
 *           type: string
 *           description: Full name of the user
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *           example: "john@example.com"
 *         phone:
 *           type: string
 *           description: Phone number
 *           example: "+91-9876543210"
 *         bio:
 *           type: string
 *           description: User biography
 *           example: "Experienced software developer with 5+ years in web development"
 *         experience:
 *           type: string
 *           description: Work experience details
 *           example: "Senior Developer at TechCorp (2020-2023), Junior Developer at StartupXYZ (2018-2020)"
 *         education:
 *           type: string
 *           description: Educational background
 *           example: "Bachelor's in Computer Science from University of Technology"
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: List of skills
 *           example: ["JavaScript", "React", "Node.js", "Python", "MongoDB"]
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *           description: List of languages known
 *           example: ["English", "Spanish", "French"]
 *         expectedSalary:
 *           type: number
 *           format: decimal
 *           description: Expected salary
 *           example: 75000.00
 *         currentSalary:
 *           type: number
 *           format: decimal
 *           description: Current salary
 *           example: 65000.00
 *         address:
 *           type: string
 *           description: Full address
 *           example: "123 Main Street, City, State 12345"
 *         location:
 *           type: string
 *           description: Current location
 *           example: "New York, NY"
 *         socialLinks:
 *           type: object
 *           description: Social media links
 *           example:
 *             linkedin: "https://linkedin.com/in/johndoe"
 *             github: "https://github.com/johndoe"
 *             twitter: "https://twitter.com/johndoe"
 */

/**
 * @swagger
 * /api/profile/{id}:
 *   get:
 *     summary: Get a specific profile by ID
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.get('/:id', profileController.getProfile);

/**
 * @swagger
 * /api/profile:
 *   post:
 *     summary: Create a new profile for current user
 *     tags: [Profile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the user
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 description: Phone number
 *                 example: "+91-9876543210"
 *               bio:
 *                 type: string
 *                 description: User biography
 *                 example: "Experienced software developer with 5+ years in web development"
 *               experience:
 *                 type: string
 *                 description: Work experience details
 *                 example: "Senior Developer at TechCorp (2020-2023)"
 *               education:
 *                 type: string
 *                 description: Educational background
 *                 example: "Bachelor's in Computer Science"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of skills
 *                 example: ["JavaScript", "React", "Node.js"]
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of languages known
 *                 example: ["English", "Spanish"]
 *               expectedSalary:
 *                 type: number
 *                 format: decimal
 *                 description: Expected salary
 *                 example: 75000.00
 *               currentSalary:
 *                 type: number
 *                 format: decimal
 *                 description: Current salary
 *                 example: 65000.00
 *               address:
 *                 type: string
 *                 description: Full address
 *                 example: "123 Main Street, City, State 12345"
 *               location:
 *                 type: string
 *                 description: Current location
 *                 example: "New York, NY"
 *               socialLinks:
 *                 type: object
 *                 description: Social media links
 *                 example:
 *                   linkedin: "https://linkedin.com/in/johndoe"
 *                   github: "https://github.com/johndoe"
 *     responses:
 *       201:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Profile already exists for this user
 *       500:
 *         description: Server error
 */
router.post('/', profileController.createProfile);

/**
 * @swagger
 * /api/profile/{id}:
 *   put:
 *     summary: Update a profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the user
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 description: Phone number
 *                 example: "+91-9876543210"
 *               bio:
 *                 type: string
 *                 description: User biography
 *                 example: "Experienced software developer with 5+ years in web development"
 *               experience:
 *                 type: string
 *                 description: Work experience details
 *                 example: "Senior Developer at TechCorp (2020-2023)"
 *               education:
 *                 type: string
 *                 description: Educational background
 *                 example: "Bachelor's in Computer Science"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of skills
 *                 example: ["JavaScript", "React", "Node.js"]
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of languages known
 *                 example: ["English", "Spanish"]
 *               expectedSalary:
 *                 type: number
 *                 format: decimal
 *                 description: Expected salary
 *                 example: 75000.00
 *               currentSalary:
 *                 type: number
 *                 format: decimal
 *                 description: Current salary
 *                 example: 65000.00
 *               address:
 *                 type: string
 *                 description: Full address
 *                 example: "123 Main Street, City, State 12345"
 *               location:
 *                 type: string
 *                 description: Current location
 *                 example: "New York, NY"
 *               socialLinks:
 *                 type: object
 *                 description: Social media links
 *                 example:
 *                   linkedin: "https://linkedin.com/in/johndoe"
 *                   github: "https://github.com/johndoe"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.put('/:id', profileController.updateProfile);

/**
 * @swagger
 * /api/profile/{id}:
 *   patch:
 *     summary: Update a profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the user
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 description: Phone number
 *                 example: "+91-9876543210"
 *               bio:
 *                 type: string
 *                 description: User biography
 *                 example: "Experienced software developer with 5+ years in web development"
 *               experience:
 *                 type: string
 *                 description: Work experience details
 *                 example: "Senior Developer at TechCorp (2020-2023)"
 *               education:
 *                 type: string
 *                 description: Educational background
 *                 example: "Bachelor's in Computer Science"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of skills
 *                 example: ["JavaScript", "React", "Node.js"]
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of languages known
 *                 example: ["English", "Spanish"]
 *               expectedSalary:
 *                 type: number
 *                 format: decimal
 *                 description: Expected salary
 *                 example: 75000.00
 *               currentSalary:
 *                 type: number
 *                 format: decimal
 *                 description: Current salary
 *                 example: 65000.00
 *               address:
 *                 type: string
 *                 description: Full address
 *                 example: "123 Main Street, City, State 12345"
 *               location:
 *                 type: string
 *                 description: Current location
 *                 example: "New York, NY"
 *               socialLinks:
 *                 type: object
 *                 description: Social media links
 *                 example:
 *                   linkedin: "https://linkedin.com/in/johndoe"
 *                   github: "https://github.com/johndoe"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 profile:
 *                   $ref: '#/components/schemas/Profile'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', profileController.updateProfile);

/**
 * @swagger
 * /api/profile/{id}:
 *   delete:
 *     summary: Delete a profile
 *     tags: [Profile]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Profile ID
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', profileController.deleteProfile);

module.exports = router; 