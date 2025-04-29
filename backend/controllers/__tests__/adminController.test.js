const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Admin = require('../../models/Admin');
const Player = require('../../models/Player');
const Organiser = require('../../models/Organiser');
const Tournament = require('../../models/Tournament');
const BanHistory = require('../../models/BanHistory');
const Report = require('../../models/Report');
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
  });

  describe('Report Management', () => {
    it('should fetch reports successfully', async () => {
      const admin = await createTestAdmin();
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();
      
      // Create a test report
      const report = new Report({
        reportedBy: player._id,
        reportType: 'Organiser',
        reportedOrganiser: organiser._id,
        reason: 'Test report reason',
        status: 'Pending'
      });
      await report.save();

      const response = await request(app)
        .get('/admin/reports')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0].reason).toBe('Test report reason');
    });

    it('should mark a report as reviewed', async () => {
      const admin = await createTestAdmin();
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();
      
      // Create a test report
      const report = new Report({
        reportedBy: player._id,
        reportType: 'Organiser',
        reportedOrganiser: organiser._id,
        reason: 'Test report reason',
        status: 'Pending'
      });
      await report.save();

      const response = await request(app)
        .put(`/admin/reports/${report._id}/review`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .send({ status: 'Reviewed' })
        .expect(200);

      expect(response.body.status).toBe('Reviewed');
      
      // Verify report status is updated in DB
      const updatedReport = await Report.findById(report._id);
      expect(updatedReport.status).toBe('Reviewed');
    });
  });

  describe('Ban History', () => {
    it('should retrieve ban history', async () => {
      // Create test data
      const admin = await createTestAdmin();
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();
      
      // Create ban history records
      const playerBanHistory = new BanHistory({
        bannedEntity: player._id,
        entityType: 'Player',
        reason: 'Player violation',
        date: new Date(),
        active: true
      });
      
      const organiserBanHistory = new BanHistory({
        bannedEntity: organiser._id,
        entityType: 'Organiser',
        reason: 'Organiser violation',
        date: new Date(),
        active: false
      });
      
      await playerBanHistory.save();
      await organiserBanHistory.save();

      const response = await request(app)
        .get('/admin/ban-history')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.banHistory).toBeDefined();
      expect(response.body.banHistory.length).toBeGreaterThanOrEqual(2);
      
      // Check that both records are present
      const reasons = response.body.banHistory.map(record => record.reason);
      expect(reasons).toContain('Player violation');
      expect(reasons).toContain('Organiser violation');
    });
  });

  describe('Dashboard', () => {
    it('should return dashboard statistics and analytics', async () => {
      const admin = await createTestAdmin();
      
      // Create test players
      await createTestPlayer();
      await createTestPlayer();
      
      // Create test organiser
      const organiser = await createTestOrganiser();
      
      // Create test tournaments with different statuses and dates
      const pendingTournament = new Tournament({
        tid: 'DP101',
        name: 'Dashboard Pending Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Pending',
        prizePool: 1000
      });
      
      const approvedTournament = new Tournament({
        tid: 'DA201',
        name: 'Dashboard Approved Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 2),
        organiser: organiser._id,
        status: 'Approved',
        prizePool: 2000
      });
      
      const completedTournament = new Tournament({
        tid: 'DC301',
        name: 'Dashboard Completed Tournament',
        startDate: new Date(Date.now() - 86400000 * 3),
        endDate: new Date(Date.now() - 86400000),
        organiser: organiser._id,
        status: 'Completed',
        prizePool: 3000,
        revenue: 4000
      });
      
      await pendingTournament.save();
      await approvedTournament.save();
      await completedTournament.save();

      const response = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', admin._id.toString())
        .set('user-role', 'admin')
        .expect(200);

      // Verify basic stats are returned
      expect(response.body).toBeDefined();
      
      // Check players and organisers data
      expect(response.body.players).toBeDefined();
      expect(response.body.organisers).toBeDefined();
      expect(response.body.players.length).toBeGreaterThanOrEqual(2);
      expect(response.body.organisers.length).toBeGreaterThanOrEqual(1);
      
      // Verify tournament counts
      expect(response.body.tournaments).toBeDefined();
      expect(response.body.tournaments.length).toBeGreaterThanOrEqual(3);
      expect(response.body.pendingTournamentsCount).toBeGreaterThanOrEqual(1);
      expect(response.body.completedTournamentsCount).toBeGreaterThanOrEqual(1);
      
      // Verify prize pool data exists
      expect(response.body.weeklyPrizePoolData).toBeDefined();
      expect(response.body.monthlyPrizePoolData).toBeDefined();
      expect(response.body.yearlyPrizePoolData).toBeDefined();
      expect(response.body.avgWeeklyPrizePool).toBeDefined();
      expect(response.body.avgMonthlyPrizePool).toBeDefined();
      expect(response.body.avgYearlyPrizePool).toBeDefined();
    });
  });
});
