const jwt = require('jsonwebtoken');
const Player = require('../models/Player'); // Ensure Player model is imported

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.user_jwt || req.headers['authorization']?.split(' ')[1]; // Support Bearer token

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Decode the token synchronously
        console.log('Decoded JWT:', decoded);         

        // Fetch the player by _id attached to the token
        const player = await Player.findById(decoded.id); // Ensure `decoded.id` matches the structure of your JWT payload
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        req.user = player; // Attach the player object to req.user
        next(); // Call the next middleware
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid token' });
        }
        return res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = { authenticateToken };
