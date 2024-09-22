require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const playerRouts = require('./routes/playerRouts');
const tournamentRoutes = require('./routes/tournamentRoutes');
const organiserRoutes = require('./routes/organiserRoutes');
const teamRoutes = require('./routes/teamRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// Serve the index.html on root path
app.get('/', (req, res) => {
  res.render('parallax'); // Adjust if you have a specific index.html to serve
});

// Serve signin and signup pages with roles
app.get('/signin', (req, res) => {
  const role = req.query.role;
  res.render('signin', { role });
});

app.get('/signup', (req, res) => {
  const role = req.query.role;
  res.render('signup', { role });
});

const jwtSecretKey = process.env.JWT_SECRET_KEY;
console.log("JWT_SECRET_KEY:", jwtSecretKey);


// Authentication routes

// Other API routes
app.use('/api/player', playerRouts);
app.use('/api/tournament',tournamentRoutes);
app.use('/api/organiser', organiserRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/report', reportRoutes);
app.use('/auth' , authRoutes);
app.use('/api',authRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/tournamentDB', {
  useNewUrlParser: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Start the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
