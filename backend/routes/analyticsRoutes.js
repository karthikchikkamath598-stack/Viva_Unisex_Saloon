const express = require('express');
const router = express.Router();
const { getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, isAdmin, getAdminAnalytics);

module.exports = router;
