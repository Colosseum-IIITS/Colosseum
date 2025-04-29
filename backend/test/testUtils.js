const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Player = require('../models/Player');
const Organiser = require('../models/Organiser');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

// Create a test player
const createTestPlayer = async (userData = {}) => {
  const defaultData = {
    username: `player_${Date.now()}`,
    email: `player_${Date.now()}@gmail.com`,
    password: await bcrypt.hash('password123', 10)
  };
  
  const player = new Player({
    ...defaultData,
    ...userData
  });
  
  await player.save();
  return player;
};

// Create a test organiser
const createTestOrganiser = async (userData = {}) => {
  const defaultData = {
    username: `organiser_${Date.now()}`,
    email: `organiser_${Date.now()}@gmail.com`,
    password: await bcrypt.hash('password123', 10)
  };
  
  const organiser = new Organiser({
    ...defaultData,
    ...userData
  });
  
  await organiser.save();
  return organiser;
};

// Create a test admin
const createTestAdmin = async (userData = {}) => {
  const defaultData = {
    username: `admin_${Date.now()}`,
    email: `admin_${Date.now()}@gmail.com`,
    password: await bcrypt.hash('password123', 10)
  };
  
  const admin = new Admin({
    ...defaultData,
    ...userData
  });
  
  await admin.save();
  return admin;
};

// Generate a JWT token for testing
const generateAuthToken = (user, role) => {
  return jwt.sign(
    { id: user._id, role },
    process.env.JWT_SECRET_KEY || 'test_secret_key',
    { expiresIn: '1h' }
  );
};

// Generate a random MongoDB ObjectId
const generateObjectId = () => new mongoose.Types.ObjectId();

module.exports = {
  createTestPlayer,
  createTestOrganiser,
  createTestAdmin,
  generateAuthToken,
  generateObjectId
};
