const express = require('express');
const router = express.Router();
const {
  getStylists,
  getStylistById,
  createStylist,
  updateStylist,
  deleteStylist
} = require('../controllers/stylistController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', getStylists);
router.get('/:id', getStylistById);

router.post('/', protect, isAdmin, createStylist);
router.put('/:id', protect, isAdmin, updateStylist);
router.delete('/:id', protect, isAdmin, deleteStylist);

module.exports = router;
