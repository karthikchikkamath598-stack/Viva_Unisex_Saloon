const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, isAdmin, getNotifications);

module.exports = router;
