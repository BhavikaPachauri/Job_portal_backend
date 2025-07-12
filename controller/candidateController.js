const { Candidate } = require('../models');
const { Op } = require('sequelize');

// List all candidates with filtering and pagination
exports.listCandidates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const {
      search,
      skills,
      location,
      availability,
      preferred_work_type,
      experience_min,
      experience_max,
      hourly_rate_min,
      hourly_rate_max,
      rating_min,
      status,
      is_featured
    } = req.query;

    const whereClause = { status: 'active' };
    
    // Search in name, designation, bio, and location
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { designation: { [Op.iLike]: `%${search}%` } },
        { bio: { [Op.iLike]: `%${search}%` } },
        { location: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Apply filters
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    if (availability) whereClause.availability = availability;
    if (preferred_work_type) whereClause.preferred_work_type = preferred_work_type;
    if (status) whereClause.status = status;
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

    // Hourly rate range filter
    if (hourly_rate_min || hourly_rate_max) {
      whereClause.hourlyRate = {
        [Op.between]: [hourly_rate_min || 0, hourly_rate_max || 999999]
      };
    }

    // Rating filter
    if (rating_min) {
      whereClause.rating = {
        [Op.gte]: parseFloat(rating_min)
      };
    }

    const { count, rows } = await Candidate.findAndCountAll({
      where: whereClause,
      order: [
        ['is_featured', 'DESC'],
        ['rating', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });

    res.status(200).json({
      message: 'Candidates retrieved successfully',
      candidates: rows,
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

// Get candidate by ID
exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const candidate = await Candidate.findOne({
      where: { id, status: 'active' }
    });
    
    if (!candidate) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    // Increment view count
    await candidate.increment('views_count');

    res.status(200).json({
      message: 'Candidate retrieved successfully',
      candidate
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Create new candidate
exports.createCandidate = async (req, res) => {
  try {
    const {
      name,
      designation,
      skills,
      rating,
      bio,
      location,
      hourlyRate,
      photo,
      email,
      phone,
      experience_years,
      education,
      certifications,
      portfolio_url,
      linkedin_url,
      github_url,
      availability,
      preferred_work_type,
      languages,
      timezone,
      is_featured
    } = req.body;
    
    // Validate required fields
    if (!name || !designation || !location || !hourlyRate) {
      return res.status(400).json({ 
        message: 'Name, designation, location, and hourly rate are required' 
      });
    }

    // Validate skills array
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ 
        message: 'Skills must be an array' 
      });
    }

    // Create candidate
    const candidate = await Candidate.create({
      name,
      designation,
      skills,
      rating: rating || 0.00,
      bio,
      location,
      hourlyRate,
      photo,
      email,
      phone,
      experience_years,
      education,
      certifications,
      portfolio_url,
      linkedin_url,
      github_url,
      availability: availability || 'Available',
      preferred_work_type: preferred_work_type || 'Remote',
      languages,
      timezone,
      is_featured: is_featured || false
    });

    res.status(201).json({
      message: 'Candidate created successfully',
      candidate
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

// Update candidate
exports.updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      designation,
      skills,
      rating,
      bio,
      location,
      hourlyRate,
      photo,
      email,
      phone,
      experience_years,
      education,
      certifications,
      portfolio_url,
      linkedin_url,
      github_url,
      availability,
      preferred_work_type,
      languages,
      timezone,
      status,
      is_featured
    } = req.body;
    
    const candidate = await Candidate.findByPk(id);
    
    if (!candidate) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    // Update fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (designation !== undefined) updateData.designation = designation;
    if (skills !== undefined) updateData.skills = skills;
    if (rating !== undefined) updateData.rating = rating;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (hourlyRate !== undefined) updateData.hourlyRate = hourlyRate;
    if (photo !== undefined) updateData.photo = photo;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (experience_years !== undefined) updateData.experience_years = experience_years;
    if (education !== undefined) updateData.education = education;
    if (certifications !== undefined) updateData.certifications = certifications;
    if (portfolio_url !== undefined) updateData.portfolio_url = portfolio_url;
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url;
    if (github_url !== undefined) updateData.github_url = github_url;
    if (availability !== undefined) updateData.availability = availability;
    if (preferred_work_type !== undefined) updateData.preferred_work_type = preferred_work_type;
    if (languages !== undefined) updateData.languages = languages;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (status !== undefined) updateData.status = status;
    if (is_featured !== undefined) updateData.is_featured = is_featured;

    await candidate.update(updateData);

    res.status(200).json({
      message: 'Candidate updated successfully',
      candidate
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

// Delete candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const candidate = await Candidate.findByPk(id);
    
    if (!candidate) {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    await candidate.destroy();

    res.status(200).json({
      message: 'Candidate deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Upload candidate photo
exports.uploadPhoto = async (req, res) => {
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
      url: `/uploads/candidates/photos/${req.user.id}/${req.file.filename}`
    };
    res.status(200).json({
      message: 'Photo uploaded successfully',
      file: uploadedFile
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get featured candidates
exports.getFeaturedCandidates = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const candidates = await Candidate.findAll({
      where: { 
        status: 'active',
        is_featured: true 
      },
      order: [
        ['rating', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit
    });

    res.status(200).json({
      message: 'Featured candidates retrieved successfully',
      candidates
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get candidates by skills
exports.getCandidatesBySkills = async (req, res) => {
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

    const { count, rows } = await Candidate.findAndCountAll({
      where: {
        status: 'active',
        skills: { [Op.overlap]: skillsArray }
      },
      order: [
        ['rating', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit,
      offset
    });

    res.status(200).json({
      message: 'Candidates by skills retrieved successfully',
      candidates: rows,
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

// Upload CV
exports.uploadCV = async (req, res) => {
  try {
    const candidateId = req.user.id;
    if (!candidateId) {
      return res.status(400).json({ message: 'candidateId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    const cvUrl = `/uploads/candidates/cvs/${candidateId}/${req.file.filename}`;
    await candidate.update({ cv_url: cvUrl });
    res.status(200).json({ message: 'CV uploaded successfully', cvUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Upload CV by candidateId (from params)
exports.uploadCVById = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    if (!candidateId) {
      return res.status(400).json({ message: 'candidateId is required' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    const candidate = await Candidate.findByPk(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    const cvUrl = `/uploads/candidates/cvs/${candidateId}/${req.file.filename}`;
    await candidate.update({ cv_url: cvUrl });
    res.status(200).json({ message: 'CV uploaded successfully', cvUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Download/View CV
exports.getCV = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByPk(id);
    if (!candidate || !candidate.cv_url) {
      return res.status(404).json({ message: 'CV not found' });
    }
    const filePath = require('path').join(__dirname, '../', candidate.cv_url);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete CV
exports.deleteCV = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findByPk(id);
    if (!candidate || !candidate.cv_url) {
      return res.status(404).json({ message: 'CV not found' });
    }
    const filePath = require('path').join(__dirname, '../', candidate.cv_url);
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await candidate.update({ cv_url: null });
    res.status(200).json({ message: 'CV deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 