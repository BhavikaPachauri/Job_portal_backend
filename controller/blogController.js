const { Blog } = require('../models');
const { Op } = require('sequelize');

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// List all blogs with pagination and filtering
exports.listBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || 'published';
    const search = req.query.search;
    const tag = req.query.tag;

    const whereClause = { status };
    
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (tag) {
      whereClause.tags = { [Op.contains]: [tag] };
    }

    const { count, rows } = await Blog.findAndCountAll({
      where: whereClause,
      order: [['writeDate', 'DESC']],
      limit,
      offset,
      attributes: { exclude: ['content'] } // Don't include full content in list
    });

    res.status(200).json({
      message: 'Blogs retrieved successfully',
      blogs: rows,
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

// Get blog detail by ID
exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByPk(id);
    
    if (!blog) {
      return res.status(404).json({ 
        message: 'Blog not found' 
      });
    }

    // Increment view count
    await blog.increment('viewCount');

    res.status(200).json({
      message: 'Blog retrieved successfully',
      blog
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get blog by slug
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({
      where: { slug, status: 'published' }
    });
    
    if (!blog) {
      return res.status(404).json({ 
        message: 'Blog not found' 
      });
    }

    // Increment view count
    await blog.increment('viewCount');

    res.status(200).json({
      message: 'Blog retrieved successfully',
      blog
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Create new blog (Admin only)
exports.createBlog = async (req, res) => {
  try {
    let { title, description, content, image, writtenBy, timeToRead, slug, status, tags } = req.body;
    if (!slug && title) {
      slug = generateSlug(title);
    }
    const blog = await Blog.create({
      title,
      description,
      content,
      image,
      writtenBy,
      timeToRead: timeToRead || 5,
      slug,
      status: status || 'draft',
      tags
    });

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: err.errors.map(e => e.message) 
      });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        message: 'Blog with this title already exists' 
      });
    }
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Update blog
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      content,
      image,
      writtenBy,
      timeToRead,
      tags,
      status
    } = req.body;
    
    const blog = await Blog.findByPk(id);
    
    if (!blog) {
      return res.status(404).json({ 
        message: 'Blog not found' 
      });
    }

    // Update fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (image !== undefined) updateData.image = image;
    if (writtenBy !== undefined) updateData.writtenBy = writtenBy;
    if (timeToRead !== undefined) updateData.timeToRead = timeToRead;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) updateData.status = status;

    let slug = req.body.slug;
    if (!slug && title) {
      slug = generateSlug(title);
    }
    updateData.slug = slug;

    await blog.update(updateData);

    res.status(200).json({
      message: 'Blog updated successfully',
      blog
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

// Delete blog
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByPk(id);
    
    if (!blog) {
      return res.status(404).json({ 
        message: 'Blog not found' 
      });
    }

    await blog.destroy();

    res.status(200).json({
      message: 'Blog deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Get blog statistics
exports.getBlogStats = async (req, res) => {
  try {
    const totalBlogs = await Blog.count();
    const publishedBlogs = await Blog.count({ where: { status: 'published' } });
    const draftBlogs = await Blog.count({ where: { status: 'draft' } });
    const archivedBlogs = await Blog.count({ where: { status: 'archived' } });
    const totalViews = await Blog.sum('viewCount');

    res.status(200).json({
      message: 'Blog statistics retrieved successfully',
      stats: {
        total: totalBlogs,
        published: publishedBlogs,
        draft: draftBlogs,
        archived: archivedBlogs,
        totalViews: totalViews || 0
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
};

// Upload blog image
exports.uploadBlogImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No image file provided' 
      });
    }

    // In a real application, you would upload to cloud storage
    // For now, we'll return a mock URL
    const imageUrl = `/uploads/blog-images/${req.file.filename}`;

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message 
    });
  }
}; 