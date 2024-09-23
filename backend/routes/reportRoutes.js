const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authenticateOrganiser } = require('../middleware/authMiddleware');

// Route for reporting a team
router.post('/PreportT2O', authenticateToken, reportController.reportTeam);
router.post('/PreportO2A',authenticateToken, reportController.reportOrganiser);
router.post('/OreportO2A',authenticateOrganiser,reportController.reportOrganiser);
router.get('/getTeamReports',authenticateOrganiser,reportController.getReportedTeams);
router.get('/getOrganiserReports', authenticateToken,reportController.getReportedOrganisers);

module.exports = router;
