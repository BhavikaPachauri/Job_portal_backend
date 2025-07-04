const express = require('express');
const router = express.Router();
const recruiterController = require('../controller/recruiterController');
const multer = require('multer');
const path = require('path');

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/recruiters/profile-images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recruiter-profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, JPEG, PNG, GIF) are allowed!'));
    }
  }
});

/**
 * @swagger
 * tags:
 *   name: Recruiters
 *   description: Recruiter management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Recruiter:
 *       type: object
 *       required:
 *         - name
 *         - designation
 *         - company_name
 *         - email
 *         - skills
 *         - location
 *       properties:
 *         id:
 *           type: integer
 *           description: Recruiter ID
 *         name:
 *           type: string
 *           description: Recruiter full name
 *           example: "Anjali Mehta"
 *         designation:
 *           type: string
 *           description: Job title or designation
 *           example: "Lead Talent Acquisition"
 *         company_name:
 *           type: string
 *           description: Company name
 *           example: "TechSolutions Pvt Ltd"
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *           example: "anjali.mehta@example.com"
 *         bio:
 *           type: string
 *           description: Recruiter biography
 *           example: "Passionate about connecting great talent with great opportunities."
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of skills
 *           example: ["Hiring", "Tech Recruiting", "ATS Tools"]
 *         rating:
 *           type: number
 *           format: decimal
 *           description: Recruiter rating (0-5)
 *           example: 4.5
 *         location:
 *           type: string
 *           description: Recruiter location
 *           example: "Bangalore"
 *         profile_image_url:
 *           type: string
 *           format: uri
 *           description: Profile image URL
 *           example: "https://example.com/images/anjali.jpg"
 *         social_links:
 *           type: object
 *           description: Social media links
 *           example: {"linkedin": "https://linkedin.com/in/anjalimehta"}
 *         is_verified:
 *           type: boolean
 *           description: Whether recruiter is verified
 *           example: true
 *         total_jobs_posted:
 *           type: integer
 *           description: Total number of jobs posted
 *           example: 128
 *         phone:
 *           type: string
 *           description: Phone number
 *         website:
 *           type: string
 *           format: uri
 *           description: Company website
 *         company_size:
 *           type: string
 *           enum: [1-10, 11-50, 51-200, 201-500, 501-1000, 1000+]
 *           description: Company size
 *         industry:
 *           type: string
 *           description: Industry
 *         experience_years:
 *           type: integer
 *           description: Years of experience
 *         specializations:
 *           type: array
 *           items:
 *             type: string
 *           description: Specializations
 *         status:
 *           type: string
 *           enum: [active, inactive, suspended]
 *           description: Recruiter status
 *         views_count:
 *           type: integer
 *           description: Number of profile views
 *         connections_count:
 *           type: integer
 *           description: Number of connections
 *         is_featured:
 *           type: boolean
 *           description: Whether recruiter is featured
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/recruiters:
 *   get:
 *     summary: List all recruiters with filtering and pagination
 *     tags: [Recruiters]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, designation, company_name, bio, and location
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Filter by skills (comma-separated)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: company_size
 *         schema:
 *           type: string
 *           enum: [1-10, 11-50, 51-200, 201-500, 501-1000, 1000+]
 *         description: Filter by company size
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: experience_min
 *         schema:
 *           type: integer
 *         description: Minimum years of experience
 *       - in: query
 *         name: experience_max
 *         schema:
 *           type: integer
 *         description: Maximum years of experience
 *       - in: query
 *         name: rating_min
 *         schema:
 *           type: number
 *         description: Minimum rating
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, suspended]
 *         description: Filter by status
 *       - in: query
 *         name: is_verified
 *         schema:
 *           type: boolean
 *         description: Filter verified recruiters
 *       - in: query
 *         name: is_featured
 *         schema:
 *           type: boolean
 *         description: Filter featured recruiters
 *     responses:
 *       200:
 *         description: Recruiters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 recruiters:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recruiter'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/', recruiterController.listRecruiters);

/**
 * @swagger
 * /api/recruiters/{id}:
 *   get:
 *     summary: Get recruiter by ID
 *     tags: [Recruiters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recruiter ID
 *     responses:
 *       200:
 *         description: Recruiter retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 recruiter:
 *                   $ref: '#/components/schemas/Recruiter'
 *       404:
 *         description: Recruiter not found
 *       500:
 *         description: Server error
 */
router.get('/:id', recruiterController.getRecruiterById);

/**
 * @swagger
 * /api/recruiters:
 *   post:
 *     summary: Create a new recruiter
 *     tags: [Recruiters]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - designation
 *               - company_name
 *               - email
 *               - skills
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Anjali Mehta"
 *               designation:
 *                 type: string
 *                 example: "Lead Talent Acquisition"
 *               company_name:
 *                 type: string
 *                 example: "TechSolutions Pvt Ltd"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "anjali.mehta@example.com"
 *               bio:
 *                 type: string
 *                 example: "Passionate about connecting great talent with great opportunities."
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Hiring", "Tech Recruiting", "ATS Tools"]
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               location:
 *                 type: string
 *                 example: "Bangalore"
 *               profile_image_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/images/anjali.jpg"
 *               social_links:
 *                 type: object
 *                 example: {"linkedin": "https://linkedin.com/in/anjalimehta"}
 *               is_verified:
 *                 type: boolean
 *                 example: true
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               company_size:
 *                 type: string
 *                 enum: [1-10, 11-50, 51-200, 201-500, 501-1000, 1000+]
 *               industry:
 *                 type: string
 *               experience_years:
 *                 type: integer
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_featured:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Recruiter created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 recruiter:
 *                   $ref: '#/components/schemas/Recruiter'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', recruiterController.createRecruiter);

/**
 * @swagger
 * /api/recruiters/{id}:
 *   put:
 *     summary: Update a recruiter
 *     tags: [Recruiters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recruiter ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               designation:
 *                 type: string
 *               company_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               bio:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               rating:
 *                 type: number
 *               location:
 *                 type: string
 *               profile_image_url:
 *                 type: string
 *                 format: uri
 *               social_links:
 *                 type: object
 *               is_verified:
 *                 type: boolean
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *                 format: uri
 *               company_size:
 *                 type: string
 *                 enum: [1-10, 11-50, 51-200, 201-500, 501-1000, 1000+]
 *               industry:
 *                 type: string
 *               experience_years:
 *                 type: integer
 *               specializations:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, suspended]
 *               is_featured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Recruiter updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 recruiter:
 *                   $ref: '#/components/schemas/Recruiter'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Recruiter not found
 *       500:
 *         description: Server error
 */
router.put('/:id', recruiterController.updateRecruiter);

/**
 * @swagger
 * /api/recruiters/{id}:
 *   delete:
 *     summary: Delete a recruiter
 *     tags: [Recruiters]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recruiter ID
 *     responses:
 *       200:
 *         description: Recruiter deleted successfully
 *       404:
 *         description: Recruiter not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', recruiterController.deleteRecruiter);

/**
 * @swagger
 * /api/recruiters/upload-profile-image:
 *   post:
 *     summary: Upload recruiter profile image
 *     tags: [Recruiters]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Recruiter profile image (JPG, JPEG, PNG, GIF)
 *     responses:
 *       200:
 *         description: Profile image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 file:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     originalname:
 *                       type: string
 *                     mimetype:
 *                       type: string
 *                     size:
 *                       type: integer
 *                     url:
 *                       type: string
 *                       format: uri
 *       400:
 *         description: No file provided
 *       500:
 *         description: Server error
 */
router.post('/upload-profile-image', upload.single('file'), recruiterController.uploadProfileImage);

/**
 * @swagger
 * /api/recruiters/featured:
 *   get:
 *     summary: Get featured recruiters
 *     tags: [Recruiters]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of featured recruiters to return
 *     responses:
 *       200:
 *         description: Featured recruiters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 recruiters:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recruiter'
 *       500:
 *         description: Server error
 */
router.get('/featured', recruiterController.getFeaturedRecruiters);

/**
 * @swagger
 * /api/recruiters/by-skills:
 *   get:
 *     summary: Get recruiters by skills
 *     tags: [Recruiters]
 *     parameters:
 *       - in: query
 *         name: skills
 *         required: true
 *         schema:
 *           type: string
 *         description: Skills to search for (comma-separated)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Recruiters by skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 recruiters:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recruiter'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *       400:
 *         description: Skills parameter is required
 *       500:
 *         description: Server error
 */
router.get('/by-skills', recruiterController.getRecruitersBySkills);

/**
 * @swagger
 * /api/recruiters/verified:
 *   get:
 *     summary: Get verified recruiters
 *     tags: [Recruiters]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Verified recruiters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 recruiters:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recruiter'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/verified', recruiterController.getVerifiedRecruiters);

module.exports = router; 