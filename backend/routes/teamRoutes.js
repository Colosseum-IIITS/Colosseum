const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamControllers');
const { authenticateToken }= require('../middleware/authMiddleware');

// Route to create a new team   
router.post('/create', authenticateToken, teamController.createTeam);

// Route to join an existing team
router.post('/join', authenticateToken, teamController.joinTeam);

// Route to leave a team
router.post('/leave', authenticateToken, teamController.leaveTeam);

// Route to search a team
router.get('/search', teamController.getTeamByName);


// Route to update team name (only by captain)
// working
router.put('/updateTeamName', authenticateToken, teamController.updateTeamName);


module.exports = router;
