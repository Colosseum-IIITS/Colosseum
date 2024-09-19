const express = require('express');
const { proposeTournament, getTournaments, updateTournamentStatus } = require('../controllers/tournamentController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');  // You can create role-based access middleware

const router = express.Router();

router.post('/propose', protect, restrictTo('TO'), proposeTournament);

router.get('/', protect, getTournaments);

router.put('/:tournamentId/status', protect, restrictTo('Admin'), updateTournamentStatus);

module.exports = router;
