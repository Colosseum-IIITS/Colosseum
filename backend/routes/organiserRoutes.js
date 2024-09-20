const express = require('express');
const router = express.Router();
const organiserController = require('../controllers/organiserController');

// Route to create a new organiser
router.post('/create', organiserController.createOrganiser);

module.exports = router;
