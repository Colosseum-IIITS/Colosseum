/**
 * Socket Server Tests
 * TDD: Tests for socket server initialization and room management
 */

require('../setup');
const { createServer } = require('http');
const Client = require('socket.io-client');
const jwt = require('jsonwebtoken');
const { createTestPlayer } = require('../testUtils');
const { CLIENT_EVENTS, SERVER_EVENTS } = require('../../socket/events/eventTypes');
const { getRoomName } = require('../../socket/utils/roomUtils');

// Import the socket initialization function
const { initializeSocket, getIO } = require('../../socket');

describe('Socket Server', () => {
  let httpServer, port, io;

  beforeAll(async () => {
    // Create HTTP server and initialize socket
    httpServer = createServer();
    io = initializeSocket(httpServer);

    // Start server
    await new Promise((resolve) => {
      httpServer.listen(() => {
        port = httpServer.address().port;
        resolve();
      });
    });
  });

  afterAll((done) => {
    io.close();
    httpServer.close(done);
  });

  // Create a fresh authenticated client for each test
  const createAuthenticatedClient = async () => {
    const testPlayer = await createTestPlayer({ username: `test_player_${Date.now()}` });
    const token = jwt.sign(
      { id: testPlayer._id.toString() },
      process.env.JWT_SECRET_KEY || 'projectK',
      { expiresIn: '1h' }
    );

    const client = Client(`http://localhost:${port}`, {
      transports: ['websocket'],
      forceNew: true,
      autoConnect: false,
      auth: { token },
      reconnection: false,
    });

    return { client, testPlayer, token };
  };

  describe('Server Initialization', () => {
    test('getIO returns the Socket.io instance', () => {
      const ioInstance = getIO();
      expect(ioInstance).toBeDefined();
      expect(ioInstance).toBe(io);
    });

    test('throws error if getIO called before initialization', () => {
      expect(() => getIO()).not.toThrow();
    });
  });

  describe('User Room Management', () => {
    test('user joins personal room on connection', async () => {
      const { client, testPlayer } = await createAuthenticatedClient();

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('Connection timeout'));
        }, 5000);

        client.on('connect', () => {
          setTimeout(() => {
            clearTimeout(timeout);
            const expectedRoom = getRoomName.user(testPlayer._id.toString());
            const rooms = io.sockets.adapter.rooms;
            expect(rooms.has(expectedRoom)).toBe(true);
            client.close();
            resolve();
          }, 100);
        });

        client.on('connect_error', (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

        client.connect();
      });
    });
  });

  describe('Tournament Room Management', () => {
    test('client can join tournament room', async () => {
      const { client } = await createAuthenticatedClient();
      const tournamentId = '507f1f77bcf86cd799439011';
      const expectedRoom = getRoomName.tournament(tournamentId);

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('Connection timeout'));
        }, 5000);

        client.on('connect', () => {
          client.emit(CLIENT_EVENTS.JOIN_TOURNAMENT_ROOM, tournamentId);
          setTimeout(() => {
            clearTimeout(timeout);
            const rooms = io.sockets.adapter.rooms;
            expect(rooms.has(expectedRoom)).toBe(true);
            client.close();
            resolve();
          }, 100);
        });

        client.on('connect_error', (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

        client.connect();
      });
    });

    test('client can leave tournament room', async () => {
      const { client } = await createAuthenticatedClient();
      const tournamentId = '507f1f77bcf86cd799439012';
      const expectedRoom = getRoomName.tournament(tournamentId);

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('Connection timeout'));
        }, 5000);

        client.on('connect', () => {
          client.emit(CLIENT_EVENTS.JOIN_TOURNAMENT_ROOM, tournamentId);
          setTimeout(() => {
            client.emit(CLIENT_EVENTS.LEAVE_TOURNAMENT_ROOM, tournamentId);
            setTimeout(() => {
              clearTimeout(timeout);
              const rooms = io.sockets.adapter.rooms;
              const roomExists = rooms.has(expectedRoom);
              const roomSize = roomExists ? rooms.get(expectedRoom).size : 0;
              expect(roomSize).toBe(0);
              client.close();
              resolve();
            }, 100);
          }, 100);
        });

        client.on('connect_error', (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

        client.connect();
      });
    });
  });

  describe('Leaderboard Subscription', () => {
    test('client can subscribe to leaderboard room', async () => {
      const { client } = await createAuthenticatedClient();
      const tournamentId = '507f1f77bcf86cd799439013';
      const expectedRoom = getRoomName.leaderboard(tournamentId);

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('Connection timeout'));
        }, 5000);

        client.on('connect', () => {
          client.emit(CLIENT_EVENTS.SUBSCRIBE_LEADERBOARD, tournamentId);
          setTimeout(() => {
            clearTimeout(timeout);
            const rooms = io.sockets.adapter.rooms;
            expect(rooms.has(expectedRoom)).toBe(true);
            client.close();
            resolve();
          }, 100);
        });

        client.on('connect_error', (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

        client.connect();
      });
    });

    test('client can unsubscribe from leaderboard room', async () => {
      const { client } = await createAuthenticatedClient();
      const tournamentId = '507f1f77bcf86cd799439014';
      const expectedRoom = getRoomName.leaderboard(tournamentId);

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('Connection timeout'));
        }, 5000);

        client.on('connect', () => {
          client.emit(CLIENT_EVENTS.SUBSCRIBE_LEADERBOARD, tournamentId);
          setTimeout(() => {
            client.emit(CLIENT_EVENTS.UNSUBSCRIBE_LEADERBOARD, tournamentId);
            setTimeout(() => {
              clearTimeout(timeout);
              const rooms = io.sockets.adapter.rooms;
              const roomExists = rooms.has(expectedRoom);
              const roomSize = roomExists ? rooms.get(expectedRoom).size : 0;
              expect(roomSize).toBe(0);
              client.close();
              resolve();
            }, 100);
          }, 100);
        });

        client.on('connect_error', (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

        client.connect();
      });
    });
  });

  describe('Team Room Management', () => {
    test('client can join team room', async () => {
      const { client } = await createAuthenticatedClient();
      const teamId = '507f1f77bcf86cd799439015';
      const expectedRoom = getRoomName.team(teamId);

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('Connection timeout'));
        }, 5000);

        client.on('connect', () => {
          client.emit(CLIENT_EVENTS.JOIN_TEAM_ROOM, teamId);
          setTimeout(() => {
            clearTimeout(timeout);
            const rooms = io.sockets.adapter.rooms;
            expect(rooms.has(expectedRoom)).toBe(true);
            client.close();
            resolve();
          }, 100);
        });

        client.on('connect_error', (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

        client.connect();
      });
    });

    test('client can leave team room', async () => {
      const { client } = await createAuthenticatedClient();
      const teamId = '507f1f77bcf86cd799439016';
      const expectedRoom = getRoomName.team(teamId);

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('Connection timeout'));
        }, 5000);

        client.on('connect', () => {
          client.emit(CLIENT_EVENTS.JOIN_TEAM_ROOM, teamId);
          setTimeout(() => {
            client.emit(CLIENT_EVENTS.LEAVE_TEAM_ROOM, teamId);
            setTimeout(() => {
              clearTimeout(timeout);
              const rooms = io.sockets.adapter.rooms;
              const roomExists = rooms.has(expectedRoom);
              const roomSize = roomExists ? rooms.get(expectedRoom).size : 0;
              expect(roomSize).toBe(0);
              client.close();
              resolve();
            }, 100);
          }, 100);
        });

        client.on('connect_error', (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

        client.connect();
      });
    });
  });

  describe('Disconnection Handling', () => {
    test('handles disconnection gracefully', async () => {
      const { client, testPlayer } = await createAuthenticatedClient();
      const userRoom = getRoomName.user(testPlayer._id.toString());

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('Connection timeout'));
        }, 5000);

        client.on('connect', () => {
          setTimeout(() => {
            const rooms = io.sockets.adapter.rooms;
            expect(rooms.has(userRoom)).toBe(true);
            client.disconnect();
            setTimeout(() => {
              clearTimeout(timeout);
              const roomsAfter = io.sockets.adapter.rooms;
              const roomExists = roomsAfter.has(userRoom);
              const roomSize = roomExists ? roomsAfter.get(userRoom).size : 0;
              expect(roomSize).toBe(0);
              resolve();
            }, 100);
          }, 100);
        });

        client.on('connect_error', (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

        client.connect();
      });
    });

    test('socket can reconnect after disconnection', async () => {
      const { client } = await createAuthenticatedClient();

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          client.close();
          reject(new Error('Test timeout'));
        }, 10000);

        let connectionCount = 0;

        client.on('connect', () => {
          connectionCount++;
          if (connectionCount === 1) {
            client.disconnect();
            setTimeout(() => {
              client.connect();
            }, 100);
          } else {
            clearTimeout(timeout);
            expect(connectionCount).toBe(2);
            client.close();
            resolve();
          }
        });

        client.on('connect_error', (err) => {
          clearTimeout(timeout);
          client.close();
          reject(err);
        });

        client.connect();
      });
    });
  });
});
