/**
 * Socket.io Server Initialization
 * Sets up Socket.io with Redis adapter for horizontal scaling
 */

const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { socketAuthMiddleware } = require('./middleware/socketAuth');
const { CLIENT_EVENTS, SERVER_EVENTS } = require('./events/eventTypes');
const { getRoomName } = require('./utils/roomUtils');

let io = null;

/**
 * Initialize Socket.io server with Redis adapter
 * @param {HttpServer} httpServer - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
const initializeSocket = (httpServer) => {
  // Create Socket.io server
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Setup Redis adapter if Redis URL is available
  // (Skip Redis adapter in test environment or if not configured)
  if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
    try {
      const Redis = require('ioredis');
      const pubClient = new Redis(process.env.REDIS_URL);
      const subClient = pubClient.duplicate();

      io.adapter(createAdapter(pubClient, subClient));
      console.log('Socket.io Redis adapter initialized');
    } catch (error) {
      console.warn('Redis adapter initialization failed, using default adapter:', error.message);
    }
  }

  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  // Handle new connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.user.role})`);

    // Join user's personal room for direct messages/notifications
    const userRoom = getRoomName.user(socket.user.id);
    socket.join(userRoom);

    // If user has a team, join team room
    if (socket.user.teamId) {
      const teamRoom = getRoomName.team(socket.user.teamId);
      socket.join(teamRoom);
    }

    // Emit authenticated event
    socket.emit(SERVER_EVENTS.AUTHENTICATED, {
      userId: socket.user.id,
      username: socket.user.username,
      role: socket.user.role,
    });

    // Register room event handlers
    registerRoomHandlers(socket);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user.id}, reason: ${reason}`);
    });
  });

  console.log('Socket.io server initialized');
  return io;
};

/**
 * Register room management event handlers for a socket
 * @param {Socket} socket - Socket.io socket instance
 */
const registerRoomHandlers = (socket) => {
  // Tournament room handlers
  socket.on(CLIENT_EVENTS.JOIN_TOURNAMENT_ROOM, (tournamentId) => {
    if (!tournamentId) return;
    const roomName = getRoomName.tournament(tournamentId);
    socket.join(roomName);
    console.log(`${socket.user.username} joined tournament room: ${roomName}`);
  });

  socket.on(CLIENT_EVENTS.LEAVE_TOURNAMENT_ROOM, (tournamentId) => {
    if (!tournamentId) return;
    const roomName = getRoomName.tournament(tournamentId);
    socket.leave(roomName);
    console.log(`${socket.user.username} left tournament room: ${roomName}`);
  });

  // Leaderboard subscription handlers
  socket.on(CLIENT_EVENTS.SUBSCRIBE_LEADERBOARD, (tournamentId) => {
    if (!tournamentId) return;
    const roomName = getRoomName.leaderboard(tournamentId);
    socket.join(roomName);
    console.log(`${socket.user.username} subscribed to leaderboard: ${roomName}`);
  });

  socket.on(CLIENT_EVENTS.UNSUBSCRIBE_LEADERBOARD, (tournamentId) => {
    if (!tournamentId) return;
    const roomName = getRoomName.leaderboard(tournamentId);
    socket.leave(roomName);
    console.log(`${socket.user.username} unsubscribed from leaderboard: ${roomName}`);
  });

  // Team room handlers
  socket.on(CLIENT_EVENTS.JOIN_TEAM_ROOM, (teamId) => {
    if (!teamId) return;
    const roomName = getRoomName.team(teamId);
    socket.join(roomName);
    console.log(`${socket.user.username} joined team room: ${roomName}`);
  });

  socket.on(CLIENT_EVENTS.LEAVE_TEAM_ROOM, (teamId) => {
    if (!teamId) return;
    const roomName = getRoomName.team(teamId);
    socket.leave(roomName);
    console.log(`${socket.user.username} left team room: ${roomName}`);
  });

  // Organiser room handlers (for following)
  socket.on(CLIENT_EVENTS.JOIN_ORGANISER_ROOM, (organiserId) => {
    if (!organiserId) return;
    const roomName = getRoomName.organiser(organiserId);
    socket.join(roomName);
    console.log(`${socket.user.username} joined organiser room: ${roomName}`);
  });

  socket.on(CLIENT_EVENTS.LEAVE_ORGANISER_ROOM, (organiserId) => {
    if (!organiserId) return;
    const roomName = getRoomName.organiser(organiserId);
    socket.leave(roomName);
    console.log(`${socket.user.username} left organiser room: ${roomName}`);
  });
};

/**
 * Get the Socket.io server instance
 * @returns {Server} Socket.io server instance
 * @throws {Error} If socket server is not initialized
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
