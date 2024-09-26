const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournmentController');
const { authenticateOrganiser  ,authenticateToken, authenticateUser } = require('../middleware/authMiddleware');

// Route to create a new tournament
router.post('/create', authenticateOrganiser,tournamentController.createTournament);
router.get('/create',authenticateOrganiser,tournamentController.createTournamentForm);
router.get('/:tournamentId', authenticateUser, tournamentController.getTournamentById);

router.get('/edit/:tournamentId', authenticateOrganiser, tournamentController.getTournamentEditPage );
router.post('/join/:tournamentId',authenticateToken,tournamentController.joinTournament);
router.post('/leave/:tournamentId',authenticateToken,tournamentController.leaveTournament);
// Route to update an existing tournament
router.post('/update/:tournamentId', tournamentController.updateTournament);

// Route to update the winner by the Organiser of the tournamne
router.put('/updateWinner', tournamentController.updateWinner);


router.post('/updateTable', authenticateOrganiser, tournamentController.updatePointsTable);
router.get('/pointsTable/:tournamentId', authenticateToken, tournamentController.getPointsTable);
router.post('/edit/:tournamentId', tournamentController.editTournament);

module.exports = router;
    
