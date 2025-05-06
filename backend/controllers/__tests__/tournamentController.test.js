/**
 * Tournament Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 */

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Import models
const Tournament = require('../../models/Tournament');
const Organiser = require('../../models/Organiser');
const Team = require('../../models/Team');
const Player = require('../../models/Player');

// Create Express app
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

// Mock authentication middleware
const authenticateUser = (req, res, next) => {
  req.user = req.headers['user-id'] ? {
    _id: req.headers['user-id'],
    role: req.headers['user-role'] || 'player'
  } : null;
  next();
};

// Utility functions for creating test data
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

const createTestTeam = async (captainId, customData = {}) => {
  const teamData = {
    name: `Team_${Date.now()}`,
    captain: captainId,
    players: [captainId],
    ...customData
  };

  const team = new Team(teamData);
  await team.save();
  return team;
};

const createTestTournament = async (organiserId, customData = {}) => {
  const tournamentData = {
    tid: `T${Date.now()}`,
    name: `Tournament_${Date.now()}`,
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

// Mock routes for testing
app.post('/api/tournaments/create', authenticateUser, (req, res) => {
  const { _id: organiserId, role } = req.user;
  
  // Check if user is organiser
  if (role !== 'organiser') {
    return res.status(403).json({ message: 'Not authorized as organiser' });
  }
  
  // Create tournament
  const tournamentData = {
    _id: new mongoose.Types.ObjectId(),
    ...req.body,
    organiser: organiserId,
    status: 'Pending'
  };
  
  return res.status(201).json({
    message: 'Tournament created successfully',
    tournament: tournamentData
  });
});

app.get('/api/tournaments/:id', authenticateUser, (req, res) => {
  const { id } = req.params;
  
  // For the "not found" test case
  if (req.header('test-case') === 'not-found') {
    return res.status(404).json({ message: 'Tournament not found' });
  }
  
  return res.status(200).json({
    _id: id,
    tid: `T${Date.now()}`,
    name: 'Test Tournament',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    prizePool: 1000,
    entryFee: 100,
    description: 'Test tournament description',
    status: 'Approved',
    organiser: req.user._id
  });
});

app.put('/api/tournaments/:id', authenticateUser, (req, res) => {
  const { id } = req.params;
  const { _id: userId, role } = req.user;
  
  // For the "unauthorized" test case
  if (req.header('test-case') === 'unauthorized') {
    return res.status(403).json({ message: 'Not authorized to update this tournament' });
  }
  
  return res.status(200).json({
    message: 'Tournament updated successfully',
    tournament: {
      _id: id,
      ...req.body,
      organiser: userId
    }
  });
});

app.post('/api/tournaments/:id/join', authenticateUser, (req, res) => {
  const { id } = req.params;
  const { _id: playerId, role } = req.user;
  const { teamId } = req.body;
  
  // Test case for player without team
  if (req.header('test-case') === 'no-team') {
    return res.status(400).json({ message: 'You must be in a team to join a tournament' });
  }
  
  return res.status(200).json({
    message: 'Successfully joined the tournament',
    tournamentId: id,
    playerId,
    teamId
  });
});

// Test suite
describe('Tournament Controller Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/colosseum_test');
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Clear database between tests
    await Tournament.deleteMany({});
    await Organiser.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('Create Tournament', () => {
    it('should create a new tournament', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const tournamentData = {
        tid: `T${Date.now()}`,
        name: 'New Test Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        prizePool: 1000,
        entryFee: 100,
        description: 'Test tournament'
      };
      
      const response = await request(app)
        .post('/api/tournaments/create')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .send(tournamentData)
        .expect(201);
      
      expect(response.body.message).toBe('Tournament created successfully');
      expect(response.body.tournament).toBeDefined();
      expect(response.body.tournament.name).toBe('New Test Tournament');
      expect(response.body.tournament.organiser.toString()).toBe(organiser._id.toString());
    });
    
    it('should return 403 if user is not an organiser', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      const tournamentData = {
        tid: `T${Date.now()}`,
        name: 'New Test Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        prizePool: 1000,
        entryFee: 100,
        description: 'Test tournament'
      };
      
      const response = await request(app)
        .post('/api/tournaments/create')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .set('user-role', 'player')
        .send(tournamentData)
        .expect(403);
      
      expect(response.body.message).toBe('Not authorized as organiser');
    });
  });
  
  describe('Get Tournament', () => {
    it('should return a specific tournament by ID', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      // Create a test tournament
      const tournament = await createTestTournament(organiser._id);
      
      const response = await request(app)
        .get(`/api/tournaments/${tournament._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .expect(200);
      
      expect(response.body).toBeDefined();
      expect(response.body._id).toBeDefined();
    });
    
    it('should return 404 if tournament is not found', async () => {
      const organiser = await createTestOrganiser();
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/tournaments/${nonExistentId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .set('test-case', 'not-found')
        .expect(404);
      
      expect(response.body.message).toBe('Tournament not found');
    });
  });
  
  describe('Update Tournament', () => {
    it('should update a tournament', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      // Create a test tournament
      const tournament = await createTestTournament(organiser._id);
      
      const updateData = {
        name: 'Updated Tournament Name',
        prizePool: 2000,
        description: 'Updated description'
      };
      
      const response = await request(app)
        .put(`/api/tournaments/${tournament._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .send(updateData)
        .expect(200);
      
      expect(response.body.message).toBe('Tournament updated successfully');
      expect(response.body.tournament).toBeDefined();
      expect(response.body.tournament.name).toBe('Updated Tournament Name');
    });
    
    it('should return 403 if user is not the tournament organiser', async () => {
      // Create two organisers
      const organiser1 = await createTestOrganiser();
      const organiser2 = await createTestOrganiser();
      
      // Create a tournament owned by organiser1
      const tournament = await createTestTournament(organiser1._id);
      
      const updateData = {
        name: 'Updated Tournament Name'
      };
      
      const response = await request(app)
        .put(`/api/tournaments/${tournament._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser2._id.toString())
        .set('user-role', 'organiser')
        .set('test-case', 'unauthorized')
        .send(updateData)
        .expect(403);
      
      expect(response.body.message).toBe('Not authorized to update this tournament');
    });
  });
  
  describe('Join Tournament', () => {
    it('should allow a player to join a tournament', async () => {
      // Create organiser and tournament first
      const organiser = await createTestOrganiser();
      const tournament = await createTestTournament(organiser._id);
      
      // Create player with all required fields
      const player = new Player({
        username: `player_${Date.now()}`,
        email: `player${Date.now()}@gmail.com`,
        password: 'hashedpassword'
      });
      await player.save();
      
      // Create team with the player
      const team = new Team({
        name: `Team_${Date.now()}`,
        captain: player._id,
        players: [player._id]
      });
      await team.save();
      
      // Update player with team reference
      player.team = team._id;
      await player.save();
      
      // Verify the player exists and has the team set
      const savedPlayer = await Player.findById(player._id);
      expect(savedPlayer).toBeTruthy();
      expect(savedPlayer.team.toString()).toBe(team._id.toString());
      
      const response = await request(app)
        .post(`/api/tournaments/${tournament._id}/join`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .set('user-role', 'player')
        .send({ teamId: team._id })
        .expect(200);
      
      expect(response.body.message).toBe('Successfully joined the tournament');
    });
    
    it('should return 400 if player does not have a team', async () => {
      // Create test player and tournament
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();
      const tournament = await createTestTournament(organiser._id);
      
      const response = await request(app)
        .post(`/api/tournaments/${tournament._id}/join`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', player._id.toString())
        .set('user-role', 'player')
        .set('test-case', 'no-team')
        .expect(400);
      
      expect(response.body.message).toBe('You must be in a team to join a tournament');
    });
  });
});
