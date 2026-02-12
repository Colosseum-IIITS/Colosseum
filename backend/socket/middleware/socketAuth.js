/**
 * Socket Authentication Middleware
 * Verifies JWT tokens for socket connections and attaches user to socket
 */

const jwt = require('jsonwebtoken');
const Player = require('../../models/Player');
const Organiser = require('../../models/Organiser');
const Admin = require('../../models/Admin');

/**
 * Socket.io authentication middleware
 * Extracts JWT from auth object or query params, verifies it,
 * and attaches user info to the socket
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    // Extract token from handshake auth or query
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'projectK');
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return next(new Error('Authentication error: Token expired'));
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return next(new Error('Authentication error: Invalid token'));
      }
      return next(new Error('Authentication error: Token verification failed'));
    }

    // Find user - check all user types (similar to authenticateUser middleware)
    let user = null;
    let role = null;

    // Try to find as organiser first
    user = await Organiser.findById(decoded.id);
    if (user) {
      role = 'organiser';
    }

    // If not organiser, try player
    if (!user) {
      user = await Player.findById(decoded.id);
      if (user) {
        role = 'player';
      }
    }

    // If not player, try admin
    if (!user) {
      user = await Admin.findById(decoded.id);
      if (user) {
        role = 'admin';
      }
    }

    // User not found in any collection
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }

    // Check if user is banned (for players and organisers)
    if ((role === 'player' || role === 'organiser') && user.banned) {
      return next(new Error('Authentication error: User is banned'));
    }

    // Attach user info to socket
    socket.user = {
      id: user._id.toString(),
      username: user.username,
      role: role,
      teamId: role === 'player' && user.team ? user.team.toString() : null,
    };

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    return next(new Error('Authentication error: ' + error.message));
  }
};

module.exports = { socketAuthMiddleware };
