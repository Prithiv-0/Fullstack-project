/**
 * server.js - Main Entry Point for the Smart City Command & Intelligence Platform
 *
 * This file initializes the Express application, sets up all middleware (security,
 * CORS, logging, rate limiting), connects to the MongoDB database, mounts all
 * API route modules under /api/v1/, and starts the HTTP server.
 *
 * The server also maintains backward-compatible route aliases under /api/ for
 * older client versions and kicks off the SLA breach cron job on startup.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

// Load environment variables from the root .env file
dotenv.config({ path: '../.env' });

// Establish connection to MongoDB before starting the server
connectDB();

const app = express();

// Helmet adds various HTTP headers for security (XSS protection, content type sniffing, etc.)
app.use(helmet());

// Enable CORS for the client app origin, allowing cookies/auth headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse incoming JSON request bodies
app.use(express.json());

// HTTP request logging in development mode using Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiting to all /api/ routes to prevent abuse
app.use('/api/', apiLimiter);

// Health check endpoint — used by monitoring tools and load balancers
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart City Command API is running',
    timestamp: new Date().toISOString()
  });
});

// ── V1 API Route Mounting ──────────────────────────────────────────────
// Each route module handles a specific domain of the application
app.use('/api/v1/auth', require('./routes/authRoutes'));            // Authentication (login, register, profile)
app.use('/api/v1/incidents', require('./routes/incidentRoutes'));    // Incident CRUD and lifecycle
app.use('/api/v1/ai', require('./routes/ai.routes'));               // AI classification endpoints
app.use('/api/v1/predictive', require('./routes/predictive.routes')); // Predictive analytics
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));   // City-wide analytics
app.use('/api/v1/departments', require('./routes/departmentRoutes')); // Department management
app.use('/api/v1/notifications', require('./routes/notification.routes')); // Notification system
app.use('/api/v1/reports', require('./routes/report.routes'));       // Report generation
app.use('/api/v1/feedback', require('./routes/feedback.routes'));    // Citizen feedback
app.use('/api/v1/sos', require('./routes/sos.routes'));             // Emergency SOS

// ── Backward Compatibility Routes ──────────────────────────────────────
// These aliases ensure older clients still work without /v1/ prefix
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));

// Centralized error handler — catches all errors from route handlers
app.use(errorHandler);

// Initialize the SLA breach ticker cron job (runs every 5 minutes)
require('./utils/slaTicker');

const PORT = process.env.PORT || 5000;

// Start the HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
});

// Graceful shutdown on unhandled promise rejections — log error and exit
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});
