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


router.get('/searchTournaments', authenticateToken, playerController.searchTournaments); // w
router.post('/followOrganiser', authenticateToken, playerController.followOrganiser); // w
router.post('/unFollowOrganiser', authenticateToken, playerController.unfollowOrganiser); // w
router.post('/joinTournament', authenticateToken, playerController.joinTournament); // w 
router.put('/updateUsername', authenticateToken, playerController.updateUsername); // w
router.put('/updatePassword', authenticateToken, playerController.updatePassword); // w
router.put('/updateEmail', authenticateToken, playerController.updateEmail); // w
router.post('/updateProfile', authenticateToken , playerController.updateProfile);
router.get('/tournamentsPlayed', authenticateToken, playerController.getTournamentsPlayed); // w
router.get('/tournamentsWon', authenticateToken, playerController.getTournamentsWon); // w
router.get('/ranking', authenticateToken, playerController.getPlayerRanking); // w
router.get('/searchOrganisers',authenticateToken, organiserController.getOrganiserByUsername);
router.post('/report-team', authenticateToken, reportController.reportTeam);
router.post('/report-organiser', authenticateToken, reportController.reportOrganiser);
router.get('/dashboard', authenticateToken, playerController.getPlayerDashboard);

router.get('/tournament/:tournamentId/points', authenticateToken, playerController.getPlayerDashboard);

router.get('/homepage', authenticateToken, playerController.getHomePage);


module.exports = router;
