const express = require('express');
const router = express.Router();
const postJobController = require('../controller/postJobController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/post-jobs/attachments/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'attachment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx|txt|jpg|jpeg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, TXT, and image files are allowed!'));
    }
  }
});

/**
 * @swagger
 * tags:
 *   name: PostJob
 *   description: Post job management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PostJob:
 *       type: object
 *       required:
 *         - job_title
 *         - job_description
 *         - job_location
 *       properties:
 *         id:
 *           type: integer
 *           description: Post job ID
 *         job_title:
 *           type: string
 *           description: Job title
 *           example: "Senior UI/UX Designer"
 *         job_description:
 *           type: string
 *           description: Detailed job description
 *           example: "We are looking for a talented UI/UX Designer..."
 *         job_location:
 *           type: string
 *           description: Job location
 *           example: "New York, NY"
 *         workplace_type:
 *           type: string
 *           enum: [Remote, On-site, Hybrid]
 *           description: Type of workplace
 *           example: "Remote"
 *         salary_min:
 *           type: number
 *           format: decimal
 *           description: Minimum salary
 *           example: 60000
 *         salary_max:
 *           type: number
 *           format: decimal
 *           description: Maximum salary
 *           example: 90000
 *         salary_currency:
 *           type: string
 *           description: Salary currency
 *           example: "USD"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Job tags
 *           example: ["Figma", "UI/UX", "Sketch"]
 *         posted_by_user_id:
 *           type: integer
 *           description: User ID who posted the job
 *         posted_date:
 *           type: string
 *           format: date-time
 *           description: When the job was posted
 *         status:
 *           type: string
 *           enum: [active, inactive, draft, expired]
 *           description: Job status
 *           example: "active"
 *         company_name:
 *           type: string
 *           description: Company name
 *           example: "TechCorp"
 *         company_logo:
 *           type: string
 *           format: uri
 *           description: Company logo URL
 *         experience_level:
 *           type: string
 *           enum: [Entry, Mid, Senior, Lead, Executive]
 *           description: Required experience level
 *         job_type:
 *           type: string
 *           enum: [Full time, Part time, Contract, Internship, Freelance]
 *           description: Type of job
 *         application_deadline:
 *           type: string
 *           format: date-time
 *           description: Application deadline
 *         views_count:
 *           type: integer
 *           description: Number of views
 *         applications_count:
 *           type: integer
 *           description: Number of applications
 *         is_featured:
 *           type: boolean
 *           description: Whether job is featured
 *         requirements:
 *           type: array
 *           items:
 *             type: string
 *           description: Job requirements
 *         benefits:
 *           type: array
 *           items:
 *             type: string
 *           description: Job benefits
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *           description: Job attachments
 */

/**
 * @swagger
 * /api/post-jobs:
 *   get:
 *     summary: List all post jobs with filtering and pagination
 *     tags: [PostJob]
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
 *         description: Search in job title, description, and location
 *       - in: query
 *         name: job_type
 *         schema:
 *           type: string
 *           enum: [Full time, Part time, Contract, Internship, Freelance]
 *         description: Filter by job type
 *       - in: query
 *         name: workplace_type
 *         schema:
 *           type: string
 *           enum: [Remote, On-site, Hybrid]
 *         description: Filter by workplace type
 *       - in: query
 *         name: experience_level
 *         schema:
 *           type: string
 *           enum: [Entry, Mid, Senior, Lead, Executive]
 *         description: Filter by experience level
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, draft, expired]
 *         description: Filter by status
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: salary_min
 *         schema:
 *           type: number
 *         description: Minimum salary filter
 *       - in: query
 *         name: salary_max
 *         schema:
 *           type: number
 *         description: Maximum salary filter
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: posted_by_user_id
 *         schema:
 *           type: integer
 *         description: Filter by user who posted
 *     responses:
 *       200:
 *         description: Post jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 postJobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PostJob'
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
router.get('/', postJobController.listPostJobs);

/**
 * @swagger
 * /api/post-jobs/{id}:
 *   get:
 *     summary: Get post job by ID
 *     tags: [PostJob]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post job ID
 *     responses:
 *       200:
 *         description: Post job retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 postJob:
 *                   $ref: '#/components/schemas/PostJob'
 *       404:
 *         description: Post job not found
 *       500:
 *         description: Server error
 */
router.get('/:id', postJobController.getPostJobById);

/**
 * @swagger
 * /api/post-jobs:
 *   post:
 *     summary: Create a new post job
 *     tags: [PostJob]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_title
 *               - job_description
 *               - job_location
 *             properties:
 *               job_title:
 *                 type: string
 *                 example: "Senior UI/UX Designer"
 *               job_description:
 *                 type: string
 *                 example: "We are looking for a talented UI/UX Designer..."
 *               job_location:
 *                 type: string
 *                 example: "New York, NY"
 *               workplace_type:
 *                 type: string
 *                 enum: [Remote, On-site, Hybrid]
 *                 example: "Remote"
 *               salary_min:
 *                 type: number
 *                 example: 60000
 *               salary_max:
 *                 type: number
 *                 example: 90000
 *               salary_currency:
 *                 type: string
 *                 example: "USD"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Figma", "UI/UX", "Sketch"]
 *               company_name:
 *                 type: string
 *                 example: "TechCorp"
 *               company_logo:
 *                 type: string
 *                 format: uri
 *               experience_level:
 *                 type: string
 *                 enum: [Entry, Mid, Senior, Lead, Executive]
 *               job_type:
 *                 type: string
 *                 enum: [Full time, Part time, Contract, Internship, Freelance]
 *                 example: "Full time"
 *               application_deadline:
 *                 type: string
 *                 format: date-time
 *               is_featured:
 *                 type: boolean
 *                 example: false
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["5+ years experience", "Figma proficiency"]
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Health insurance", "Remote work"]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Post job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 postJob:
 *                   $ref: '#/components/schemas/PostJob'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', postJobController.createPostJob);

/**
 * @swagger
 * /api/post-jobs/{id}:
 *   put:
 *     summary: Update a post job
 *     tags: [PostJob]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               job_title:
 *                 type: string
 *               job_description:
 *                 type: string
 *               job_location:
 *                 type: string
 *               workplace_type:
 *                 type: string
 *                 enum: [Remote, On-site, Hybrid]
 *               salary_min:
 *                 type: number
 *               salary_max:
 *                 type: number
 *               salary_currency:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               company_name:
 *                 type: string
 *               company_logo:
 *                 type: string
 *                 format: uri
 *               experience_level:
 *                 type: string
 *                 enum: [Entry, Mid, Senior, Lead, Executive]
 *               job_type:
 *                 type: string
 *                 enum: [Full time, Part time, Contract, Internship, Freelance]
 *               application_deadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, inactive, draft, expired]
 *               is_featured:
 *                 type: boolean
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *               benefits:
 *                 type: array
 *                 items:
 *                   type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Post job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 postJob:
 *                   $ref: '#/components/schemas/PostJob'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Post job not found
 *       500:
 *         description: Server error
 */
router.put('/:id', postJobController.updatePostJob);

/**
 * @swagger
 * /api/post-jobs/{id}:
 *   delete:
 *     summary: Delete a post job
 *     tags: [PostJob]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post job ID
 *     responses:
 *       200:
 *         description: Post job deleted successfully
 *       404:
 *         description: Post job not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', postJobController.deletePostJob);

/**
 * @swagger
 * /api/post-jobs/upload-attachments:
 *   post:
 *     summary: Upload job attachments
 *     tags: [PostJob]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Job attachment files (PDF, DOC, DOCX, TXT, images)
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 files:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       filename:
 *                         type: string
 *                       originalname:
 *                         type: string
 *                       mimetype:
 *                         type: string
 *                       size:
 *                         type: integer
 *                       url:
 *                         type: string
 *                         format: uri
 *       400:
 *         description: No files provided
 *       500:
 *         description: Server error
 */
router.post('/upload-attachments', upload.array('attachments', 5), postJobController.uploadAttachments);

/**
 * @swagger
 * /api/post-jobs/user/my-jobs:
 *   get:
 *     summary: Get user's posted jobs
 *     tags: [PostJob]
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
 *         description: User posted jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 postJobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PostJob'
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
router.get('/user/my-jobs', postJobController.getUserPostedJobs);

module.exports = router; 