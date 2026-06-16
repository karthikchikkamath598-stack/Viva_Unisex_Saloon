const express = require('express');
const router = express.Router();
const { getCustomersList } = require('../controllers/customerController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, isAdmin, getCustomersList);

module.exports = router;
