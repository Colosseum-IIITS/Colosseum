const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamControllers');

// Route to create a new team
router.post('/create', teamController.createTeam);

// Route to join an existing team
router.post('/join', teamController.joinTeam);

// Route to leave a team
router.post('/leave', teamController.leaveTeam);

// Route to search a team
router.get('/search', teamController.getTeamByName);


// Route to update team name (only by captain)
// working
router.put('/updateTeamName', teamController.updateTeamName);


module.exports = router;
