/**
 * Socket.io Room Utilities
 * Provides consistent room naming conventions and helpers
 */

// Room name prefixes
const ROOM_PREFIXES = {
  USER: 'user:',
  TOURNAMENT: 'tournament:',
  LEADERBOARD: 'leaderboard:',
  TEAM: 'team:',
  ORGANISER: 'organiser:',
};

/**
 * Room name generators
 * Each function returns a consistent room name for the given ID
 */
const getRoomName = {
  /**
   * Get user's personal room name (for direct notifications)
   * @param {string} userId
   * @returns {string} Room name like "user:123abc"
   */
  user: (userId) => `${ROOM_PREFIXES.USER}${userId}`,

  /**
   * Get tournament room name (for all tournament viewers)
   * @param {string} tournamentId
   * @returns {string} Room name like "tournament:123abc"
   */
  tournament: (tournamentId) => `${ROOM_PREFIXES.TOURNAMENT}${tournamentId}`,

  /**
   * Get leaderboard room name (for points table subscribers)
   * @param {string} tournamentId
   * @returns {string} Room name like "leaderboard:123abc"
   */
  leaderboard: (tournamentId) => `${ROOM_PREFIXES.LEADERBOARD}${tournamentId}`,

  /**
   * Get team room name (for team members, join requests)
   * @param {string} teamId
   * @returns {string} Room name like "team:123abc"
   */
  team: (teamId) => `${ROOM_PREFIXES.TEAM}${teamId}`,

  /**
   * Get organiser room name (for followers)
   * @param {string} organiserId
   * @returns {string} Room name like "organiser:123abc"
   */
  organiser: (organiserId) => `${ROOM_PREFIXES.ORGANISER}${organiserId}`,
};

/**
 * Parse room name to extract type and ID
 * @param {string} roomName
 * @returns {{ type: string, id: string } | null}
 */
const parseRoomName = (roomName) => {
  for (const [type, prefix] of Object.entries(ROOM_PREFIXES)) {
    if (roomName.startsWith(prefix)) {
      return {
        type: type.toLowerCase(),
        id: roomName.slice(prefix.length),
      };
    }
  }
  return null;
};

/**
 * Validate if a string is a valid room name
 * @param {string} roomName
 * @returns {boolean}
 */
const isValidRoomName = (roomName) => {
  return parseRoomName(roomName) !== null;
};

module.exports = {
  ROOM_PREFIXES,
  getRoomName,
  parseRoomName,
  isValidRoomName,
};
