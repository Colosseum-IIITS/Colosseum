require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { authenticateUser } = require('./middleware/authMiddleware');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerConfig');
require('dotenv').config();
const morgan = require('morgan');
const cors = require('cors');
const rfs = require("rotating-file-stream");

// Import routes
const playerRoutes = require('./routes/playerRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const organiserRoutes = require('./routes/organiserRoutes');
const teamRoutes = require('./routes/teamRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Allow requests from the frontend
app.use(cors({origin: 'http://localhost:3000', credentials: true}));

// Create a log stream
const logStream = rfs.createStream("Colosseum-morgan-logs.txt", {
  size: '10M', // rotate every 10 MegaBytes written
  interval: '1d', // rotate daily
  compress: 'gzip' // compress rotated files
});

// Custom Morgan format for more informative logs
const format = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms';

// Middleware setup
app.use(morgan(format, { stream: logStream }));
// app.use(morgan(format)); // To log to console as well

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes setup
app.use('/api/player', playerRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/organiser', organiserRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY); // For debugging

// Swagger routes
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
