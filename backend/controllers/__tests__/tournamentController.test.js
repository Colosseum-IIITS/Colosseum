const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Tournament = require('../../models/Tournament');
const Organiser = require('../../models/Organiser');
const Team = require('../../models/Team');
const Player = require('../../models/Player');
const tournamentController = require('../tournmentController');
const { authenticateUser } = require('../../middleware/authMiddleware');
const { 
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
        role: req.headers['user-role'] || 'organiser' 
      };
    }
    next();
  })
}));

// Setup express app for testing
const app = express();
app.use(express.json());

// Register tournament routes for testing
app.post('/api/tournament', authenticateUser, tournamentController.createTournament);
app.get('/api/tournament', tournamentController.getAllTournaments);
app.get('/api/tournament/:id', tournamentController.getTournamentById);
app.put('/api/tournament/:id', authenticateUser, tournamentController.updateTournament);
app.delete('/api/tournament/:id', authenticateUser, tournamentController.deleteTournament);
app.post('/api/tournament/:id/join', authenticateUser, tournamentController.joinTournament);

// Load test setup
require('../../test/setup');

describe('Tournament Controller Tests', () => {
  describe('Create Tournament', () => {
    it('should create a new tournament', async () => {
      // Create a test organiser
      const organiser = await createTestOrganiser();

      const tournamentData = {
        name: 'Test Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // Tomorrow
        entryFee: 100,
        prizePool: 1000,
        description: 'Test tournament description'
      };

      const response = await request(app)
        .post('/api/tournament')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .send(tournamentData)
        .expect(201);

      expect(response.body.message).toBe('Tournament created successfully');
      expect(response.body.tournament).toBeDefined();
      expect(response.body.tournament.name).toBe(tournamentData.name);
      expect(response.body.tournament.organiser.toString()).toBe(organiser._id.toString());
      
      // Verify tournament was created in the database
      const tournament = await Tournament.findById(response.body.tournament._id);
      expect(tournament).toBeTruthy();
      expect(tournament.name).toBe(tournamentData.name);
    });

    it('should return 403 if user is not an organiser', async () => {
      // Create a test player
      const player = await createTestPlayer();

      const tournamentData = {
        name: 'Test Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // Tomorrow
        entryFee: 100,
        prizePool: 1000
      };

      const response = await request(app)
        .post('/api/tournament')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .set('user-role', 'player')
        .send(tournamentData)
        .expect(403);

      expect(response.body.errorMessage).toBe('Only organisers can create tournaments');
    });
  });

  describe('Get Tournaments', () => {
    it('should get all tournaments', async () => {
      // Create test tournaments
      const organiser = await createTestOrganiser();
      
      const tournament1 = new Tournament({
        tid: 'T123',
        name: 'Tournament 1',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Approved'
      });
      
      const tournament2 = new Tournament({
        tid: 'T456',
        name: 'Tournament 2',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 2),
        organiser: organiser._id,
        status: 'Approved'
      });
      
      await tournament1.save();
      await tournament2.save();

      const response = await request(app)
        .get('/api/tournament')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Tournament 1');
      expect(response.body[1].name).toBe('Tournament 2');
    });

    it('should get a tournament by ID', async () => {
      // Create a test tournament
      const organiser = await createTestOrganiser();
      
      const tournament = new Tournament({
        tid: 'T789',
        name: 'Specific Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Approved'
      });
      
      await tournament.save();

      const response = await request(app)
        .get(`/api/tournament/${tournament._id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe('Specific Tournament');
      expect(response.body._id.toString()).toBe(tournament._id.toString());
    });
  });

  describe('Update Tournament', () => {
    it('should update a tournament', async () => {
      // Create a test organiser and tournament
      const organiser = await createTestOrganiser();
      
      const tournament = new Tournament({
        tid: 'T101',
        name: 'Original Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser._id,
        status: 'Approved'
      });
      
      await tournament.save();

      const updateData = {
        name: 'Updated Tournament',
        prizePool: 2000
      };

      const response = await request(app)
        .put(`/api/tournament/${tournament._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', organiser._id.toString())
        .set('user-role', 'organiser')
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Tournament updated successfully');
      
      // Verify the update in the database
      const updatedTournament = await Tournament.findById(tournament._id);
      expect(updatedTournament.name).toBe('Updated Tournament');
      expect(updatedTournament.prizePool).toBe(2000);
    });

    it('should return 403 if user is not the tournament organiser', async () => {
      // Create two test organisers
      const organiser1 = await createTestOrganiser();
      const organiser2 = await createTestOrganiser();
      
      // Create a tournament owned by organiser1
      const tournament = new Tournament({
        tid: 'T102',
        name: 'Original Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        organiser: organiser1._id,
        status: 'Approved'
      });
      
      await tournament.save();

      // Try to update as organiser2
      const response = await request(app)
        .put(`/api/tournament/${tournament._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', organiser2._id.toString())
        .set('user-role', 'organiser')
        .send({ name: 'Attempted Update' })
        .expect(403);

      expect(response.body.errorMessage).toBe('You are not authorized to update this tournament');
    });
  });

  describe('Join Tournament', () => {
    it('should allow a team to join a tournament', async () => {
      // Create test data
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();
      
      // Create a team
      const team = new Team({
        name: 'Test Team',
        captain: player._id,
        members: [player._id]
      });
      await team.save();
      
      // Update player with team
      player.team = team._id;
      await player.save();
      
      // Create a tournament
      const tournament = new Tournament({
        tid: 'T103',
        name: 'Joinable Tournament',
        startDate: new Date(Date.now() + 86400000), // Future date
        endDate: new Date(Date.now() + 86400000 * 2),
        organiser: organiser._id,
        status: 'Approved',
        entryFee: 100
      });
      await tournament.save();

      const response = await request(app)
        .post(`/api/tournament/${tournament._id}/join`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .set('user-role', 'player')
        .expect(200);

      expect(response.body.message).toBe('Successfully joined the tournament');
      
      // Verify the tournament has the team
      const updatedTournament = await Tournament.findById(tournament._id);
      expect(updatedTournament.teams).toContainEqual(team._id);
      
      // Verify the player has the tournament
      const updatedPlayer = await Player.findById(player._id);
      const playerTournament = updatedPlayer.tournaments.find(t => 
        t.tournament.toString() === tournament._id.toString()
      );
      expect(playerTournament).toBeDefined();
    });

    it('should return 400 if player does not have a team', async () => {
      // Create a player without a team
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();
      
      // Create a tournament
      const tournament = new Tournament({
        tid: 'T104',
        name: 'Another Tournament',
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 86400000 * 2),
        organiser: organiser._id,
        status: 'Approved'
      });
      await tournament.save();

      const response = await request(app)
        .post(`/api/tournament/${tournament._id}/join`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .set('user-role', 'player')
        .expect(400);

      expect(response.body.errorMessage).toBe('You need to be part of a team to join a tournament');
    });
  });
});
