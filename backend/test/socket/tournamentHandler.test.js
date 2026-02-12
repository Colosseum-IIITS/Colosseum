/**
 * Tournament Event Handler Tests
 * TDD: Tests for tournament-related socket event emissions
 */

const { createMockIO } = require('./testHelpers');
const { SERVER_EVENTS } = require('../../socket/events/eventTypes');
const { getRoomName } = require('../../socket/utils/roomUtils');

// Import handlers (will be created after tests)
const {
  emitPointsTableUpdate,
  emitTournamentStatusChange,
  emitWinnerDeclared,
  emitNewTournament,
  emitTeamJoinedTournament,
} = require('../../socket/handlers/tournamentHandler');

describe('Tournament Event Handlers', () => {
  let mockIO;

  beforeEach(() => {
    mockIO = createMockIO();
  });

  afterEach(() => {
    mockIO.reset();
  });

  describe('emitPointsTableUpdate', () => {
    test('sends to correct leaderboard room', () => {
      const tournamentId = '507f1f77bcf86cd799439011';
      const pointsTable = [
        { ranking: 1, teamName: 'Team Alpha', totalPoints: 100 },
        { ranking: 2, teamName: 'Team Beta', totalPoints: 80 },
      ];

      emitPointsTableUpdate(mockIO, tournamentId, pointsTable);

      const expectedRoom = getRoomName.leaderboard(tournamentId);
      expect(mockIO.to).toHaveBeenCalledWith(expectedRoom);
    });

    test('emits correct event with tournamentId and pointsTable', () => {
      const tournamentId = '507f1f77bcf86cd799439011';
      const pointsTable = [
        { ranking: 1, teamName: 'Team Alpha', totalPoints: 100 },
      ];

      emitPointsTableUpdate(mockIO, tournamentId, pointsTable);

      expect(mockIO.to().emit).toHaveBeenCalledWith(
        SERVER_EVENTS.POINTS_TABLE_UPDATED,
        expect.objectContaining({
          tournamentId,
          pointsTable,
          updatedAt: expect.any(String),
        })
      );
    });

    test('includes ISO timestamp in updatedAt', () => {
      const tournamentId = '507f1f77bcf86cd799439011';
      const pointsTable = [];

      emitPointsTableUpdate(mockIO, tournamentId, pointsTable);

      const emitCall = mockIO.to().emit.mock.calls[0];
      const payload = emitCall[1];

      // Check that updatedAt is a valid ISO string
      expect(() => new Date(payload.updatedAt)).not.toThrow();
      expect(new Date(payload.updatedAt).toISOString()).toBe(payload.updatedAt);
    });
  });

  describe('emitTournamentStatusChange', () => {
    test('sends to correct tournament room', () => {
      const tournamentId = '507f1f77bcf86cd799439012';
      const status = 'Approved';

      emitTournamentStatusChange(mockIO, tournamentId, status);

      const expectedRoom = getRoomName.tournament(tournamentId);
      expect(mockIO.to).toHaveBeenCalledWith(expectedRoom);
    });

    test('emits status change event with correct data', () => {
      const tournamentId = '507f1f77bcf86cd799439012';
      const status = 'Completed';

      emitTournamentStatusChange(mockIO, tournamentId, status);

      expect(mockIO.to().emit).toHaveBeenCalledWith(
        SERVER_EVENTS.TOURNAMENT_STATUS_CHANGED,
        expect.objectContaining({
          tournamentId,
          status,
          updatedAt: expect.any(String),
        })
      );
    });

    test('includes additional data when provided', () => {
      const tournamentId = '507f1f77bcf86cd799439012';
      const status = 'Completed';
      const additionalData = { reason: 'All matches completed' };

      emitTournamentStatusChange(mockIO, tournamentId, status, additionalData);

      expect(mockIO.to().emit).toHaveBeenCalledWith(
        SERVER_EVENTS.TOURNAMENT_STATUS_CHANGED,
        expect.objectContaining({
          tournamentId,
          status,
          reason: 'All matches completed',
        })
      );
    });
  });

  describe('emitWinnerDeclared', () => {
    test('sends to correct tournament room', () => {
      const tournamentId = '507f1f77bcf86cd799439013';
      const winnerData = {
        teamId: 'team123',
        teamName: 'Champions',
        prizeAmount: 10000,
      };

      emitWinnerDeclared(mockIO, tournamentId, winnerData);

      const expectedRoom = getRoomName.tournament(tournamentId);
      expect(mockIO.to).toHaveBeenCalledWith(expectedRoom);
    });

    test('emits winner data to tournament room', () => {
      const tournamentId = '507f1f77bcf86cd799439013';
      const winnerData = {
        teamId: 'team123',
        teamName: 'Champions',
        prizeAmount: 10000,
      };

      emitWinnerDeclared(mockIO, tournamentId, winnerData);

      expect(mockIO.to().emit).toHaveBeenCalledWith(
        SERVER_EVENTS.TOURNAMENT_WINNER_DECLARED,
        expect.objectContaining({
          tournamentId,
          winner: winnerData,
          updatedAt: expect.any(String),
        })
      );
    });
  });

  describe('emitNewTournament', () => {
    test('sends to correct organiser followers room', () => {
      const organiserId = '507f1f77bcf86cd799439014';
      const tournament = {
        _id: 'tournament123',
        name: 'Spring Championship',
        prizePool: 50000,
      };

      emitNewTournament(mockIO, organiserId, tournament);

      const expectedRoom = getRoomName.organiser(organiserId);
      expect(mockIO.to).toHaveBeenCalledWith(expectedRoom);
    });

    test('emits tournament created event with tournament data', () => {
      const organiserId = '507f1f77bcf86cd799439014';
      const tournament = {
        _id: 'tournament123',
        name: 'Spring Championship',
        prizePool: 50000,
      };

      emitNewTournament(mockIO, organiserId, tournament);

      expect(mockIO.to().emit).toHaveBeenCalledWith(
        SERVER_EVENTS.TOURNAMENT_CREATED,
        expect.objectContaining({
          tournament,
          createdAt: expect.any(String),
        })
      );
    });
  });

  describe('emitTeamJoinedTournament', () => {
    test('sends to correct tournament room', () => {
      const tournamentId = '507f1f77bcf86cd799439015';
      const teamData = {
        teamId: 'team456',
        teamName: 'New Challengers',
      };

      emitTeamJoinedTournament(mockIO, tournamentId, teamData);

      const expectedRoom = getRoomName.tournament(tournamentId);
      expect(mockIO.to).toHaveBeenCalledWith(expectedRoom);
    });

    test('emits team joined event with team data', () => {
      const tournamentId = '507f1f77bcf86cd799439015';
      const teamData = {
        teamId: 'team456',
        teamName: 'New Challengers',
      };

      emitTeamJoinedTournament(mockIO, tournamentId, teamData);

      expect(mockIO.to().emit).toHaveBeenCalledWith(
        SERVER_EVENTS.TEAM_JOINED_TOURNAMENT,
        expect.objectContaining({
          tournamentId,
          team: teamData,
          joinedAt: expect.any(String),
        })
      );
    });
  });
});
