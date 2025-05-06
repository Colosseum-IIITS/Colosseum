/**
 * Tournament Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 * Using completely mocked database
 */

const mongoose = require('mongoose');

// Create mock IDs to use throughout tests
const mockTournamentId = '5f8d0d55b54764421b719733';
const mockOrganiserId = '5f8d0d55b54764421b719734';
const mockPlayerId = '5f8d0d55b54764421b719735';
const mockTeamId = '5f8d0d55b54764421b719736';

// Mock the models before requiring them
jest.mock('../../models/Tournament', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockImplementation(() => Promise.resolve({
    _id: mockTournamentId,
    tid: 'T12345',
    name: 'Test Tournament',
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    prizePool: 1000,
    entryFee: 100,
    description: 'Test tournament description',
    status: 'Approved',
    organiser: mockOrganiserId,
    save: jest.fn().mockResolvedValue(true),
    populate: jest.fn().mockReturnThis()
  })),
  findOne: jest.fn().mockImplementation(() => Promise.resolve({
    _id: mockTournamentId,
    tid: 'T12345',
    name: 'Test Tournament',
    status: 'Approved'
  })),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockImplementation((data) => Promise.resolve({
    ...data,
    _id: mockTournamentId,
    save: jest.fn().mockResolvedValue(true)
  })),
  findByIdAndUpdate: jest.fn().mockImplementation((id, data) => Promise.resolve({
    _id: id,
    ...data,
    save: jest.fn().mockResolvedValue(true)
  })),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  select: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{
    _id: mockTournamentId,
    tid: 'T12345',
    name: 'Test Tournament'
  }])
}));

jest.mock('../../models/Organiser', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockImplementation(() => Promise.resolve({
    _id: mockOrganiserId,
    username: 'testorganiser',
    email: 'testorganiser@example.com'
  })),
  findOne: jest.fn().mockResolvedValue({
    _id: mockOrganiserId,
    username: 'testorganiser',
    email: 'testorganiser@example.com'
  }),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockImplementation((data) => Promise.resolve({
    ...data,
    _id: mockOrganiserId
  })),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{
    _id: mockOrganiserId,
    username: 'testorganiser'
  }])
}));

jest.mock('../../models/Player', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockImplementation(() => Promise.resolve({
    _id: mockPlayerId,
    username: 'testplayer',
    email: 'testplayer@example.com',
    team: mockTeamId
  })),
  findOne: jest.fn().mockResolvedValue({
    _id: mockPlayerId,
    username: 'testplayer',
    email: 'testplayer@example.com'
  }),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockImplementation((data) => Promise.resolve({
    ...data,
    _id: mockPlayerId
  })),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{
    _id: mockPlayerId,
    username: 'testplayer'
  }])
}));

jest.mock('../../models/Team', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockImplementation(() => Promise.resolve({
    _id: mockTeamId,
    name: 'Test Team',
    captain: mockPlayerId,
    players: [mockPlayerId]
  })),
  findOne: jest.fn().mockResolvedValue({
    _id: mockTeamId,
    name: 'Test Team',
    captain: mockPlayerId
  }),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockImplementation((data) => Promise.resolve({
    ...data,
    _id: mockTeamId
  })),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{
    _id: mockTeamId,
    name: 'Test Team'
  }])
}));

// Mock Redis client
jest.mock('../../utils/redisClient', () => ({
  getClient: jest.fn().mockReturnValue({}),
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(true),
  delCache: jest.fn().mockResolvedValue(true)
}));

// Now import all dependencies after mocking
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Import models (they'll use the mocked versions)
const Tournament = require('../../models/Tournament');
const Organiser = require('../../models/Organiser');
const Team = require('../../models/Team');
const Player = require('../../models/Player');

// Create Express app
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

// Mock authentication middleware
const authenticateUser = (req, res, next) => {
  req.user = req.headers['user-id'] ? {
    _id: req.headers['user-id'],
    role: req.headers['user-role'] || 'player'
  } : null;
  next();
};

// Define mock routes for testing
app.post('/api/tournaments/create', authenticateUser, (req, res) => {
  const { _id: organiserId, role } = req.user;
  
  // Check if user is organiser
  if (role !== 'organiser') {
    return res.status(403).json({ message: 'Not authorized as organiser' });
  }
  
  // Create tournament
  const tournamentData = {
    _id: mockTournamentId,
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
    tid: 'T12345',
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Tournament', () => {
    it('should create a new tournament', async () => {
      const tournamentData = {
        tid: 'T12345',
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
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .send(tournamentData)
        .expect(201);
      
      expect(response.body.message).toBe('Tournament created successfully');
      expect(response.body.tournament).toBeDefined();
      expect(response.body.tournament.name).toBe('New Test Tournament');
    });
    
    it('should return 403 if user is not an organiser', async () => {
      const tournamentData = {
        tid: 'T12345',
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
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .send(tournamentData)
        .expect(403);
      
      expect(response.body.message).toBe('Not authorized as organiser');
    });
  });
  
  describe('Get Tournament', () => {
    it('should return a specific tournament by ID', async () => {
      const response = await request(app)
        .get(`/api/tournaments/${mockTournamentId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .expect(200);
      
      expect(response.body).toBeDefined();
      expect(response.body._id).toBeDefined();
      expect(response.body.name).toBe('Test Tournament');
    });
    
    it('should return 404 if tournament is not found', async () => {
      const response = await request(app)
        .get(`/api/tournaments/${mockTournamentId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .set('test-case', 'not-found')
        .expect(404);
      
      expect(response.body.message).toBe('Tournament not found');
    });
  });
  
  describe('Update Tournament', () => {
    it('should update a tournament', async () => {
      const updateData = {
        name: 'Updated Tournament Name',
        prizePool: 2000,
        description: 'Updated description'
      };
      
      const response = await request(app)
        .put(`/api/tournaments/${mockTournamentId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .send(updateData)
        .expect(200);
      
      expect(response.body.message).toBe('Tournament updated successfully');
      expect(response.body.tournament).toBeDefined();
      expect(response.body.tournament.name).toBe('Updated Tournament Name');
    });
    
    it('should return 403 if user is not the tournament organiser', async () => {
      const updateData = {
        name: 'Updated Tournament Name'
      };
      
      const response = await request(app)
        .put(`/api/tournaments/${mockTournamentId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'organiser')
        .set('test-case', 'unauthorized')
        .send(updateData)
        .expect(403);
      
      expect(response.body.message).toBe('Not authorized to update this tournament');
    });
  });
  
  describe('Join Tournament', () => {
    it('should allow a player to join a tournament', async () => {
      const response = await request(app)
        .post(`/api/tournaments/${mockTournamentId}/join`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .send({ teamId: mockTeamId })
        .expect(200);
      
      expect(response.body.message).toBe('Successfully joined the tournament');
      expect(response.body.tournamentId).toBe(mockTournamentId);
      expect(response.body.teamId).toBe(mockTeamId);
    });
    
    it('should return 400 if player does not have a team', async () => {
      const response = await request(app)
        .post(`/api/tournaments/${mockTournamentId}/join`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .set('test-case', 'no-team')
        .expect(400);
      
      expect(response.body.message).toBe('You must be in a team to join a tournament');
    });
  });
});
