// VIVA Unisex Salon Backend
require('dotenv').config();

if (process.env.NODE_ENV === 'test' && !process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_suite_jwt_secret_token_key_2026';
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, prisma } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const stylistRoutes = require('./routes/stylistRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const offerRoutes = require('./routes/offerRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const customerRoutes = require('./routes/customerRoutes');
const billingRoutes = require('./routes/billingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middlewares
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.unsplash.com"],
      connectSrc: ["'self'", "http://localhost:*", "https://*", "ws://localhost:*"],
      frameSrc: ["'self'", "https://maps.google.com", "https://*.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CLIENT_URL || `http://localhost:${PORT}`,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter for admin login to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 login requests per 15 minutes
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' }
});
app.use('/api/auth/admin-login', loginLimiter);

// API Routes Mapping (must come before the catch-all)
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/stylists', stylistRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/billing', billingRoutes);

// Root route (API status check)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "VIVA Unisex Salon API is running",
    status: "healthy"
  });
});

// Database connectivity health check route
app.get('/health', async (req, res) => {
  try {
    // Run SELECT 1 query to confirm database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      status: "healthy",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      database: "disconnected",
      error: error.message
    });
  }
});

// Catch-all middleware for unknown routes (returns 404 API Endpoint Not Found)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Endpoint Not Found"
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  ✨ VIVA Unisex Salon — Full Stack Server`);
    console.log(`  🌐 Open in browser: http://localhost:${PORT}`);
    console.log(`  ⚙️  API base:        http://localhost:${PORT}/api`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`======================================================\n`);

    // Start the background cron scheduler (1-hour reminders)
    const { startScheduler } = require('./services/scheduler');
    startScheduler();
  });
}

module.exports = app;
