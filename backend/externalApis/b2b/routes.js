const express = require('express');
const router = express.Router();
const b2bController = require('./controller');

router.get('/stats', b2bController.getBusinessStats);
router.get('/average-revenue', b2bController.getAverageRevenuePerTournament);
router.get('/total-team-joins', b2bController.getTotalTeamJoins);
router.get('/tournament-growth', b2bController.getTournamentGrowthOverTime);

module.exports = router;
