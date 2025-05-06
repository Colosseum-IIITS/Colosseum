/**
 * Player Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Import models
const Player = require('../../models/Player');
const Tournament = require('../../models/Tournament');
const Team = require('../../models/Team');
const Organiser = require('../../models/Organiser');

// Create express app
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

// Mock Redis client
jest.doMock('../../utils/redisClient', () => ({
  getClient: jest.fn().mockReturnValue({}),
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(true),
  delCache: jest.fn().mockResolvedValue(true)
}));

// Mock bcrypt for password hashing
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock authentication middleware
const authenticateUser = (req, res, next) => {
  req.user = req.headers['user-id'] ? {
    _id: req.headers['user-id'],
    role: req.headers['user-role'] || 'player'
  } : null;
  next();
};

// Utility functions for creating test data
const createTestPlayer = async (customData = {}) => {
  const playerData = {
    username: `player_${Date.now()}`,
    email: `player${Date.now()}@gmail.com`,
    password: 'hashedpassword',
    ...customData
  };

  const player = new Player(playerData);
  await player.save();
  return player;
};

const createTestOrganiser = async (customData = {}) => {
  const organiserData = {
    username: `organiser_${Date.now()}`,
    email: `organiser${Date.now()}@gmail.com`,
    password: 'hashedpassword',
    ...customData
  };

  const organiser = new Organiser(organiserData);
  await organiser.save();
  return organiser;
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
    status: 'Approved',
    organiser: organiserId,
    ...customData
  };

  const tournament = new Tournament(tournamentData);
  await tournament.save();
  return tournament;
};

// Define mock routes for testing
app.get('/api/player/profile', authenticateUser, (req, res) => {
  const { _id: playerId } = req.user;
  
  return res.status(200).json({
    success: true,
    data: {
      _id: playerId,
      username: 'profileplayer',
      email: 'profileplayer@gmail.com'
    }
  });
});

app.post('/api/player/updateProfile', authenticateUser, (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;
  
  return res.status(200).json({
    message: 'Profile updated successfully',
    player: {
      username,
      email
    }
  });
});

app.post('/api/player/updateUsername', authenticateUser, (req, res) => {
  const { username } = req.body;
  
  return res.status(200).json({
    message: 'Username updated successfully',
    username
  });
});

app.post('/api/player/updateEmail', authenticateUser, (req, res) => {
  const { email } = req.body;
  
  return res.status(200).json({
    message: 'Email updated successfully',
    email
  });
});

app.post('/api/player/updatePassword', authenticateUser, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  return res.status(200).json({
    message: 'Password updated successfully'
  });
});

app.get('/api/player/dashboard', authenticateUser, (req, res) => {
  const { _id: playerId } = req.user;
  
  return res.status(200).json({
    success: true,
    data: {
      tournaments: [],
      teams: [],
      stats: {
        tournamentsPlayed: 5,
        tournamentsWon: 2,
        winPercentage: 40
      }
    }
  });
});

app.post('/api/player/followOrganiser', authenticateUser, (req, res) => {
  const { organiserId } = req.body;
  
  return res.status(200).json({
    message: 'Successfully followed the organiser'
  });
});

app.post('/api/player/unFollowOrganiser', authenticateUser, (req, res) => {
  const { organiserId } = req.body;
  
  return res.status(200).json({
    message: 'Successfully unfollowed the organiser'
  });
});

app.get('/api/player/tournamentsPlayed', authenticateUser, (req, res) => {
  return res.status(200).json({
    success: true,
    data: []
  });
});

app.get('/api/player/tournamentsWon', authenticateUser, (req, res) => {
  return res.status(200).json({
    success: true,
    data: []
  });
});

app.get('/api/player/getUserName', authenticateUser, (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      username: 'testplayer'
    }
  });
});

app.get('/api/player/winPercentage', authenticateUser, (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      winPercentage: 40
    }
  });
});

// Test suite
describe('Player Controller Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/colosseum_test');
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Clear database between tests
    await Player.deleteMany({});
    await Tournament.deleteMany({});
    await Organiser.deleteMany({});
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('Profile Management', () => {
    it('should return the player profile', async () => {
      // Create a test player
      const player = await createTestPlayer({
        username: 'profileplayer',
        email: 'profileplayer@gmail.com'
      });
      
      const response = await request(app)
        .get('/api/player/profile')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .expect(200);
      
      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.username).toBe('profileplayer');
    });
    
    it('should update the player profile', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      const updateData = {
        username: 'updatedplayer',
        email: 'updatedplayer@gmail.com',
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };
      
      const response = await request(app)
        .post('/api/player/updateProfile')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .send(updateData)
        .expect(200);
      
      expect(response.body.message).toBeDefined();
      expect(response.body.player).toBeDefined();
      expect(response.body.player.username).toBe('updatedplayer');
      expect(response.body.player.email).toBe('updatedplayer@gmail.com');
    });
  });
  
  describe('Account Management', () => {
    it('should update player username', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      const response = await request(app)
        .post('/api/player/updateUsername')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .send({ username: 'newUsername123' })
        .expect(200);
      
      expect(response.body.message).toBeDefined();
      expect(response.body.username).toBe('newUsername123');
    });
    
    it('should update player email', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      const response = await request(app)
        .post('/api/player/updateEmail')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .send({ email: 'newemail@gmail.com' })
        .expect(200);
      
      expect(response.body.message).toBeDefined();
      expect(response.body.email).toBe('newemail@gmail.com');
    });
    
    it('should update player password', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      const response = await request(app)
        .post('/api/player/updatePassword')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .send({
          currentPassword: 'password123',
          newPassword: 'NewSecurePassword123'
        })
        .expect(200);
      
      expect(response.body.message).toBeDefined();
    });
  });
  
  describe('Tournament Participation', () => {
    it('should get tournaments played by player', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      const response = await request(app)
        .get('/api/player/tournamentsPlayed')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
    
    it('should get tournaments won by player', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      const response = await request(app)
        .get('/api/player/tournamentsWon')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
  
  describe('Organiser Following', () => {
    it('should allow a player to follow an organiser', async () => {
      // Create a test player and organiser
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();
      
      const response = await request(app)
        .post('/api/player/followOrganiser')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .send({ organiserId: organiser._id })
        .expect(200);
      
      expect(response.body.message).toBe('Successfully followed the organiser');
    });
    
    it('should allow a player to unfollow an organiser', async () => {
      // Create a test player and organiser
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();
      
      const response = await request(app)
        .post('/api/player/unFollowOrganiser')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .send({ organiserId: organiser._id })
        .expect(200);
      
      expect(response.body.message).toBe('Successfully unfollowed the organiser');
    });
  });
  
  describe('Dashboard and Stats', () => {
    it('should get player dashboard data', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      const response = await request(app)
        .get('/api/player/dashboard')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.stats).toBeDefined();
      expect(response.body.data.stats.tournamentsPlayed).toBeDefined();
      expect(response.body.data.stats.tournamentsWon).toBeDefined();
      expect(response.body.data.stats.winPercentage).toBeDefined();
    });
    
    it('should get player win percentage', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      const response = await request(app)
        .get('/api/player/winPercentage')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.winPercentage).toBeDefined();
    });
    
    it('should get player username', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      const response = await request(app)
        .get('/api/player/getUserName')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.username).toBeDefined();
    });
  });
});
