const { PostJob } = require('../models');
const { Op } = require('sequelize');

// List all post jobs with filtering and pagination
exports.listPostJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const {
      search,
      job_type,
      workplace_type,
      experience_level,
      status,
      location,
      salary_min,
      salary_max,
      tags,
      posted_by_user_id
    } = req.query;
    const whereClause = {};
    if (status) whereClause.status = status;
    // Search in job title, description, and location
    if (search) {
      whereClause[Op.or] = [
        { job_title: { [Op.iLike]: `%${search}%` } },
        { job_description: { [Op.iLike]: `%${search}%` } },
        { job_location: { [Op.iLike]: `%${search}%` } }
      ];
    }
    // Apply filters
    if (job_type) whereClause.job_type = job_type;
    if (workplace_type) whereClause.workplace_type = workplace_type;
    if (experience_level) whereClause.experience_level = experience_level;
    if (location) whereClause.job_location = { [Op.iLike]: `%${location}%` };
    if (posted_by_user_id) whereClause.posted_by_user_id = posted_by_user_id;
    // Salary range filter
    if (salary_min || salary_max) {
      whereClause[Op.or] = [
        { salary_min: { [Op.between]: [salary_min || 0, salary_max || 999999] } },
        { salary_max: { [Op.between]: [salary_min || 0, salary_max || 999999] } }
      ];
    }
    // Tags filter
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      whereClause.tags = { [Op.overlap]: tagsArray };
    }
    const { count, rows } = await PostJob.findAndCountAll({
      where: whereClause,
      order: [
        ['is_featured', 'DESC'],
        ['posted_date', 'DESC']
      ],
      limit,
      offset
    });
    res.status(200).json({
      message: 'Post jobs retrieved successfully',
      postJobs: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get post job by ID
exports.getPostJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const postJob = await PostJob.findByPk(id);
    if (!postJob) {
      return res.status(404).json({ message: 'Post job not found' });
    }
    await postJob.increment('views_count');
    res.status(200).json({ message: 'Post job retrieved successfully', postJob });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create new post job
exports.createPostJob = async (req, res) => {
  try {
    const {
      job_title,
      job_description,
      job_location,
      workplace_type,
      salary_min,
      salary_max,
      salary_currency,
      tags,
      posted_by_user_id,
      company_name,
      company_logo,
      experience_level,
      job_type,
      application_deadline,
      is_featured,
      requirements,
      benefits,
      attachments
    } = req.body;
    if (!job_title || !job_description || !job_location) {
      return res.status(400).json({ message: 'Job title, description, and location are required' });
    }
    const postJob = await PostJob.create({
      job_title,
      job_description,
      job_location,
      workplace_type: workplace_type || 'On-site',
      salary_min,
      salary_max,
      salary_currency: salary_currency || 'USD',
      tags,
      posted_by_user_id,
      company_name,
      company_logo,
      experience_level,
      job_type: job_type || 'Full time',
      application_deadline,
      is_featured: is_featured || false,
      requirements,
      benefits,
      attachments
    });
    res.status(201).json({ message: 'Post job created successfully', postJob });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update post job
exports.updatePostJob = async (req, res) => {
  try {
    const { id } = req.params;
    const postJob = await PostJob.findByPk(id);
    if (!postJob) {
      return res.status(404).json({ message: 'Post job not found' });
    }
    await postJob.update(req.body);
    res.status(200).json({ message: 'Post job updated successfully', postJob });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete post job
exports.deletePostJob = async (req, res) => {
  try {
    const { id } = req.params;
    const postJob = await PostJob.findByPk(id);
    if (!postJob) {
      return res.status(404).json({ message: 'Post job not found' });
    }
    await postJob.destroy();
    res.status(200).json({ message: 'Post job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Upload job attachments
exports.uploadAttachments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'No files provided' 
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/post-jobs/attachments/${file.filename}`
    }));

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get user's posted jobs
exports.getUserPostedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await PostJob.findAndCountAll({
      where: { posted_by_user_id: userId },
      order: [['posted_date', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      message: 'User posted jobs retrieved successfully',
      postJobs: rows,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
}; 