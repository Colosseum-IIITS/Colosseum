const express = require('express');
const router = express.Router();
const b2cController = require('./controller');
const limiter = require("../../middleware/rateLimiting");

router.get('/stats', limiter, b2cController.getPublicStats);
router.get('/tournament-status', limiter, b2cController.getTournamentStatusBreakdown);
router.get('/top-rated-organisers', limiter, b2cController.getTopRatedOrganisersCount);
router.get('/average-players-per-team', limiter, b2cController.getAvgPlayersPerTeam);

module.exports = router;
