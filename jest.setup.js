// Jest setup file for test environment configuration

// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.MONGODB_URI = 'mongodb://localhost:27017/colosseum_test';

// Mock console methods to reduce noise during tests
// Comment these out if you want to see console output during testing
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Set up global test timeouts
jest.setTimeout(30000);
