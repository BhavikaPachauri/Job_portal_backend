const { Task } = require('../models');

// List all tasks
exports.listTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ message: 'Tasks retrieved successfully', tasks });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, status, startDate, completion } = req.body;
    const task = await Task.create({ title, description, priority, status, startDate, completion });
    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, startDate, completion } = req.body;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.update({ title, description, priority, status, startDate, completion });
    res.status(200).json({ message: 'Task updated successfully', task });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: err.errors.map(e => e.message) });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.destroy();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 