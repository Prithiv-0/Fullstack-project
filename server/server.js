const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

// Load env vars
dotenv.config({ path: '../.env' });

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parser
app.use(express.json());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Smart City Command API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes — v1 API
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/incidents', require('./routes/incidentRoutes'));
app.use('/api/v1/ai', require('./routes/ai.routes'));
app.use('/api/v1/predictive', require('./routes/predictive.routes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));
app.use('/api/v1/departments', require('./routes/departmentRoutes'));
app.use('/api/v1/notifications', require('./routes/notification.routes'));
app.use('/api/v1/reports', require('./routes/report.routes'));
app.use('/api/v1/feedback', require('./routes/feedback.routes'));
app.use('/api/v1/sos', require('./routes/sos.routes'));

// Backward compat — mount under /api too
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));

// Error handler
app.use(errorHandler);

// Start SLA cron job
require('./utils/slaTicker');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/v1`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});
