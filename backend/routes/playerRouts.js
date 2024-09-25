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
router.get('/homepage', authenticateToken, (req, res) => {
    res.render('homepage'); 
});
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
router.get('/searchOrganisers',authenticateToken, organiserController.getOrganiserByUsername);
router.post('/report-team', authenticateToken, reportController.reportTeam);
router.post('/report-organiser', authenticateToken, reportController.reportOrganiser);
router.get('/dashboard', authenticateToken, async (req, res) => {
    const userId = req.user._id; // Get user ID from authenticated request
    try {
        const user = await Player.findById(userId); // Assuming you are using the Player model
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Pass user data to the template
        res.render('dashboard', { user });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
router.post('/joinTeam', authenticateToken,teamController.joinTeam);
router.get('/searchTeam', teamController.getTeamsByName);
router.get('/getEnrolledTeams', authenticateToken, teamController.getEnrolledTeams);
router.get('/getEnrolledTournaments', authenticateToken, tournmentController.getEnrolledTournaments);
router.get('/myOrganisers', authenticateToken, organiserController.getMyOrganisers);

module.exports = router;
