/**
 * Socket Authentication Middleware Tests
 * TDD: Write tests first, then implement
 */

require('../setup');
const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const jwt = require('jsonwebtoken');
const { createTestPlayer, createTestOrganiser, createTestAdmin } = require('../testUtils');

// Import the middleware we're testing (will be created after tests)
const { socketAuthMiddleware } = require('../../socket/middleware/socketAuth');

describe('Socket Authentication Middleware', () => {
  let io, httpServer, port;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer, {
      cors: { origin: '*' },
    });

    // Apply the auth middleware
    io.use(socketAuthMiddleware);

    // Simple connection handler for testing
    io.on('connection', (socket) => {
      socket.emit('authenticated', {
        userId: socket.user.id,
        username: socket.user.username,
        role: socket.user.role,
      });
    });

    httpServer.listen(() => {
      port = httpServer.address().port;
      done();
    });
  });

  afterAll((done) => {
    io.close();
    httpServer.close(done);
  });

  const createClient = (options = {}) => {
    return Client(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true,
      autoConnect: false,
      ...options,
    });
  };

  describe('Connection Rejection', () => {
    test('rejects connection without token', (done) => {
      const client = createClient();

      client.on('connect_error', (error) => {
        expect(error.message).toContain('No token provided');
        client.close();
        done();
      });

      client.connect();
    });

    test('rejects connection with invalid token', (done) => {
      const client = createClient({
        auth: { token: 'invalid_token_here' },
      });

      client.on('connect_error', (error) => {
        expect(error.message).toContain('Invalid token');
        client.close();
        done();
      });

      client.connect();
    });

    test('rejects connection with expired token', (done) => {
      // Create an expired token
      const expiredToken = jwt.sign(
        { id: 'test_id' },
        process.env.JWT_SECRET_KEY || 'projectK',
        { expiresIn: '-1s' }
      );

      const client = createClient({
        auth: { token: expiredToken },
      });

      client.on('connect_error', (error) => {
        expect(error.message).toContain('Token expired');
        client.close();
        done();
      });

      client.connect();
    });

    test('rejects connection when user not found in database', (done) => {
      // Create token with non-existent user ID
      const token = jwt.sign(
        { id: '507f1f77bcf86cd799439011' }, // Valid ObjectId but doesn't exist
        process.env.JWT_SECRET_KEY || 'projectK',
        { expiresIn: '1h' }
      );

      const client = createClient({
        auth: { token },
      });

      client.on('connect_error', (error) => {
        expect(error.message).toContain('User not found');
        client.close();
        done();
      });

      client.connect();
    });
  });

  describe('Connection Acceptance', () => {
    test('accepts connection with valid player token', async () => {
      const player = await createTestPlayer({ username: 'socket_test_player' });
      const token = jwt.sign(
        { id: player._id.toString() },
        process.env.JWT_SECRET_KEY || 'projectK',
        { expiresIn: '1h' }
      );

      const client = createClient({
        auth: { token },
      });

      await new Promise((resolve, reject) => {
        client.on('authenticated', (data) => {
          expect(data.userId).toBe(player._id.toString());
          expect(data.username).toBe('socket_test_player');
          expect(data.role).toBe('player');
          client.close();
          resolve();
        });

        client.on('connect_error', (error) => {
          client.close();
          reject(error);
        });

        client.connect();
      });
    });

    test('accepts connection with valid organiser token', async () => {
      const organiser = await createTestOrganiser({ username: 'socket_test_organiser' });
      const token = jwt.sign(
        { id: organiser._id.toString() },
        process.env.JWT_SECRET_KEY || 'projectK',
        { expiresIn: '1h' }
      );

      const client = createClient({
        auth: { token },
      });

      await new Promise((resolve, reject) => {
        client.on('authenticated', (data) => {
          expect(data.userId).toBe(organiser._id.toString());
          expect(data.username).toBe('socket_test_organiser');
          expect(data.role).toBe('organiser');
          client.close();
          resolve();
        });

        client.on('connect_error', (error) => {
          client.close();
          reject(error);
        });

        client.connect();
      });
    });

    test('accepts connection with valid admin token', async () => {
      const admin = await createTestAdmin({ username: 'socket_test_admin' });
      const token = jwt.sign(
        { id: admin._id.toString() },
        process.env.JWT_SECRET_KEY || 'projectK',
        { expiresIn: '1h' }
      );

      const client = createClient({
        auth: { token },
      });

      await new Promise((resolve, reject) => {
        client.on('authenticated', (data) => {
          expect(data.userId).toBe(admin._id.toString());
          expect(data.username).toBe('socket_test_admin');
          expect(data.role).toBe('admin');
          client.close();
          resolve();
        });

        client.on('connect_error', (error) => {
          client.close();
          reject(error);
        });

        client.connect();
      });
    });

    test('accepts token from query parameter', async () => {
      const player = await createTestPlayer({ username: 'socket_query_player' });
      const token = jwt.sign(
        { id: player._id.toString() },
        process.env.JWT_SECRET_KEY || 'projectK',
        { expiresIn: '1h' }
      );

      const client = createClient({
        query: { token },
      });

      await new Promise((resolve, reject) => {
        client.on('authenticated', (data) => {
          expect(data.userId).toBe(player._id.toString());
          client.close();
          resolve();
        });

        client.on('connect_error', (error) => {
          client.close();
          reject(error);
        });

        client.connect();
      });
    });
  });

  describe('Socket User Object', () => {
    test('attaches user object with correct properties for player', async () => {
      const player = await createTestPlayer({
        username: 'props_test_player',
        team: null
      });
      const token = jwt.sign(
        { id: player._id.toString() },
        process.env.JWT_SECRET_KEY || 'projectK',
        { expiresIn: '1h' }
      );

      const client = createClient({
        auth: { token },
      });

      await new Promise((resolve, reject) => {
        // We need to verify the socket.user object on the server
        // The authenticated event already sends the user data
        client.on('authenticated', (data) => {
          expect(data).toHaveProperty('userId');
          expect(data).toHaveProperty('username');
          expect(data).toHaveProperty('role');
          expect(typeof data.userId).toBe('string');
          expect(typeof data.username).toBe('string');
          expect(['player', 'organiser', 'admin']).toContain(data.role);
          client.close();
          resolve();
        });

        client.on('connect_error', (error) => {
          client.close();
          reject(error);
        });

        client.connect();
      });
    });
  });
});
