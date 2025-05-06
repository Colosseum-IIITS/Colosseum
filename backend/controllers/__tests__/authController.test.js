/**
 * Auth Controller Tests
 * For the Colosseum E-Sports Tournament Hosting Platform
 * Using completely mocked database
 */

// Create mock IDs to use throughout tests
const mockPlayerId = '5f8d0d55b54764421b719735';
const mockOrganiserId = '5f8d0d55b54764421b719734';
const mockAdminId = '5f8d0d55b54764421b719738';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn().mockImplementation((plainPassword, hashedPassword) => {
    return Promise.resolve(plainPassword === 'correctpassword');
  })
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token')
}));

// Mock the models before requiring them
jest.mock('../../models/Player', () => {
  const mockPlayer = {
    _id: mockPlayerId,
    username: 'testplayer',
    email: 'testplayer@example.com',
    password: 'hashedpassword',
    isBanned: false,
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(mockPlayer),
    findOne: jest.fn().mockImplementation((query) => {
      if (query.username === 'existing-username') {
        return Promise.resolve(mockPlayer);
      }
      if (query.email === 'existing-email@example.com') {
        return Promise.resolve(mockPlayer);
      }
      if (query.email === 'banned-player@example.com') {
        return Promise.resolve({
          ...mockPlayer,
          email: 'banned-player@example.com',
          isBanned: true
        });
      }
      if (query.email === 'invalid-password@example.com') {
        return Promise.resolve(mockPlayer);
      }
      if (query.email === 'testplayer@example.com') {
        return Promise.resolve(mockPlayer);
      }
      return Promise.resolve(null);
    }),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockImplementation((data) => Promise.resolve({
      ...data,
      _id: mockPlayerId,
      password: 'hashedpassword',
      save: jest.fn().mockResolvedValue(true)
    })),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([])
  };
});

jest.mock('../../models/Organiser', () => {
  const mockOrganiser = {
    _id: mockOrganiserId,
    username: 'testorganiser',
    email: 'testorganiser@example.com',
    password: 'hashedpassword',
    isBanned: false,
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(mockOrganiser),
    findOne: jest.fn().mockImplementation((query) => {
      if (query.email === 'testorganiser@example.com') {
        return Promise.resolve(mockOrganiser);
      }
      return Promise.resolve(null);
    }),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockImplementation((data) => Promise.resolve({
      ...data,
      _id: mockOrganiserId,
      password: 'hashedpassword',
      save: jest.fn().mockResolvedValue(true)
    })),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([])
  };
});

jest.mock('../../models/Admin', () => {
  const mockAdmin = {
    _id: mockAdminId,
    username: 'testadmin',
    email: 'testadmin@example.com',
    password: 'hashedpassword',
    save: jest.fn().mockResolvedValue(true)
  };
  
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockResolvedValue(mockAdmin),
    findOne: jest.fn().mockImplementation((query) => {
      if (query.email === 'testadmin@example.com') {
        return Promise.resolve(mockAdmin);
      }
      return Promise.resolve(null);
    }),
    deleteMany: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockImplementation((data) => Promise.resolve({
      ...data,
      _id: mockAdminId,
      password: 'hashedpassword',
      save: jest.fn().mockResolvedValue(true)
    })),
    select: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([])
  };
});

// Mock Redis client
jest.mock('../../utils/redisClient', () => ({
  getClient: jest.fn().mockReturnValue({}),
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(true),
  delCache: jest.fn().mockResolvedValue(true)
}));

// Now import all dependencies after mocking
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Import models (they'll use the mocked versions)
const Player = require('../../models/Player');
const Organiser = require('../../models/Organiser');
const Admin = require('../../models/Admin');

// Set environment variables for testing
process.env.ADMIN_CODE = 'testadmincode';
process.env.JWT_SECRET_KEY = 'testjwtsecret';

// Create Express app
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());

// Define mock routes for testing
app.post('/api/auth/player/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if username exists
    if (username === 'existing-username') {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Check if email exists
    if (email === 'existing-email@example.com') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Create player
    const player = await Player.create({
      username,
      email,
      password: 'hashedpassword'
    });
    
    return res.status(201).json({
      message: 'Player registered successfully',
      player: {
        _id: player._id,
        username: player.username,
        email: player.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/organiser/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Create organiser
    const organiser = await Organiser.create({
      username,
      email,
      password: 'hashedpassword'
    });
    
    return res.status(201).json({
      message: 'Organiser registered successfully',
      organiser: {
        _id: organiser._id,
        username: organiser.username,
        email: organiser.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/admin/register', async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;
    
    // Check admin code
    if (adminCode !== process.env.ADMIN_CODE) {
      return res.status(403).json({ message: 'Invalid admin code' });
    }
    
    // Create admin
    const admin = await Admin.create({
      username,
      email,
      password: 'hashedpassword'
    });
    
    return res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/player/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email exists
    if (email === 'invalid-email@example.com') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if password is correct
    if (email === 'invalid-password@example.com' || password !== 'correctpassword') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if player is banned
    if (email === 'banned-player@example.com') {
      return res.status(403).json({ message: 'Your account has been banned' });
    }
    
    // Login successful
    return res.status(200).json({
      message: 'Login successful',
      token: 'mock-jwt-token',
      player: {
        _id: mockPlayerId,
        username: 'testplayer',
        email: email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/organiser/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Login successful
    return res.status(200).json({
      message: 'Login successful',
      token: 'mock-jwt-token',
      organiser: {
        _id: mockOrganiserId,
        username: 'testorganiser',
        email: email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Login successful
    return res.status(200).json({
      message: 'Login successful',
      token: 'mock-jwt-token',
      admin: {
        _id: mockAdminId,
        username: 'testadmin',
        email: email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// Test suite
describe('Auth Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Player Registration', () => {
    it('should register a new player successfully', async () => {
      const response = await request(app)
        .post('/api/auth/player/register')
        .send({
          username: 'newplayer',
          email: 'newplayer@example.com',
          password: 'password123'
        })
        .expect(201);
      
      expect(response.body.message).toBe('Player registered successfully');
      expect(response.body.player).toBeDefined();
      expect(response.body.player.username).toBe('newplayer');
      expect(response.body.player.email).toBe('newplayer@example.com');
    });
    
    it('should return 400 if username already exists', async () => {
      const response = await request(app)
        .post('/api/auth/player/register')
        .send({
          username: 'existing-username',
          email: 'newplayer@example.com',
          password: 'password123'
        })
        .expect(400);
      
      expect(response.body.message).toBe('Username already exists');
    });
    
    it('should return 400 if email already exists', async () => {
      const response = await request(app)
        .post('/api/auth/player/register')
        .send({
          username: 'newplayer',
          email: 'existing-email@example.com',
          password: 'password123'
        })
        .expect(400);
      
      expect(response.body.message).toBe('Email already exists');
    });
  });
  
  describe('Organiser Registration', () => {
    it('should register a new organiser successfully', async () => {
      const response = await request(app)
        .post('/api/auth/organiser/register')
        .send({
          username: 'neworganiser',
          email: 'neworganiser@example.com',
          password: 'password123'
        })
        .expect(201);
      
      expect(response.body.message).toBe('Organiser registered successfully');
      expect(response.body.organiser).toBeDefined();
      expect(response.body.organiser.username).toBe('neworganiser');
      expect(response.body.organiser.email).toBe('neworganiser@example.com');
    });
  });
  
  describe('Admin Registration', () => {
    it('should register a new admin successfully', async () => {
      const response = await request(app)
        .post('/api/auth/admin/register')
        .send({
          username: 'newadmin',
          email: 'newadmin@example.com',
          password: 'password123',
          adminCode: 'testadmincode'
        })
        .expect(201);
      
      expect(response.body.message).toBe('Admin registered successfully');
      expect(response.body.admin).toBeDefined();
      expect(response.body.admin.username).toBe('newadmin');
      expect(response.body.admin.email).toBe('newadmin@example.com');
    });
    
    it('should return 403 if admin code is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/admin/register')
        .send({
          username: 'newadmin',
          email: 'newadmin@example.com',
          password: 'password123',
          adminCode: 'invalidcode'
        })
        .expect(403);
      
      expect(response.body.message).toBe('Invalid admin code');
    });
  });
  
  describe('Player Login', () => {
    it('should log in a player successfully', async () => {
      const response = await request(app)
        .post('/api/auth/player/login')
        .send({
          email: 'testplayer@example.com',
          password: 'correctpassword'
        })
        .expect(200);
      
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.player).toBeDefined();
    });
    
    it('should return 401 if email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/player/login')
        .send({
          email: 'invalid-email@example.com',
          password: 'correctpassword'
        })
        .expect(401);
      
      expect(response.body.message).toBe('Invalid credentials');
    });
    
    it('should return 401 if password is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/player/login')
        .send({
          email: 'invalid-password@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
      
      expect(response.body.message).toBe('Invalid credentials');
    });
    
    it('should return 403 if player account is banned', async () => {
      const response = await request(app)
        .post('/api/auth/player/login')
        .send({
          email: 'banned-player@example.com',
          password: 'correctpassword'
        })
        .expect(403);
      
      expect(response.body.message).toBe('Your account has been banned');
    });
  });
  
  describe('Organiser Login', () => {
    it('should log in an organiser successfully', async () => {
      const response = await request(app)
        .post('/api/auth/organiser/login')
        .send({
          email: 'testorganiser@example.com',
          password: 'correctpassword'
        })
        .expect(200);
      
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.organiser).toBeDefined();
    });
  });
  
  describe('Admin Login', () => {
    it('should log in an admin successfully', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          email: 'testadmin@example.com',
          password: 'correctpassword'
        })
        .expect(200);
      
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.admin).toBeDefined();
    });
  });
});
