const { State, City } = require('../models');

// Add a new state
exports.addState = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'State name is required' });
    const state = await State.create({ name });
    res.status(201).json({ message: 'State created', state });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List all states
exports.getStates = async (req, res) => {
  try {
    const states = await State.findAll();
    res.status(200).json({ states });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Add a new city
exports.addCity = async (req, res) => {
  try {
    const { name, stateId } = req.body;
    if (!name || !stateId) return res.status(400).json({ message: 'City name and stateId are required' });
    const city = await City.create({ name, stateId });
    res.status(201).json({ message: 'City created', city });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List all cities
exports.getCities = async (req, res) => {
  try {
    const cities = await City.findAll({ include: State });
    res.status(200).json({ cities });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List all cities for a state
exports.getCitiesByState = async (req, res) => {
  try {
    const { stateId } = req.params;
    const cities = await City.findAll({ where: { stateId } });
    res.status(200).json({ cities });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 