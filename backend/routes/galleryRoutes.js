const express = require('express');
const router = express.Router();
const { getGallery, createGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', getGallery);
router.post('/', protect, isAdmin, createGalleryItem);
router.delete('/:id', protect, isAdmin, deleteGalleryItem);

module.exports = router;
