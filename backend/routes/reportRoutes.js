const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Route for reporting a team
router.post('/report-team', reportController.reportTeam);

module.exports = router;
