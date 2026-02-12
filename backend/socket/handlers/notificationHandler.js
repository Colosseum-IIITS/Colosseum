/**
 * Notification Event Handlers
 */

const { SERVER_EVENTS } = require('../events/eventTypes');
const { getRoomName } = require('../utils/roomUtils');

const emitNotificationToUser = (io, userId, notification) => {
  const roomName = getRoomName.user(userId);
  io.to(roomName).emit(SERVER_EVENTS.NOTIFICATION_NEW, {
    notification,
    timestamp: new Date().toISOString(),
  });
};

const emitNotificationToUsers = (io, userIds, notification) => {
  userIds.forEach((userId) => {
    emitNotificationToUser(io, userId, notification);
  });
};

module.exports = {
  emitNotificationToUser,
  emitNotificationToUsers,
};
