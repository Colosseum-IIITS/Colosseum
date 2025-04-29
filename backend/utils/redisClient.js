// redisClient.js
const Redis = require('ioredis');
const redis = new Redis();

const setCache = (key, value, ttl = 1800) => {
  return redis.setex(key, ttl, JSON.stringify(value)); // store as string
};

const getCache = async (key) => {
  const data = await redis.get(key);
  try {
    return data ? JSON.parse(data) : null; // return object
  } catch (err) {
    console.error('Redis JSON parse error:', err);
    return null;
  }
};

module.exports = { redis, setCache, getCache };
