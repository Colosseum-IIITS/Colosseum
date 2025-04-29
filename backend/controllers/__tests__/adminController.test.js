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
app.get('/admin/dashboard', authenticateUser, adminController.getDashboard);
app.get('/admin/ban-history', authenticateUser, adminController.getBanHistory);
app.put('/admin/ban-player/:id', authenticateUser, adminController.banPlayer);
app.put('/admin/unban-player/:id', authenticateUser, adminController.unBanPlayer);
app.put('/admin/ban-organiser/:id', authenticateUser, adminController.banOrganiser);
app.put('/admin/unban-organiser/:id', authenticateUser, adminController.unBanOrganiser);
app.delete('/admin/organiser/:id', authenticateUser, adminController.deleteOrganiser);
app.delete('/admin/player/:id', authenticateUser, adminController.deletePlayer);
app.put('/admin/approve-tournament/:id', authenticateUser, adminController.approveTournament);
app.get('/admin/reports', authenticateUser, adminController.fetchOrganiserReportsForAdmin);
app.put('/admin/reports/:id/review', authenticateUser, adminController.reviewedOrNot);

// Load test setup
require('../../test/setup');

describe('Admin Controller Tests', () => {
  describe('Ban and Unban Player', () => {
    it('should ban a player successfully', async () => {
      // Create test data
      const admin = await createTestAdmin();
      const player = await createTestPlayer();

      const banData = {
        reason: 'Violating platform rules'
      };

      const response = await request(app)
        .put(`/admin/ban-player/${player._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .send(banData)
        .expect(200);

      expect(response.body.message).toBe('Player banned successfully.');
      
      // Verify player is banned in the database
      const bannedPlayer = await Player.findById(player._id);
      expect(bannedPlayer.banned).toBe(true);
      
      // Verify ban history entry was created
      const banHistory = await BanHistory.findOne({ 
        bannedEntity: player._id,
        entityType: 'Player'
      });
      expect(banHistory).toBeTruthy();
      expect(banHistory.reason).toBe('Violating platform rules');
    });

    it('should return 404 if player to ban is not found', async () => {
      const admin = await createTestAdmin();
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/admin/ban-player/${nonExistentId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .send({ reason: 'Test reason' })
        .expect(404);

      expect(response.body.error).toBe('Player not found');
    });

    it('should unban a player successfully', async () => {
      // Create a banned player with ban history
      const admin = await createTestAdmin();
      const player = await createTestPlayer({ banned: true });
      
      // Create ban history record
      const banHistory = new BanHistory({
        bannedEntity: player._id,
        entityType: 'Player',
        reason: 'Previous violation',
        active: true
      });
      await banHistory.save();

      const response = await request(app)
        .put(`/admin/unban-player/${player._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body.message).toBe('Player unbanned successfully.');
      
      // Verify player is unbanned in the database
      const unbannedPlayer = await Player.findById(player._id);
      expect(unbannedPlayer.banned).toBe(false);
      
      // Verify ban history is updated
      const updatedBanHistory = await BanHistory.findOne({ 
        bannedEntity: player._id,
        entityType: 'Player'
      });
      expect(updatedBanHistory.active).toBe(false);
    });
  });

  describe('Ban and Unban Organiser', () => {
    it('should ban an organiser successfully', async () => {
      const admin = await createTestAdmin();
      const organiser = await createTestOrganiser();

      const banData = {
        reason: 'Policy violation'
      };

      const response = await request(app)
        .put(`/admin/ban-organiser/${organiser._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .send(banData)
        .expect(200);

      expect(response.body.message).toBe('Organiser banned successfully.');
      
      // Verify organiser is banned in database
      const bannedOrganiser = await Organiser.findById(organiser._id);
      expect(bannedOrganiser.banned).toBe(true);
      
      // Verify ban history was created
      const banHistory = await BanHistory.findOne({ 
        bannedEntity: organiser._id,
        entityType: 'Organiser'
      });
      expect(banHistory).toBeTruthy();
      expect(banHistory.reason).toBe('Policy violation');
    });

    it('should return 404 if organiser to ban is not found', async () => {
      const admin = await createTestAdmin();
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/admin/ban-organiser/${nonExistentId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .send({ reason: 'Test reason' })
        .expect(404);

      expect(response.body.error).toBe('Organiser not found');
    });

    it('should unban an organiser successfully', async () => {
      const admin = await createTestAdmin();
      const organiser = await createTestOrganiser({ banned: true });
      
      // Create ban history record
      const banHistory = new BanHistory({
        bannedEntity: organiser._id,
        entityType: 'Organiser',
        reason: 'Previous violation',
        active: true
      });
      await banHistory.save();

      const response = await request(app)
        .put(`/admin/unban-organiser/${organiser._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body.message).toBe('Organiser unbanned successfully.');
      
      // Verify organiser is unbanned
      const unbannedOrganiser = await Organiser.findById(organiser._id);
      expect(unbannedOrganiser.banned).toBe(false);
      
      // Verify ban history is updated
      const updatedBanHistory = await BanHistory.findOne({ 
        bannedEntity: organiser._id,
        entityType: 'Organiser'
      });
      expect(updatedBanHistory.active).toBe(false);
    });
  });

  describe('Delete User', () => {
    it('should delete a player successfully', async () => {
      const admin = await createTestAdmin();
      const player = await createTestPlayer();

      const response = await request(app)
        .delete(`/admin/player/${player._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body.message).toBe('Player deleted successfully.');
      
      // Verify player was deleted
      const deletedPlayer = await Player.findById(player._id);
      expect(deletedPlayer).toBeNull();
    });

    it('should delete an organiser successfully', async () => {
      const admin = await createTestAdmin();
      const organiser = await createTestOrganiser();

      const response = await request(app)
        .delete(`/admin/organiser/${organiser._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body.message).toBe('Organiser deleted successfully.');
      
      // Verify organiser was deleted
      const deletedOrganiser = await Organiser.findById(organiser._id);
      expect(deletedOrganiser).toBeNull();
    });
  });

  describe('Tournament Management', () => {
    it('should approve a tournament successfully', async () => {
      // Create test data
      const admin = await createTestAdmin();
      const organiser = await createTestOrganiser();
      
      // Create a pending tournament
      const tournament = new Tournament({
        tid: 'T101',
        name: 'Test Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Pending'
      });
      await tournament.save();

      const response = await request(app)
        .put(`/admin/approve-tournament/${tournament._id}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body.message).toBe('Tournament approved successfully.');
      
      // Verify tournament status is updated in database
      const updatedTournament = await Tournament.findById(tournament._id);
      expect(updatedTournament.status).toBe('Approved');
    });

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
