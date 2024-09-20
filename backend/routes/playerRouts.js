const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Route to search tournaments
router.get('/search-tournaments', playerController.searchTournaments);

// Route to join a tournament
router.post('/join-tournament', playerController.joinTournament);

// Route to follow an organizer
router.post('/follow-organiser', playerController.followOrganiser);

// Route to unfollow an organizer
router.post('/unfollow-organiser', playerController.unfollowOrganiser);


module.exports = router;
