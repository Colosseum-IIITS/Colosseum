require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { authenticateToken } = require('./middleware/authMiddleware');


// Import routes
const playerRoutes = require('./routes/playerRouts');
const tournamentRoutes = require('./routes/tournamentRoutes');
const organiserRoutes = require('./routes/organiserRoutes');
const teamRoutes = require('./routes/teamRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import the tournament controller
const playerController = require('./controllers/playerController');

const app = express();

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS and set views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Serve static files from the "assets" directory
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// Route for searching tournaments
app.get('/searchTournaments', playerController.searchTournaments); // Tournament search route
app.get('/dashboard', authenticateToken, playerController.getDashboard);

// Routes for sign-in and sign-up with roles
app.get('/signin', (req, res) => {
    const role = req.query.role;
    res.render('signin', { role });
});
process.env.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "123mysuperstar";
app.get('/signup', (req, res) => {
    const role = req.query.role;
    res.render('signup', { role });
});

app.get('/admin', (req, res) => {
    res.render('adminSignin');
});

app.get('/admin/create', (req, res) => {
    res.render('adminSignup');  // Renders the signup form
});

app.get('/', (req, res) => {
  res.render('parallax');
});
// app.get('/dashboard', (req, res) => {
//     res.render('dashboard');
// });

  app.get('/profile', (req, res) => {
    console.log(req.user); // Check what is being passed
    res.render('profile', { user: req.user || null });
});

    

// Use routes for players, tournaments, organisers, teams, reports, and authentication
app.use('/api/player', playerRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/organiser', organiserRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/report', reportRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);


// MongoDB connection
mongoose.connect('mongodb://localhost:27017/tournamentDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Start the server
const PORT = process.env.PORT || 3010; 
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


