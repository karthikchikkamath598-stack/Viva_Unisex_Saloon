const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', getSettings);
router.put('/', protect, isAdmin, updateSettings);

module.exports = router;
