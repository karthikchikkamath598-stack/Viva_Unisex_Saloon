const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  verifyOtp,
  getProfile,
  toggleSavedService
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.get('/profile', protect, getProfile);
router.post('/toggle-save', protect, toggleSavedService);

module.exports = router;
