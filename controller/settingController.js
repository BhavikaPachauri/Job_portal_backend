const { Setting } = require('../models');

// Get all settings or by ID (if provided)
exports.getSettings = async (req, res) => {
  try {
    const { id, userId } = req.query;
    let settings;
    if (id) {
      settings = await Setting.findByPk(id);
      if (!settings) {
        return res.status(404).json({ message: 'Setting not found' });
      }
    } else if (userId) {
      settings = await Setting.findOne({ where: { userId } });
      if (!settings) {
        return res.status(404).json({ message: 'Setting not found for this user' });
      }
    } else {
      settings = await Setting.findAll();
    }
    res.status(200).json({
      message: 'Settings retrieved successfully',
      settings
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create new settings
exports.createSetting = async (req, res) => {
  try {
    const setting = await Setting.create(req.body);
    res.status(201).json({ message: 'Setting created successfully', setting });
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

// Update settings by ID
exports.updateSettings = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'ID is required to update settings' });
    }
    const setting = await Setting.findByPk(id);
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    await setting.update(req.body);
    res.status(200).json({ message: 'Setting updated successfully', setting });
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

// Delete settings by ID
exports.deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const setting = await Setting.findByPk(id);
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    await setting.destroy();
    res.status(200).json({ message: 'Setting deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Upload logo
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No logo file provided' 
      });
    }

    const userId = req.user.id;
    const logoUrl = `/uploads/settings/logos/${req.file.filename}`;

    // Update settings with new logo URL
    let settings = await Setting.findOne({ where: { userId } });
    if (!settings) {
      settings = await Setting.create({ userId });
    }

    await settings.update({ logoUrl });

    res.status(200).json({
      message: 'Logo uploaded successfully',
      logoUrl
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Upload cover photo
exports.uploadCoverPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No cover photo file provided' 
      });
    }

    const userId = req.user.id;
    const coverPhotoUrl = `/uploads/settings/covers/${req.file.filename}`;

    // Update settings with new cover photo URL
    let settings = await Setting.findOne({ where: { userId } });
    if (!settings) {
      settings = await Setting.create({ userId });
    }

    await settings.update({ coverPhotoUrl });

    res.status(200).json({
      message: 'Cover photo uploaded successfully',
      coverPhotoUrl
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Reset settings to default
exports.resetSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let settings = await Setting.findOne({ where: { userId } });
    
    if (!settings) {
      settings = await Setting.create({ userId });
    }

    // Reset to default values
    await settings.update({
      companyName: null,
      email: null,
      phone: null,
      website: null,
      bio: null,
      experience: null,
      employees: null,
      languages: null,
      categories: null,
      workingTime: null,
      averageWage: null,
      location: null,
      logoUrl: null,
      coverPhotoUrl: null,
      notifications: {
        jobAlert: true,
        weeklySummary: false,
        applicationUpdates: true,
        newsletter: false
      },
      privacy: {
        profileVisibility: 'public',
        resumeDownloadable: true,
        emailVisible: false
      },
      language: 'en',
      timezone: 'UTC',
      theme: 'light'
    });

    const resetSettings = await Setting.findOne({
      where: { userId },
      include: [{
        model: Auth,
        as: 'user',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    res.status(200).json({
      message: 'Settings reset to default successfully',
      settings: resetSettings
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
}; 