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
    const logoUrl = `${req.protocol}://${req.get('host')}/uploads/settings/logos/${req.file.filename}`;

    // Debug logs
    console.log('protocol:', req.protocol);
    console.log('host:', req.get('host'));
    console.log('file:', req.file);
    console.log('logoUrl:', logoUrl);

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

// Upload logo (new endpoint /api/settings/upload-logo1)
exports.uploadLogo1 = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No logo file provided' 
      });
    }

    const userId = req.user.id;
    // Construct absolute URL for the uploaded logo
    const protocol = req.protocol;
    const host = req.get('host');
    const filename = req.file.filename;
    const logoUrl = `${protocol}://${host}/uploads/settings/logos/${filename}`;

    // Debug logs
    console.log('protocol:', protocol);
    console.log('host:', host);
    console.log('file:', req.file);
    console.log('logoUrl:', logoUrl);

    // Update or create settings for the user
    let settings = await Setting.findOne({ where: { userId } });
    if (!settings) {
      settings = await Setting.create({ userId });
    }
    await settings.update({ logoUrl });

    res.status(200).json({
      message: 'Logo uploaded successfully (v1)',
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
    const coverPhotoUrl = `${req.protocol}://${req.get('host')}/uploads/settings/covers/${req.file.filename}`;

    // Debug logs
    console.log('Cover photo upload - protocol:', req.protocol);
    console.log('Cover photo upload - host:', req.get('host'));
    console.log('Cover photo upload - file:', req.file);
    console.log('Cover photo upload - coverPhotoUrl:', coverPhotoUrl);
    console.log('Cover photo upload - userId:', userId);

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
    console.error('Cover photo upload error:', err);
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