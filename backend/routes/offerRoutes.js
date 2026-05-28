const express = require('express');
const router = express.Router();
const { getOffers, createOffer, deleteOffer } = require('../controllers/offerController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', getOffers);
router.post('/', protect, isAdmin, createOffer);
router.delete('/:id', protect, isAdmin, deleteOffer);

module.exports = router;
