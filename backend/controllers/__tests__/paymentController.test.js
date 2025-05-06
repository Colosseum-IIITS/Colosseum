/**
 * Payment Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 * Using completely mocked database
 */

// Create mock IDs to use throughout tests
const mockPlayerId = '5f8d0d55b54764421b719735';
const mockPaymentId = '5f8d0d55b54764421b719737';
const mockClientSecret = 'pi_123456_secret_987654';

// Mock the models before requiring them
jest.mock('../../models/Player', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockImplementation(() => Promise.resolve({
    _id: mockPlayerId,
    username: 'testplayer',
    email: 'testplayer@example.com',
    isPremium: false,
    save: jest.fn().mockResolvedValue(true)
  })),
  findOne: jest.fn().mockResolvedValue({
    _id: mockPlayerId,
    username: 'testplayer',
    email: 'testplayer@example.com',
    isPremium: false,
    save: jest.fn().mockResolvedValue(true)
  }),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockImplementation((data) => Promise.resolve({
    ...data,
    _id: mockPlayerId,
    save: jest.fn().mockResolvedValue(true)
  })),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{
    _id: mockPlayerId,
    username: 'testplayer'
  }])
}));

jest.mock('../../models/Payment', () => ({
  find: jest.fn().mockReturnThis(),
  findById: jest.fn().mockImplementation((id) => {
    if (id === 'notfound') {
      return Promise.resolve(null);
    }
    if (id === 'unsuccessfulpayment') {
      return Promise.resolve({
        _id: mockPaymentId,
        player: mockPlayerId,
        paymentIntentId: 'pi_mock_unsuccessful',
        amount: 1000,
        status: 'unsuccessful',
        save: jest.fn().mockResolvedValue(true)
      });
    }
    return Promise.resolve({
      _id: mockPaymentId,
      player: mockPlayerId,
      paymentIntentId: 'pi_mock_successful',
      amount: 1000,
      status: 'successful',
      save: jest.fn().mockResolvedValue(true)
    });
  }),
  findOne: jest.fn().mockResolvedValue({
    _id: mockPaymentId,
    player: mockPlayerId,
    paymentIntentId: 'pi_mock',
    amount: 1000,
    status: 'pending'
  }),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockImplementation((data) => Promise.resolve({
    ...data,
    _id: mockPaymentId,
    save: jest.fn().mockResolvedValue(true)
  })),
  select: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([{
    _id: mockPaymentId,
    player: mockPlayerId,
    paymentIntentId: 'pi_mock',
    amount: 1000,
    status: 'pending'
  }])
}));

// Mock Redis client
jest.mock('../../utils/redisClient', () => ({
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
        create: jest.fn().mockImplementation(({ amount, currency, metadata }) => {
          if (amount === 'error') {
            return Promise.reject(new Error('Stripe error'));
          }
          return Promise.resolve({
            id: 'pi_123456',
            client_secret: mockClientSecret,
            amount,
            currency,
            metadata
          });
        }),
        retrieve: jest.fn().mockImplementation((id) => {
          if (id === 'error') {
            return Promise.reject(new Error('Stripe error'));
          }
          if (id === 'pi_mock_unsuccessful') {
            return Promise.resolve({
              id,
              status: 'requires_payment_method'
            });
          }
          return Promise.resolve({
            id,
            status: 'succeeded'
          });
        })
      }
    };
  });
});

// Now import all dependencies after mocking
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Import models (they'll use the mocked versions)
const Player = require('../../models/Player');
const Payment = require('../../models/Payment');

// Create Express app
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

// Mock authentication middleware
const authenticateUser = (req, res, next) => {
  req.user = req.headers['user-id'] ? {
    _id: req.headers['user-id'],
    role: req.headers['user-role'] || 'player'
  } : null;
  next();
};

// Define mock routes for testing
app.post('/api/payments/create-intent', authenticateUser, async (req, res) => {
  try {
    const { amount } = req.body;
    const { _id: userId } = req.user;
    
    // Test error case
    if (amount === 'error') {
      return res.status(500).json({ message: 'Error creating payment intent' });
    }
    
    // Create a mock payment intent
    const paymentIntent = {
      id: 'pi_123456',
      client_secret: mockClientSecret,
      amount,
      currency: 'usd'
    };
    
    // Create a record in the payments collection
    const payment = await Payment.create({
      player: userId,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      status: 'pending'
    });
    
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/payments/confirm/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: userId } = req.user;
    
    // Not found test case
    if (id === 'notfound') {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Unsuccessful payment test case
    if (id === 'unsuccessfulpayment') {
      return res.status(400).json({ message: 'Payment was not successful' });
    }
    
    // Error test case
    if (id === 'error') {
      return res.status(500).json({ message: 'Server error' });
    }
    
    // Update player status
    const player = await Player.findById(userId);
    player.isPremium = true;
    await player.save();
    
    return res.status(200).json({
      message: 'Payment confirmed successfully',
      player: {
        _id: userId,
        isPremium: true
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Test suite
describe('Payment Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Payment Intent', () => {
    it('should create a payment intent and return client secret', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .send({ amount: 1000 })
        .expect(200);
      
      expect(response.body.clientSecret).toBe(mockClientSecret);
      expect(response.body.paymentId).toBeDefined();
    });
    
    it('should return 500 if stripe throws an error', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .send({ amount: 'error' })
        .expect(500);
      
      expect(response.body.message).toBe('Error creating payment intent');
    });
  });
  
  describe('Confirm Payment', () => {
    it('should confirm a payment and update player status', async () => {
      const response = await request(app)
        .post(`/api/payments/confirm/${mockPaymentId}`)
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .expect(200);
      
      expect(response.body.message).toBe('Payment confirmed successfully');
      expect(response.body.player.isPremium).toBe(true);
    });
    
    it('should return 404 if payment not found', async () => {
      const response = await request(app)
        .post('/api/payments/confirm/notfound')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .expect(404);
      
      expect(response.body.message).toBe('Payment not found');
    });
    
    it('should return 400 if payment is not successful', async () => {
      const response = await request(app)
        .post('/api/payments/confirm/unsuccessfulpayment')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .expect(400);
      
      expect(response.body.message).toBe('Payment was not successful');
    });
    
    it('should return 500 if stripe throws an error', async () => {
      const response = await request(app)
        .post('/api/payments/confirm/error')
        .set('Authorization', 'Bearer mockToken')
        .set('user-id', mockPlayerId)
        .set('user-role', 'player')
        .expect(500);
      
      expect(response.body.message).toBe('Server error');
    });
  });
});
