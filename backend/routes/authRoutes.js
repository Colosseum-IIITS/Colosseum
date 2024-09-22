const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post('/player/signup', authController.createPlayer); // w
router.post('/player/signin', authController.loginPlayer); // w

router.post("/org/signup", authController.createOrganiser);
router.post("/org/signin", authController.loginOrganiser);

module.exports = router;
