const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');
const { authenticateUser } = require('../middleware/authMiddleware');
const organiserController = require('../controllers/organiserController');
const reportController = require('../controllers/reportController');
const Player = require('../models/Player');
const teamController = require('../controllers/teamControllers');
const tournmentController = require('../controllers/tournmentController');
const organiser = require('../models/Organiser');
const upload = require("../middleware/multerConfig");

router.get('/profile',authenticateUser,playerController.getPlayerProfile);
router.get('/searchTournaments', authenticateUser, playerController.searchTournaments);
router.get('/searchPlayer', playerController.searchPlayer);
router.post('/followOrganiser', authenticateUser, playerController.followOrganiser);
router.post('/unFollowOrganiser', authenticateUser, playerController.unfollowOrganiser);
router.post('/joinTournament', authenticateUser, playerController.joinTournament);
router.post('/updateUsername', authenticateUser, playerController.updateUsername);
router.post('/updatePassword', authenticateUser, playerController.updatePassword);
router.post('/updateEmail', authenticateUser, playerController.updateEmail);
router.post('/updateProfile', authenticateUser, playerController.updateProfile);
router.get('/tournamentsPlayed', authenticateUser, playerController.getTournamentsPlayed);
router.get('/tournamentsWon', authenticateUser, playerController.getTournamentsWon);
router.get('/ranking', authenticateUser, playerController.getPlayerRanking);
router.get('/searchOrganisers', authenticateUser, organiserController.getOrganiserByUsername);
router.post('/report-team', authenticateUser, reportController.reportTeam);
router.post('/report-organiser', authenticateUser, reportController.reportOrganiser);
router.get('/dashboard', authenticateUser, playerController.getDashboard);
router.get('/teamName', authenticateUser, teamController.getTeamsByName);
router.get('/followedOrg',authenticateUser,organiserController.getMyOrganisers);
router.get('/getUserName', authenticateUser, playerController.getUsername);
router.get('/homepage', authenticateUser, playerController.getHomePage);
router.post('/joinTeam', authenticateUser, teamController.joinTeam);
router.get('/winPercentage',authenticateUser,playerController.getWinPercentage);
module.exports = router;
// Routes
router.post(
    "/updateprofilepicture",
    authenticateUser, // Ensure user is authenticated
    upload.single("profilePhoto"), // Handle file upload via multer
    playerController.updateProfilePicture // Call controller to update the profile picture
  );
  
  router.get(
    "/profilepicture",
    authenticateUser, // Ensure user is authenticated
    playerController.getProfilePicture // Call controller to fetch the profile picture
  );

  module.exports = router;
