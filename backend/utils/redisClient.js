// redisClient.js - Configured for Upstash Redis
const Redis = require('ioredis');
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Initialize Redis client
let redis;
let isConnected = false;

try {
  // Upstash Redis connection URL from environment variables
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  // Configure Redis client with options optimized for Upstash
  const redisOptions = {
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
    // Upstash typically requires TLS
    tls: redisUrl.startsWith('rediss://') ? {
      rejectUnauthorized: false
    } : undefined
  };
  
  redis = new Redis(redisUrl, redisOptions);
  
  // Set up connection event handlers
  redis.on('connect', () => {
    console.log('Connected to Upstash Redis successfully');
    isConnected = true;
  });
  
  redis.on('error', (err) => {
    console.error('Upstash Redis connection error:', err);
    isConnected = false;
  });
  
  redis.on('reconnecting', () => {
    console.log('Reconnecting to Upstash Redis...');
  });
  
} catch (err) {
  console.error('Failed to initialize Upstash Redis:', err);
  // Create a fallback local cache
  redis = createFallbackCache();
}

/**
 * Set a value in cache with expiration
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON stringified)
 * @param {number} ttl - Time to live in seconds (default: 30 minutes)
 * @returns {Promise<boolean>} - Success status
 */
const setCache = async (key, value, ttl = 1800) => {
  try {
    if (!isConnected && isProduction) {
      // In production, silently fail to avoid impacting user experience
      return false;
    }
    
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Upstash Redis setCache error for key ${key}:`, err);
    return false;
  }
};

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null if not found
 */
const getCache = async (key) => {
  try {
    if (!isConnected && isProduction) {
      return null;
    }
    
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Upstash Redis getCache error for key ${key}:`, err);
    return null;
  }
};

/**
 * Delete a value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
const delCache = async (key) => {
  try {
    if (!isConnected && isProduction) {
      return false;
    }
    
    const result = await redis.del(key);
    return result > 0;
  } catch (err) {
    console.error(`Upstash Redis delCache error for key ${key}:`, err);
    return false;
  }
};

/**
 * Create a simple in-memory fallback cache
 * @returns {object} - Mock Redis client
 */
function createFallbackCache() {
  console.warn('Using in-memory fallback cache instead of Upstash Redis');
  const cache = new Map();
  const expirations = new Map();
  
  return {
    setex: (key, ttl, value) => {
      cache.set(key, value);
      const expiration = Date.now() + (ttl * 1000);
      expirations.set(key, expiration);
      return Promise.resolve('OK');
    },
    
    get: (key) => {
      if (expirations.has(key) && expirations.get(key) < Date.now()) {
        cache.delete(key);
        expirations.delete(key);
        return Promise.resolve(null);
      }
      return Promise.resolve(cache.get(key) || null);
    },
    
    del: (key) => {
      const existed = cache.has(key);
      cache.delete(key);
      expirations.delete(key);
      return Promise.resolve(existed ? 1 : 0);
    },
    
    on: (event, callback) => {
      if (event === 'connect') {
        // Simulate connection success
        setTimeout(callback, 0);
      }
      return this;
    }
  };
}

module.exports = { 
  redis, 
  setCache, 
  getCache,
  delCache,
  isConnected: () => isConnected
};

module.exports = {
  setCache,
  getCache,
  delCache
};