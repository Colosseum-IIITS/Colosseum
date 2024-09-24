const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { authenticateToken } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

router.get('/searchTournaments', authenticateToken, playerController.searchTournaments); // w
router.post('/followOrganiser', authenticateToken, playerController.followOrganiser); // w
router.post('/unFollowOrganiser', authenticateToken, playerController.unfollowOrganiser); // w
router.post('/joinTournament', authenticateToken, playerController.joinTournament); // w 
router.put('/updateUsername', authenticateToken, playerController.updateUsername); // w
router.put('/updatePassword', authenticateToken, playerController.updatePassword); // w
router.put('/updateEmail', authenticateToken, playerController.updateEmail); // w
router.get('/tournamentsPlayed', authenticateToken, playerController.getTournamentsPlayed); // w
router.get('/tournamentsWon', authenticateToken, playerController.getTournamentsWon); // w
router.get('/ranking', authenticateToken, playerController.getPlayerRanking); // w
router.get('/followingOrgs', playerController.followOrganiser);

router.post('/report-team', authenticateToken, reportController.reportTeam);
router.post('/report-organiser', authenticateToken, reportController.reportOrganiser);

module.exports = router;
