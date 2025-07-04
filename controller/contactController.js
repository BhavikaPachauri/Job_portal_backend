const { Contact } = require('../models');

// Create a new contact submission
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, company, description } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !description) {
      return res.status(400).json({ 
        message: 'Name, email, phone, and description are required' 
      });
    }

    // Create contact
    const contact = await Contact.create({
      name,
      email,
      phone,
      company,
      description
    });

    res.status(201).json({
      message: 'Contact submission successful',
      contact
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

// Get all contacts (with pagination)
exports.getAllContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Contact.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      message: 'Contacts retrieved successfully',
      contacts: rows,
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

// Get a single contact by ID
exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findByPk(id);
    
    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact not found' 
      });
    }

    res.status(200).json({
      message: 'Contact retrieved successfully',
      contact
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Update contact status
exports.updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, name, email, phone, company, description } = req.body;
    
    const contact = await Contact.findByPk(id);
    
    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact not found' 
      });
    }

    // Update fields
    const updateData = {};
    if (status) updateData.status = status;
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (company !== undefined) updateData.company = company;
    if (description) updateData.description = description;

    await contact.update(updateData);

    res.status(200).json({
      message: 'Contact updated successfully',
      contact
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

// Delete a contact
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await Contact.findByPk(id);
    
    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact not found' 
      });
    }

    await contact.destroy();

    res.status(200).json({
      message: 'Contact deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get contact statistics
exports.getContactStats = async (req, res) => {
  try {
    const totalContacts = await Contact.count();
    const pendingContacts = await Contact.count({ where: { status: 'pending' } });
    const readContacts = await Contact.count({ where: { status: 'read' } });
    const repliedContacts = await Contact.count({ where: { status: 'replied' } });

    res.status(200).json({
      message: 'Contact statistics retrieved successfully',
      stats: {
        total: totalContacts,
        pending: pendingContacts,
        read: readContacts,
        replied: repliedContacts
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
}; 