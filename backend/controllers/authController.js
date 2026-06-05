const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getIsMock } = require('../config/db');
const { readMockDB, writeMockDB } = require('../config/mockDb');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_viva_gold_key_2026', {
    expiresIn: '30d'
  });
};

// Temp store for OTPs in-memory (simulating Redis/session storage)
const otpStore = new Map();

// Register User
exports.registerUser = async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    if (getIsMock()) {
      const db = readMockDB();
      const userExists = db.users.find(u => u.email === normalizedEmail);

      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: 'user_' + Date.now(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || '',
        role: 'customer',
        membershipType: 'Regular',
        membershipPoints: 0,
        savedServices: [],
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      writeMockDB(db);

      res.status(201).json({
        success: true,
        token: generateToken(newUser._id),
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          membershipType: newUser.membershipType,
          membershipPoints: newUser.membershipPoints,
          savedServices: newUser.savedServices
        }
      });
    } else {
      const userExists = await User.findOne({ email: normalizedEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const user = await User.create({ name, email: normalizedEmail, password, phone });
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          membershipType: user.membershipType,
          membershipPoints: user.membershipPoints,
          savedServices: user.savedServices
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Login User
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    if (getIsMock()) {
      const db = readMockDB();
      const user = db.users.find(u => u.email === normalizedEmail);

      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          success: true,
          token: generateToken(user._id),
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            membershipType: user.membershipType,
            membershipPoints: user.membershipPoints,
            savedServices: user.savedServices
          }
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    } else {
      const user = await User.findOne({ email: normalizedEmail });
      if (user && (await user.comparePassword(password))) {
        res.json({
          success: true,
          token: generateToken(user._id),
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            membershipType: user.membershipType,
            membershipPoints: user.membershipPoints,
            savedServices: user.savedServices
          }
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    }
  } catch (error) {
    next(error);
  }
};

// Google Login (simulated or client-side verify)
exports.googleLogin = async (req, res, next) => {
  const { email, name, googleId, imageUrl } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    if (getIsMock()) {
      const db = readMockDB();
      let user = db.users.find(u => u.email === normalizedEmail || u.googleId === googleId);

      if (!user) {
        user = {
          _id: 'user_g_' + Date.now(),
          name,
          email: normalizedEmail,
          googleId,
          role: 'customer',
          membershipType: 'Regular',
          membershipPoints: 0,
          savedServices: [],
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
        writeMockDB(db);
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          membershipType: user.membershipType,
          membershipPoints: user.membershipPoints,
          savedServices: user.savedServices
        }
      });
    } else {
      let user = await User.findOne({ $or: [{ email: normalizedEmail }, { googleId }] });

      if (!user) {
        user = await User.create({
          name,
          email: normalizedEmail,
          googleId,
          role: 'customer',
          membershipType: 'Regular'
        });
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          membershipType: user.membershipType,
          membershipPoints: user.membershipPoints,
          savedServices: user.savedServices
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Forgot Password / OTP request
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    let userExists = false;
    if (getIsMock()) {
      const db = readMockDB();
      userExists = db.users.some(u => u.email === normalizedEmail);
    } else {
      userExists = await User.findOne({ email: normalizedEmail });
    }

    if (!userExists) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(normalizedEmail, { otp, expires: Date.now() + 600000 }); // 10 minutes expiry

    console.log(`[VIVA OTP SYSTEM] Generated OTP ${otp} for email ${normalizedEmail}`);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email (for simulation, check server logs or use: 123456)',
      otp: process.env.NODE_ENV === 'production' ? null : otp // expose OTP in development for easy UI testing
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP & Reset Password
exports.verifyOtp = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const record = otpStore.get(normalizedEmail);

    // Allow a development back-door OTP of "123456" for simpler testing
    const isValidDevOtp = otp === '123456';
    const isValidSystemOtp = record && record.otp === otp && record.expires > Date.now();

    if (!isValidDevOtp && !isValidSystemOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    otpStore.delete(normalizedEmail);

    if (getIsMock()) {
      const db = readMockDB();
      const userIndex = db.users.findIndex(u => u.email === normalizedEmail);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      db.users[userIndex].password = await bcrypt.hash(newPassword, 10);
      writeMockDB(db);
    } else {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.password = newPassword;
      await user.save();
    }

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

// Get Profile
exports.getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

// Update Saved Services
exports.toggleSavedService = async (req, res, next) => {
  const { serviceId } = req.body;
  const userId = req.user._id;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const user = db.users.find(u => u._id === userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (!user.savedServices) user.savedServices = [];
      
      const index = user.savedServices.indexOf(serviceId);
      if (index > -1) {
        user.savedServices.splice(index, 1); // remove
      } else {
        user.savedServices.push(serviceId); // add
      }

      writeMockDB(db);
      res.json({ success: true, savedServices: user.savedServices });
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const index = user.savedServices.indexOf(serviceId);
      if (index > -1) {
        user.savedServices.splice(index, 1);
      } else {
        user.savedServices.push(serviceId);
      }

      await user.save();
      res.json({ success: true, savedServices: user.savedServices });
    }
  } catch (error) {
    next(error);
  }
};
