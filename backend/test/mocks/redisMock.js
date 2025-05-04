// Mock implementation of Redis client for tests
// Use an in-memory cache for testing
const mockCache = new Map();

const setCache = async (key, data, ttl = 3600) => {
  mockCache.set(key, JSON.stringify(data));
  return Promise.resolve();
};

const getCache = async (key) => {
  const data = mockCache.get(key);
  return Promise.resolve(data ? JSON.parse(data) : null);
};

const delCache = async (key) => {
  mockCache.delete(key);
  return Promise.resolve();
};

module.exports = {
  setCache,
  getCache,
  delCache
};
