const express = require('express');
const router = express.Router();
const organiserController = require('../controllers/organiserController');
const teamController = require('../controllers/teamControllers');

// Route to create a new organiser
router.post('/create', organiserController.createOrganiser);
router.get('/fetchTeams',teamController.fetchTeam);

module.exports = router;
