const express = require('express');
const router = express.Router();
const b2bController = require('./controller');
const limiter = require("../../middleware/rateLimiting");

router.get('/stats', limiter, b2bController.getBusinessStats);
router.get('/average-revenue', limiter, b2bController.getAverageRevenuePerTournament);
router.get('/total-team-joins', limiter, b2bController.getTotalTeamJoins);
router.get('/tournament-growth', limiter, b2bController.getTournamentGrowthOverTime);

module.exports = router;
