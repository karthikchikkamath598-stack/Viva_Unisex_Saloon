const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const normalizePhone = (phone) => {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('91') && p.length === 12) p = p.slice(2);
  return p;
};

const safeUser = (u) => ({
  _id: u.id,
  fullName: u.fullName,
  name: u.fullName, // for compatibility
  mobileNumber: u.mobileNumber,
  phone: u.mobileNumber, // for compatibility
  role: u.role,
  membership: { type: 'None', status: 'None' },
  membershipPoints: 0,
  savedServices: []
});

// 1. GET PROFILE (Protected)
exports.getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, user: safeUser(req.user) });
  } catch (err) {
    next(err);
  }
};

// 2. ADMIN REGISTRATION
exports.registerAdmin = async (req, res, next) => {
  const { fullName, mobileNumber, password, role } = req.body;
  const cleanMobile = normalizePhone(mobileNumber);

  try {
    const adminExists = await prisma.admin.findUnique({
      where: { mobileNumber: cleanMobile }
    });

    if (adminExists) {
      return res.status(400).json({ success: false, message: 'This mobile number is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminRole = ['owner', 'software_manager', 'software_developer', 'admin'].includes(role) ? role : 'admin';

    await prisma.admin.create({
      data: {
        fullName,
        mobileNumber: cleanMobile,
        password: hashedPassword,
        role: adminRole
      }
    });

    res.status(201).json({ success: true, message: 'Admin account registered successfully. Please login.' });
  } catch (err) {
    next(err);
  }
};

// 3. ADMIN LOGIN
exports.loginAdmin = async (req, res, next) => {
  const { mobileNumber, password } = req.body;
  const cleanMobile = normalizePhone(mobileNumber);

  try {
    const admin = await prisma.admin.findUnique({
      where: { mobileNumber: cleanMobile }
    });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Check your details and password.' });
    }

    // Device restriction check
    const ua = req.headers['user-agent'] || '';
    const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isMobileSec = req.headers['sec-ch-ua-mobile'] === '?1';
    if (isMobileUa || isMobileSec) {
      return res.status(403).json({ success: false, message: 'Admin portal is only accessible on desktop/laptop devices.' });
    }

    const payload = {
      _id: admin.id,
      fullName: admin.fullName,
      name: admin.fullName,
      mobileNumber: admin.mobileNumber,
      phone: admin.mobileNumber,
      role: admin.role
    };

    return res.json({ success: true, token: generateToken(admin.id), user: payload });
  } catch (err) {
    next(err);
  }
};
