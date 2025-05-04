require('dotenv').config(); // ensure environment variables are loaded
const Redis = require('ioredis');

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined in environment variables.');
}

const redis = new Redis(process.env.REDIS_URL);

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
