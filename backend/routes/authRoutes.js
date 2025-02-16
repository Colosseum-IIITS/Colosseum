    const express = require('express');
    const router = express.Router();
    const authController = require('../controllers/authController');

    // Player routes
    router.post('/player/signin', authController.loginPlayer);
    router.post('/player/signup', authController.createPlayer);

    // Organiser routes
    router.post('/organiser/signin', authController.loginOrganiser);
    router.post('/organiser/signup', authController.createOrganiser);

    // Admin routes
    router.post('/admin/signup', authController.createAdmin);
    router.post('/admin/signin', authController.loginAdmin);



    module.exports = router;
