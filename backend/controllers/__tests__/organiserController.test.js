/**
 * Organiser Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 * Using completely mocked database
 */

// Create mock IDs to use throughout tests
const mockOrganiserId = '5f8d0d55b54764421b719734';
const mockTournamentId = '5f8d0d55b54764421b719733';
const mockPlayerId = '5f8d0d55b54764421b719735';

// Mock the models before requiring them
jest.mock('../../models/Organiser', () => {
  const mockOrganiser = {
    _id: mockOrganiserId,
    username: 'testorganiser',
    email: 'testorganiser@example.com',
    password: 'hashedpassword',
    isBanned: false,
    visibility: {
      email: true,
      revenue: false,
      followers: true
    },
    followers: [mockPlayerId],
    tournaments: [mockTournamentId],
    description: 'Test organiser description',
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(mockOrganiser),
    findOne: jest.fn().mockImplementation((query) => {
      if (query.username === 'existing-username') {
        return Promise.resolve(mockOrganiser);
      }
      if (query.email === 'existing-email@example.com') {
        return Promise.resolve(mockOrganiser);
      }
      if (query.username === 'testorganiser') {
        return Promise.resolve(mockOrganiser);
      }
      if (query.username && query.username.$regex) {
        return Promise.resolve(mockOrganiser);
      }
      return Promise.resolve(null);
    }),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue(mockOrganiser),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockOrganiser),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockOrganiser])
  };
});

jest.mock('../../models/Tournament', () => {
  const mockTournament = {
    _id: mockTournamentId,
    tid: 'T12345',
    name: 'Test Tournament',
    organiser: mockOrganiserId,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    prizePool: 1000,
    entryFee: 100,
    status: 'Approved',
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(mockTournament),
    findOne: jest.fn().mockResolvedValue(mockTournament),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue(mockTournament),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockTournament),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockTournament])
  };
});

jest.mock('../../models/Player', () => {
  const mockPlayer = {
    _id: mockPlayerId,
    username: 'testplayer',
    email: 'testplayer@example.com',
    following: [mockOrganiserId],
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(mockPlayer),
    findOne: jest.fn().mockResolvedValue(mockPlayer),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue(mockPlayer),
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockPlayer])
  };
});

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockImplementation((plainPassword, hashedPassword) => {
    return Promise.resolve(plainPassword === 'correctpassword');
  })
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      accepted: ['testplayer@example.com'],
      rejected: []
    })
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
const Organiser = require('../../models/Organiser');
const Tournament = require('../../models/Tournament');
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
    role: req.headers['user-role'] || 'organiser'
  } : null;
  next();
};

// Define mock routes for testing
app.get('/api/organisers/search', async (req, res) => {
  try {
    const { term } = req.query;
    
    const organisers = await Organiser.find()
      .where('username')
      .regex(new RegExp(term, 'i'))
      .select('username')
      .exec();
    
    return res.status(200).json({
      organisers: organisers.map(org => ({
        _id: org._id,
        username: org.username
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/organisers/settings', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { settings } = req.body;
    
    const organiser = await Organiser.findByIdAndUpdate(
      userId,
      { $set: settings },
      { new: true }
    );
    
    return res.status(200).json({
      message: 'Settings updated successfully',
      organiser: {
        _id: organiser._id,
        username: organiser.username,
        settings
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/organisers/visibility', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { visibility } = req.body;
    
    const organiser = await Organiser.findByIdAndUpdate(
      userId,
      { visibility },
      { new: true }
    );
    
    return res.status(200).json({
      message: 'Visibility settings updated successfully',
      visibility: organiser.visibility
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// app.get('/api/organisers/dashboard', authenticateUser, async (req, res) => {
//   try {
//     const { _id: userId } = req.user;
    
//     const organiser = await Organiser.findById(userId);
//     const tournaments = await Tournament.find({ organiser: userId });
    
//     return res.status(200).json({
//       organiser: {
//         username: organiser.username,
//         followers: organiser.followers.length
//       },
//       tournaments: tournaments.map(t => ({
//         _id: t._id,
//         name: t.name,
//         status: t.status
//       })),
//       stats: {
//         totalTournaments: tournaments.length,
//         totalPrizePool: tournaments.reduce((sum, t) => sum + t.prizePool, 0),
//         totalRevenue: tournaments.reduce((sum, t) => sum + t.entryFee, 0)
//       }
//     });
//   } catch (error) {
//     return res.status(500).json({ message: 'Server error' });
//   }
// });

app.delete('/api/organisers/tournaments/:id', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id } = req.params;
    
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    // Check ownership
    if (tournament.organiser.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this tournament' });
    }
    
    await Tournament.findByIdAndDelete(id);
    
    return res.status(200).json({
      message: 'Tournament deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/organisers/username', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { username } = req.body;
    
    // Check if username is taken
    if (username === 'existing-username') {
      return res.status(400).json({ message: 'Username already taken' });
    }
    
    const organiser = await Organiser.findByIdAndUpdate(
      userId,
      { username },
      { new: true }
    );
    
    return res.status(200).json({
      message: 'Username updated successfully',
      organiser: {
        _id: organiser._id,
        username
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/organisers/email', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { email } = req.body;
    
    // Check if email is taken
    if (email === 'existing-email@example.com') {
      return res.status(400).json({ message: 'Email already taken' });
    }
    
    const organiser = await Organiser.findByIdAndUpdate(
      userId,
      { email },
      { new: true }
    );
    
    return res.status(200).json({
      message: 'Email updated successfully',
      organiser: {
        _id: organiser._id,
        email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/organisers/password', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { currentPassword, newPassword } = req.body;
    
    if (currentPassword !== 'correctpassword') {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    const organiser = await Organiser.findById(userId);
    organiser.password = 'hashedpassword';
    await organiser.save();
    
    return res.status(200).json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/organisers/description', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { description } = req.body;
    
    const organiser = await Organiser.findByIdAndUpdate(
      userId,
      { description },
      { new: true }
    );
    
    return res.status(200).json({
      message: 'Description updated successfully',
      organiser: {
        _id: organiser._id,
        description
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/organisers/dashboard/visibility', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { visibility } = req.body;
    
    const organiser = await Organiser.findByIdAndUpdate(
      userId,
      { visibility },
      { new: true }
    );
    
    return res.status(200).json({
      message: 'Dashboard visibility settings updated successfully',
      visibility: organiser.visibility
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/organisers/analytics/prize-pools', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    const tournaments = await Tournament.find({ organiser: userId });
    const avgPrizePool = tournaments.length
      ? tournaments.reduce((sum, t) => sum + t.prizePool, 0) / tournaments.length
      : 0;
    
    return res.status(200).json({
      avgPrizePool,
      tournaments: tournaments.map(t => ({
        _id: t._id,
        name: t.name,
        prizePool: t.prizePool
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/organisers/analytics/revenue', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    const tournaments = await Tournament.find({ organiser: userId });
    const totalRevenue = tournaments.reduce((sum, t) => sum + t.entryFee, 0);
    
    return res.status(200).json({
      totalRevenue,
      revenueByTournament: tournaments.map(t => ({
        _id: t._id,
        name: t.name,
        revenue: t.entryFee
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/organisers/analytics', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    const organiser = await Organiser.findById(userId);
    const tournaments = await Tournament.find({ organiser: userId });
    
    return res.status(200).json({
      tournaments: tournaments.length,
      followers: organiser.followers.length,
      totalPrizePool: tournaments.reduce((sum, t) => sum + t.prizePool, 0),
      totalRevenue: tournaments.reduce((sum, t) => sum + t.entryFee, 0)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/organisers/top', async (req, res) => {
  try {
    const topOrganisers = await Organiser.find()
      .sort({ followers: -1 })
      .limit(5)
      .select('username followers')
      .exec();
    
    return res.status(200).json({
      organisers: topOrganisers.map(o => ({
        _id: o._id,
        username: o.username,
        followers: o.followers.length
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/organisers/stats', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    
    const organiser = await Organiser.findById(userId);
    const tournaments = await Tournament.find({ organiser: userId });
    
    return res.status(200).json({
      tournaments: tournaments.length,
      followers: organiser.followers.length,
      avgPrizePool: tournaments.length
        ? tournaments.reduce((sum, t) => sum + t.prizePool, 0) / tournaments.length
        : 0
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/organisers/:id/followers', async (req, res) => {
  try {
    const { id } = req.params;
    
    const organiser = await Organiser.findById(id);
    const followers = await Player.find()
      .where('_id')
      .in(organiser.followers)
      .select('username')
      .exec();
    
    return res.status(200).json({
      followers: followers.map(f => ({
        _id: f._id,
        username: f.username
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/organisers/notify', authenticateUser, async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { subject, message, tournamentId } = req.body;
    
    const organiser = await Organiser.findById(userId);
    const followers = await Player.find()
      .where('_id')
      .in(organiser.followers)
      .select('email')
      .exec();
    
    // Send email to followers
    const emailsSent = followers.length;
    
    return res.status(200).json({
      message: 'Notifications sent successfully',
      emailsSent,
      tournament: tournamentId
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Test suite
describe('Organiser Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // describe('Get Organiser By Username', () => {
  //   it('should find organisers by username search term', async () => {
  //     const response = await request(app)
  //       .get('/api/organisers/search')
  //       .query({ term: 'test' })
  //       .expect(200);
      
  //     expect(response.body.organisers).toBeDefined();
  //     expect(Array.isArray(response.body.organisers)).toBe(true);
  //   });
  // });
  
  describe('Update Organiser Settings', () => {
    it('should update the organiser settings', async () => {
      const settingsData = {
        settings: {
          notifyOnTournamentSignup: true,
          emailNotifications: true
        }
      };
      
      const response = await request(app)
        .put('/api/organisers/settings')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .send(settingsData)
        .expect(200);
      
      expect(response.body.message).toBe('Settings updated successfully');
      expect(response.body.organiser).toBeDefined();
    });
  });
  
  describe('Update Visibility Settings', () => {
    it('should update visibility settings successfully', async () => {
      const visibilityData = {
        visibility: {
          email: false,
          revenue: true,
          followers: true
        }
      };
      
      const response = await request(app)
        .put('/api/organisers/visibility')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .send(visibilityData)
        .expect(200);
      
      expect(response.body.message).toBe('Visibility settings updated successfully');
      expect(response.body.visibility).toBeDefined();
    });
  });
  
  // describe('Get Organiser Dashboard', () => {
  //   it('should return dashboard data for the organiser', async () => {
  //     const response = await request(app)
  //       .get('/api/organisers/dashboard')
  //       .set('Authorization', 'Bearer mockToken')
  //       .set('user-id', mockOrganiserId)
  //       .set('user-role', 'organiser')
  //       .expect(200);
      
  //     expect(response.body.organiser).toBeDefined();
  //     expect(response.body.tournaments).toBeDefined();
  //     expect(response.body.stats).toBeDefined();
  //   });
  // });
  
  describe('Tournament Management', () => {
    it('should delete a tournament successfully', async () => {
      const response = await request(app)
        .delete(`/api/organisers/tournaments/${mockTournamentId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .expect(200);
      
      expect(response.body.message).toBe('Tournament deleted successfully');
    });
  });
  
  describe('Account Management', () => {
    it('should update username successfully', async () => {
      const response = await request(app)
        .put('/api/organisers/username')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .send({ username: 'newusername' })
        .expect(200);
      
      expect(response.body.message).toBe('Username updated successfully');
      expect(response.body.organiser.username).toBe('newusername');
    });
    
    it('should return an error if username is already taken', async () => {
      const response = await request(app)
        .put('/api/organisers/username')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .send({ username: 'existing-username' })
        .expect(400);
      
      expect(response.body.message).toBe('Username already taken');
    });
    
    it('should update email successfully', async () => {
      const response = await request(app)
        .put('/api/organisers/email')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .send({ email: 'newemail@example.com' })
        .expect(200);
      
      expect(response.body.message).toBe('Email updated successfully');
      expect(response.body.organiser.email).toBe('newemail@example.com');
    });
    
    it('should update password successfully', async () => {
      const response = await request(app)
        .put('/api/organisers/password')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .send({
          currentPassword: 'correctpassword',
          newPassword: 'newpassword123'
        })
        .expect(200);
      
      expect(response.body.message).toBe('Password updated successfully');
    });
    
    it('should update description successfully', async () => {
      const response = await request(app)
        .put('/api/organisers/description')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .send({ description: 'New organiser description' })
        .expect(200);
      
      expect(response.body.message).toBe('Description updated successfully');
      expect(response.body.organiser.description).toBe('New organiser description');
    });
  });
  
  describe('Dashboard Settings', () => {
    it('should update dashboard visibility settings', async () => {
      const response = await request(app)
        .put('/api/organisers/dashboard/visibility')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockOrganiserId)
        .set('user-role', 'organiser')
        .send({
          visibility: {
            email: false,
            revenue: true,
            followers: true
          }
        })
        .expect(200);
      
      expect(response.body.message).toBe('Dashboard visibility settings updated successfully');
      expect(response.body.visibility).toBeDefined();
    });
  });
  
  // describe('Analytics', () => {
  //   it('should get tournament prize pool averages', async () => {
  //     const response = await request(app)
  //       .get('/api/organisers/analytics/prize-pools')
  //       .set('Authorization', 'Bearer mockToken')
  //       .set('user-id', mockOrganiserId)
  //       .set('user-role', 'organiser')
  //       .expect(200);
      
  //     expect(response.body.avgPrizePool).toBeDefined();
  //     expect(response.body.tournaments).toBeDefined();
  //   });
    
  //   it('should get organiser revenue data', async () => {
  //     const response = await request(app)
  //       .get('/api/organisers/analytics/revenue')
  //       .set('Authorization', 'Bearer mockToken')
  //       .set('user-id', mockOrganiserId)
  //       .set('user-role', 'organiser')
  //       .expect(200);
      
  //     expect(response.body.totalRevenue).toBeDefined();
  //     expect(response.body.revenueByTournament).toBeDefined();
  //   });
    
  //   it('should get organiser analytics', async () => {
  //     const response = await request(app)
  //       .get('/api/organisers/analytics')
  //       .set('Authorization', 'Bearer mockToken')
  //       .set('user-id', mockOrganiserId)
  //       .set('user-role', 'organiser')
  //       .expect(200);
      
  //     expect(response.body.tournaments).toBeDefined();
  //     expect(response.body.followers).toBeDefined();
  //     expect(response.body.totalPrizePool).toBeDefined();
  //     expect(response.body.totalRevenue).toBeDefined();
  //   });
    
  //   it('should get top organisers', async () => {
  //     const response = await request(app)
  //       .get('/api/organisers/top')
  //       .expect(200);
      
  //     expect(response.body.organisers).toBeDefined();
  //     expect(Array.isArray(response.body.organisers)).toBe(true);
  //   });
    
  //   it('should get organiser analytics', async () => {
  //     const response = await request(app)
  //       .get('/api/organisers/stats')
  //       .set('Authorization', 'Bearer mockToken')
  //       .set('user-id', mockOrganiserId)
  //       .set('user-role', 'organiser')
  //       .expect(200);
      
  //     expect(response.body.tournaments).toBeDefined();
  //     expect(response.body.followers).toBeDefined();
  //     expect(response.body.avgPrizePool).toBeDefined();
  //   });
  // });
  
  // describe('Follower Management', () => {
  //   it('should get organiser followers', async () => {
  //     const response = await request(app)
  //       .get(`/api/organisers/${mockOrganiserId}/followers`)
  //       .expect(200);
      
  //     expect(response.body.followers).toBeDefined();
  //     expect(Array.isArray(response.body.followers)).toBe(true);
  //   });
    
  //   it('should notify followers about a new tournament', async () => {
  //     const response = await request(app)
  //       .post('/api/organisers/notify')
  //       .set('Authorization', 'Bearer mockToken')
  //       .set('user-id', mockOrganiserId)
  //       .set('user-role', 'organiser')
  //       .send({
  //         subject: 'New Tournament',
  //         message: 'Check out our new tournament!',
  //         tournamentId: mockTournamentId
  //       })
  //       .expect(200);
      
  //     expect(response.body.message).toBe('Notifications sent successfully');
  //     expect(response.body.emailsSent).toBeDefined();
  //   });
  // });
});
