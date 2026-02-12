/**
 * Team Event Handlers
 */

const { SERVER_EVENTS } = require('../events/eventTypes');
const { getRoomName } = require('../utils/roomUtils');

const emitJoinRequestReceived = (io, teamId, requestData) => {
  const roomName = getRoomName.team(teamId);
  io.to(roomName).emit(SERVER_EVENTS.TEAM_JOIN_REQUEST_RECEIVED, {
    ...requestData,
    timestamp: new Date().toISOString(),
  });
};

const emitJoinRequestAccepted = (io, playerId, teamData) => {
  const roomName = getRoomName.user(playerId);
  io.to(roomName).emit(SERVER_EVENTS.TEAM_JOIN_REQUEST_ACCEPTED, {
    team: teamData,
    timestamp: new Date().toISOString(),
  });
};

const emitJoinRequestRejected = (io, playerId, teamId) => {
  const roomName = getRoomName.user(playerId);
  io.to(roomName).emit(SERVER_EVENTS.TEAM_JOIN_REQUEST_REJECTED, {
    teamId,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  emitJoinRequestReceived,
  emitJoinRequestAccepted,
  emitJoinRequestRejected,
};
