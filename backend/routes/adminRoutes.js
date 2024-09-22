const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authToken } = require("../middleware/authMiddleware");

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

module.exports = router;
