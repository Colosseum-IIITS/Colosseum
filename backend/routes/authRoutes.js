const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Player routes
router.post('/player/signin', authController.loginPlayer); // Make sure this is defined
router.post('/player/signup', authController.createPlayer);

// Organizer routes
router.post('/org/signin', authController.loginOrganiser);
router.post('/org/signup', authController.createOrganiser);

// Admin routes
router.post('/admin/login', authController.loginAdmin);

module.exports = router;
