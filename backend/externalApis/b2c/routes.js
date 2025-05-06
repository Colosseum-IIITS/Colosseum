const express = require('express');
const router = express.Router();
const b2cController = require('./controller');

router.get('/stats', b2cController.getPublicStats);
router.get('/tournament-status', b2cController.getTournamentStatusBreakdown);
router.get('/top-rated-organisers', b2cController.getTopRatedOrganisersCount);
router.get('/average-players-per-team', b2cController.getAvgPlayersPerTeam);

module.exports = router;
