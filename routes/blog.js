const express = require('express');
const router = express.Router();
const blogController = require('../controller/blogController');
const { authenticateToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/blog-images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
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
 *   name: Blog
 *   description: Blog management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - content
 *         - writtenBy
 *       properties:
 *         id:
 *           type: integer
 *           description: Blog ID
 *         title:
 *           type: string
 *           description: Blog title
 *           example: "Getting Started with Node.js"
 *         description:
 *           type: string
 *           description: Blog description
 *           example: "A comprehensive guide to getting started with Node.js development"
 *         content:
 *           type: string
 *           description: Full blog content
 *           example: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine..."
 *         image:
 *           type: string
 *           format: uri
 *           description: Blog image URL
 *           example: "https://example.com/images/nodejs-blog.jpg"
 *         writtenBy:
 *           type: string
 *           description: Author name
 *           example: "John Doe"
 *         writeDate:
 *           type: string
 *           format: date-time
 *           description: Date when blog was written
 *         timeToRead:
 *           type: integer
 *           description: Time to read in minutes
 *           example: 8
 *         slug:
 *           type: string
 *           description: URL-friendly slug
 *           example: "getting-started-with-nodejs"
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: Blog status
 *           example: "published"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Blog tags
 *           example: ["Node.js", "JavaScript", "Backend"]
 *         viewCount:
 *           type: integer
 *           description: Number of views
 *           example: 1250
 */

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: List all blogs with pagination and filtering
 *     tags: [Blog]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *           default: published
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and content
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 blogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
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
router.get('/', blogController.listBlogs);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get blog detail by ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get('/:id', blogController.getBlogById);

/**
 * @swagger
 * /api/blogs/slug/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog slug
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get('/slug/:slug', blogController.getBlogBySlug);

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog (Admin only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - content
 *               - writtenBy
 *             properties:
 *               title:
 *                 type: string
 *                 description: Blog title
 *                 example: "Getting Started with Node.js"
 *               description:
 *                 type: string
 *                 description: Blog description
 *                 example: "A comprehensive guide to getting started with Node.js development"
 *               content:
 *                 type: string
 *                 description: Full blog content
 *                 example: "Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine..."
 *               image:
 *                 type: string
 *                 format: uri
 *                 description: Blog image URL
 *                 example: "https://example.com/images/nodejs-blog.jpg"
 *               writtenBy:
 *                 type: string
 *                 description: Author name
 *                 example: "John Doe"
 *               timeToRead:
 *                 type: integer
 *                 description: Time to read in minutes
 *                 example: 8
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Blog tags
 *                 example: ["Node.js", "JavaScript", "Backend"]
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 description: Blog status
 *                 example: "draft"
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Required fields missing or validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Blog with this title already exists
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, blogController.createBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Blog title
 *               description:
 *                 type: string
 *                 description: Blog description
 *               content:
 *                 type: string
 *                 description: Full blog content
 *               image:
 *                 type: string
 *                 format: uri
 *                 description: Blog image URL
 *               writtenBy:
 *                 type: string
 *                 description: Author name
 *               timeToRead:
 *                 type: integer
 *                 description: Time to read in minutes
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Blog tags
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 description: Blog status
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateToken, blogController.updateBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateToken, blogController.deleteBlog);

/**
 * @swagger
 * /api/blogs/stats/overview:
 *   get:
 *     summary: Get blog statistics
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blog statistics retrieved successfully
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
 *                     published:
 *                       type: integer
 *                     draft:
 *                       type: integer
 *                     archived:
 *                       type: integer
 *                     totalViews:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats/overview', authenticateToken, blogController.getBlogStats);

/**
 * @swagger
 * /api/blogs/upload-image:
 *   post:
 *     summary: Upload blog image
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Blog image file (jpeg, jpg, png, gif, webp)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: No image file provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/upload-image', authenticateToken, upload.single('image'), blogController.uploadBlogImage);

module.exports = router; 