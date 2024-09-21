const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

// Route to search tournaments
router.get('/search-tournaments', playerController.searchTournaments);

// Route to follow an organizer
router.post('/follow-organiser', playerController.followOrganiser);

// Route to unfollow an organizer
router.post('/unfollow-organiser', playerController.unfollowOrganiser);

// Route to create a new player
router.post('/create', playerController.createPlayer);


// Route to join a tournment  
router.post('/join-tournament', playerController.joinTournament);

module.exports = router;
