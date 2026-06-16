const express = require('express');
const router = express.Router();
const {
  createBill,
  getBills,
  verifyMembership,
  getBillingAnalytics,
  getStaffReports
} = require('../controllers/billingController');
const { protect, isAdmin } = require('../middleware/auth');
const { validate, createBillSchema } = require('../middleware/validate');

// All Billing POS actions are restricted to logged-in admins
router.post('/', protect, isAdmin, validate(createBillSchema), createBill);
router.get('/', protect, isAdmin, getBills);
router.get('/verify/:phone', protect, isAdmin, verifyMembership);
router.get('/analytics', protect, isAdmin, getBillingAnalytics);
router.get('/staff-reports', protect, isAdmin, getStaffReports);

module.exports = router;
