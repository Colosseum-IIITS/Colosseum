const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Player = require('../../models/Player');
const Organiser = require('../../models/Organiser');
const Admin = require('../../models/Admin');
const authController = require('../authController');
const { createTestPlayer, createTestAdmin } = require('../../test/testUtils');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ response: 'Email sent' })
  })
}));

// Setup express app for testing
const app = express();
app.use(express.json());

// Register auth routes for testing
app.post('/auth/player/register', authController.createPlayer);
app.post('/auth/player/login', authController.loginPlayer);
app.post('/auth/organiser/register', authController.createOrganiser);
app.post('/auth/organiser/login', authController.loginOrganiser);
app.post('/auth/admin/register', authController.createAdmin);
app.post('/auth/admin/login', authController.loginAdmin);

// Setup environment
process.env.JWT_SECRET_KEY = 'test_secret_key';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test_password';

// Load test setup
require('../../test/setup');

describe('Auth Controller Tests', () => {
  describe('Player Registration', () => {
    it('should register a new player successfully', async () => {
      const playerData = {
        username: 'testplayer',
        email: 'testplayer@gmail.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/player/register')
        .send(playerData)
        .expect(201);

      expect(response.body.message).toBe('Player registered successfully');
      expect(response.body.token).toBeDefined();

      // Verify player was created in the database
      const player = await Player.findOne({ username: playerData.username });
      expect(player).toBeTruthy();
      expect(player.email).toBe(playerData.email);
    });

    it('should return 400 if username already exists', async () => {
      // Create a player first
      await createTestPlayer({ username: 'existingplayer', email: 'unique@gmail.com' });

      // Try to create another player with the same username
      const response = await request(app)
        .post('/auth/player/register')
        .send({
          username: 'existingplayer',
          email: 'different@gmail.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.errorMessage).toBe('Username already exists!');
    });

    it('should return 400 if email already exists', async () => {
      // Create a player first
      await createTestPlayer({ username: 'uniqueplayer', email: 'existing@gmail.com' });

      // Try to create another player with the same email
      const response = await request(app)
        .post('/auth/player/register')
        .send({
          username: 'differentplayer',
          email: 'existing@gmail.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.errorMessage).toBe('Email already taken!');
    });

    it('should return 400 if email is not a Gmail address', async () => {
      const response = await request(app)
        .post('/auth/player/register')
        .send({
          username: 'testplayer',
          email: 'testplayer@hotmail.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.errorMessage).toBe('Only Gmail addresses are allowed');
    });
  });

  describe('Player Login', () => {
    it('should login a player successfully', async () => {
      // Create a test player
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const player = await createTestPlayer({ 
        username: 'loginplayer', 
        password: hashedPassword 
      });

      const response = await request(app)
        .post('/auth/player/login')
        .send({
          username: 'loginplayer',
          password: password
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
    });

    it('should return 401 if player not found', async () => {
      const response = await request(app)
        .post('/auth/player/login')
        .send({
          username: 'nonexistentplayer',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.errorMessage).toBe('Player not found');
    });

    it('should return 401 if password is incorrect', async () => {
      // Create a test player
      await createTestPlayer({ username: 'passwordplayer' });

      const response = await request(app)
        .post('/auth/player/login')
        .send({
          username: 'passwordplayer',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.errorMessage).toBe('Invalid username or password');
    });

    it('should return 403 if player is banned', async () => {
      // Create a banned test player
      await createTestPlayer({ 
        username: 'bannedplayer',
        banned: true
      });

      const response = await request(app)
        .post('/auth/player/login')
        .send({
          username: 'bannedplayer',
          password: 'password123'
        })
        .expect(403);

      expect(response.body.errorMessage).toBe('Player is banned');
    });
  });

  describe('Admin Registration', () => {
    it('should register a new admin successfully', async () => {
      const adminData = { username: 'testadmin', email: 'testadmin@gmail.com', password: 'password123' };
      const response = await request(app)
        .post('/auth/admin/register')
        .send(adminData)
        .expect(201);
      expect(response.body.message).toBe('Admin registered successfully');
      const admin = await Admin.findOne({ username: adminData.username });
      expect(admin).toBeTruthy();
      expect(admin.email).toBe(adminData.email);
    });

    it('should return 400 if admin username already exists', async () => {
      await createTestAdmin({ username: 'existingadmin', email: 'existingadmin@gmail.com' });
      const response = await request(app)
        .post('/auth/admin/register')
        .send({ username: 'existingadmin', email: 'different@gmail.com', password: 'password123' })
        .expect(400);
      expect(response.body.message).toBe('Admin already exists');
    });
  });

  describe('Admin Login', () => {
    it('should login an admin successfully', async () => {
      const username = `admin_${Date.now()}`;
      const admin = await createTestAdmin({ username, email: `${username}@gmail.com` });
      const response = await request(app)
        .post('/auth/admin/login')
        .send({ username: admin.username, password: 'password123' })
        .expect(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
    });

    it('should return 401 if admin not found', async () => {
      const response = await request(app)
        .post('/auth/admin/login')
        .send({ username: 'nouser', password: 'password123' })
        .expect(401);
      expect(response.body.errorMessage).toBe('Invalid username or password');
    });

    it('should return 401 if password is incorrect', async () => {
      const admin = await createTestAdmin({ username: 'passadmin', email: 'passadmin@gmail.com' });
      const response = await request(app)
        .post('/auth/admin/login')
        .send({ username: admin.username, password: 'wrongpassword' })
        .expect(401);
      expect(response.body.errorMessage).toBe('Invalid username or password');
    });
  });

  // Add similar tests for Organiser authentication
});
