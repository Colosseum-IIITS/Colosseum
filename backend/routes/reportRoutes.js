const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateUser, authenticateOrganiser } = require('../middleware/authMiddleware');

// Route for reporting a team
router.post('/PreportT2O', authenticateUser, reportController.reportTeam);
router.post('/OreportO2A',authenticateOrganiser,reportController.reportOrganiser);
router.get('/getTeamReports',authenticateOrganiser,reportController.getReportedTeams);
router.post('/PreportO2A',authenticateUser, reportController.reportOrganiser);


router.get('/getOrganiserReports', authenticateUser,reportController.getReportedOrganisers);

module.exports = router;
