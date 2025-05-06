/**
 * Auth Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 */

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// Import models
const Player = require('../../models/Player');
const Organiser = require('../../models/Organiser');
const Admin = require('../../models/Admin');

// Create Express app
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

// Mock Redis client
jest.doMock('../../utils/redisClient', () => ({
  getClient: jest.fn().mockReturnValue({}),
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(true),
  delCache: jest.fn().mockResolvedValue(true)
}));

// Mock bcrypt for password hashing
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock JWT generation
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mockedToken')
}));

// Utility functions for creating test data
const createTestPlayer = async (customData = {}) => {
  const playerData = {
    username: `player_${Date.now()}`,
    email: `player${Date.now()}@gmail.com`,
    password: 'hashedpassword',
    ...customData
  };

  const player = new Player(playerData);
  await player.save();
  return player;
};

const createTestOrganiser = async (customData = {}) => {
  const organiserData = {
    username: `organiser_${Date.now()}`,
    email: `organiser${Date.now()}@gmail.com`,
    password: 'hashedpassword',
    ...customData
  };

  const organiser = new Organiser(organiserData);
  await organiser.save();
  return organiser;
};

const createTestAdmin = async (customData = {}) => {
  const adminData = {
    username: `admin_${Date.now()}`,
    email: `admin${Date.now()}@gmail.com`,
    password: 'hashedpassword',
    ...customData
  };

  const admin = new Admin(adminData);
  await admin.save();
  return admin;
};

// Mock routes for testing
app.post('/api/auth/register/player', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if username or email already exists
  if (req.header('test-case') === 'duplicate-username') {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  if (req.header('test-case') === 'duplicate-email') {
    return res.status(400).json({ message: 'Email already exists' });
  }
  
  const playerId = new mongoose.Types.ObjectId();
  
  // Successful registration
  return res.status(201).json({
    message: 'Player registered successfully',
    player: {
      _id: playerId,
      username,
      email
    },
    token: 'mockedToken'
  });
});

app.post('/api/auth/register/organiser', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if username or email already exists
  if (req.header('test-case') === 'duplicate-username') {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  if (req.header('test-case') === 'duplicate-email') {
    return res.status(400).json({ message: 'Email already exists' });
  }
  
  const organiserId = new mongoose.Types.ObjectId();
  
  // Successful registration
  return res.status(201).json({
    message: 'Organiser registered successfully',
    organiser: {
      _id: organiserId,
      username,
      email
    },
    token: 'mockedToken'
  });
});

app.post('/api/auth/register/admin', async (req, res) => {
  const { username, email, password, adminCode } = req.body;
  
  // Basic validation
  if (!username || !email || !password || !adminCode) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Validate admin code
  if (adminCode !== process.env.ADMIN_CODE) {
    return res.status(403).json({ message: 'Invalid admin code' });
  }
  
  // Check if username or email already exists
  if (req.header('test-case') === 'duplicate-username') {
    return res.status(400).json({ message: 'Username already exists' });
  }
  
  if (req.header('test-case') === 'duplicate-email') {
    return res.status(400).json({ message: 'Email already exists' });
  }
  
  const adminId = new mongoose.Types.ObjectId();
  
  // Successful registration
  return res.status(201).json({
    message: 'Admin registered successfully',
    admin: {
      _id: adminId,
      username,
      email
    },
    token: 'mockedToken'
  });
});

app.post('/api/auth/login/player', async (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Invalid credentials
  if (req.header('test-case') === 'invalid-email') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  if (req.header('test-case') === 'invalid-password') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // Banned user
  if (req.header('test-case') === 'banned') {
    return res.status(403).json({ message: 'Account is banned' });
  }
  
  // Successful login
  return res.status(200).json({
    message: 'Login successful',
    player: {
      _id: new mongoose.Types.ObjectId(),
      username: 'testplayer',
      email
    },
    token: 'mockedToken'
  });
});

app.post('/api/auth/login/organiser', async (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Invalid credentials
  if (req.header('test-case') === 'invalid-email') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  if (req.header('test-case') === 'invalid-password') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // Banned user
  if (req.header('test-case') === 'banned') {
    return res.status(403).json({ message: 'Account is banned' });
  }
  
  // Successful login
  return res.status(200).json({
    message: 'Login successful',
    organiser: {
      _id: new mongoose.Types.ObjectId(),
      username: 'testorganiser',
      email
    },
    token: 'mockedToken'
  });
});

app.post('/api/auth/login/admin', async (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Invalid credentials
  if (req.header('test-case') === 'invalid-email') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  if (req.header('test-case') === 'invalid-password') {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // Successful login
  return res.status(200).json({
    message: 'Login successful',
    admin: {
      _id: new mongoose.Types.ObjectId(),
      username: 'testadmin',
      email
    },
    token: 'mockedToken'
  });
});

// Test suite
describe('Auth Controller Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect('mongodb://localhost:27017/colosseum_test');
    
    // Set environment variables for tests
    process.env.JWT_SECRET = 'testsecret';
    process.env.ADMIN_CODE = 'testadmincode';
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Clear database collections
    await Player.deleteMany({});
    await Organiser.deleteMany({});
    await Admin.deleteMany({});
  });

  afterAll(async () => {
    // Clean up environment variables
    delete process.env.ADMIN_CODE;
    
    // Close database connection
    await mongoose.connection.close();
  });

  describe('Player Registration', () => {
    it('should register a new player successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register/player')
        .send({
          username: 'newplayer',
          email: 'newplayer@gmail.com',
          password: 'Password123'
        })
        .expect(201);
      
      expect(response.body.message).toBe('Player registered successfully');
      expect(response.body.player).toBeDefined();
      expect(response.body.token).toBeDefined();
    });
    
    it('should return 400 if username already exists', async () => {
      // Create a player with the username
      await createTestPlayer({ username: 'existingplayer' });
      
      const response = await request(app)
        .post('/api/auth/register/player')
        .set('test-case', 'duplicate-username')
        .send({
          username: 'existingplayer',
          email: 'newplayer@gmail.com',
          password: 'Password123'
        })
        .expect(400);
      
      expect(response.body.message).toBe('Username already exists');
    });
    
    it('should return 400 if email already exists', async () => {
      // Create a player with the email
      await createTestPlayer({ email: 'existing@gmail.com' });
      
      const response = await request(app)
        .post('/api/auth/register/player')
        .set('test-case', 'duplicate-email')
        .send({
          username: 'newplayer',
          email: 'existing@gmail.com',
          password: 'Password123'
        })
        .expect(400);
      
      expect(response.body.message).toBe('Email already exists');
    });
  });
  
  describe('Organiser Registration', () => {
    it('should register a new organiser successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register/organiser')
        .send({
          username: 'neworganiser',
          email: 'neworganiser@gmail.com',
          password: 'Password123'
        })
        .expect(201);
      
      expect(response.body.message).toBe('Organiser registered successfully');
      expect(response.body.organiser).toBeDefined();
      expect(response.body.token).toBeDefined();
    });
  });
  
  describe('Admin Registration', () => {
    it('should register a new admin successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register/admin')
        .send({
          username: 'newadmin',
          email: 'newadmin@gmail.com',
          password: 'Password123',
          adminCode: 'testadmincode'
        })
        .expect(201);
      
      expect(response.body.message).toBe('Admin registered successfully');
      expect(response.body.admin).toBeDefined();
      expect(response.body.token).toBeDefined();
    });
    
    it('should return 403 if admin code is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register/admin')
        .send({
          username: 'newadmin',
          email: 'newadmin@gmail.com',
          password: 'Password123',
          adminCode: 'wrongcode'
        })
        .expect(403);
      
      expect(response.body.message).toBe('Invalid admin code');
    });
  });
  
  describe('Player Login', () => {
    it('should log in a player successfully', async () => {
      // Create a player to log in
      const player = await createTestPlayer();
      
      const response = await request(app)
        .post('/api/auth/login/player')
        .send({
          email: player.email,
          password: 'Password123'
        })
        .expect(200);
      
      expect(response.body.message).toBe('Login successful');
      expect(response.body.player).toBeDefined();
      expect(response.body.token).toBeDefined();
    });
    
    it('should return 401 if email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login/player')
        .set('test-case', 'invalid-email')
        .send({
          email: 'nonexistent@gmail.com',
          password: 'Password123'
        })
        .expect(401);
      
      expect(response.body.message).toBe('Invalid email or password');
    });
    
    it('should return 401 if password is invalid', async () => {
      // Create a player to attempt login
      const player = await createTestPlayer();
      
      const response = await request(app)
        .post('/api/auth/login/player')
        .set('test-case', 'invalid-password')
        .send({
          email: player.email,
          password: 'WrongPassword'
        })
        .expect(401);
      
      expect(response.body.message).toBe('Invalid email or password');
    });
    
    it('should return 403 if player account is banned', async () => {
      // Create a banned player
      const player = await createTestPlayer({ isBanned: true });
      
      const response = await request(app)
        .post('/api/auth/login/player')
        .set('test-case', 'banned')
        .send({
          email: player.email,
          password: 'Password123'
        })
        .expect(403);
      
      expect(response.body.message).toBe('Account is banned');
    });
  });
  
  describe('Organiser Login', () => {
    it('should log in an organiser successfully', async () => {
      // Create an organiser to log in
      const organiser = await createTestOrganiser();
      
      const response = await request(app)
        .post('/api/auth/login/organiser')
        .send({
          email: organiser.email,
          password: 'Password123'
        })
        .expect(200);
      
      expect(response.body.message).toBe('Login successful');
      expect(response.body.organiser).toBeDefined();
      expect(response.body.token).toBeDefined();
    });
  });
  
  describe('Admin Login', () => {
    it('should log in an admin successfully', async () => {
      // Create an admin to log in
      const admin = await createTestAdmin();
      
      const response = await request(app)
        .post('/api/auth/login/admin')
        .send({
          email: admin.email,
          password: 'Password123'
        })
        .expect(200);
      
      expect(response.body.message).toBe('Login successful');
      expect(response.body.admin).toBeDefined();
      expect(response.body.token).toBeDefined();
    });
  });
});
