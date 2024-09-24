// routes/adminRoutes.js

const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.get('/dashboard', adminController.getDashboard);

router.post('/ban/organiser/:id', adminController.banOrganiser);
router.post('/unban/organiser/:id', adminController.unBanOrganiser);
router.post('/delete/organiser/:id', adminController.deleteOrganiser);

router.post('/ban/player/:id', adminController.banPlayer);
router.post('/unban/player/:id', adminController.unBanPlayer);
router.post('/delete/player/:id', adminController.deletePlayer);

module.exports = router;
