const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Organiser = require('../../models/Organiser');
const Tournament = require('../../models/Tournament');
const Player = require('../../models/Player');
const organiserController = require('../organiserController');
const { authenticateUser } = require('../../middleware/authMiddleware');
const { 
  createTestOrganiser, 
  createTestPlayer,
  generateAuthToken, 
  generateObjectId 
} = require('../../test/testUtils');

// Mock middleware
jest.mock('../../middleware/authMiddleware', () => ({
  authenticateUser: jest.fn((req, res, next) => {
    if (req.headers.authorization) {
      req.user = { 
        id: req.headers['user-id'] || 'mockUserId', 
        role: req.headers['user-role'] || 'organiser' 
      };
    }
    next();
  })
}));

// Setup express app for testing
const app = express();
app.use(express.json());

// Register organiser routes for testing
app.get('/api/organiser/profile', authenticateUser, organiserController.getOrganiserProfile);
app.put('/api/organiser/profile', authenticateUser, organiserController.updateOrganiserProfile);
app.get('/api/organiser/tournaments', authenticateUser, organiserController.getOrganiserTournaments);
app.get('/api/organiser/:id/tournaments', organiserController.getPublicOrganiserTournaments);
app.get('/api/organiser/followers', authenticateUser, organiserController.getFollowers);
app.post('/api/organiser/notify-followers', authenticateUser, organiserController.notifyFollowers);
app.get('/api/organiser/analytics', authenticateUser, organiserController.getAnalytics);

// Load test setup
require('../../test/setup');

describe('Organiser Controller Tests', () => {
  describe('Get Organiser Profile', () => {
    it('should return the organiser profile', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser({
        username: 'profileorganiser',
        email: 'profileorg@gmail.com'
      });

      const response = await request(app)
        .get('/api/organiser/profile')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.username).toBe('profileorganiser');
      expect(response.body.email).toBe('profileorg@gmail.com');
    });

    it('should return 404 if organiser not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get('/api/organiser/profile')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', nonExistentId.toString())
        .set('user-role', 'organiser')
        .expect(404);

      expect(response.body.errorMessage).toBe('Organiser not found');
    });
  });

  describe('Update Organiser Profile', () => {
    it('should update the organiser profile', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser({
        username: 'updateorganiser',
        email: 'updateorg@gmail.com'
      });

      const updatedData = {
        username: 'updatedorganiser',
        bio: 'Updated bio information'
      };

      const response = await request(app)
        .put('/api/organiser/profile')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .send(updatedData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      
      // Verify the update in the database
      const updatedOrganiser = await Organiser.findById(organiser._id);
      expect(updatedOrganiser.username).toBe('updatedorganiser');
      expect(updatedOrganiser.bio).toBe('Updated bio information');
    });

    it('should return 400 if username already exists', async () => {
      // Create two test organisers
      const organiser1 = await createTestOrganiser({
        username: 'existingorganiser1',
        email: 'org1@gmail.com'
      });

      const organiser2 = await createTestOrganiser({
        username: 'organiser2',
        email: 'org2@gmail.com'
      });

      // Try to update organiser2's username to organiser1's username
      const response = await request(app)
        .put('/api/organiser/profile')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', organiser2._id.toString())
        .set('user-role', 'organiser')
        .send({ username: 'existingorganiser1' })
        .expect(400);

      expect(response.body.errorMessage).toBe('Username already exists');
    });
  });

  describe('Get Organiser Tournaments', () => {
    it('should return tournaments created by the organiser', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      // Create test tournaments
      const tournament1 = new Tournament({
        tid: 'O123',
        name: 'Organiser Tournament 1',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Approved'
      });
      
      const tournament2 = new Tournament({
        tid: 'O456',
        name: 'Organiser Tournament 2',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 2),
        organiser: organiser._id,
        status: 'Pending'
      });
      
      await tournament1.save();
      await tournament2.save();

      const response = await request(app)
        .get('/api/organiser/tournaments')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Organiser Tournament 1');
      expect(response.body[1].name).toBe('Organiser Tournament 2');
    });

    it('should return public tournaments for a specific organiser', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      // Create test tournaments with different statuses
      const approvedTournament = new Tournament({
        tid: 'O789',
        name: 'Approved Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Approved'
      });
      
      const pendingTournament = new Tournament({
        tid: 'O101',
        name: 'Pending Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Pending'
      });
      
      await approvedTournament.save();
      await pendingTournament.save();

      // Public endpoint should only return approved tournaments
      const response = await request(app)
        .get(`/api/organiser/${organiser._id}/tournaments`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Approved Tournament');
      expect(response.body[0].status).toBe('Approved');
    });
  });

  describe('Follower Management', () => {
    it('should get organiser followers', async () => {
      // Create a test organiser and followers
      const organiser = await createTestOrganiser();
      const follower1 = await createTestPlayer();
      const follower2 = await createTestPlayer();
      
      // Make players follow the organiser
      follower1.following.push(organiser._id);
      follower2.following.push(organiser._id);
      await follower1.save();
      await follower2.save();

      const response = await request(app)
        .get('/api/organiser/followers')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(2);
      expect(response.body[0]._id.toString()).toBe(follower1._id.toString());
      expect(response.body[1]._id.toString()).toBe(follower2._id.toString());
    });

    it('should notify followers about a new tournament', async () => {
      // Create a test organiser and followers
      const organiser = await createTestOrganiser();
      const follower1 = await createTestPlayer();
      const follower2 = await createTestPlayer();
      
      // Make players follow the organiser
      follower1.following.push(organiser._id);
      follower2.following.push(organiser._id);
      await follower1.save();
      await follower2.save();
      
      // Create a tournament
      const tournament = new Tournament({
        tid: 'N123',
        name: 'Notification Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Approved'
      });
      await tournament.save();

      const notificationData = {
        message: 'New tournament announced: Notification Tournament',
        tournamentId: tournament._id
      };

      const response = await request(app)
        .post('/api/organiser/notify-followers')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .send(notificationData)
        .expect(200);

      expect(response.body.message).toBe('Followers notified successfully');
      
      // Verify followers received notifications
      const updatedFollower1 = await Player.findById(follower1._id);
      const updatedFollower2 = await Player.findById(follower2._id);
      
      expect(updatedFollower1.notifications.length).toBe(1);
      expect(updatedFollower1.notifications[0].message).toBe(notificationData.message);
      
      expect(updatedFollower2.notifications.length).toBe(1);
      expect(updatedFollower2.notifications[0].message).toBe(notificationData.message);
    });
  });

  describe('Analytics', () => {
    it('should get organiser analytics', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();
      
      // Create test tournaments with different statuses and dates
      const completedTournament = new Tournament({
        tid: 'A123',
        name: 'Completed Tournament',
        startDate: new Date(Date.now() - 86400000 * 2),
        endDate: new Date(Date.now() - 86400000),
        organiser: organiser._id,
        status: 'Completed',
        entryFee: 100,
        prizePool: 1000,
        revenue: 500,
        teams: [generateObjectId(), generateObjectId()]
      });
      
      const approvedTournament = new Tournament({
        tid: 'A456',
        name: 'Approved Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Approved',
        entryFee: 50,
        prizePool: 500,
        teams: [generateObjectId()]
      });
      
      await completedTournament.save();
      await approvedTournament.save();
      
      // Create followers
      const follower1 = await createTestPlayer();
      const follower2 = await createTestPlayer();
      
      follower1.following.push(organiser._id);
      follower2.following.push(organiser._id);
      await follower1.save();
      await follower2.save();

      const response = await request(app)
        .get('/api/organiser/analytics')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.totalTournaments).toBe(2);
      expect(response.body.completedTournaments).toBe(1);
      expect(response.body.totalRevenue).toBe(500);
      expect(response.body.totalFollowers).toBe(2);
      expect(response.body.totalTeams).toBe(3);
    });
  });
});
