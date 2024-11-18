const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const Player = require("../models/Player"); // Ensure Player model is imported
const Organiser = require("../models/Organiser");
const Admin = require("../models/Admin");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const authenticateOrganiser = async (req, res, next) => {
  const token =
    req.cookies.user_jwt ||
    (req.headers["authorization"] &&
      req.headers["authorization"].split(" ")[1]); // Extract from cookies or Bearer token

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the JWT and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Decode the token
    console.log("Decoded JWT:", decoded);

    // Fetch the player by the decoded id
    const organiser = await Organiser.findById(decoded.id); // Ensure `decoded.id` is present in JWT payload
    if (!organiser) {
      return res.status(404).json({ message: "Organiser not found" });
    }

    // Attach the Organsier object to req.user
    req.user = organiser;
    next(); // Proceed to the next middleware
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const authenticateUser = async (req, res, next) => {
  const token =
    req.cookies.user_jwt ||
    (req.headers["authorization"] &&
      req.headers["authorization"].split(" ")[1]); // Extract from cookies or Bearer token

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the JWT and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Decode the token
    console.log("Decoded JWT:", decoded);

    // Attempt to find the organiser
    const organiser = await Organiser.findById(decoded.id);
    if (organiser) {
      req.user = organiser; // If found, assign to req.user
      req.user.role = "organiser";
      return next(); // Proceed to the next middleware
    }

    // If organiser not found, attempt to find the player
    const player = await Player.findById(decoded.id);
    if (player) {
      req.user = player; // If found, assign to req.user
      req.user.role = "player";
      return next(); // Proceed to the next middleware
    }

    // If neither organiser nor player is found
    return res.status(404).json({ message: "User Not Found" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const authenticateAdmin = async (req, res, next) => {
  const token =
    req.cookies.admin_jwt ||
    (req.headers["authorization"] &&
      req.headers["authorization"].split(" ")[1]); // Extract from cookies or Bearer token

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the JWT and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Decode the token
    console.log("Decoded Admin JWT:", decoded);

    // Fetch the admin by the decoded id
    const admin = await Admin.findById(decoded.id); // Ensure `decoded.id` is present in JWT payload
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Attach the admin object to req.user
    req.user = admin;
    next(); // Proceed to the next middleware
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  authenticateOrganiser,
  authenticateUser,
  authenticateAdmin,
};
