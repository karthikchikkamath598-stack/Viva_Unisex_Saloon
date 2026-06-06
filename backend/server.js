require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
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

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (falls back to local JSON mock DB if MongoDB connection fails)
connectDB();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to VIVA Unisex Salon Premium Full-Stack API',
    status: 'Online',
    timestamp: new Date().toISOString()
  });
});

// API Routes Mapping
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/stylists', stylistRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// Page Not Found (404) Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource endpoint not found' });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`VIVA Unisex Salon Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`======================================================\n`);
  
  // Start the background cron scheduler
  const { startScheduler } = require('./services/scheduler');
  startScheduler();
});
