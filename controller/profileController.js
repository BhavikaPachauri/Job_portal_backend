const { Profile, Auth } = require('../models');

// Get Profile by ID (public)
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json({ message: 'Profile retrieved successfully', profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update Profile (public)
exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const profile = await Profile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    await profile.update(updateData);
    res.status(200).json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.errors.map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create Profile (public)
exports.createProfile = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      email,
      phone,
      bio,
      experience,
      education,
      skills,
      languages,
      expectedSalary,
      currentSalary,
      address,
      location,
      socialLinks
    } = req.body;
    const profile = await Profile.create({
      userId,
      fullName,
      email,
      phone,
      bio,
      experience,
      education,
      skills,
      languages,
      expectedSalary,
      currentSalary,
      address,
      location,
      socialLinks
    });
    res.status(201).json({ message: 'Profile created successfully', profile });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.errors.map(e => e.message)
      });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete Profile (public)
exports.deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByPk(id);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    await profile.destroy();
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: { userId: req.user.id },
      include: [{
        model: Auth,
        as: 'user',
        attributes: ['id', 'fullName', 'email', 'username']
      }]
    });
    
    if (!profile) {
      return res.status(404).json({ 
        message: 'Profile not found. Please create your profile first.' 
      });
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      profile
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
}; 