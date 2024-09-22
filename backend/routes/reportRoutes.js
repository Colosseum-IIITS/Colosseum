const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Route for reporting a team
router.post('/reportTeam', authenticateToken, reportController.reportTeam);

module.exports = router;
