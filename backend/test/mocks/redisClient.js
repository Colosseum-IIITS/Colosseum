// Mock implementation of Redis for testing
const redisMock = {
  setex: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  keys: jest.fn().mockResolvedValue([]),
  del: jest.fn().mockResolvedValue(1),
  flushall: jest.fn().mockResolvedValue('OK'),
};

module.exports = {
  redis: redisMock,
  setCache: jest.fn().mockResolvedValue('OK'),
  getCache: jest.fn().mockResolvedValue(null),
};
