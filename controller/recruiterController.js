const { Recruiter } = require('../models');
const { Op } = require('sequelize');

// List all recruiters with filtering and pagination
exports.listRecruiters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const {
      search,
      skills,
      location,
      company_size,
      industry,
      experience_min,
      experience_max,
      rating_min,
      status,
      is_verified,
      is_featured
    } = req.query;

    const whereClause = { status: 'active' };
    
    // Search in name, designation, company_name, bio, and location
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { designation: { [Op.iLike]: `%${search}%` } },
        { company_name: { [Op.iLike]: `%${search}%` } },
        { bio: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Apply filters
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    if (company_size) whereClause.company_size = company_size;
    if (industry) whereClause.industry = { [Op.iLike]: `%${industry}%` };
    if (status) whereClause.status = status;
    if (is_verified !== undefined) whereClause.is_verified = is_verified === 'true';
    if (is_featured !== undefined) whereClause.is_featured = is_featured === 'true';
    
    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      whereClause.skills = { [Op.overlap]: skillsArray };
    }

    // Experience range filter
    if (experience_min || experience_max) {
      whereClause.experience_years = {
        [Op.between]: [experience_min || 0, experience_max || 50]
      };
    }

    // Rating filter
    if (rating_min) {
      whereClause.rating = {
        [Op.gte]: parseFloat(rating_min)
      };
    }

    const { count, rows } = await Recruiter.findAndCountAll({
      where: whereClause,
      order: [
        ['is_featured', 'DESC'],
        ['rating', 'DESC'],
        ['total_jobs_posted', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });

    res.status(200).json({
      message: 'Recruiters retrieved successfully',
      recruiters: rows,
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

// Get recruiter by ID
exports.getRecruiterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recruiter = await Recruiter.findOne({
      where: { id, status: 'active' }
    });
    
    if (!recruiter) {
      return res.status(404).json({ 
        message: 'Recruiter not found' 
      });
    }

    // Increment view count
    await recruiter.increment('views_count');

    res.status(200).json({
      message: 'Recruiter retrieved successfully',
      recruiter
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Create new recruiter
exports.createRecruiter = async (req, res) => {
  try {
    const {
      name,
      designation,
      company_name,
      email,
      bio,
      skills,
      rating,
      location,
      profile_image_url,
      social_links,
      is_verified,
      phone,
      website,
      company_size,
      industry,
      experience_years,
      specializations,
      is_featured
    } = req.body;
    
    // Validate required fields
    if (!name || !designation || !company_name || !email || !location) {
      return res.status(400).json({ 
        message: 'Name, designation, company name, email, and location are required' 
      });
    }

    // Validate skills array
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ 
        message: 'Skills must be an array' 
      });
    }

    // Check if email already exists
    const existingRecruiter = await Recruiter.findOne({ where: { email } });
    if (existingRecruiter) {
      return res.status(400).json({ 
        message: 'Email already exists' 
      });
    }

    // Create recruiter
    const recruiter = await Recruiter.create({
      name,
      designation,
      company_name,
      email,
      bio,
      skills,
      rating: rating || 0.00,
      location,
      profile_image_url,
      social_links,
      is_verified: is_verified || false,
      phone,
      website,
      company_size,
      industry,
      experience_years,
      specializations,
      is_featured: is_featured || false
    });

    res.status(201).json({
      message: 'Recruiter created successfully',
      recruiter
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

// Update recruiter
exports.updateRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      designation,
      company_name,
      email,
      bio,
      skills,
      rating,
      location,
      profile_image_url,
      social_links,
      is_verified,
      phone,
      website,
      company_size,
      industry,
      experience_years,
      specializations,
      status,
      is_featured
    } = req.body;
    
    const recruiter = await Recruiter.findByPk(id);
    
    if (!recruiter) {
      return res.status(404).json({ 
        message: 'Recruiter not found' 
      });
    }

    // Check if email already exists (if email is being updated)
    if (email && email !== recruiter.email) {
      const existingRecruiter = await Recruiter.findOne({ where: { email } });
      if (existingRecruiter) {
        return res.status(400).json({ 
          message: 'Email already exists' 
        });
      }
    }

    // Update fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (designation !== undefined) updateData.designation = designation;
    if (company_name !== undefined) updateData.company_name = company_name;
    if (email !== undefined) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (skills !== undefined) updateData.skills = skills;
    if (rating !== undefined) updateData.rating = rating;
    if (location !== undefined) updateData.location = location;
    if (profile_image_url !== undefined) updateData.profile_image_url = profile_image_url;
    if (social_links !== undefined) updateData.social_links = social_links;
    if (is_verified !== undefined) updateData.is_verified = is_verified;
    if (phone !== undefined) updateData.phone = phone;
    if (website !== undefined) updateData.website = website;
    if (company_size !== undefined) updateData.company_size = company_size;
    if (industry !== undefined) updateData.industry = industry;
    if (experience_years !== undefined) updateData.experience_years = experience_years;
    if (specializations !== undefined) updateData.specializations = specializations;
    if (status !== undefined) updateData.status = status;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    await recruiter.update(updateData);

    res.status(200).json({
      message: 'Recruiter updated successfully',
      recruiter
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

// Delete recruiter
exports.deleteRecruiter = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recruiter = await Recruiter.findByPk(id);
    
    if (!recruiter) {
      return res.status(404).json({ 
        message: 'Recruiter not found' 
      });
    }

    await recruiter.destroy();

    res.status(200).json({
      message: 'Recruiter deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Upload recruiter profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No file provided' 
      });
    }

    const uploadedFile = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/recruiters/profile-images/${req.file.filename}`
    };

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      file: uploadedFile
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get featured recruiters
exports.getFeaturedRecruiters = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const recruiters = await Recruiter.findAll({
      where: { 
        status: 'active',
        is_featured: true 
      },
      order: [
        ['rating', 'DESC'],
        ['total_jobs_posted', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit
    });

    res.status(200).json({
      message: 'Featured recruiters retrieved successfully',
      recruiters
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get recruiters by skills
exports.getRecruitersBySkills = async (req, res) => {
  try {
    const { skills } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (!skills) {
      return res.status(400).json({ 
        message: 'Skills parameter is required' 
      });
    }

    const skillsArray = skills.split(',').map(skill => skill.trim());

    const { count, rows } = await Recruiter.findAndCountAll({
      where: {
        status: 'active',
        skills: { [Op.overlap]: skillsArray }
      },
      order: [
        ['rating', 'DESC'],
        ['total_jobs_posted', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });

    res.status(200).json({
      message: 'Recruiters by skills retrieved successfully',
      recruiters: rows,
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

// Get verified recruiters
exports.getVerifiedRecruiters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Recruiter.findAndCountAll({
      where: {
        status: 'active',
        is_verified: true
      },
      order: [
        ['rating', 'DESC'],
        ['total_jobs_posted', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });

    res.status(200).json({
      message: 'Verified recruiters retrieved successfully',
      recruiters: rows,
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