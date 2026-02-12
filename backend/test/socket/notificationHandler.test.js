/**
 * Notification Event Handler Tests
 */

const { createMockIO } = require('./testHelpers');
const { SERVER_EVENTS } = require('../../socket/events/eventTypes');
const { getRoomName } = require('../../socket/utils/roomUtils');
const {
  emitNotificationToUser,
  emitNotificationToUsers,
} = require('../../socket/handlers/notificationHandler');

describe('Notification Event Handlers', () => {
  let mockIO;

  beforeEach(() => {
    mockIO = createMockIO();
  });

  test('emitNotificationToUser sends to user room', () => {
    const userId = 'user123';
    const notification = { message: 'Test notification', type: 'info' };

    emitNotificationToUser(mockIO, userId, notification);

    expect(mockIO.to).toHaveBeenCalledWith(getRoomName.user(userId));
    expect(mockIO.to().emit).toHaveBeenCalledWith(
      SERVER_EVENTS.NOTIFICATION_NEW,
      expect.objectContaining({ notification, timestamp: expect.any(String) })
    );
  });

  test('emitNotificationToUsers sends to multiple user rooms', () => {
    const userIds = ['user1', 'user2', 'user3'];
    const notification = { message: 'Broadcast', type: 'announcement' };

    emitNotificationToUsers(mockIO, userIds, notification);

    expect(mockIO.to).toHaveBeenCalledTimes(3);
    userIds.forEach(id => {
      expect(mockIO.to).toHaveBeenCalledWith(getRoomName.user(id));
    });
  });

  test('notification includes message, type, and timestamp', () => {
    const userId = 'user123';
    const notification = { message: 'Hello', type: 'greeting' };

    emitNotificationToUser(mockIO, userId, notification);

    const payload = mockIO.to().emit.mock.calls[0][1];
    expect(payload.notification.message).toBe('Hello');
    expect(payload.notification.type).toBe('greeting');
    expect(payload.timestamp).toBeDefined();
  });
});
