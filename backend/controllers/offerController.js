const Offer = require('../models/Offer');
const { getIsMock } = require('../config/db');
const { readMockDB, writeMockDB } = require('../config/mockDb');

// Get All Offers
exports.getOffers = async (req, res, next) => {
  try {
    if (getIsMock()) {
      const db = readMockDB();
      res.json({ success: true, count: db.offers.length, offers: db.offers });
    } else {
      const offers = await Offer.find().sort({ createdAt: -1 });
      res.json({ success: true, count: offers.length, offers });
    }
  } catch (error) {
    next(error);
  }
};

// Create Offer (Admin)
exports.createOffer = async (req, res, next) => {
  const { title, description, discountCode, discountPercentage, expiryDate, bannerImageUrl } = req.body;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      
      const codeExists = db.offers.some(o => o.discountCode.toUpperCase() === discountCode.toUpperCase());
      if (codeExists) {
        return res.status(400).json({ success: false, message: 'Discount code already exists' });
      }

      const newOffer = {
        _id: 'offer_' + Date.now(),
        title,
        description,
        discountCode: discountCode.toUpperCase(),
        discountPercentage: Number(discountPercentage),
        expiryDate,
        bannerImageUrl: bannerImageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
        createdAt: new Date().toISOString()
      };

      db.offers.push(newOffer);
      writeMockDB(db);
      res.status(201).json({ success: true, offer: newOffer });
    } else {
      const codeExists = await Offer.findOne({ discountCode });
      if (codeExists) {
        return res.status(400).json({ success: false, message: 'Discount code already exists' });
      }

      const offer = await Offer.create({
        title,
        description,
        discountCode: discountCode.toUpperCase(),
        discountPercentage: Number(discountPercentage),
        expiryDate,
        bannerImageUrl
      });
      res.status(201).json({ success: true, offer });
    }
  } catch (error) {
    next(error);
  }
};

// Delete Offer (Admin)
exports.deleteOffer = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const index = db.offers.findIndex(o => o._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Offer not found' });
      }
      db.offers.splice(index, 1);
      writeMockDB(db);
      res.json({ success: true, message: 'Offer deleted successfully' });
    } else {
      const offer = await Offer.findByIdAndDelete(id);
      if (!offer) {
        return res.status(404).json({ success: false, message: 'Offer not found' });
      }
      res.json({ success: true, message: 'Offer deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};
