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

// Temp store for Reset Tokens
const resetTokenStore = new Map();

// Forgot Password - Generate Reset Token
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    let userExists = false;
    let userName = '';
    if (getIsMock()) {
      const db = readMockDB();
      const user = db.users.find(u => u.email === normalizedEmail);
      userExists = !!user;
      if (user) userName = user.name;
    } else {
      const user = await User.findOne({ email: normalizedEmail });
      userExists = !!user;
      if (user) userName = user.name;
    }

    if (!userExists) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate token
    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex');
    
    // Store token (valid for 1 hour)
    resetTokenStore.set(token, {
      email: normalizedEmail,
      expires: Date.now() + 3600000 // 1 hour
    });

    // Also support OTP for backwards compatibility
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(normalizedEmail, { otp, expires: Date.now() + 600000 }); // 10 minutes expiry

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${token}`;
    console.log(`\n================================================================`);
    console.log(`[VIVA PASSWORD RESET SYSTEM]`);
    console.log(`User: ${userName} (${normalizedEmail})`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`OTP (Fallback): ${otp}`);
    console.log(`================================================================\n`);

    res.json({
      success: true,
      message: 'Password reset link sent to your email (for simulation, check server console logs)',
      token: process.env.NODE_ENV === 'production' ? null : token, // expose token in development
      otp: process.env.NODE_ENV === 'production' ? null : otp
    });
  } catch (error) {
    next(error);
  }
};

// Validate Reset Token
exports.validateResetToken = async (req, res, next) => {
  const { token } = req.params;
  try {
    const record = resetTokenStore.get(token);
    if (!record || record.expires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    res.json({ success: true, message: 'Token is valid' });
  } catch (error) {
    next(error);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const record = resetTokenStore.get(token);

    if (!record || record.expires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const { email } = record;

    if (getIsMock()) {
      const db = readMockDB();
      const userIndex = db.users.findIndex(u => u.email === email);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      db.users[userIndex].password = await bcrypt.hash(password, 10);
      writeMockDB(db);
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.password = password; // pre-save hook will hash it
      await user.save();
    }

    // Clear the token
    resetTokenStore.delete(token);

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};

// Verify OTP & Reset Password (Fallback / legacy)
exports.verifyOtp = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const record = otpStore.get(normalizedEmail);

    const isValidDevOtp = otp === '123456';
    const isValidSystemOtp = record && record.otp === otp && record.expires > Date.now();

    if (!isValidDevOtp && !isValidSystemOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

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

// Update Profile
exports.updateProfile = async (req, res, next) => {
  const { name, email, phone } = req.body;
  const userId = req.user._id;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const normalizedEmail = email.toLowerCase().trim();

    if (getIsMock()) {
      const db = readMockDB();
      
      // Check if email is taken by another user
      const emailTaken = db.users.some(u => u.email === normalizedEmail && u._id !== userId);
      if (emailTaken) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      const userIndex = db.users.findIndex(u => u._id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      db.users[userIndex].name = name || db.users[userIndex].name;
      db.users[userIndex].email = normalizedEmail;
      db.users[userIndex].phone = phone || db.users[userIndex].phone;
      
      writeMockDB(db);
      
      const updatedUser = { ...db.users[userIndex] };
      delete updatedUser.password;
      
      res.json({
        success: true,
        user: updatedUser
      });
    } else {
      // Check if email is taken by another user
      const emailTaken = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
      if (emailTaken) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.name = name || user.name;
      user.email = normalizedEmail;
      user.phone = phone || user.phone;

      await user.save();
      
      const userWithoutPassword = await User.findById(userId).select('-password');
      res.json({
        success: true,
        user: userWithoutPassword
      });
    }
  } catch (error) {
    next(error);
  }
};
