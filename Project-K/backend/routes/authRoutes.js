const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);  // Register route
router.post('/login', loginUser);        // Login route

module.exports = router;
