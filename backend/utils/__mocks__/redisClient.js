// Mock Redis client for testing
const redis = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
};

// Mock cache functions
const setCache = jest.fn().mockImplementation((key, value, ttl = 1800) => {
  return Promise.resolve(true);
});

const getCache = jest.fn().mockImplementation((key) => {
  return Promise.resolve(null);
});

const delCache = jest.fn().mockImplementation((key) => {
  return Promise.resolve(true);
});

const isRedisConnected = jest.fn().mockReturnValue(true);

module.exports = {
  redis,
  setCache,
  getCache,
  delCache,
  isRedisConnected,
};
