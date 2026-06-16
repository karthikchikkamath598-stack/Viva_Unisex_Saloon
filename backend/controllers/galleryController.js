const { prisma } = require('../config/db');

const mapGalleryItem = (g) => {
  if (!g) return null;
  return {
    ...g,
    _id: g.id
  };
};

// Get All Gallery Items
exports.getGallery = async (req, res, next) => {
  try {
    const gallery = await prisma.gallery.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      success: true,
      count: gallery.length,
      gallery: gallery.map(mapGalleryItem)
    });
  } catch (error) {
    next(error);
  }
};

// Create Gallery Item (Admin)
exports.createGalleryItem = async (req, res, next) => {
  const { imageUrl, category, title, isBeforeAfter, beforeImageUrl, afterImageUrl } = req.body;

  try {
    const isBA = isBeforeAfter === true || isBeforeAfter === 'true';
    const galleryItem = await prisma.gallery.create({
      data: {
        imageUrl: imageUrl || beforeImageUrl || 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=600',
        category,
        title,
        isBeforeAfter: isBA,
        beforeImageUrl: beforeImageUrl || '',
        afterImageUrl: afterImageUrl || ''
      }
    });
    res.status(201).json({ success: true, galleryItem: mapGalleryItem(galleryItem) });
  } catch (error) {
    next(error);
  }
};

// Delete Gallery Item (Admin)
exports.deleteGalleryItem = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.gallery.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
