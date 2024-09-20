const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const playerRouts = require('./routes/playerRouts');
const tournamentRoutes = require('./routes/tournamentRoutes');
const organiserRoutes = require('./routes/organiserRoutes');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// Serve the index.html on root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Authentication routes

// Other API routes
app.use('/api/player', playerRouts);
app.use('/api/tournament',tournamentRoutes);
app.use('/api/organiser', organiserRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/tournamentDB', {
  useNewUrlParser: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
