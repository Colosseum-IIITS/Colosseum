const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournmentController');

// Route to create a new tournament
router.post('/create', tournamentController.createTournament);

// Route to update an existing tournament
router.post('/update/:tournamentId', tournamentController.updateTournament);

module.exports = router;
