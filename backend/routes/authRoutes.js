const express = require('express');
const router = express.Router();
const {
  getProfile,
  registerAdmin,
  loginAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: { success: false, message: 'Too many registration attempts. Please try again after 15 minutes.' }
});

// ── Admin Auth Routes ──────────────────────────────────────
router.post('/admin-register', registerLimiter, validate(registerSchema), registerAdmin);
router.post('/admin-login', validate(loginSchema), loginAdmin);

// ── Profile (Protected) ───────────────────────────────────
router.get('/profile', protect, getProfile);

module.exports = router;
