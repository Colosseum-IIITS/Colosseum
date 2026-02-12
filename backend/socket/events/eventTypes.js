/**
 * Socket.io Event Type Constants
 * Defines all event names used for socket communication
 */

// Server -> Client Events (emitted by server to clients)
const SERVER_EVENTS = {
  // Tournament events
  POINTS_TABLE_UPDATED: 'tournament:pointsTableUpdated',
  TOURNAMENT_STATUS_CHANGED: 'tournament:statusChanged',
  TOURNAMENT_WINNER_DECLARED: 'tournament:winnerDeclared',
  TOURNAMENT_CREATED: 'tournament:created',
  TEAM_JOINED_TOURNAMENT: 'tournament:teamJoined',

  // Notification events
  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_BATCH: 'notification:batch',

  // Team events
  TEAM_JOIN_REQUEST_RECEIVED: 'team:joinRequestReceived',
  TEAM_JOIN_REQUEST_ACCEPTED: 'team:joinRequestAccepted',
  TEAM_JOIN_REQUEST_REJECTED: 'team:joinRequestRejected',
  TEAM_MEMBER_ADDED: 'team:memberAdded',
  TEAM_MEMBER_REMOVED: 'team:memberRemoved',

  // Connection events
  AUTHENTICATED: 'authenticated',
  CONNECTION_ERROR: 'connection:error',
};

// Client -> Server Events (emitted by client to server)
const CLIENT_EVENTS = {
  // Room management
  JOIN_TOURNAMENT_ROOM: 'room:joinTournament',
  LEAVE_TOURNAMENT_ROOM: 'room:leaveTournament',
  JOIN_TEAM_ROOM: 'room:joinTeam',
  LEAVE_TEAM_ROOM: 'room:leaveTeam',
  JOIN_ORGANISER_ROOM: 'room:joinOrganiser',
  LEAVE_ORGANISER_ROOM: 'room:leaveOrganiser',

  // Subscriptions
  SUBSCRIBE_LEADERBOARD: 'subscribe:leaderboard',
  UNSUBSCRIBE_LEADERBOARD: 'unsubscribe:leaderboard',
};

module.exports = { SERVER_EVENTS, CLIENT_EVENTS };
