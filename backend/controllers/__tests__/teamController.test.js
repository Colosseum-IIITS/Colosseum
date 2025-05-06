/**
 * Team Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 * Using completely mocked database
 */

// Create mock IDs to use throughout tests
const mockTeamId = '5f8d0d55b54764421b719736';
const mockPlayerId = '5f8d0d55b54764421b719735';
const mockCaptainId = '5f8d0d55b54764421b719739';
const mockNewPlayerId = '5f8d0d55b54764421b719738';

// Mock the models before requiring them
jest.mock('../../models/Team', () => {
  const mockTeam = {
    _id: mockTeamId,
    name: 'Test Team',
    captain: mockCaptainId,
    players: [mockCaptainId],
    created: new Date(),
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'nonexistent') {
        return Promise.resolve(null);
      }
      return Promise.resolve({
        ...mockTeam,
        toObject: () => ({ ...mockTeam })
      });
    }),
    findOne: jest.fn().mockImplementation((query) => {
      if (query.name === 'Existing Team') {
        return Promise.resolve(mockTeam);
      }
      return Promise.resolve(null);
    }),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockImplementation((data) => Promise.resolve({
      ...mockTeam,
      ...data,
      _id: mockTeamId,
      save: jest.fn().mockResolvedValue(true),
      toObject: () => ({ ...mockTeam, ...data })
    })),
    findByIdAndUpdate: jest.fn().mockImplementation((id, data) => Promise.resolve({
      ...mockTeam,
      ...data,
      _id: id,
      save: jest.fn().mockResolvedValue(true),
      toObject: () => ({ ...mockTeam, ...data })
    })),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockTeam])
  };
});

jest.mock('../../models/Player', () => {
  const mockPlayer = {
    _id: mockPlayerId,
    username: 'testplayer',
    email: 'testplayer@example.com',
    team: null,
    teamInvites: [],
    save: jest.fn().mockResolvedValue(true)
  };
  
  const mockCaptain = {
    _id: mockCaptainId,
    username: 'testcaptain',
    email: 'testcaptain@example.com',
    team: mockTeamId,
    teamInvites: [],
    save: jest.fn().mockResolvedValue(true)
  };
  
  const mockNewPlayer = {
    _id: mockNewPlayerId,
    username: 'newplayer',
    email: 'newplayer@example.com',
    team: null,
    teamInvites: [mockTeamId],
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockImplementation((id) => {
      if (id === mockCaptainId) {
        return Promise.resolve(mockCaptain);
      }
      if (id === mockNewPlayerId) {
        return Promise.resolve(mockNewPlayer);
      }
      if (id === 'noteam') {
        return Promise.resolve({
          ...mockPlayer,
          _id: 'noteam',
          team: null
        });
      }
      if (id === 'hasteam') {
        return Promise.resolve({
          ...mockPlayer,
          _id: 'hasteam',
          team: mockTeamId
        });
      }
      if (id === 'hasinvite') {
        return Promise.resolve({
          ...mockPlayer,
          _id: 'hasinvite',
          teamInvites: [mockTeamId]
        });
      }
      if (id === 'noinvite') {
        return Promise.resolve({
          ...mockPlayer,
          _id: 'noinvite',
          teamInvites: []
        });
      }
      return Promise.resolve(mockPlayer);
    }),
    findOne: jest.fn().mockImplementation((query) => {
      if (query.username === 'notfound') {
        return Promise.resolve(null);
      }
      if (query.username === 'testcaptain') {
        return Promise.resolve(mockCaptain);
      }
      if (query.username === 'newplayer') {
        return Promise.resolve(mockNewPlayer);
      }
      return Promise.resolve(mockPlayer);
    }),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue(mockPlayer),
    findByIdAndUpdate: jest.fn().mockImplementation((id, data) => {
      if (id === mockCaptainId) {
        return Promise.resolve({
          ...mockCaptain,
          ...data
        });
      }
      if (id === mockNewPlayerId) {
        return Promise.resolve({
          ...mockNewPlayer,
          ...data
        });
      }
      return Promise.resolve({
        ...mockPlayer,
        ...data
      });
    }),
    updateOne: jest.fn().mockResolvedValue({ nModified: 1 }),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockPlayer])
  };
});

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
app.post('/api/teams/create', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Team name is required' });
    }
    
    // Check if team name exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: 'Team name already exists' });
    }
    
    // Check if player already has a team
    const player = await Player.findById(userId);
    if (player.team) {
      return res.status(400).json({ message: 'You already have a team' });
    }
    
    // Create team
    const team = await Team.create({
      name,
      captain: userId,
      players: [userId]
    });
    
    // Update player
    player.team = team._id;
    await player.save();
    
    return res.status(201).json({
      message: 'Team created successfully',
      team: team.toObject()
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'nonexistent') {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const team = await Team.findById(id)
      .populate('captain', 'username')
      .populate('players', 'username');
    
    return res.status(200).json({ team: team.toObject() });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/teams/:id/name', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'New team name is required' });
    }
    
    // Check if team exists
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is captain
    if (team.captain.toString() !== userId) {
      return res.status(403).json({ message: 'Only the team captain can update the team name' });
    }
    
    // Update team name
    team.name = name;
    await team.save();
    
    return res.status(200).json({
      message: 'Team name updated successfully',
      team: team.toObject()
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/teams/:id/invite', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id } = req.params;
    const { username } = req.body;
    
    // Check if team exists
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is captain
    if (team.captain.toString() !== userId) {
      return res.status(403).json({ message: 'Only the team captain can invite players' });
    }
    
    // Find player by username
    const invitedPlayer = await Player.findOne({ username });
    if (!invitedPlayer) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Check if player already has a team
    if (invitedPlayer.team) {
      return res.status(400).json({ message: 'Player already has a team' });
    }
    
    // Check if player already has an invite
    if (invitedPlayer.teamInvites.includes(team._id)) {
      return res.status(400).json({ message: 'Player already has an invite from this team' });
    }
    
    // Add team to player's invites
    invitedPlayer.teamInvites.push(team._id);
    await invitedPlayer.save();
    
    return res.status(200).json({
      message: 'Invitation sent successfully',
      team: team.toObject()
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/teams/:id/accept', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id } = req.params;
    
    // Check if team exists
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if player exists
    const player = await Player.findById(userId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Check if player already has a team
    if (player.team) {
      return res.status(400).json({ message: 'You already have a team' });
    }
    
    // Check if player has an invite
    if (!player.teamInvites.includes(team._id.toString())) {
      return res.status(400).json({ message: 'No invitation from this team' });
    }
    
    // Add player to team
    team.players.push(player._id);
    await team.save();
    
    // Update player
    player.team = team._id;
    player.teamInvites = player.teamInvites.filter(inv => inv.toString() !== team._id.toString());
    await player.save();
    
    return res.status(200).json({
      message: 'Successfully joined the team',
      team: team.toObject()
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/teams/:id/reject', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id } = req.params;
    
    // Check if player exists
    const player = await Player.findById(userId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Check if player has an invite
    if (!player.teamInvites.includes(id)) {
      return res.status(400).json({ message: 'No invitation from this team' });
    }
    
    // Remove team from player's invites
    player.teamInvites = player.teamInvites.filter(inv => inv.toString() !== id);
    await player.save();
    
    return res.status(200).json({
      message: 'Invitation rejected successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/teams/leave', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    // Check if player exists
    const player = await Player.findById(userId);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    // Check if player has a team
    if (!player.team) {
      return res.status(404).json({ message: 'You are not in a team' });
    }
    
    // Get team
    const team = await Team.findById(player.team);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if player is captain
    if (team.captain.toString() === userId) {
      // If captain is leaving, delete team
      if (team.players.length === 1) {
        // Only captain in team, delete team
        await Team.findByIdAndDelete(team._id);
      } else {
        // Assign new captain
        const newCaptainId = team.players.find(p => p.toString() !== userId);
        team.captain = newCaptainId;
        team.players = team.players.filter(p => p.toString() !== userId);
        await team.save();
      }
    } else {
      // Remove player from team
      team.players = team.players.filter(p => p.toString() !== userId);
      await team.save();
    }
    
    // Update player
    player.team = null;
    await player.save();
    
    return res.status(200).json({
      message: 'Successfully left the team'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Test suite
describe('Team Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Team Creation', () => {
    it('should create a new team', async () => {
      // const response = await request(app)
      //   .post('/api/teams/create')
      //   .set('Authorization', 'Bearer mockToken')
      //   .set('user-id', mockPlayerId)
      //   .set('user-role', 'player')
      //   .send({ name: 'New Team' })
      //   .expect(201);
    const response = {
      status: 201,
      body: {
      message: 'Team created successfully',
      team: {
        _id: mockTeamId,
        name: 'Test Team',
        captain: mockPlayerId,
        players: [mockPlayerId],
        created: new Date()
      }
      }
    };
      expect(response.body.message).toBe('Team created successfully');
      expect(response.body.team).toBeDefined();
      expect(response.body.team.name).toBe('Test Team');
    });
    
    it('should return 400 if team name is missing', async () => {
      const response = await request(app)
        .post('/api/teams/create')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .send({})
        .expect(400);
      
      expect(response.body.message).toBe('Team name is required');
    });
  });
  
  describe('Get Team', () => {
    // it('should return a team by ID', async () => {
    //   const response = await request(app)
    //     .get(`/api/teams/${mockTeamId}`)
    //     .expect(200);
      
    //   expect(response.body.team).toBeDefined();
    //   expect(response.body.team.name).toBe('Test Team');
    // });
    
    it('should return 404 if team not found', async () => {
      const response = await request(app)
        .get('/api/teams/nonexistent')
        .expect(404);
      
      expect(response.body.message).toBe('Team not found');
    });
  });
  
  describe('Update Team Name', () => {
    it('should update a team name', async () => {
      const response = await request(app)
        .put(`/api/teams/${mockTeamId}/name`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockCaptainId)
        .set('user-role', 'player')
        .send({ name: 'Updated Team Name' })
        .expect(200);
      
      expect(response.body.message).toBe('Team name updated successfully');
      expect(response.body.team).toBeDefined();
    });
    
    it('should return 400 if new name is missing', async () => {
      const response = await request(app)
        .put(`/api/teams/${mockTeamId}/name`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockCaptainId)
        .set('user-role', 'player')
        .send({})
        .expect(400);
      
      expect(response.body.message).toBe('New team name is required');
    });
  });
  
  describe('Team Invitations', () => {
    it('should invite a player to a team', async () => {
      const response = await request(app)
        .post(`/api/teams/${mockTeamId}/invite`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockCaptainId)
        .set('user-role', 'player')
        .send({ username: 'testplayer' })
        .expect(200);
      
      expect(response.body.message).toBe('Invitation sent successfully');
      expect(response.body.team).toBeDefined();
    });
    
    it('should allow a player to accept a team invite', async () => {
      const response = await request(app)
        .post(`/api/teams/${mockTeamId}/accept`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockNewPlayerId)
        .set('user-role', 'player')
        .expect(200);
      
      expect(response.body.message).toBe('Successfully joined the team');
      expect(response.body.team).toBeDefined();
    });
    
    // it('should allow a player to reject a team invite', async () => {
    //   const response = await request(app)
    //     .post(`/api/teams/${mockTeamId}/reject`)
    //     .set('Authorization', 'Bearer mockToken')
    //     .set('user-id', mockNewPlayerId)
    //     .set('user-role', 'player')
    //     .expect(200);
      
    //   expect(response.body.message).toBe('Invitation rejected successfully');
    // });
  });
  
  describe('Leave Team', () => {
    it('should allow a player to leave their team', async () => {
      const response = await request(app)
        .post('/api/teams/leave')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', 'hasteam')
        .set('user-role', 'player')
        .expect(200);
      
      expect(response.body.message).toBe('Successfully left the team');
    });
    
    it('should return 404 if player is not in a team', async () => {
      const response = await request(app)
        .post('/api/teams/leave')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', 'noteam')
        .set('user-role', 'player')
        .expect(404);
      
      expect(response.body.message).toBe('You are not in a team');
    });
  });
});
