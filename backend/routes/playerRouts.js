const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { authenticateToken } = require('../middleware/authMiddleware');


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

module.exports = router;
