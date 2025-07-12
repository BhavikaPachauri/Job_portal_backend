const express = require('express');
const router = express.Router();
const stateController = require('../controller/stateController');

/**
 * @swagger
 * /api/locations/states:
 *   post:
 *     summary: Add a new state
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: State name
 *     responses:
 *       201:
 *         description: State created
 *       400:
 *         description: State name is required
 *       500:
 *         description: Server error
 */
router.post('/states', stateController.addState);

/**
 * @swagger
 * /api/locations/states:
 *   get:
 *     summary: List all states
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of states
 *       500:
 *         description: Server error
 */
router.get('/states', stateController.getStates);

/**
 * @swagger
 * /api/locations/cities:
 *   post:
 *     summary: Add a new city
 *     tags: [Locations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - stateId
 *             properties:
 *               name:
 *                 type: string
 *                 description: City name
 *               stateId:
 *                 type: integer
 *                 description: State ID
 *     responses:
 *       201:
 *         description: City created
 *       400:
 *         description: City name and stateId are required
 *       500:
 *         description: Server error
 */
router.post('/cities', stateController.addCity);

/**
 * @swagger
 * /api/locations/cities:
 *   get:
 *     summary: List all cities
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of cities
 *       500:
 *         description: Server error
 */
router.get('/cities', stateController.getCities);

/**
 * @swagger
 * /api/locations/states/{stateId}/cities:
 *   get:
 *     summary: List all cities for a state
 *     tags: [Locations]
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: State ID
 *     responses:
 *       200:
 *         description: List of cities for the state
 *       500:
 *         description: Server error
 */
router.get('/states/:stateId/cities', stateController.getCitiesByState);

module.exports = router; 