const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamControllers');
const { authenticateUser }= require('../middleware/authMiddleware');

// Route to create a new team   
router.post('/create', authenticateUser, teamController.createTeam);

// Route to join an existing team
router.post('/join', authenticateUser, teamController.joinTeam);

// Route to request to join an existing team
router.post('/request', authenticateUser, teamController.requestToJoinTeam);

// Route to leave a team
router.post('/leave', authenticateUser, teamController.leaveTeam);

// Route to search a team
router.get('/search', teamController.getTeamsByName);

// Route to update team name (only by captain)
router.post('/updateTeamName', authenticateUser, teamController.updateTeamName);

// Route to get join requests for a specific team (only accessible by the captain)
router.get('/:teamId/requests', authenticateUser, teamController.getJoinRequests);

// Route to accept a join request (only the captain can accept)
router.post('/accept', authenticateUser, teamController.acceptJoinRequest);

// Route to reject a join request (only the captain can reject)
router.post('/reject', authenticateUser, teamController.rejectJoinRequest);


module.exports = router;
