const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournmentController');
const { authenticateOrganiser } = require('../middleware/authMiddleware');

// Route to create a new tournament
router.post('/create', authenticateOrganiser,tournamentController.createTournament);
router.get('/create',authenticateOrganiser,tournamentController.createTournamentForm);

// Route to update an existing tournament
router.post('/update/:tournamentId', tournamentController.updateTournament);

// Route to update the winner by the Organiser of the tournamne
router.put('/updateWinner', tournamentController.updateWinner);

module.exports = router;
    