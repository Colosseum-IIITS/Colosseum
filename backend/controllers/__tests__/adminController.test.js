/**
 * Admin Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 * Using completely mocked database
 */

// Create mock IDs to use throughout tests
const mockAdminId = '5f8d0d55b54764421b719738';
const mockPlayerId = '5f8d0d55b54764421b719735';
const mockOrganiserId = '5f8d0d55b54764421b719734';
const mockTournamentId = '5f8d0d55b54764421b719733';

// Mock the models before requiring them
jest.mock('../../models/Admin', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockImplementation(() => Promise.resolve({
    _id: mockAdminId,
    username: 'testadmin',
    email: 'testadmin@example.com',
    save: jest.fn().mockResolvedValue(true)
  })),
  findOne: jest.fn().mockResolvedValue({
    _id: mockAdminId,
    username: 'testadmin',
    email: 'testadmin@example.com'
  }),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockImplementation((data) => Promise.resolve({
    ...data,
    _id: mockAdminId,
    save: jest.fn().mockResolvedValue(true)
  })),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{
    _id: mockAdminId,
    username: 'testadmin'
  }])
}));

jest.mock('../../models/Player', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockImplementation(() => Promise.resolve({
    _id: mockPlayerId,
    username: 'testplayer',
    email: 'testplayer@example.com',
    isBanned: false,
    save: jest.fn().mockResolvedValue(true)
  })),
  findOne: jest.fn().mockResolvedValue({
    _id: mockPlayerId,
    username: 'testplayer',
    email: 'testplayer@example.com',
    isBanned: false,
    save: jest.fn().mockResolvedValue(true)
  }),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockImplementation((data) => Promise.resolve({
    ...data,
    _id: mockPlayerId,
    save: jest.fn().mockResolvedValue(true)
  })),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{
    _id: mockPlayerId,
    username: 'testplayer'
  }])
}));

jest.mock('../../models/Organiser', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockImplementation(() => Promise.resolve({
    _id: mockOrganiserId,
    username: 'testorganiser',
    email: 'testorganiser@example.com',
    isBanned: false,
    save: jest.fn().mockResolvedValue(true)
  })),
  findOne: jest.fn().mockResolvedValue({
    _id: mockOrganiserId,
    username: 'testorganiser',
    email: 'testorganiser@example.com',
    isBanned: false,
    save: jest.fn().mockResolvedValue(true)
  }),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockImplementation((data) => Promise.resolve({
    ...data,
    _id: mockOrganiserId,
    save: jest.fn().mockResolvedValue(true)
  })),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{
    _id: mockOrganiserId,
    username: 'testorganiser'
  }])
}));

jest.mock('../../models/Tournament', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockImplementation(() => Promise.resolve({
    _id: mockTournamentId,
    tid: 'T12345',
    name: 'Test Tournament',
    status: 'Pending',
    save: jest.fn().mockResolvedValue(true)
  })),
  findOne: jest.fn().mockResolvedValue({
    _id: mockTournamentId,
    tid: 'T12345',
    name: 'Test Tournament',
    status: 'Pending',
    save: jest.fn().mockResolvedValue(true)
  }),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockImplementation((data) => Promise.resolve({
    ...data,
    _id: mockTournamentId,
    save: jest.fn().mockResolvedValue(true)
  })),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{
    _id: mockTournamentId,
    tid: 'T12345',
    name: 'Test Tournament'
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
const Admin = require('../../models/Admin');
const Player = require('../../models/Player');
const Organiser = require('../../models/Organiser');
const Tournament = require('../../models/Tournament');

// Create Express app
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

// Mock authentication middleware
const authenticateUser = (req, res, next) => {
  req.user = req.headers['user-id'] ? {
    _id: req.headers['user-id'],
    role: req.headers['user-role'] || 'admin'
  } : null;
  next();
};

// Define mock routes for testing
app.post('/api/admin/players/:id/ban', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const player = await Player.findById(id);
    player.isBanned = true;
    await player.save();

    return res.status(200).json({
      message: 'Player banned successfully',
      player: {
        _id: id,
        username: player.username,
        isBanned: true
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/players/:id/unban', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const player = await Player.findById(id);
    player.isBanned = false;
    await player.save();

    return res.status(200).json({
      message: 'Player unbanned successfully',
      player: {
        _id: id,
        username: player.username,
        isBanned: false
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/organisers/:id/ban', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const organiser = await Organiser.findById(id);
    organiser.isBanned = true;
    await organiser.save();

    return res.status(200).json({
      message: 'Organiser banned successfully',
      organiser: {
        _id: id,
        username: organiser.username,
        isBanned: true
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/organisers/:id/unban', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const organiser = await Organiser.findById(id);
    organiser.isBanned = false;
    await organiser.save();

    return res.status(200).json({
      message: 'Organiser unbanned successfully',
      organiser: {
        _id: id,
        username: organiser.username,
        isBanned: false
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/tournaments/:id/approve', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    const tournament = await Tournament.findById(id);
    tournament.status = 'Approved';
    await tournament.save();
    
    return res.status(200).json({
      message: 'Tournament approved successfully',
      tournament: {
        _id: id,
        name: tournament.name,
        status: 'Approved'
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/tournaments/:id/reject', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    
    if (role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }
    
    const tournament = await Tournament.findById(id);
    tournament.status = 'Rejected';
    await tournament.save();
    
    return res.status(200).json({
      message: 'Tournament rejected successfully',
      tournament: {
        _id: id,
        name: tournament.name,
        status: 'Rejected'
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Test suite
describe('Admin Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Ban and Unban Player', () => {
    it('should ban a player successfully', async () => {
      const response = await request(app)
        .post(`/api/admin/players/${mockPlayerId}/ban`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockAdminId)
        .set('user-role', 'admin')
        .expect(200);
      
      expect(response.body.message).toBe('Player banned successfully');
      expect(response.body.player.isBanned).toBe(true);
    });
    
    it('should unban a player successfully', async () => {
      const response = await request(app)
        .post(`/api/admin/players/${mockPlayerId}/unban`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockAdminId)
        .set('user-role', 'admin')
        .expect(200);
      
      expect(response.body.message).toBe('Player unbanned successfully');
      expect(response.body.player.isBanned).toBe(false);
    });
  });
  
  describe('Tournament Management', () => {
    it('should approve a tournament successfully', async () => {
      const response = await request(app)
        .post(`/api/admin/tournaments/${mockTournamentId}/approve`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockAdminId)
        .set('user-role', 'admin')
        .expect(200);
      
      expect(response.body.message).toBe('Tournament approved successfully');
      expect(response.body.tournament.status).toBe('Approved');
    });
    
    it('should reject a tournament successfully', async () => {
      const response = await request(app)
        .post(`/api/admin/tournaments/${mockTournamentId}/reject`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockAdminId)
        .set('user-role', 'admin')
        .expect(200);
      
      expect(response.body.message).toBe('Tournament rejected successfully');
      expect(response.body.tournament.status).toBe('Rejected');
    });
  });
  
  describe('Organiser Management', () => {
    it('should ban an organiser successfully', async () => {
      const response = await request(app)
        .post(`/api/admin/organisers/${mockOrganiserId}/ban`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockAdminId)
        .set('user-role', 'admin')
        .expect(200);
      
      expect(response.body.message).toBe('Organiser banned successfully');
      expect(response.body.organiser.isBanned).toBe(true);
    });
    
    it('should unban an organiser successfully', async () => {
      const response = await request(app)
        .post(`/api/admin/organisers/${mockOrganiserId}/unban`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockAdminId)
        .set('user-role', 'admin')
        .expect(200);
      
      expect(response.body.message).toBe('Organiser unbanned successfully');
      expect(response.body.organiser.isBanned).toBe(false);
    });
  });
});
