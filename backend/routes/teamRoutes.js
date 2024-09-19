const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// Route to create a new team
router.post('/create', teamController.createTeam);

// Route to join an existing team
router.post('/join', teamController.joinTeam);

// Route to leave a team
router.post('/leave', teamController.leaveTeam);

module.exports = router;
