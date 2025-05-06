require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { authenticateUser } = require('./middleware/authMiddleware');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerConfig');
const morgan = require('morgan');
const cors = require('cors');
const rfs = require("rotating-file-stream");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import routes
const playerRoutes = require('./routes/playerRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const organiserRoutes = require('./routes/organiserRoutes');
const teamRoutes = require('./routes/teamRoutes');
const reportRoutes = require('./routes/reportRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const b2cRoutes = require('./externalApis/b2c/routes');
const b2bRoutes = require('./externalApis/b2b/routes');


const app = express();

// Environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  // Allow both HTTP and HTTPS for local development
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      process.env.FRONTEND_URL
    ];
    // Remove any undefined or null values
    const validOrigins = allowedOrigins.filter(o => o);
    
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || validOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Configure logging based on environment
let morganFormat;
if (isProduction) {
  morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms';
  // Create a log stream for production
  const logStream = rfs.createStream("Colosseum-morgan-logs.txt", {
    size: '10M', // rotate every 10 MegaBytes written
    interval: '1d', // rotate daily
    compress: 'gzip' // compress rotated files
  });
  app.use(morgan(morganFormat, { stream: logStream }));
} else {
  morganFormat = 'dev';
  app.use(morgan(morganFormat)); // Log to console in development
}

// Body parsing middleware
app.use(express.json({ limit: '1mb' })); // Limit payload size
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
app.use('/b2c', b2cRoutes);
app.use('/b2b', b2bRoutes);

// API documentation (disable in production or secure it)
if (!isProduction) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
} else {
  // In production, you might want to secure the API docs
  app.use('/api-docs', authenticateUser, swaggerUi.serve, swaggerUi.setup(swaggerDocs));
}

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';
  
  // Don't expose sensitive error details in production
  const errorResponse = isProduction 
    ? { message } 
    : { message, stack: err.stack, details: err };
  
  console.error(`[${new Date().toISOString()}] Error:`, err);
  res.status(status).json(errorResponse);
});

// 404 handler - should be after all defined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    // Modern MongoDB connection options (compatible with Mongoose 8+)
    // Add connection pool settings for production
    ...(isProduction ? {
      maxPoolSize: 50,
      wtimeoutMS: 2500
    } : {})
  })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
