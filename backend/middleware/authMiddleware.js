const jwt = require("jsonwebtoken");
const Player = require("../models/Player"); // Ensure Player model is imported
const Organiser = require("../models/Organiser");

const authenticateToken = async (req, res, next) => {
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
    const player = await Player.findById(decoded.id); // Ensure `decoded.id` is present in JWT payload
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Attach the player object to req.user
    req.user = player;
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
      return next(); // Proceed to the next middleware
    }

    // If organiser not found, attempt to find the player
    const player = await Player.findById(decoded.id);
    if (player) {
      req.user = player; // If found, assign to req.user
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
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { authenticateToken, authenticateOrganiser, authenticateUser };


