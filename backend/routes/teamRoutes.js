const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamControllers');
const { authenticateUser }= require('../middleware/authMiddleware');

// Route to create a new team   
router.post('/create', authenticateUser, teamController.createTeam);

// Route to join an existing team
router.post('/join', authenticateUser, teamController.joinTeam);

// Route to leave a team
router.post('/leave', authenticateUser, teamController.leaveTeam);

// Route to search a team
router.get('/search', teamController.getTeamsByName);


// Route to update team name (only by captain)
// working
router.post('/updateTeamName', authenticateUser, teamController.updateTeamName);


module.exports = router;
