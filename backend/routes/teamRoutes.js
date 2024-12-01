const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamControllers');
const { authenticateUser }= require('../middleware/authMiddleware');

router.post('/create', authenticateUser, teamController.createTeam);
router.post('/join', authenticateUser, teamController.joinTeam);
router.post('/request', authenticateUser, teamController.requestToJoinTeam);
router.post('/leave', authenticateUser, teamController.leaveTeam);
router.get('/search', teamController.getTeamsByName);
router.post('/updateTeamName', authenticateUser, teamController.updateTeamName);
router.get('/:teamId/requests', authenticateUser, teamController.getJoinRequests);
router.post('/accept', authenticateUser, teamController.acceptJoinRequest);
router.post('/reject', authenticateUser, teamController.rejectJoinRequest);


module.exports = router;
