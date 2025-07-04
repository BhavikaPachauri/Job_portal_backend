const { Job, Auth } = require('../models');
const { Op } = require('sequelize');

// List all jobs with filtering and pagination
exports.listJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const {
      search,
      job_type,
      location,
      industry,
      experience_level,
      remote_option,
      is_featured,
      salary_min,
      salary_max,
      skills
    } = req.query;

    const whereClause = { is_active: true };
    
    // Search in job title, company name, and description
    if (search) {
      whereClause[Op.or] = [
        { job_title: { [Op.iLike]: `%${search}%` } },
        { company_name: { [Op.iLike]: `%${search}%` } },
        { job_description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Apply filters
    if (job_type) whereClause.job_type = job_type;
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    if (industry) whereClause.industry = { [Op.iLike]: `%${industry}%` };
    if (experience_level) whereClause.experience_level = experience_level;
    if (remote_option) whereClause.remote_option = remote_option;
    if (is_featured !== undefined) whereClause.is_featured = is_featured === 'true';
    
    // Salary range filter
    if (salary_min || salary_max) {
      whereClause[Op.or] = [
        { salary_per_hour: { [Op.between]: [salary_min || 0, salary_max || 999999] } },
        { salary_min: { [Op.between]: [salary_min || 0, salary_max || 999999] } },
        { salary_max: { [Op.between]: [salary_min || 0, salary_max || 999999] } }
      ];
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      whereClause.skills_required = { [Op.overlap]: skillsArray };
    }

    const { count, rows } = await Job.findAndCountAll({
      where: whereClause,
      include: [{
        model: Auth,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      }],
      order: [
        ['is_featured', 'DESC'],
        ['posted_time', 'DESC']
      ],
      limit,
      offset
    });

    res.status(200).json({
      message: 'Jobs retrieved successfully',
      jobs: rows,
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

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findOne({
      where: { id, is_active: true },
      include: [{
        model: Auth,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      }]
    });
    
    if (!job) {
      return res.status(404).json({ 
        message: 'Job not found' 
      });
    }

    // Increment view count
    await job.increment('views_count');

    res.status(200).json({
      message: 'Job retrieved successfully',
      job
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Create new job
exports.createJob = async (req, res) => {
  try {
    const {
      company_name,
      company_logo_url,
      location,
      job_title,
      job_type,
      job_description,
      skills_required,
      salary_per_hour,
      salary_min,
      salary_max,
      salary_currency,
      apply_link,
      industry,
      experience_level,
      remote_option,
      is_featured
    } = req.body;
    
    // Validate required fields
    if (!company_name || !location || !job_title || !job_description) {
      return res.status(400).json({ 
        message: 'Company name, location, job title, and job description are required' 
      });
    }

    // Create job
    const job = await Job.create({
      company_name,
      company_logo_url,
      location,
      job_title,
      job_type: job_type || 'Full time',
      job_description,
      skills_required,
      salary_per_hour,
      salary_min,
      salary_max,
      salary_currency: salary_currency || 'USD',
      apply_link,
      industry,
      experience_level,
      remote_option: remote_option || 'On-site',
      is_featured: is_featured || false,
      created_by: req.user ? req.user.id : null
    });

    const createdJob = await Job.findByPk(job.id, {
      include: [{
        model: Auth,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    res.status(201).json({
      message: 'Job created successfully',
      job: createdJob
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: err.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Update job
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      company_name,
      company_logo_url,
      location,
      job_title,
      job_type,
      job_description,
      skills_required,
      salary_per_hour,
      salary_min,
      salary_max,
      salary_currency,
      apply_link,
      industry,
      experience_level,
      remote_option,
      is_featured,
      is_active
    } = req.body;
    
    const job = await Job.findByPk(id);
    
    if (!job) {
      return res.status(404).json({ 
        message: 'Job not found' 
      });
    }

    // Check if user is authorized to update this job
    if (req.user && job.created_by && req.user.id !== job.created_by) {
      return res.status(403).json({ 
        message: 'Not authorized to update this job' 
      });
    }

    // Update fields
    const updateData = {};
    if (company_name !== undefined) updateData.company_name = company_name;
    if (company_logo_url !== undefined) updateData.company_logo_url = company_logo_url;
    if (location !== undefined) updateData.location = location;
    if (job_title !== undefined) updateData.job_title = job_title;
    if (job_type !== undefined) updateData.job_type = job_type;
    if (job_description !== undefined) updateData.job_description = job_description;
    if (skills_required !== undefined) updateData.skills_required = skills_required;
    if (salary_per_hour !== undefined) updateData.salary_per_hour = salary_per_hour;
    if (salary_min !== undefined) updateData.salary_min = salary_min;
    if (salary_max !== undefined) updateData.salary_max = salary_max;
    if (salary_currency !== undefined) updateData.salary_currency = salary_currency;
    if (apply_link !== undefined) updateData.apply_link = apply_link;
    if (industry !== undefined) updateData.industry = industry;
    if (experience_level !== undefined) updateData.experience_level = experience_level;
    if (remote_option !== undefined) updateData.remote_option = remote_option;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (is_active !== undefined) updateData.is_active = is_active;

    await job.update(updateData);

    const updatedJob = await Job.findByPk(id, {
      include: [{
        model: Auth,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    res.status(200).json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: err.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Delete job
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findByPk(id);
    
    if (!job) {
      return res.status(404).json({ 
        message: 'Job not found' 
      });
    }

    // Check if user is authorized to delete this job
    if (req.user && job.created_by && req.user.id !== job.created_by) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this job' 
      });
    }

    await job.destroy();

    res.status(200).json({
      message: 'Job deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get featured jobs
exports.getFeaturedJobs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const jobs = await Job.findAll({
      where: { 
        is_featured: true, 
        is_active: true 
      },
      include: [{
        model: Auth,
        as: 'creator',
        attributes: ['id', 'fullName', 'email']
      }],
      order: [['posted_time', 'DESC']],
      limit
    });

    res.status(200).json({
      message: 'Featured jobs retrieved successfully',
      jobs
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get job statistics
exports.getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.count({ where: { is_active: true } });
    const featuredJobs = await Job.count({ where: { is_featured: true, is_active: true } });
    const totalViews = await Job.sum('views_count', { where: { is_active: true } });
    const totalApplications = await Job.sum('applications_count', { where: { is_active: true } });

    // Get job types distribution
    const jobTypes = await Job.findAll({
      attributes: [
        'job_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      where: { is_active: true },
      group: ['job_type']
    });

    res.status(200).json({
      message: 'Job statistics retrieved successfully',
      stats: {
        total: totalJobs,
        featured: featuredJobs,
        totalViews: totalViews || 0,
        totalApplications: totalApplications || 0,
        jobTypes
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
}; 