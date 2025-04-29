const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Player = require('../../models/Player');
const Tournament = require('../../models/Tournament');
const Team = require('../../models/Team');
const playerController = require('../playerController');
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
      const token = req.headers.authorization.split(' ')[1];
      req.user = { id: req.headers['user-id'] || 'mockUserId', role: 'player' };
    }
    next();
  })
}));

// Setup express app for testing
const app = express();
app.use(express.json());

// Register player routes for testing
app.get('/api/player/profile', authenticateUser, playerController.getPlayerProfile);
app.put('/api/player/profile', authenticateUser, playerController.updatePlayerProfile);
app.get('/api/player/tournaments', authenticateUser, playerController.getPlayerTournaments);
app.post('/api/player/follow/:organiserId', authenticateUser, playerController.followOrganiser);
app.delete('/api/player/unfollow/:organiserId', authenticateUser, playerController.unfollowOrganiser);

// Load test setup
require('../../test/setup');

describe('Player Controller Tests', () => {
  describe('Get Player Profile', () => {
    it('should return the player profile', async () => {
      // Create a test player
      const player = await createTestPlayer({
        username: 'profileplayer',
        email: 'profileplayer@gmail.com'
      });

      const response = await request(app)
        .get('/api/player/profile')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.username).toBe('profileplayer');
      expect(response.body.email).toBe('profileplayer@gmail.com');
    });

    it('should return 404 if player not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get('/api/player/profile')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', nonExistentId.toString())
        .expect(404);

      expect(response.body.errorMessage).toBe('Player not found');
    });
  });

  describe('Update Player Profile', () => {
    it('should update the player profile', async () => {
      // Create a test player
      const player = await createTestPlayer({
        username: 'updateplayer',
        email: 'updateplayer@gmail.com'
      });

      const updatedData = {
        username: 'updatedplayer'
      };

      const response = await request(app)
        .put('/api/player/profile')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .send(updatedData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      
      // Verify the update in the database
      const updatedPlayer = await Player.findById(player._id);
      expect(updatedPlayer.username).toBe('updatedplayer');
    });

    it('should return 400 if username already exists', async () => {
      // Create two test players
      const player1 = await createTestPlayer({
        username: 'existingplayer1',
        email: 'player1@gmail.com'
      });

      const player2 = await createTestPlayer({
        username: 'player2',
        email: 'player2@gmail.com'
      });

      // Try to update player2's username to player1's username
      const response = await request(app)
        .put('/api/player/profile')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player2._id.toString())
        .send({ username: 'existingplayer1' })
        .expect(400);

      expect(response.body.errorMessage).toBe('Username already exists');
    });
  });

  describe('Get Player Tournaments', () => {
    it('should return tournaments the player has joined', async () => {
      // Create a test player with tournaments
      const player = await createTestPlayer();
      
      // Create a test tournament
      const tournament = new Tournament({
        tid: 'T123',
        name: 'Test Tournament',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // Tomorrow
        organiser: generateObjectId(),
        teams: []
      });
      await tournament.save();
      
      // Add tournament to player
      player.tournaments.push({
        tournament: tournament._id,
        won: false
      });
      await player.save();

      const response = await request(app)
        .get('/api/player/tournaments')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Test Tournament');
    });
  });

  describe('Follow/Unfollow Organiser', () => {
    it('should allow a player to follow an organiser', async () => {
      // Create a test player and organiser
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();

      const response = await request(app)
        .post(`/api/player/follow/${organiser._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .expect(200);

      expect(response.body.message).toBe('Organiser followed successfully');
      
      // Verify the follow in the database
      const updatedPlayer = await Player.findById(player._id);
      expect(updatedPlayer.following).toContainEqual(organiser._id);
    });

    it('should allow a player to unfollow an organiser', async () => {
      // Create a test player and organiser
      const player = await createTestPlayer();
      const organiser = await createTestOrganiser();
      
      // Make player follow the organiser first
      player.following.push(organiser._id);
      await player.save();

      const response = await request(app)
        .delete(`/api/player/unfollow/${organiser._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .expect(200);

      expect(response.body.message).toBe('Organiser unfollowed successfully');
      
      // Verify the unfollow in the database
      const updatedPlayer = await Player.findById(player._id);
      expect(updatedPlayer.following).not.toContainEqual(organiser._id);
    });
  });
});
