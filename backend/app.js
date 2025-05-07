require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { authenticateUser } = require("./middleware/authMiddleware");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swaggerConfig");
const morgan = require("morgan");
const cors = require("cors");
const rfs = require("rotating-file-stream");
const helmet = require("helmet");

// Import routes
const playerRoutes = require("./routes/playerRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");
const organiserRoutes = require("./routes/organiserRoutes");
const teamRoutes = require("./routes/teamRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const b2cRoutes = require("./externalApis/b2c/routes");
const b2bRoutes = require("./externalApis/b2b/routes");

const app = express();

// Environment variables
const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

// Security headers - relaxed for cross-domain cookies
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// CORS configuration - using a simpler, more permissive approach for production
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Origin',
    'Accept',
    'Cache-Control'
  ],
  exposedHeaders: ['Set-Cookie', 'Date', 'ETag'],
  maxAge: 86400
}));

// Configure logging based on environment
let morganFormat;
if (isProduction) {
  morganFormat =
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] - :response-time ms';
  // Create a log stream for production
  const logStream = rfs.createStream("Colosseum-morgan-logs.txt", {
    size: "10M", // rotate every 10 MegaBytes written
    interval: "1d", // rotate daily
    compress: "gzip", // compress rotated files
  });
  app.use(morgan(morganFormat, { stream: logStream }));
} else {
  morganFormat = "dev";
  app.use(morgan(morganFormat)); // Log to console in development
}

// Body parsing middleware
app.use(express.json({ limit: "1mb" })); // Limit payload size
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes setup
app.use("/api/player", playerRoutes);
app.use("/api/tournament", tournamentRoutes);
app.use("/api/organiser", organiserRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/b2c", b2cRoutes);
app.use("/b2b", b2bRoutes);

// API documentation (disable in production or secure it)
// if (!isProduction) {
  app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// } else {
//   // In production, you might want to secure the API docs
//   app.use("/", authenticateUser, swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// }

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Something went wrong";

  const errorResponse = isProduction
    ? { message }
    : { message, stack: err.stack, details: err };

  console.error(`[${new Date().toISOString()}] Error:`, err);
  res.status(status).json(errorResponse);
});

app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    // Modern MongoDB connection options (compatible with Mongoose 8+)
    // Add connection pool settings for production
    ...(isProduction
      ? {
          maxPoolSize: 50,
          wtimeoutMS: 2500,
        }
      : {}),
  })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(async () => {
    console.log("HTTP server closed");
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    } catch (err) {
      console.error("Error closing MongoDB connection", err);
      process.exit(1);
    }
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`Test server running at http://localhost:${PORT}`);
});
