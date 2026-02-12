/**
 * Socket.io Test Helpers
 * Provides mock factories and utilities for testing socket functionality
 */

const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');

/**
 * Creates a mock Socket.io server for testing
 * @returns {Object} { io, httpServer, cleanup }
 */
const createTestServer = () => {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  return {
    io,
    httpServer,
    cleanup: async () => {
      io.close();
      httpServer.close();
    },
  };
};

/**
 * Creates a test client that connects to the server
 * @param {number} port - The port to connect to
 * @param {Object} options - Socket.io client options
 * @returns {Socket} Socket.io client instance
 */
const createTestClient = (port, options = {}) => {
  return Client(`http://localhost:${port}`, {
    transports: ['websocket'],
    forceNew: true,
    ...options,
  });
};

/**
 * Waits for a socket to connect
 * @param {Socket} socket - Socket.io client instance
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<void>}
 */
const waitForConnect = (socket, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (socket.connected) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error('Socket connection timeout'));
    }, timeout);

    socket.once('connect', () => {
      clearTimeout(timer);
      resolve();
    });

    socket.once('connect_error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
};

/**
 * Waits for a socket event
 * @param {Socket} socket - Socket.io client or server socket
 * @param {string} event - Event name to wait for
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<any>} Event data
 */
const waitForEvent = (socket, event, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${event}`));
    }, timeout);

    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
};

/**
 * Creates a mock IO object for unit testing emit functions
 * @returns {Object} Mock IO with spies
 */
const createMockIO = () => {
  const emitSpy = jest.fn();
  const toSpy = jest.fn(() => ({
    emit: emitSpy,
  }));

  return {
    to: toSpy,
    emit: emitSpy,
    // Helper to reset mocks
    reset: () => {
      toSpy.mockClear();
      emitSpy.mockClear();
    },
    // Helper to get emit calls for a specific room
    getEmitCalls: (room) => {
      const toCalls = toSpy.mock.calls.filter((call) => call[0] === room);
      return toCalls.map(() => emitSpy.mock.calls).flat();
    },
  };
};

/**
 * Creates a mock socket for unit testing handlers
 * @param {Object} userData - User data to attach to socket
 * @returns {Object} Mock socket with spies
 */
const createMockSocket = (userData = {}) => {
  const joinedRooms = new Set();

  return {
    id: `socket_${Date.now()}`,
    user: {
      id: 'test_user_id',
      username: 'test_user',
      role: 'player',
      teamId: null,
      ...userData,
    },
    handshake: {
      auth: {},
      query: {},
    },
    join: jest.fn((room) => joinedRooms.add(room)),
    leave: jest.fn((room) => joinedRooms.delete(room)),
    emit: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
    // Helper to check if in room
    isInRoom: (room) => joinedRooms.has(room),
    // Helper to get joined rooms
    getJoinedRooms: () => Array.from(joinedRooms),
  };
};

/**
 * Starts the HTTP server and returns the port
 * @param {HttpServer} httpServer
 * @returns {Promise<number>} Port number
 */
const startServer = (httpServer) => {
  return new Promise((resolve) => {
    httpServer.listen(() => {
      const { port } = httpServer.address();
      resolve(port);
    });
  });
};

/**
 * Closes a socket client gracefully
 * @param {Socket} socket
 */
const closeClient = (socket) => {
  return new Promise((resolve) => {
    if (socket.connected) {
      socket.once('disconnect', resolve);
      socket.disconnect();
    } else {
      resolve();
    }
  });
};

module.exports = {
  createTestServer,
  createTestClient,
  waitForConnect,
  waitForEvent,
  createMockIO,
  createMockSocket,
  startServer,
  closeClient,
};
