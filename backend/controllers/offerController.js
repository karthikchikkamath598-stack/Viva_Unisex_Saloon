const { prisma } = require('../config/db');

const mapOffer = (o) => {
  if (!o) return null;
  return {
    ...o,
    _id: o.id
  };
};

// Get All Offers
exports.getOffers = async (req, res, next) => {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      success: true,
      count: offers.length,
      offers: offers.map(mapOffer)
    });
  } catch (error) {
    next(error);
  }
};

// Create Offer (Admin)
exports.createOffer = async (req, res, next) => {
  const { title, description, discountCode, discountPercentage, expiryDate, bannerImageUrl } = req.body;
  const uppercaseCode = discountCode.toUpperCase();

  try {
    const codeExists = await prisma.offer.findUnique({
      where: { discountCode: uppercaseCode }
    });

    if (codeExists) {
      return res.status(400).json({ success: false, message: 'Discount code already exists' });
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        discountCode: uppercaseCode,
        discountPercentage: Number(discountPercentage),
        expiryDate,
        bannerImageUrl: bannerImageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800'
      }
    });

    res.status(201).json({ success: true, offer: mapOffer(offer) });
  } catch (error) {
    next(error);
  }
};

// Delete Offer (Admin)
exports.deleteOffer = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.offer.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    next(error);
  }
};
