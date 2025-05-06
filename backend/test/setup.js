const mongoose = require('mongoose');

// Use jest.doMock instead of jest.mock to fix the variable scoping issue
jest.doMock('../utils/redisClient', () => ({
  getClient: jest.fn().mockReturnValue({}),
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(true),
  delCache: jest.fn().mockResolvedValue(true)
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        create: jest.fn().mockResolvedValue({
          client_secret: 'test_client_secret',
          id: 'test_payment_intent_id'
        }),
        retrieve: jest.fn().mockResolvedValue({
          id: 'test_payment_intent_id',
          status: 'succeeded'
        })
      },
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({
            id: 'test_session_id',
            url: 'https://test-checkout-url.com'
          })
        }
      }
    };
  });
});

// Set up environment variables for testing
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
process.env.STRIPE_SECRET_KEY = 'test_stripe_key';

// Connect to the MongoDB database before all tests
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/colosseum_test');
});

// Clear all data between tests
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect after all tests
afterAll(async () => {
  await mongoose.disconnect();
});
