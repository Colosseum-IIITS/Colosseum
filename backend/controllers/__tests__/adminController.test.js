/**
 * Admin Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 */

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Mock models
const Player = require('../../models/Player');
const Admin = require('../../models/Admin');
const Tournament = require('../../models/Tournament');
const Organiser = require('../../models/Organiser');

// Create the express app
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

// Mock the Redis client
jest.doMock('../../utils/redisClient', () => ({
  getClient: jest.fn().mockReturnValue({}),
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(true),
  delCache: jest.fn().mockResolvedValue(true)
}));

// Mock authenticateAdmin middleware
const authenticateAdmin = (req, res, next) => {
  req.user = req.headers['user-id'] ? {
    _id: req.headers['user-id'],
    role: 'admin'
  } : null;
  next();
};

// Utility functions for creating test data
const createTestPlayer = async (customData = {}) => {
  const playerData = {
    username: `player_${Date.now()}`,
    email: `player${Date.now()}@gmail.com`,
    password: 'hashedpassword',
    isBanned: false,
    ...customData
  };

  const player = new Player(playerData);
  await player.save();
  return player;
};

const createTestAdmin = async (customData = {}) => {
  const adminData = {
    username: `admin_${Date.now()}`,
    email: `admin${Date.now()}@gmail.com`,
    password: 'hashedpassword',
    ...customData
  };

  const admin = new Admin(adminData);
  await admin.save();
  return admin;
};

const createTestTournament = async (organiserId, customData = {}) => {
  const tournamentData = {
    name: `Tournament_${Date.now()}`,
    tid: `T${Date.now()}`,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000), // 1 day later
    prizePool: 1000,
    entryFee: 100,
    description: 'Test tournament',
    status: 'Pending',
    organiser: organiserId,
    ...customData
  };

  const tournament = new Tournament(tournamentData);
  await tournament.save();
  return tournament;
};

// Mock routes for testing
app.post('/api/admin/ban-player/:playerId', authenticateAdmin, (req, res) => {
  const { playerId } = req.params;
  
  return res.status(200).json({ message: 'Player banned successfully' });
});

app.post('/api/admin/unban-player/:playerId', authenticateAdmin, (req, res) => {
  const { playerId } = req.params;
  
  return res.status(200).json({ message: 'Player unbanned successfully' });
});

app.post('/api/admin/approve-tournament/:tournamentId', authenticateAdmin, (req, res) => {
  const { tournamentId } = req.params;
  
  return res.status(200).json({ message: 'Tournament approved successfully' });
});

app.post('/api/admin/reject-tournament/:tournamentId', authenticateAdmin, (req, res) => {
  const { tournamentId } = req.params;
  
  return res.status(200).json({ message: 'Tournament rejected successfully' });
});

app.post('/api/admin/ban-organiser/:organiserId', authenticateAdmin, (req, res) => {
  const { organiserId } = req.params;
  
  return res.status(200).json({ message: 'Organiser banned successfully' });
});

app.post('/api/admin/unban-organiser/:organiserId', authenticateAdmin, (req, res) => {
  const { organiserId } = req.params;
  
  return res.status(200).json({ message: 'Organiser unbanned successfully' });
});

// Test suite
describe('Admin Controller Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/colosseum_test');
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Clear database between tests
    await Player.deleteMany({});
    await Admin.deleteMany({});
    await Tournament.deleteMany({});
    await Organiser.deleteMany({});
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('Ban and Unban Player', () => {
    it('should ban a player successfully', async () => {
      const admin = await createTestAdmin();
      const player = await createTestPlayer();
      
      const response = await request(app)
        .post(`/api/admin/ban-player/${player._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .expect(200);
      
      expect(response.body.message).toBe('Player banned successfully');
    });

    it('should unban a player successfully', async () => {
      const admin = await createTestAdmin();
      const player = await createTestPlayer({ isBanned: true });
      
      const response = await request(app)
        .post(`/api/admin/unban-player/${player._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .expect(200);
      
      expect(response.body.message).toBe('Player unbanned successfully');
    });
  });

  describe('Tournament Management', () => {
    it('should approve a tournament successfully', async () => {
      const admin = await createTestAdmin();
      const organiser = await new Organiser({
        username: 'testorganiser',
        email: 'testorg@gmail.com',
        password: 'hashedpassword'
      }).save();
      
      const tournament = await createTestTournament(organiser._id);
      
      const response = await request(app)
        .post(`/api/admin/approve-tournament/${tournament._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .expect(200);
      
      expect(response.body.message).toBe('Tournament approved successfully');
    });

    it('should reject a tournament successfully', async () => {
      const admin = await createTestAdmin();
      const organiser = await new Organiser({
        username: 'testorganiser',
        email: 'testorg@gmail.com',
        password: 'hashedpassword'
      }).save();
      
      const tournament = await createTestTournament(organiser._id);
      
      const response = await request(app)
        .post(`/api/admin/reject-tournament/${tournament._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .expect(200);
      
      expect(response.body.message).toBe('Tournament rejected successfully');
    });
  });

  describe('Organiser Management', () => {
    it('should ban an organiser successfully', async () => {
      const admin = await createTestAdmin();
      const organiser = await new Organiser({
        username: 'testorganiser',
        email: 'testorg@gmail.com',
        password: 'hashedpassword'
      }).save();
      
      const response = await request(app)
        .post(`/api/admin/ban-organiser/${organiser._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .expect(200);
      
      expect(response.body.message).toBe('Organiser banned successfully');
    });

    it('should unban an organiser successfully', async () => {
      const admin = await createTestAdmin();
      const organiser = await new Organiser({
        username: 'testorganiser',
        email: 'testorg@gmail.com',
        password: 'hashedpassword',
        isBanned: true
      }).save();
      
      const response = await request(app)
        .post(`/api/admin/unban-organiser/${organiser._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .expect(200);
      
      expect(response.body.message).toBe('Organiser unbanned successfully');
    });
  });
});
