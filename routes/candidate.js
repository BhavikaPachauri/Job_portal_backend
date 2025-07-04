const express = require('express');
const router = express.Router();
const candidateController = require('../controller/candidateController');
const { authenticateToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const upload = require('../middleware/uploadMiddleware');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/candidates/photos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'candidate-photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadPhoto = multer({
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
 *   name: Candidates
 *   description: Candidate management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Candidate:
 *       type: object
 *       required:
 *         - name
 *         - designation
 *         - skills
 *         - location
 *         - hourlyRate
 *       properties:
 *         id:
 *           type: integer
 *           description: Candidate ID
 *         name:
 *           type: string
 *           description: Candidate full name
 *           example: "John Doe"
 *         designation:
 *           type: string
 *           description: Job title or designation
 *           example: "Senior Frontend Developer"
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of skills
 *           example: ["React", "JavaScript", "TypeScript", "Node.js"]
 *         rating:
 *           type: number
 *           format: decimal
 *           description: Candidate rating (0-5)
 *           example: 4.5
 *         bio:
 *           type: string
 *           description: Candidate biography
 *           example: "Experienced frontend developer with 5+ years..."
 *         location:
 *           type: string
 *           description: Candidate location
 *           example: "New York, NY"
 *         hourlyRate:
 *           type: number
 *           format: decimal
 *           description: Hourly rate in USD
 *           example: 75.00
 *         photo:
 *           type: string
 *           format: uri
 *           description: Profile photo URL
 *         email:
 *           type: string
 *           format: email
 *           description: Email address
 *         phone:
 *           type: string
 *           description: Phone number
 *         experience_years:
 *           type: integer
 *           description: Years of experience
 *           example: 5
 *         education:
 *           type: array
 *           items:
 *             type: object
 *           description: Education history
 *         certifications:
 *           type: array
 *           items:
 *             type: object
 *           description: Professional certifications
 *         portfolio_url:
 *           type: string
 *           format: uri
 *           description: Portfolio website URL
 *         linkedin_url:
 *           type: string
 *           format: uri
 *           description: LinkedIn profile URL
 *         github_url:
 *           type: string
 *           format: uri
 *           description: GitHub profile URL
 *         availability:
 *           type: string
 *           enum: [Available, Part-time, Not Available]
 *           description: Availability status
 *         preferred_work_type:
 *           type: string
 *           enum: [Remote, On-site, Hybrid]
 *           description: Preferred work arrangement
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *           description: Languages spoken
 *         timezone:
 *           type: string
 *           description: Timezone
 *         status:
 *           type: string
 *           enum: [active, inactive, hired]
 *           description: Candidate status
 *         views_count:
 *           type: integer
 *           description: Number of profile views
 *         applications_count:
 *           type: integer
 *           description: Number of job applications
 *         is_featured:
 *           type: boolean
 *           description: Whether candidate is featured
 */

/**
 * @swagger
 * /api/candidates:
 *   get:
 *     summary: List all candidates with filtering and pagination
 *     tags: [Candidates]
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
 *         description: Search in name, designation, bio, and location
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
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [Available, Part-time, Not Available]
 *         description: Filter by availability
 *       - in: query
 *         name: preferred_work_type
 *         schema:
 *           type: string
 *           enum: [Remote, On-site, Hybrid]
 *         description: Filter by preferred work type
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
 *         name: hourly_rate_min
 *         schema:
 *           type: number
 *         description: Minimum hourly rate
 *       - in: query
 *         name: hourly_rate_max
 *         schema:
 *           type: number
 *         description: Maximum hourly rate
 *       - in: query
 *         name: rating_min
 *         schema:
 *           type: number
 *         description: Minimum rating
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, hired]
 *         description: Filter by status
 *       - in: query
 *         name: is_featured
 *         schema:
 *           type: boolean
 *         description: Filter featured candidates
 *     responses:
 *       200:
 *         description: Candidates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 candidates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Candidate'
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
router.get('/', candidateController.listCandidates);

/**
 * @swagger
 * /api/candidates/{id}:
 *   get:
 *     summary: Get candidate by ID
 *     tags: [Candidates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 candidate:
 *                   $ref: '#/components/schemas/Candidate'
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.get('/:id', candidateController.getCandidateById);

/**
 * @swagger
 * /api/candidates:
 *   post:
 *     summary: Create a new candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - designation
 *               - skills
 *               - location
 *               - hourlyRate
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               designation:
 *                 type: string
 *                 example: "Senior Frontend Developer"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "JavaScript", "TypeScript", "Node.js"]
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               bio:
 *                 type: string
 *                 example: "Experienced frontend developer with 5+ years..."
 *               location:
 *                 type: string
 *                 example: "New York, NY"
 *               hourlyRate:
 *                 type: number
 *                 example: 75.00
 *               photo:
 *                 type: string
 *                 format: uri
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               experience_years:
 *                 type: integer
 *                 example: 5
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: object
 *               portfolio_url:
 *                 type: string
 *                 format: uri
 *               linkedin_url:
 *                 type: string
 *                 format: uri
 *               github_url:
 *                 type: string
 *                 format: uri
 *               availability:
 *                 type: string
 *                 enum: [Available, Part-time, Not Available]
 *                 example: "Available"
 *               preferred_work_type:
 *                 type: string
 *                 enum: [Remote, On-site, Hybrid]
 *                 example: "Remote"
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               timezone:
 *                 type: string
 *               is_featured:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Candidate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 candidate:
 *                   $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, candidateController.createCandidate);

/**
 * @swagger
 * /api/candidates/{id}:
 *   put:
 *     summary: Update a candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
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
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               rating:
 *                 type: number
 *               bio:
 *                 type: string
 *               location:
 *                 type: string
 *               hourlyRate:
 *                 type: number
 *               photo:
 *                 type: string
 *                 format: uri
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               experience_years:
 *                 type: integer
 *               education:
 *                 type: array
 *                 items:
 *                   type: object
 *               certifications:
 *                 type: array
 *                 items:
 *                   type: object
 *               portfolio_url:
 *                 type: string
 *                 format: uri
 *               linkedin_url:
 *                 type: string
 *                 format: uri
 *               github_url:
 *                 type: string
 *                 format: uri
 *               availability:
 *                 type: string
 *                 enum: [Available, Part-time, Not Available]
 *               preferred_work_type:
 *                 type: string
 *                 enum: [Remote, On-site, Hybrid]
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *               timezone:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, hired]
 *               is_featured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Candidate updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 candidate:
 *                   $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, candidateController.updateCandidate);

/**
 * @swagger
 * /api/candidates/{id}:
 *   delete:
 *     summary: Delete a candidate
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: Candidate deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, candidateController.deleteCandidate);

/**
 * @swagger
 * /api/candidates/upload-photo:
 *   post:
 *     summary: Upload candidate photo
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Candidate photo (JPG, JPEG, PNG, GIF)
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/upload-photo', authenticateToken, uploadPhoto.single('photo'), candidateController.uploadPhoto);

/**
 * @swagger
 * /api/candidates/featured:
 *   get:
 *     summary: Get featured candidates
 *     tags: [Candidates]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of featured candidates to return
 *     responses:
 *       200:
 *         description: Featured candidates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 candidates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Candidate'
 *       500:
 *         description: Server error
 */
router.get('/featured', candidateController.getFeaturedCandidates);

/**
 * @swagger
 * /api/candidates/by-skills:
 *   get:
 *     summary: Get candidates by skills
 *     tags: [Candidates]
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
 *         description: Candidates by skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 candidates:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Candidate'
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
router.get('/by-skills', candidateController.getCandidatesBySkills);

/**
 * @swagger
 * /api/candidates/cv/upload:
 *   post:
 *     summary: Upload a CV file for a candidate
 *     tags: [CV]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cv:
 *                 type: string
 *                 format: binary
 *                 description: CV file (PDF, DOC, DOCX)
 *               candidateId:
 *                 type: integer
 *                 description: Candidate ID
 *     responses:
 *       200:
 *         description: CV uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 cvUrl:
 *                   type: string
 *       400:
 *         description: candidateId or file missing
 *       404:
 *         description: Candidate not found
 *       500:
 *         description: Server error
 *
 * /api/candidates/cv/{id}:
 *   get:
 *     summary: Download/View a candidate's CV by candidate ID
 *     tags: [CV]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: CV file
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: CV not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a candidate's CV by candidate ID
 *     tags: [CV]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Candidate ID
 *     responses:
 *       200:
 *         description: CV deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: CV not found
 *       500:
 *         description: Server error
 */
// CV Management APIs
router.post('/cv/upload', upload.single('cv'), candidateController.uploadCV);
router.get('/cv/:id', candidateController.getCV);
router.delete('/cv/:id', candidateController.deleteCV);

module.exports = router; 