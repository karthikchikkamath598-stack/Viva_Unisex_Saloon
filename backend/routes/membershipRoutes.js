const express = require('express');
const router = express.Router();
const {
  purchaseMembership,
  applyStudentMembership,
  getAllMemberships,
  approveStudentMembership,
  rejectStudentMembership,
  manualUpdateMembership
} = require('../controllers/membershipController');
const { protect, isAdmin } = require('../middleware/auth');
const {
  validate,
  purchaseMembershipSchema,
  applyStudentMembershipSchema,
  manualUpdateMembershipSchema
} = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

const membershipLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10,
  message: { success: false, message: 'Too many membership registration attempts from this IP. Please try again later.' }
});

// Customer Actions (Public with Rate Limiting)
router.post('/purchase', membershipLimiter, validate(purchaseMembershipSchema), purchaseMembership);
router.post('/apply', membershipLimiter, validate(applyStudentMembershipSchema), applyStudentMembership);

// Admin Actions (Strictly Protected)
router.get('/admin/all', protect, isAdmin, getAllMemberships);
router.put('/admin/:userId/approve', protect, isAdmin, approveStudentMembership);
router.put('/admin/:userId/reject', protect, isAdmin, rejectStudentMembership);
router.put('/admin/:userId/manual', protect, isAdmin, validate(manualUpdateMembershipSchema), manualUpdateMembership);

module.exports = router;
