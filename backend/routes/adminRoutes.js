const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const reportController = require("../controllers/reportController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Ban an organiser
router.put("/ban-organiser/:id", adminController.banOrganiser);

// Delete an organiser
router.delete("/delete-organiser/:id", adminController.deleteOrganiser);

// Ban a player
router.put("/ban-player/:id", adminController.banPlayer);

// Delete a player
router.delete("/delete-player/:id", adminController.deletePlayer);

// Approve a tournament
router.put("/approve-tournament/:id", adminController.approveTournament);

router.get(
  "/reported-organisers",
  authenticateToken,
  reportController.getReportedOrganisers
);

// Organiser routes to see reported teams
router.get(
  "/reported-teams",
  authenticateToken,
  reportController.getReportedTeams
);

module.exports = router;
