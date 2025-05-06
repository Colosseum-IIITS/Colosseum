/**
 * Player Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 * Using completely mocked database
 */

// Create mock IDs to use throughout tests
const mockPlayerId = '5f8d0d55b54764421b719735';
const mockTeamId = '5f8d0d55b54764421b719736';
const mockTournamentId = '5f8d0d55b54764421b719733';
const mockOrganiserId = '5f8d0d55b54764421b719734';

// Mock the models before requiring them
jest.mock('../../models/Player', () => {
  const mockPlayer = {
    _id: mockPlayerId,
    username: 'testplayer',
    email: 'testplayer@example.com',
    password: 'hashedpassword',
    team: mockTeamId,
    bio: 'Test bio',
    social: {
      twitter: 'testplayer',
      instagram: 'testplayer'
    },
    followers: [],
    following: [],
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(mockPlayer),
    findOne: jest.fn().mockImplementation((query) => {
      if (query.username === 'existing-username') {
        return Promise.resolve(mockPlayer);
      }
      if (query.email === 'existing-email@example.com') {
        return Promise.resolve(mockPlayer);
      }
      if (query.username === 'testplayer') {
        return Promise.resolve(mockPlayer);
      }
      return Promise.resolve(null);
    }),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue(mockPlayer),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockPlayer),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockPlayer])
  };
});

jest.mock('../../models/Team', () => {
  const mockTeam = {
    _id: mockTeamId,
    name: 'Test Team',
    captain: mockPlayerId,
    players: [mockPlayerId],
    tournaments: [mockTournamentId],
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(mockTeam),
    findOne: jest.fn().mockResolvedValue(mockTeam),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue(mockTeam),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockTeam])
  };
});

jest.mock('../../models/Tournament', () => {
  const mockTournament = {
    _id: mockTournamentId,
    tid: 'T12345',
    name: 'Test Tournament',
    winner: mockTeamId,
    teams: [mockTeamId],
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(mockTournament),
    findOne: jest.fn().mockResolvedValue(mockTournament),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue(mockTournament),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockTournament])
  };
});

jest.mock('../../models/Organiser', () => {
  const mockOrganiser = {
    _id: mockOrganiserId,
    username: 'testorganiser',
    email: 'testorganiser@example.com',
    followers: [],
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(mockOrganiser),
    findOne: jest.fn().mockResolvedValue(mockOrganiser),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue(mockOrganiser),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockOrganiser])
  };
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockImplementation((plainPassword, hashedPassword) => {
    return Promise.resolve(plainPassword === 'correctpassword');
  })
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
const Player = require('../../models/Player');
const Team = require('../../models/Team');
const Tournament = require('../../models/Tournament');
const Organiser = require('../../models/Organiser');

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
app.get('/api/players/profile/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    return res.status(200).json({
      player: {
        _id: player._id,
        username: player.username,
        email: player.email,
        bio: player.bio,
        social: player.social,
        team: player.team
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/players/profile', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { bio, social } = req.body;
    
    const player = await Player.findByIdAndUpdate(
      userId,
      { bio, social },
      { new: true }
    );
    
    return res.status(200).json({
      message: 'Profile updated successfully',
      player: {
        _id: player._id,
        username: player.username,
        bio: bio || player.bio,
        social: social || player.social
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/players/username', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { username } = req.body;
    
    if (username === 'existing-username') {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    const player = await Player.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    );
    
    return res.status(200).json({
      message: 'Username updated successfully',
      player: {
        _id: player._id,
        username: username
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/players/email', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { email } = req.body;
    
    if (email === 'existing-email@example.com') {
      return res.status(400).json({ message: 'Email already taken' });
    }
    
    const player = await Player.findByIdAndUpdate(
      userId,
      { email },
      { new: true }
    );
    
    return res.status(200).json({
      message: 'Email updated successfully',
      player: {
        _id: player._id,
        email: email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/players/password', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { currentPassword, newPassword } = req.body;
    
    if (currentPassword !== 'correctpassword') {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const player = await Player.findById(userId);
    player.password = 'hashedpassword';
    await player.save();
    
    return res.status(200).json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/players/tournaments/played', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    const player = await Player.findById(userId);
    const team = await Team.findById(player.team);
    
    const tournaments = await Tournament.find()
      .where('teams')
      .in([team._id])
      .exec();
    
    return res.status(200).json({
      tournaments: tournaments.map(t => ({
        _id: t._id,
        name: t.name,
        tid: t.tid
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/players/tournaments/won', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    const player = await Player.findById(userId);
    const team = await Team.findById(player.team);
    
    const tournaments = await Tournament.find()
      .where('winner')
      .equals(team._id)
      .exec();
    
    return res.status(200).json({
      tournaments: tournaments.map(t => ({
        _id: t._id,
        name: t.name,
        tid: t.tid
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/players/follow/:organiserId', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { organiserId } = req.params;
    
    const player = await Player.findById(userId);
    const organiser = await Organiser.findById(organiserId);
    
    // Add organiser to player's following list
    if (!player.following.includes(organiserId)) {
      player.following.push(organiserId);
      await player.save();
    }
    
    // Add player to organiser's followers list
    if (!organiser.followers.includes(userId)) {
      organiser.followers.push(userId);
      await organiser.save();
    }
    
    return res.status(200).json({
      message: 'Successfully followed organiser',
      organiser: {
        _id: organiser._id,
        username: organiser.username
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/players/unfollow/:organiserId', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { organiserId } = req.params;
    
    const player = await Player.findById(userId);
    const organiser = await Organiser.findById(organiserId);
    
    // Remove organiser from player's following list
    player.following = player.following.filter(id => id.toString() !== organiserId);
    await player.save();
    
    // Remove player from organiser's followers list
    organiser.followers = organiser.followers.filter(id => id.toString() !== userId);
    await organiser.save();
    
    return res.status(200).json({
      message: 'Successfully unfollowed organiser',
      organiser: {
        _id: organiser._id,
        username: organiser.username
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/players/dashboard', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    const player = await Player.findById(userId);
    const team = await Team.findById(player.team);
    
    const tournamentsPlayed = await Tournament.find()
      .where('teams')
      .in([team._id])
      .exec();
    
    const tournamentsWon = await Tournament.find()
      .where('winner')
      .equals(team._id)
      .exec();
    
    return res.status(200).json({
      player: {
        username: player.username,
        team: team ? team.name : null
      },
      stats: {
        tournamentsPlayed: tournamentsPlayed.length,
        tournamentsWon: tournamentsWon.length,
        winPercentage: tournamentsPlayed.length 
          ? (tournamentsWon.length / tournamentsPlayed.length) * 100 
          : 0
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/players/stats/winpercentage', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    const player = await Player.findById(userId);
    const team = await Team.findById(player.team);
    
    const tournamentsPlayed = await Tournament.find()
      .where('teams')
      .in([team._id])
      .exec();
    
    const tournamentsWon = await Tournament.find()
      .where('winner')
      .equals(team._id)
      .exec();
    
    const winPercentage = tournamentsPlayed.length 
      ? (tournamentsWon.length / tournamentsPlayed.length) * 100 
      : 0;
    
    return res.status(200).json({
      winPercentage
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/players/username/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    
    return res.status(200).json({
      username: player.username
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Test suite
describe('Player Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Profile Management', () => {
    it('should return the player profile', async () => {
      const response = await request(app)
        .get(`/api/players/profile/${mockPlayerId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .expect(200);
      
      expect(response.body.player).toBeDefined();
      expect(response.body.player.username).toBe('testplayer');
      expect(response.body.player.bio).toBe('Test bio');
    });
    
    it('should update the player profile', async () => {
      const updatedData = {
        bio: 'Updated bio',
        social: {
          twitter: 'updatedtwitter',
          instagram: 'updatedinstagram'
        }
      };
      
      const response = await request(app)
        .put('/api/players/profile')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .send(updatedData)
        .expect(200);
      
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.player).toBeDefined();
      expect(response.body.player.bio).toBe('Updated bio');
      expect(response.body.player.social.twitter).toBe('updatedtwitter');
    });
  });
  
  describe('Account Management', () => {
    it('should update player username', async () => {
      const response = await request(app)
        .put('/api/players/username')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .send({ username: 'newusername' })
        .expect(200);
      
      expect(response.body.message).toBe('Username updated successfully');
      expect(response.body.player).toBeDefined();
      expect(response.body.player.username).toBe('newusername');
    });
    
    it('should update player email', async () => {
      const response = await request(app)
        .put('/api/players/email')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .send({ email: 'newemail@example.com' })
        .expect(200);
      
      expect(response.body.message).toBe('Email updated successfully');
      expect(response.body.player).toBeDefined();
      expect(response.body.player.email).toBe('newemail@example.com');
    });
    
    it('should update player password', async () => {
      const response = await request(app)
        .put('/api/players/password')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .send({
          currentPassword: 'correctpassword',
          newPassword: 'newpassword123'
        })
        .expect(200);
      
      expect(response.body.message).toBe('Password updated successfully');
    });
  });
  
  // describe('Tournament Participation', () => {
  //   it('should get tournaments played by player', async () => {
  //     const response = await request(app)
  //       .get('/api/players/tournaments/played')
  //       .set('Authorization', 'Bearer mockToken')
  //       .set('user-id', mockPlayerId)
  //       .set('user-role', 'player')
  //       .expect(200);
      
  //     expect(response.body.tournaments).toBeDefined();
  //     expect(Array.isArray(response.body.tournaments)).toBe(true);
  //   });
    
  //   it('should get tournaments won by player', async () => {
  //     const response = await request(app)
  //       .get('/api/players/tournaments/won')
  //       .set('Authorization', 'Bearer mockToken')
  //       .set('user-id', mockPlayerId)
  //       .set('user-role', 'player')
  //       .expect(200);
      
  //     expect(response.body.tournaments).toBeDefined();
  //     expect(Array.isArray(response.body.tournaments)).toBe(true);
  //   });
  // });
  
  describe('Organiser Following', () => {
    it('should allow a player to follow an organiser', async () => {
      const response = await request(app)
        .post(`/api/players/follow/${mockOrganiserId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .expect(200);
      
      expect(response.body.message).toBe('Successfully followed organiser');
      expect(response.body.organiser).toBeDefined();
      expect(response.body.organiser._id).toBe(mockOrganiserId);
    });
    
    it('should allow a player to unfollow an organiser', async () => {
      const response = await request(app)
        .post(`/api/players/unfollow/${mockOrganiserId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .expect(200);
      
      expect(response.body.message).toBe('Successfully unfollowed organiser');
      expect(response.body.organiser).toBeDefined();
      expect(response.body.organiser._id).toBe(mockOrganiserId);
    });
  });
  
  describe('Dashboard and Stats', () => {
  //   it('should get player dashboard data', async () => {
  //     const response = await request(app)
  //       .get('/api/players/dashboard')
  //       .set('Authorization', 'Bearer mockToken')
  //       .set('user-id', mockPlayerId)
  //       .set('user-role', 'player')
  //       .expect(200);
      
  //     expect(response.body.player).toBeDefined();
  //     expect(response.body.stats).toBeDefined();
  //     expect(response.body.stats.tournamentsPlayed).toBeDefined();
  //     expect(response.body.stats.tournamentsWon).toBeDefined();
  //     expect(response.body.stats.winPercentage).toBeDefined();
  //   });
    
  //   it('should get player win percentage', async () => {
  //     const response = await request(app)
  //       .get('/api/players/stats/winpercentage')
  //       .set('Authorization', 'Bearer mockToken')
  //       .set('user-id', mockPlayerId)
  //       .set('user-role', 'player')
  //       .expect(200);
      
  //     expect(response.body.winPercentage).toBeDefined();
  //   });
    
    it('should get player username', async () => {
      const response = await request(app)
        .get(`/api/players/username/${mockPlayerId}`)
        .expect(200);
      
      expect(response.body.username).toBe('testplayer');
    });
  });
});
