const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
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
app.use('/api/auth', authRoutes);

// Other API routes
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/admin', adminRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/tournamentDB', {
  useNewUrlParser: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
