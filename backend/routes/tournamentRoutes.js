const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournmentController');
const { authenticateOrganiser, authenticateUser } = require('../middleware/authMiddleware');

// Route to create a new tournament
router.post('/create', authenticateOrganiser,tournamentController.createTournament);
router.get('/create',authenticateOrganiser,tournamentController.createTournamentForm);
router.get('/tournamentsEnrolled',authenticateUser, tournamentController.getEnrolledTournaments);
router.get('/notifications', authenticateUser, tournamentController.getNotifications);
router.get('/:tournamentId', authenticateUser, tournamentController.getTournamentById);

router.get('/edit/:tournamentId', authenticateOrganiser, tournamentController.getTournamentEditPage );
router.post('/join/:tournamentId',authenticateUser,tournamentController.joinTournament);
router.post('/leave/:tournamentId',authenticateUser,tournamentController.leaveTournament);
// Route to update an existing tournament
router.post('/update/:tournamentId', tournamentController.updateTournament);
router.post('/updatePointsTable',tournamentController.updateTournament);

// Route to update the winner by the Organiser of the tournamne
router.put('/updateWinner', tournamentController.updateWinner);

router.post('/updateTable', authenticateOrganiser, tournamentController.updatePointsTable);
router.get('/pointsTable/:tournamentId', authenticateUser, tournamentController.getPointsTable);
router.post('/edit/:tournamentId', tournamentController.editTournament);

module.exports = router;
    
