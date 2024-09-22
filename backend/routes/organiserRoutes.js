const express = require('express');
const router = express.Router();
const organiserController = require('../controllers/organiserController');
const teamController = require('../controllers/teamControllers');

// Route to create a new Organiser
router.post('/create', organiserController.createOrganiser);

// Route to search the Organiser
router.get('/search', organiserController.getOrganiserByUsername);

module.exports = router;
