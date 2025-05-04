const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Set data in cache with TTL
const setCache = async (key, data, ttl = 3600) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Redis setCache error:', error);
  }
};

// Get data from cache
const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
};

// Delete cache entry
const delCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis delCache error:', error);
  }
};

module.exports = {
  setCache,
  getCache,
  delCache
};