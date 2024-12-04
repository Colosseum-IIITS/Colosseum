const express = require('express');
const adminController = require('../controllers/adminController');
const organiserController = require('../controllers/organiserController');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/authMiddleware');


router.post('/ban/organiser/:id', adminController.banOrganiser);
router.post('/unban/organiser/:id', adminController.unBanOrganiser);
router.post('/delete/organiser/:id', adminController.deleteOrganiser);
router.get('/banhistory', adminController.getBanHistory);
router.post('/ban/player/:id', adminController.banPlayer);
router.post('/unban/player/:id', adminController.unBanPlayer);
router.post('/delete/player/:id', adminController.deletePlayer);

router.post('/approve/tournament/:id', adminController.approveTournament);
router.post('/delete/:tournamentId', authenticateAdmin,organiserController.deleteTournament);

router.get('/dashboard',adminController.getDashboard);

module.exports = router;
