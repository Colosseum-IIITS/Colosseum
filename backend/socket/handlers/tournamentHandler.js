/**
 * Tournament Event Handlers
 * Stub file - to be implemented after tests
 */

const { SERVER_EVENTS } = require('../events/eventTypes');
const { getRoomName } = require('../utils/roomUtils');

const emitPointsTableUpdate = (io, tournamentId, pointsTable) => {
  const roomName = getRoomName.leaderboard(tournamentId);
  io.to(roomName).emit(SERVER_EVENTS.POINTS_TABLE_UPDATED, {
    tournamentId,
    pointsTable,
    updatedAt: new Date().toISOString(),
  });
};

const emitTournamentStatusChange = (io, tournamentId, status, additionalData = {}) => {
  const roomName = getRoomName.tournament(tournamentId);
  io.to(roomName).emit(SERVER_EVENTS.TOURNAMENT_STATUS_CHANGED, {
    tournamentId,
    status,
    ...additionalData,
    updatedAt: new Date().toISOString(),
  });
};

const emitWinnerDeclared = (io, tournamentId, winnerData) => {
  const roomName = getRoomName.tournament(tournamentId);
  io.to(roomName).emit(SERVER_EVENTS.TOURNAMENT_WINNER_DECLARED, {
    tournamentId,
    winner: winnerData,
    updatedAt: new Date().toISOString(),
  });
};

const emitNewTournament = (io, organiserId, tournament) => {
  const roomName = getRoomName.organiser(organiserId);
  io.to(roomName).emit(SERVER_EVENTS.TOURNAMENT_CREATED, {
    tournament,
    createdAt: new Date().toISOString(),
  });
};

const emitTeamJoinedTournament = (io, tournamentId, teamData) => {
  const roomName = getRoomName.tournament(tournamentId);
  io.to(roomName).emit(SERVER_EVENTS.TEAM_JOINED_TOURNAMENT, {
    tournamentId,
    team: teamData,
    joinedAt: new Date().toISOString(),
  });
};

module.exports = {
  emitPointsTableUpdate,
  emitTournamentStatusChange,
  emitWinnerDeclared,
  emitNewTournament,
  emitTeamJoinedTournament,
};
