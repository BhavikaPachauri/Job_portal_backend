const express = require('express');
const router = express.Router();
const jobController = require('../controller/jobController');
// const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Job
 *   description: Job management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       required:
 *         - company_name
 *         - location
 *         - job_title
 *         - job_description
 *       properties:
 *         id:
 *           type: integer
 *           description: Job ID
 *         company_name:
 *           type: string
 *           description: Company name
 *           example: "LinkedIn"
 *         company_logo_url:
 *           type: string
 *           format: uri
 *           description: Company logo URL
 *           example: "https://example.com/logo.png"
 *         location:
 *           type: string
 *           description: Job location
 *           example: "New York, US"
 *         job_title:
 *           type: string
 *           description: Job title
 *           example: "UI / UX Designer fulltime"
 *         job_type:
 *           type: string
 *           enum: [Full time, Part time, Contract, Internship, Freelance]
 *           description: Type of job
 *           example: "Full time"
 *         posted_time:
 *           type: string
 *           format: date-time
 *           description: When the job was posted
 *           example: "2025-06-28T15:30:00Z"
 *         job_description:
 *           type: string
 *           description: Detailed job description
 *           example: "Lorem ipsum dolor sit amet..."
 *         skills_required:
 *           type: array
 *           items:
 *             type: string
 *           description: Required skills
 *           example: ["Adobe XD", "Figma", "Photoshop"]
 *         salary_per_hour:
 *           type: number
 *           format: decimal
 *           description: Hourly salary
 *           example: 500
 *         salary_min:
 *           type: number
 *           format: decimal
 *           description: Minimum annual salary
 *         salary_max:
 *           type: number
 *           format: decimal
 *           description: Maximum annual salary
 *         salary_currency:
 *           type: string
 *           description: Salary currency
 *           example: "USD"
 *         apply_link:
 *           type: string
 *           format: uri
 *           description: Application link
 *           example: "https://example.com/apply/101"
 *         industry:
 *           type: string
 *           description: Industry
 *           example: "Software"
 *         experience_level:
 *           type: string
 *           enum: [Entry, Mid, Senior, Lead, Executive]
 *           description: Experience level required
 *         remote_option:
 *           type: string
 *           enum: [On-site, Remote, Hybrid]
 *           description: Remote work option
 *           example: "Remote"
 *         is_featured:
 *           type: boolean
 *           description: Whether job is featured
 *           example: true
 *         is_active:
 *           type: boolean
 *           description: Whether job is active
 *           example: true
 *         views_count:
 *           type: integer
 *           description: Number of views
 *           example: 150
 *         applications_count:
 *           type: integer
 *           description: Number of applications
 *           example: 25
 */

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: List all jobs with filtering and pagination
 *     tags: [Job]
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
 *         description: Search in job title, company name, and description
 *       - in: query
 *         name: job_type
 *         schema:
 *           type: string
 *           enum: [Full time, Part time, Contract, Internship, Freelance]
 *         description: Filter by job type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter by industry
 *       - in: query
 *         name: experience_level
 *         schema:
 *           type: string
 *           enum: [Entry, Mid, Senior, Lead, Executive]
 *         description: Filter by experience level
 *       - in: query
 *         name: remote_option
 *         schema:
 *           type: string
 *           enum: [On-site, Remote, Hybrid]
 *         description: Filter by remote option
 *       - in: query
 *         name: is_featured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
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
 *         name: skills
 *         schema:
 *           type: string
 *         description: Filter by skills (comma-separated)
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
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
router.get('/', jobController.listJobs);

/**
 * @swagger
 * /api/jobs/featured:
 *   get:
 *     summary: Get featured jobs
 *     tags: [Job]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of featured jobs to return
 *     responses:
 *       200:
 *         description: Featured jobs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       500:
 *         description: Server error
 */
router.get('/featured', jobController.getFeaturedJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get('/:id', jobController.getJobById);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job
 *     tags: [Job]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - location
 *               - job_title
 *               - job_description
 *             properties:
 *               company_name:
 *                 type: string
 *                 example: "LinkedIn"
 *               company_logo_url:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/logo.png"
 *               location:
 *                 type: string
 *                 example: "New York, US"
 *               job_title:
 *                 type: string
 *                 example: "UI / UX Designer fulltime"
 *               job_type:
 *                 type: string
 *                 enum: [Full time, Part time, Contract, Internship, Freelance]
 *                 example: "Full time"
 *               job_description:
 *                 type: string
 *                 example: "Lorem ipsum dolor sit amet..."
 *               skills_required:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Adobe XD", "Figma", "Photoshop"]
 *               salary_per_hour:
 *                 type: number
 *                 example: 500
 *               salary_min:
 *                 type: number
 *                 description: Minimum annual salary
 *               salary_max:
 *                 type: number
 *                 description: Maximum annual salary
 *               salary_currency:
 *                 type: string
 *                 example: "USD"
 *               apply_link:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/apply/101"
 *               industry:
 *                 type: string
 *                 example: "Software"
 *               experience_level:
 *                 type: string
 *                 enum: [Entry, Mid, Senior, Lead, Executive]
 *               remote_option:
 *                 type: string
 *                 enum: [On-site, Remote, Hybrid]
 *                 example: "Remote"
 *               is_featured:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', jobController.createJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               company_logo_url:
 *                 type: string
 *                 format: uri
 *               location:
 *                 type: string
 *               job_title:
 *                 type: string
 *               job_type:
 *                 type: string
 *                 enum: [Full time, Part time, Contract, Internship, Freelance]
 *               job_description:
 *                 type: string
 *               skills_required:
 *                 type: array
 *                 items:
 *                   type: string
 *               salary_per_hour:
 *                 type: number
 *               salary_min:
 *                 type: number
 *               salary_max:
 *                 type: number
 *               salary_currency:
 *                 type: string
 *               apply_link:
 *                 type: string
 *                 format: uri
 *               industry:
 *                 type: string
 *               experience_level:
 *                 type: string
 *                 enum: [Entry, Mid, Senior, Lead, Executive]
 *               remote_option:
 *                 type: string
 *                 enum: [On-site, Remote, Hybrid]
 *               is_featured:
 *                 type: boolean
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.put('/:id', jobController.updateJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   delete:
 *     summary: Delete a job
 *     tags: [Job]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', jobController.deleteJob);

/**
 * @swagger
 * /api/jobs/stats/overview:
 *   get:
 *     summary: Get job statistics
 *     tags: [Job]
 *     responses:
 *       200:
 *         description: Job statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     featured:
 *                       type: integer
 *                     totalViews:
 *                       type: integer
 *                     totalApplications:
 *                       type: integer
 *                     jobTypes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           job_type:
 *                             type: string
 *                           count:
 *                             type: integer
 *       500:
 *         description: Server error
 */
router.get('/stats/overview', jobController.getJobStats);

module.exports = router; 