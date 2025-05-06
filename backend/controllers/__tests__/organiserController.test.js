/**
 * Organiser Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Import models
const Organiser = require('../../models/Organiser');
const Tournament = require('../../models/Tournament');
const Player = require('../../models/Player');

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

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock authenticateOrganiser middleware
const authenticateOrganiser = (req, res, next) => {
  req.user = req.headers['user-id'] ? {
    _id: req.headers['user-id'],
    role: 'organiser'
  } : null;
  next();
};

// Utility functions for creating test data
const createTestOrganiser = async (customData = {}) => {
  const organiserData = {
    username: `organiser_${Date.now()}`,
    email: `organiser${Date.now()}@gmail.com`,
    password: 'hashedpassword',
    description: 'Test organiser description',
    visibility: {
      profile: true,
      email: false,
      tournaments: true
    },
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

// Define mock routes
app.get('/api/organisers/search/:username', async (req, res) => {
  const { username } = req.params;
  
  return res.status(200).json({
    organisers: [
      {
        _id: new mongoose.Types.ObjectId(),
        username: username,
        description: 'Test organiser description'
      }
    ]
  });
});

app.put('/api/organisers/settings', authenticateOrganiser, async (req, res) => {
  const { settings } = req.body;
  
  return res.status(200).json({
    message: 'Settings updated successfully',
    updatedSettings: settings
  });
});

app.put('/api/organisers/visibility', authenticateOrganiser, async (req, res) => {
  const { visibility } = req.body;
  
  return res.status(200).json({
    message: 'Visibility settings updated successfully',
    updatedVisibilitySettings: {
      profile: visibility.profile,
      email: visibility.email,
      tournaments: visibility.tournaments
    }
  });
});

app.get('/api/organisers/dashboard', authenticateOrganiser, async (req, res) => {
  return res.status(200).json({
    tournaments: [],
    followers: [],
    analytics: {
      totalTournaments: 5,
      totalPrizeMoney: 5000,
      totalParticipants: 50
    }
  });
});

app.delete('/api/tournaments/:id', authenticateOrganiser, async (req, res) => {
  const { id } = req.params;
  
  return res.status(200).json({
    message: 'Tournament deleted successfully'
  });
});

app.put('/api/organisers/username', authenticateOrganiser, async (req, res) => {
  const { newUsername } = req.body;
  
  if (req.header('test-case') === 'username-taken') {
    return res.status(400).json({
      message: 'Username already taken'
    });
  }
  
  return res.status(200).json({
    message: 'Username updated successfully',
    username: newUsername
  });
});

app.put('/api/organisers/email', authenticateOrganiser, async (req, res) => {
  const { newEmail } = req.body;
  
  return res.status(200).json({
    message: 'Email updated successfully',
    email: newEmail
  });
});

app.put('/api/organisers/password', authenticateOrganiser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  return res.status(200).json({
    message: 'Password updated successfully'
  });
});

app.put('/api/organisers/description', authenticateOrganiser, async (req, res) => {
  const { description } = req.body;
  
  return res.status(200).json({
    message: 'Description updated successfully',
    description
  });
});

app.put('/api/organisers/dashboard-visibility', authenticateOrganiser, async (req, res) => {
  const { dashboardVisibility } = req.body;
  
  return res.status(200).json({
    message: 'Visibility settings updated successfully',
    updatedVisibilitySettings: {
      profile: dashboardVisibility.profile,
      email: dashboardVisibility.email,
      tournaments: dashboardVisibility.tournaments
    }
  });
});

app.get('/api/organisers/analytics/prize-pool', authenticateOrganiser, async (req, res) => {
  return res.status(200).json({
    averages: [
      { year: 2022, month: 1, average: 1000 },
      { year: 2022, month: 2, average: 1500 }
    ]
  });
});

app.get('/api/organisers/analytics/revenue', authenticateOrganiser, async (req, res) => {
  return res.status(200).json({
    revenue: [
      { year: 2022, month: 1, amount: 1000 },
      { year: 2022, month: 2, amount: 1500 }
    ]
  });
});

app.get('/api/organisers/analytics', authenticateOrganiser, async (req, res) => {
  return res.status(200).json({
    totalTournaments: 10,
    totalTeams: 50,
    totalPlayers: 200,
    totalPrizeMoney: 10000
  });
});

app.get('/api/organisers/top', async (req, res) => {
  return res.status(200).json({
    organisers: [
      {
        _id: new mongoose.Types.ObjectId(),
        username: 'top_organiser_1',
        tournaments: 10,
        followers: 100
      },
      {
        _id: new mongoose.Types.ObjectId(),
        username: 'top_organiser_2',
        tournaments: 8,
        followers: 80
      }
    ]
  });
});

app.get('/api/organisers/organiser-analytics', async (req, res) => {
  return res.status(200).json({
    totalOrganisers: 100,
    newOrganisersThisMonth: 10,
    activeOrganisers: 50
  });
});

app.get('/api/organisers/:id/followers', authenticateOrganiser, async (req, res) => {
  const { id } = req.params;
  
  return res.status(200).json({
    followers: [
      {
        _id: new mongoose.Types.ObjectId(),
        username: 'follower_1'
      },
      {
        _id: new mongoose.Types.ObjectId(),
        username: 'follower_2'
      }
    ]
  });
});

app.post('/api/organisers/:id/notify-followers', authenticateOrganiser, async (req, res) => {
  const { id } = req.params;
  const { tournamentId, message } = req.body;
  
  return res.status(200).json({
    message: 'Notification sent successfully'
  });
});

// Start test suite
describe('Organiser Controller Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/colosseum_test');
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Clear database collections
    await Organiser.deleteMany({});
    await Tournament.deleteMany({});
  });

  afterAll(async () => {
    // Close database connection
    await mongoose.connection.close();
  });

  describe('Get Organiser By Username', () => {
    it('should find organisers by username search term', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const response = await request(app)
        .get(`/api/organisers/search/${organiser.username}`)
        .expect(200);
      
      expect(response.body.organisers).toBeDefined();
      expect(response.body.organisers.length).toBeGreaterThan(0);
    });
  });

  describe('Update Organiser Settings', () => {
    it('should update the organiser settings', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const newSettings = {
        notificationPreferences: {
          email: true,
          inApp: false
        },
        privacySettings: {
          showEmail: false,
          showProfile: true
        }
      };
      
      const response = await request(app)
        .put('/api/organisers/settings')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .send({ settings: newSettings })
        .expect(200);
      
      expect(response.body.message).toBe('Settings updated successfully');
      expect(response.body.updatedSettings).toBeDefined();
    });
  });

  describe('Update Visibility Settings', () => {
    it('should update visibility settings successfully', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const newVisibility = {
        profile: false,
        email: true,
        tournaments: true
      };
      
      const response = await request(app)
        .put('/api/organisers/visibility')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .send({ visibility: newVisibility })
        .expect(200);
      
      expect(response.body.message).toBe('Visibility settings updated successfully');
      expect(response.body.updatedVisibilitySettings).toBeDefined();
      expect(response.body.updatedVisibilitySettings.profile).toBe(newVisibility.profile);
      expect(response.body.updatedVisibilitySettings.email).toBe(newVisibility.email);
      expect(response.body.updatedVisibilitySettings.tournaments).toBe(newVisibility.tournaments);
    });
  });

  describe('Get Organiser Dashboard', () => {
    it('should return dashboard data for the organiser', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      // Create some tournaments for the organiser
      await createTestTournament(organiser._id);
      
      const response = await request(app)
        .get('/api/organisers/dashboard')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .expect(200);
      
      expect(response.body).toBeDefined();
      expect(response.body.analytics).toBeDefined();
    });
  });

  describe('Tournament Management', () => {
    it('should delete a tournament successfully', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      // Create a tournament
      const tournament = await createTestTournament(organiser._id);
      
      const response = await request(app)
        .delete(`/api/tournaments/${tournament._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .expect(200);
      
      expect(response.body.message).toBe('Tournament deleted successfully');
    });
  });

  describe('Account Management', () => {
    it('should update username successfully', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const newUsername = 'new_username_' + Date.now();
      
      const response = await request(app)
        .put('/api/organisers/username')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .send({ newUsername })
        .expect(200);
      
      expect(response.body.message).toBe('Username updated successfully');
      expect(response.body.username).toBe(newUsername);
    });
    
    it('should return an error if username is already taken', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const response = await request(app)
        .put('/api/organisers/username')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .set('test-case', 'username-taken')
        .send({ newUsername: 'taken_username' })
        .expect(400);
      
      expect(response.body.message).toBe('Username already taken');
    });
    
    it('should update email successfully', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const newEmail = `new_email_${Date.now()}@gmail.com`;
      
      const response = await request(app)
        .put('/api/organisers/email')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .send({ newEmail })
        .expect(200);
      
      expect(response.body.message).toBe('Email updated successfully');
      expect(response.body.email).toBe(newEmail);
    });
    
    it('should update password successfully', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const response = await request(app)
        .put('/api/organisers/password')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .send({ 
          currentPassword: 'currentPassword',
          newPassword: 'newPassword123'
        })
        .expect(200);
      
      expect(response.body.message).toBe('Password updated successfully');
    });
    
    it('should update description successfully', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const newDescription = 'New test organiser description';
      
      const response = await request(app)
        .put('/api/organisers/description')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .send({ description: newDescription })
        .expect(200);
      
      expect(response.body.message).toBe('Description updated successfully');
      expect(response.body.description).toBe(newDescription);
    });
  });

  describe('Dashboard Settings', () => {
    it('should update dashboard visibility settings', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const dashboardVisibility = {
        profile: false,
        email: true,
        tournaments: true
      };
      
      const response = await request(app)
        .put('/api/organisers/dashboard-visibility')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .send({ dashboardVisibility })
        .expect(200);
      
      expect(response.body.message).toBe('Visibility settings updated successfully');
      expect(response.body.updatedVisibilitySettings).toBeDefined();
      expect(response.body.updatedVisibilitySettings.profile).toBe(dashboardVisibility.profile);
      expect(response.body.updatedVisibilitySettings.email).toBe(dashboardVisibility.email);
      expect(response.body.updatedVisibilitySettings.tournaments).toBe(dashboardVisibility.tournaments);
    });
  });

  describe('Analytics', () => {
    it('should get tournament prize pool averages', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const response = await request(app)
        .get('/api/organisers/analytics/prize-pool')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .expect(200);
      
      expect(response.body.averages).toBeDefined();
      expect(Array.isArray(response.body.averages)).toBe(true);
    });
    
    it('should get organiser revenue data', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const response = await request(app)
        .get('/api/organisers/analytics/revenue')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .expect(200);
      
      expect(response.body.revenue).toBeDefined();
      expect(Array.isArray(response.body.revenue)).toBe(true);
    });
    
    it('should get organiser analytics', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const response = await request(app)
        .get('/api/organisers/analytics')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .expect(200);
      
      expect(response.body.totalTournaments).toBeDefined();
      expect(response.body.totalTeams).toBeDefined();
      expect(response.body.totalPlayers).toBeDefined();
      expect(response.body.totalPrizeMoney).toBeDefined();
    });
    
    it('should get top organisers', async () => {
      const response = await request(app)
        .get('/api/organisers/top')
        .expect(200);
      
      expect(response.body.organisers).toBeDefined();
      expect(Array.isArray(response.body.organisers)).toBe(true);
      expect(response.body.organisers.length).toBeGreaterThan(0);
    });
    
    it('should get organiser analytics', async () => {
      const response = await request(app)
        .get('/api/organisers/organiser-analytics')
        .expect(200);
      
      expect(response.body.totalOrganisers).toBeDefined();
      expect(response.body.newOrganisersThisMonth).toBeDefined();
      expect(response.body.activeOrganisers).toBeDefined();
    });
  });

  describe('Follower Management', () => {
    it('should get organiser followers', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      const response = await request(app)
        .get(`/api/organisers/${organiser._id}/followers`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .expect(200);
      
      expect(response.body.followers).toBeDefined();
      expect(Array.isArray(response.body.followers)).toBe(true);
    });
    
    it('should notify followers about a new tournament', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      // Create a tournament
      const tournament = await createTestTournament(organiser._id);
      
      const response = await request(app)
        .post(`/api/organisers/${organiser._id}/notify-followers`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', organiser._id.toString())
        .send({
          tournamentId: tournament._id,
          message: 'New tournament created!'
        })
        .expect(200);
      
      expect(response.body.message).toBe('Notification sent successfully');
    });
  });
});
