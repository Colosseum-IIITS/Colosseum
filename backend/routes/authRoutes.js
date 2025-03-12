    const express = require('express');
    const router = express.Router();
    const authController = require('../controllers/authController');
    const csrf = require('csurf');
    const csrfProtection = csrf({cookie:true});
    // Player routes
    router.post('/player/signin', authController.loginPlayer);
    router.post('/player/signup', authController.createPlayer);
    router.get('/csrfToken',csrfProtection,(req,res)=>{
      res.json({csrfToken: req.csrfToken()}) ;
    });

    // Organiser routes
    router.post('/organiser/signin', authController.loginOrganiser);
    router.post('/organiser/signup', authController.createOrganiser);
    

    // Admin routes
    router.post('/admin/signup', authController.createAdmin);
    router.post('/admin/signin', authController.loginAdmin);
    


    module.exports = router;
