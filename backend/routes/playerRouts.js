const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { authenticateToken } = require('../middleware/authMiddleware');
const organiserController = require('../controllers/organiserController');
const reportController = require('../controllers/reportController');
const Player = require('../models/Player');
const teamController = require('../controllers/teamControllers');
const tournmentController = require('../controllers/tournmentController');
const organiser = require('../models/Organiser');

router.get('/searchTournaments', authenticateToken, playerController.searchTournaments);
router.post('/followOrganiser', authenticateToken, playerController.followOrganiser);
router.post('/unFollowOrganiser', authenticateToken, playerController.unfollowOrganiser);
router.post('/joinTournament', authenticateToken, playerController.joinTournament);
router.post('/updateUsername', authenticateToken, playerController.updateUsername);
router.post('/updatePassword', authenticateToken, playerController.updatePassword);
router.post('/updateEmail', authenticateToken, playerController.updateEmail);
router.post('/updateProfile', authenticateToken, playerController.updateProfile);
router.get('/tournamentsPlayed', authenticateToken, playerController.getTournamentsPlayed);
router.get('/tournamentsWon', authenticateToken, playerController.getTournamentsWon);
router.get('/ranking', authenticateToken, playerController.getPlayerRanking);
router.get('/searchOrganisers', authenticateToken, organiserController.getOrganiserByUsername);
router.post('/report-team', authenticateToken, reportController.reportTeam);
router.post('/report-organiser', authenticateToken, reportController.reportOrganiser);
router.get('/dashboard', authenticateToken, playerController.getDashboard);
router.get('/teamName', authenticateToken, teamController.getTeamsByName);
router.get('/followedOrg',authenticateToken,organiserController.getMyOrganisers);
router.get('/homepage', authenticateToken, playerController.getHomePage);


module.exports = router;
