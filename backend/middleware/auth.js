const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          fullName: true,
          mobileNumber: true,
          role: true,
          createdAt: true
        }
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Not authorized, admin not found' });
      }

      req.user = {
        ...user,
        _id: user.id,
        name: user.fullName,
        phone: user.mobileNumber
      };
      
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && ['admin', 'owner', 'software_manager', 'software_developer'].includes(req.user.role)) {
    const userAgent = req.headers['user-agent'] || '';
    const isMobileUa = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isMobileSec = req.headers['sec-ch-ua-mobile'] === '?1';
    if (isMobileUa || isMobileSec) {
      return res.status(403).json({ success: false, message: 'Admin portal access is strictly restricted to desktop and laptop devices only.' });
    }
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as admin' });
  }
};

module.exports = { protect, isAdmin };
