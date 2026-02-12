/**
 * Team Event Handler Tests
 */

const { createMockIO } = require('./testHelpers');
const { SERVER_EVENTS } = require('../../socket/events/eventTypes');
const { getRoomName } = require('../../socket/utils/roomUtils');
const {
  emitJoinRequestReceived,
  emitJoinRequestAccepted,
  emitJoinRequestRejected,
} = require('../../socket/handlers/teamHandler');

describe('Team Event Handlers', () => {
  let mockIO;

  beforeEach(() => {
    mockIO = createMockIO();
  });

  test('emitJoinRequestReceived sends to team room', () => {
    const teamId = 'team123';
    const requestData = { playerId: 'player1', playerName: 'John' };

    emitJoinRequestReceived(mockIO, teamId, requestData);

    expect(mockIO.to).toHaveBeenCalledWith(getRoomName.team(teamId));
    expect(mockIO.to().emit).toHaveBeenCalledWith(
      SERVER_EVENTS.TEAM_JOIN_REQUEST_RECEIVED,
      expect.objectContaining({ ...requestData, timestamp: expect.any(String) })
    );
  });

  test('emitJoinRequestAccepted sends to requester user room', () => {
    const playerId = 'player1';
    const teamData = { teamId: 'team123', teamName: 'Champions' };

    emitJoinRequestAccepted(mockIO, playerId, teamData);

    expect(mockIO.to).toHaveBeenCalledWith(getRoomName.user(playerId));
    expect(mockIO.to().emit).toHaveBeenCalledWith(
      SERVER_EVENTS.TEAM_JOIN_REQUEST_ACCEPTED,
      expect.objectContaining({ team: teamData, timestamp: expect.any(String) })
    );
  });

  test('emitJoinRequestRejected sends to requester user room', () => {
    const playerId = 'player1';
    const teamId = 'team123';

    emitJoinRequestRejected(mockIO, playerId, teamId);

    expect(mockIO.to).toHaveBeenCalledWith(getRoomName.user(playerId));
    expect(mockIO.to().emit).toHaveBeenCalledWith(
      SERVER_EVENTS.TEAM_JOIN_REQUEST_REJECTED,
      expect.objectContaining({ teamId, timestamp: expect.any(String) })
    );
  });
});
