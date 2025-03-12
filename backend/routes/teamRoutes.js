const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamControllers');
const { authenticateUser }= require('../middleware/authMiddleware');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
router.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

router.post('/create', authenticateUser, csrfProtection,teamController.createTeam);
router.post('/join', authenticateUser, teamController.joinTeam);
router.post('/request', authenticateUser, teamController.requestToJoinTeam);
router.post('/leave', authenticateUser,csrfProtection, teamController.leaveTeam);
router.get('/search', teamController.getTeamsByName);
router.post('/updateTeamName', csrfProtection,authenticateUser, teamController.updateTeamName);
router.get('/:teamId/requests', authenticateUser, teamController.getJoinRequests);
router.post('/accept', authenticateUser, teamController.acceptJoinRequest);
router.post('/reject', authenticateUser, teamController.rejectJoinRequest);
router.get('/getTournamentsWon',authenticateUser,teamController.getTournamentsWon );
router.get('/getTournamentsPlayed',authenticateUser,teamController.getTournamentsPlayed);
router.get('/dashboard', authenticateUser, teamController.getTeamDashboard);
router.post('/remove/:playerId', authenticateUser, teamController.removePlayerFromTeam);




module.exports = router;
