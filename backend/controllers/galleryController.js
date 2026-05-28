const Gallery = require('../models/Gallery');
const { getIsMock } = require('../config/db');
const { readMockDB, writeMockDB } = require('../config/mockDb');

// Get All Gallery Items
exports.getGallery = async (req, res, next) => {
  try {
    if (getIsMock()) {
      const db = readMockDB();
      res.json({ success: true, count: db.gallery.length, gallery: db.gallery });
    } else {
      const gallery = await Gallery.find().sort({ createdAt: -1 });
      res.json({ success: true, count: gallery.length, gallery });
    }
  } catch (error) {
    next(error);
  }
};

// Create Gallery Item (Admin)
exports.createGalleryItem = async (req, res, next) => {
  const { imageUrl, category, title, isBeforeAfter, beforeImageUrl, afterImageUrl } = req.body;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const newItem = {
        _id: 'gallery_' + Date.now(),
        imageUrl: imageUrl || beforeImageUrl || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600',
        category,
        title,
        isBeforeAfter: isBeforeAfter === true || isBeforeAfter === 'true',
        beforeImageUrl: beforeImageUrl || '',
        afterImageUrl: afterImageUrl || '',
        createdAt: new Date().toISOString()
      };
      db.gallery.push(newItem);
      writeMockDB(db);
      res.status(201).json({ success: true, galleryItem: newItem });
    } else {
      const galleryItem = await Gallery.create({
        imageUrl: imageUrl || beforeImageUrl,
        category,
        title,
        isBeforeAfter: isBeforeAfter === true,
        beforeImageUrl,
        afterImageUrl
      });
      res.status(201).json({ success: true, galleryItem });
    }
  } catch (error) {
    next(error);
  }
};

// Delete Gallery Item (Admin)
exports.deleteGalleryItem = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const index = db.gallery.findIndex(g => g._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Gallery item not found' });
      }
      db.gallery.splice(index, 1);
      writeMockDB(db);
      res.json({ success: true, message: 'Gallery item deleted successfully' });
    } else {
      const item = await Gallery.findByIdAndDelete(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Gallery item not found' });
      }
      res.json({ success: true, message: 'Gallery item deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};
