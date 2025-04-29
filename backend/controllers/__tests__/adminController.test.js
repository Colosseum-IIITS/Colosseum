const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Admin = require('../../models/Admin');
const Player = require('../../models/Player');
const Organiser = require('../../models/Organiser');
const Tournament = require('../../models/Tournament');
const BanHistory = require('../../models/BanHistory');
const adminController = require('../adminController');
const { authenticateUser } = require('../../middleware/authMiddleware');
const { 
  createTestAdmin,
  createTestPlayer,
  createTestOrganiser,
  generateAuthToken, 
  generateObjectId 
} = require('../../test/testUtils');

// Mock middleware
jest.mock('../../middleware/authMiddleware', () => ({
  authenticateUser: jest.fn((req, res, next) => {
    if (req.headers.authorization) {
      req.user = { 
        id: req.headers['user-id'] || 'mockUserId', 
        role: req.headers['user-role'] || 'admin' 
      };
    }
    next();
  })
}));

// Setup express app for testing
const app = express();
app.use(express.json());

// Register admin routes for testing
app.get('/admin/dashboard', authenticateUser, adminController.getDashboardStats);
app.get('/admin/players', authenticateUser, adminController.getAllPlayers);
app.get('/admin/organisers', authenticateUser, adminController.getAllOrganisers);
app.get('/admin/tournaments', authenticateUser, adminController.getAllTournaments);
app.put('/admin/approve-tournament/:id', authenticateUser, adminController.approveTournament);
app.put('/admin/reject-tournament/:id', authenticateUser, adminController.rejectTournament);
app.put('/admin/ban-player/:id', authenticateUser, adminController.banPlayer);
app.put('/admin/unban-player/:id', authenticateUser, adminController.unbanPlayer);
app.put('/admin/ban-organiser/:id', authenticateUser, adminController.banOrganiser);
app.put('/admin/unban-organiser/:id', authenticateUser, adminController.unbanOrganiser);
app.get('/admin/ban-history', authenticateUser, adminController.getBanHistory);

// Load test setup
require('../../test/setup');

describe('Admin Controller Tests', () => {
  describe('Dashboard Stats', () => {
    it('should return dashboard statistics', async () => {
      // Create test data
      const admin = await createTestAdmin();
      
      // Create players
      await createTestPlayer();
      await createTestPlayer();
      
      // Create organisers
      await createTestOrganiser();
      
      // Create tournaments with different statuses
      const pendingTournament = new Tournament({
        tid: 'D123',
        name: 'Pending Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: generateObjectId(),
        status: 'Pending'
      });
      
      const approvedTournament = new Tournament({
        tid: 'D456',
        name: 'Approved Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: generateObjectId(),
        status: 'Approved'
      });
      
      const completedTournament = new Tournament({
        tid: 'D789',
        name: 'Completed Tournament',
        startDate: new Date(Date.now() - 86400000 * 2),
        endDate: new Date(Date.now() - 86400000),
        organiser: generateObjectId(),
        status: 'Completed'
      });
      
      await pendingTournament.save();
      await approvedTournament.save();
      await completedTournament.save();

      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.totalPlayers).toBe(2);
      expect(response.body.totalOrganisers).toBe(1);
      expect(response.body.totalTournaments).toBe(3);
      expect(response.body.pendingTournaments).toBe(1);
      expect(response.body.approvedTournaments).toBe(1);
      expect(response.body.completedTournaments).toBe(1);
    });
  });

  describe('User Management', () => {
    it('should return all players', async () => {
      // Create test data
      const admin = await createTestAdmin();
      await createTestPlayer({ username: 'player1' });
      await createTestPlayer({ username: 'player2' });

      const response = await request(app)
        .get('/admin/players')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(2);
      expect(response.body.map(p => p.username)).toContain('player1');
      expect(response.body.map(p => p.username)).toContain('player2');
    });

    it('should return all organisers', async () => {
      // Create test data
      const admin = await createTestAdmin();
      await createTestOrganiser({ username: 'organiser1' });
      await createTestOrganiser({ username: 'organiser2' });

      const response = await request(app)
        .get('/admin/organisers')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(2);
      expect(response.body.map(o => o.username)).toContain('organiser1');
      expect(response.body.map(o => o.username)).toContain('organiser2');
    });

    it('should ban a player', async () => {
      // Create test data
      const admin = await createTestAdmin();
      const player = await createTestPlayer();

      const banData = {
        reason: 'Violating platform rules'
      };

      const response = await request(app)
        .put(`/admin/ban-player/${player._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .send(banData)
        .expect(200);

      expect(response.body.message).toBe('Player banned successfully');
      
      // Verify player is banned
      const bannedPlayer = await Player.findById(player._id);
      expect(bannedPlayer.banned).toBe(true);
      
      // Verify ban history is created
      const banHistory = await BanHistory.findOne({ bannedEntity: player._id });
      expect(banHistory).toBeTruthy();
      expect(banHistory.reason).toBe('Violating platform rules');
      expect(banHistory.entityType).toBe('Player');
      expect(banHistory.active).toBe(true);
    });

    it('should unban a player', async () => {
      // Create test data
      const admin = await createTestAdmin();
      const player = await createTestPlayer({ banned: true });
      
      // Create ban history
      const banHistory = new BanHistory({
        bannedEntity: player._id,
        entityType: 'Player',
        reason: 'Previous violation',
        date: new Date(),
        active: true
      });
      await banHistory.save();

      const response = await request(app)
        .put(`/admin/unban-player/${player._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body.message).toBe('Player unbanned successfully');
      
      // Verify player is unbanned
      const unbannedPlayer = await Player.findById(player._id);
      expect(unbannedPlayer.banned).toBe(false);
      
      // Verify ban history is updated
      const updatedBanHistory = await BanHistory.findOne({ bannedEntity: player._id });
      expect(updatedBanHistory.active).toBe(false);
    });

    it('should ban an organiser', async () => {
      // Create test data
      const admin = await createTestAdmin();
      const organiser = await createTestOrganiser();

      const banData = {
        reason: 'Fraudulent tournament activity'
      };

      const response = await request(app)
        .put(`/admin/ban-organiser/${organiser._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .send(banData)
        .expect(200);

      expect(response.body.message).toBe('Organiser banned successfully');
      
      // Verify organiser is banned
      const bannedOrganiser = await Organiser.findById(organiser._id);
      expect(bannedOrganiser.banned).toBe(true);
      
      // Verify ban history is created
      const banHistory = await BanHistory.findOne({ bannedEntity: organiser._id });
      expect(banHistory).toBeTruthy();
      expect(banHistory.reason).toBe('Fraudulent tournament activity');
      expect(banHistory.entityType).toBe('Organiser');
      expect(banHistory.active).toBe(true);
    });
  });

  describe('Tournament Management', () => {
    it('should return all tournaments', async () => {
      // Create test data
      const admin = await createTestAdmin();
      const organiser = await createTestOrganiser();
      
      // Create tournaments
      const tournament1 = new Tournament({
        tid: 'AT123',
        name: 'Admin Test Tournament 1',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Pending'
      });
      
      const tournament2 = new Tournament({
        tid: 'AT456',
        name: 'Admin Test Tournament 2',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Approved'
      });
      
      await tournament1.save();
      await tournament2.save();

      const response = await request(app)
        .get('/admin/tournaments')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(2);
      expect(response.body.map(t => t.name)).toContain('Admin Test Tournament 1');
      expect(response.body.map(t => t.name)).toContain('Admin Test Tournament 2');
    });

    it('should approve a pending tournament', async () => {
      // Create test data
      const admin = await createTestAdmin();
      const organiser = await createTestOrganiser();
      
      // Create a pending tournament
      const tournament = new Tournament({
        tid: 'AP123',
        name: 'Pending Approval Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Pending'
      });
      await tournament.save();

      const response = await request(app)
        .put(`/admin/approve-tournament/${tournament._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body.message).toBe('Tournament approved successfully');
      
      // Verify tournament status is updated
      const approvedTournament = await Tournament.findById(tournament._id);
      expect(approvedTournament.status).toBe('Approved');
      
      // Verify organiser received a notification
      const updatedOrganiser = await Organiser.findById(organiser._id);
      expect(updatedOrganiser.notifications.length).toBe(1);
      expect(updatedOrganiser.notifications[0].message).toContain('has been approved');
    });

    it('should reject a pending tournament', async () => {
      // Create test data
      const admin = await createTestAdmin();
      const organiser = await createTestOrganiser();
      
      // Create a pending tournament
      const tournament = new Tournament({
        tid: 'RJ123',
        name: 'Pending Rejection Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Pending'
      });
      await tournament.save();

      const rejectionData = {
        reason: 'Insufficient tournament details'
      };

      const response = await request(app)
        .put(`/admin/reject-tournament/${tournament._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .send(rejectionData)
        .expect(200);

      expect(response.body.message).toBe('Tournament rejected successfully');
      
      // Verify tournament is deleted
      const rejectedTournament = await Tournament.findById(tournament._id);
      expect(rejectedTournament).toBeNull();
      
      // Verify organiser received a notification
      const updatedOrganiser = await Organiser.findById(organiser._id);
      expect(updatedOrganiser.notifications.length).toBe(1);
      expect(updatedOrganiser.notifications[0].message).toContain('has been rejected');
      expect(updatedOrganiser.notifications[0].message).toContain('Insufficient tournament details');
    });
  });

  describe('Ban History', () => {
    it('should return ban history', async () => {
      // Create test data
      const admin = await createTestAdmin();
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();
      
      // Create ban history records
      const banHistory1 = new BanHistory({
        bannedEntity: player._id,
        entityType: 'Player',
        reason: 'Cheating',
        date: new Date(),
        active: true
      });
      
      const banHistory2 = new BanHistory({
        bannedEntity: organiser._id,
        entityType: 'Organiser',
        reason: 'Fraudulent activity',
        date: new Date(Date.now() - 86400000),
        active: false
      });
      
      await banHistory1.save();
      await banHistory2.save();

      const response = await request(app)
        .get('/admin/ban-history')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(2);
      expect(response.body[0].reason).toBe('Cheating');
      expect(response.body[0].entityType).toBe('Player');
      expect(response.body[0].active).toBe(true);
      
      expect(response.body[1].reason).toBe('Fraudulent activity');
      expect(response.body[1].entityType).toBe('Organiser');
      expect(response.body[1].active).toBe(false);
    });
  });
});
