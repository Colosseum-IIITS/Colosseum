const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Team = require('../../models/Team');
const Player = require('../../models/Player');
const teamController = require('../teamControllers');
const { authenticateUser } = require('../../middleware/authMiddleware');
const { 
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
        role: req.headers['user-role'] || 'player' 
      };
    }
    next();
  })
}));

// Setup express app for testing
const app = express();
app.use(express.json());

// Register team routes for testing
app.post('/api/team', authenticateUser, teamController.createTeam);
app.get('/api/team/:id', teamController.getTeamById);
app.put('/api/team/:id', authenticateUser, teamController.updateTeam);
app.delete('/api/team/:id', authenticateUser, teamController.deleteTeam);
app.post('/api/team/:id/invite', authenticateUser, teamController.invitePlayerToTeam);
app.post('/api/team/accept-invite/:teamId', authenticateUser, teamController.acceptTeamInvite);
app.post('/api/team/reject-invite/:teamId', authenticateUser, teamController.rejectTeamInvite);

// Load test setup
require('../../test/setup');

describe('Team Controller Tests', () => {
  describe('Create Team', () => {
    it('should create a new team', async () => {
      // Create a test player
      const player = await createTestPlayer({
        teamPayment: { paid: true }
      });

      const teamData = {
        name: 'Test Team',
        description: 'A team for testing'
      };

      const response = await request(app)
        .post('/api/team')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .set('user-role', 'player')
        .send(teamData)
        .expect(201);

      expect(response.body.message).toBe('Team created successfully');
      expect(response.body.team).toBeDefined();
      expect(response.body.team.name).toBe(teamData.name);
      expect(response.body.team.captain.toString()).toBe(player._id.toString());
      
      // Verify team was created in the database
      const team = await Team.findById(response.body.team._id);
      expect(team).toBeTruthy();
      expect(team.name).toBe(teamData.name);
      
      // Verify player was updated with team
      const updatedPlayer = await Player.findById(player._id);
      expect(updatedPlayer.team.toString()).toBe(team._id.toString());
    });

    it('should return 400 if player has not paid team fee', async () => {
      // Create a test player who hasn't paid
      const player = await createTestPlayer({
        teamPayment: { paid: false }
      });

      const teamData = {
        name: 'Unpaid Team',
        description: 'This team should not be created'
      };

      const response = await request(app)
        .post('/api/team')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .set('user-role', 'player')
        .send(teamData)
        .expect(400);

      expect(response.body.errorMessage).toBe('You need to pay the team creation fee first');
    });

    it('should return 400 if player already has a team', async () => {
      // Create a test player
      const player = await createTestPlayer({
        teamPayment: { paid: true }
      });
      
      // Create a team for the player
      const team = new Team({
        name: 'Existing Team',
        captain: player._id,
        members: [player._id]
      });
      await team.save();
      
      // Update player with team
      player.team = team._id;
      await player.save();

      // Try to create another team
      const response = await request(app)
        .post('/api/team')
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .set('user-role', 'player')
        .send({ name: 'Second Team' })
        .expect(400);

      expect(response.body.errorMessage).toBe('You are already part of a team');
    });
  });

  describe('Get Team', () => {
    it('should get a team by ID', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      // Create a team
      const team = new Team({
        name: 'Retrievable Team',
        captain: player._id,
        members: [player._id],
        description: 'A team that can be retrieved'
      });
      await team.save();

      const response = await request(app)
        .get(`/api/team/${team._id}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.name).toBe('Retrievable Team');
      expect(response.body.description).toBe('A team that can be retrieved');
      expect(response.body.captain.toString()).toBe(player._id.toString());
    });

    it('should return 404 if team not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/team/${nonExistentId}`)
        .expect(404);

      expect(response.body.errorMessage).toBe('Team not found');
    });
  });

  describe('Update Team', () => {
    it('should update a team', async () => {
      // Create a test player
      const player = await createTestPlayer();
      
      // Create a team
      const team = new Team({
        name: 'Original Team',
        captain: player._id,
        members: [player._id],
        description: 'Original description'
      });
      await team.save();

      const updateData = {
        name: 'Updated Team',
        description: 'Updated description'
      };

      const response = await request(app)
        .put(`/api/team/${team._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', player._id.toString())
        .set('user-role', 'player')
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Team updated successfully');
      
      // Verify the update in the database
      const updatedTeam = await Team.findById(team._id);
      expect(updatedTeam.name).toBe('Updated Team');
      expect(updatedTeam.description).toBe('Updated description');
    });

    it('should return 403 if user is not the team captain', async () => {
      // Create two test players
      const captain = await createTestPlayer();
      const member = await createTestPlayer();
      
      // Create a team with captain and member
      const team = new Team({
        name: 'Captain\'s Team',
        captain: captain._id,
        members: [captain._id, member._id]
      });
      await team.save();
      
      // Update both players with team
      captain.team = team._id;
      member.team = team._id;
      await captain.save();
      await member.save();

      // Try to update as member (not captain)
      const response = await request(app)
        .put(`/api/team/${team._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', member._id.toString())
        .set('user-role', 'player')
        .send({ name: 'Attempted Update' })
        .expect(403);

      expect(response.body.errorMessage).toBe('Only the team captain can update the team');
    });
  });

  describe('Team Invitations', () => {
    it('should invite a player to a team', async () => {
      // Create captain and invitee
      const captain = await createTestPlayer();
      const invitee = await createTestPlayer();
      
      // Create a team
      const team = new Team({
        name: 'Invitation Team',
        captain: captain._id,
        members: [captain._id]
      });
      await team.save();
      
      // Update captain with team
      captain.team = team._id;
      await captain.save();

      const response = await request(app)
        .post(`/api/team/${team._id}/invite`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', captain._id.toString())
        .set('user-role', 'player')
        .send({ playerId: invitee._id })
        .expect(200);

      expect(response.body.message).toBe('Invitation sent successfully');
      
      // Verify the invitee received a notification
      const updatedInvitee = await Player.findById(invitee._id);
      expect(updatedInvitee.notifications.length).toBe(1);
      expect(updatedInvitee.notifications[0].message).toContain('invited you to join');
    });

    it('should allow a player to accept a team invite', async () => {
      // Create captain and invitee
      const captain = await createTestPlayer();
      const invitee = await createTestPlayer();
      
      // Create a team
      const team = new Team({
        name: 'Accept Invite Team',
        captain: captain._id,
        members: [captain._id]
      });
      await team.save();
      
      // Update captain with team
      captain.team = team._id;
      await captain.save();
      
      // Add notification to invitee (simulating an invite)
      invitee.notifications.push({
        message: `Team ${team.name} invited you to join`,
        read: false,
        date: new Date()
      });
      await invitee.save();

      const response = await request(app)
        .post(`/api/team/accept-invite/${team._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', invitee._id.toString())
        .set('user-role', 'player')
        .expect(200);

      expect(response.body.message).toBe('Successfully joined the team');
      
      // Verify the team has the new member
      const updatedTeam = await Team.findById(team._id);
      expect(updatedTeam.members).toContainEqual(invitee._id);
      
      // Verify the player has the team
      const updatedInvitee = await Player.findById(invitee._id);
      expect(updatedInvitee.team.toString()).toBe(team._id.toString());
    });

    it('should allow a player to reject a team invite', async () => {
      // Create captain and invitee
      const captain = await createTestPlayer();
      const invitee = await createTestPlayer();
      
      // Create a team
      const team = new Team({
        name: 'Reject Invite Team',
        captain: captain._id,
        members: [captain._id]
      });
      await team.save();
      
      // Update captain with team
      captain.team = team._id;
      await captain.save();
      
      // Add notification to invitee (simulating an invite)
      invitee.notifications.push({
        message: `Team ${team.name} invited you to join`,
        read: false,
        date: new Date()
      });
      await invitee.save();

      const response = await request(app)
        .post(`/api/team/reject-invite/${team._id}`)
        .set('Authorization', `Bearer mockToken`)
        .set('user-id', invitee._id.toString())
        .set('user-role', 'player')
        .expect(200);

      expect(response.body.message).toBe('Team invitation rejected');
      
      // Verify the team does not have the invitee
      const updatedTeam = await Team.findById(team._id);
      expect(updatedTeam.members).not.toContainEqual(invitee._id);
      
      // Verify the player does not have the team
      const updatedInvitee = await Player.findById(invitee._id);
      expect(updatedInvitee.team).toBeUndefined();
    });
  });
});
