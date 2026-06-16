const { prisma } = require('../config/db');

const mapService = (s) => {
  if (!s) return null;
  return {
    ...s,
    _id: s.id
  };
};

// Get All Services
exports.getServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({
      success: true,
      count: services.length,
      services: services.map(mapService)
    });
  } catch (error) {
    next(error);
  }
};

// Get Service By ID
exports.getServiceById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const service = await prisma.service.findUnique({
      where: { id }
    });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service: mapService(service) });
  } catch (error) {
    next(error);
  }
};

// Create Service (Admin)
exports.createService = async (req, res, next) => {
  const { name, category, subcategory, description, price, duration, imageUrl, isPopular } = req.body;

  try {
    const service = await prisma.service.create({
      data: {
        name,
        category,
        subcategory: subcategory || '',
        description,
        price: Number(price),
        duration: Number(duration),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
        rating: 5.0,
        reviewsCount: 0,
        isPopular: isPopular === true || isPopular === 'true'
      }
    });
    res.status(201).json({ success: true, service: mapService(service) });
  } catch (error) {
    next(error);
  }
};

// Update Service (Admin)
exports.updateService = async (req, res, next) => {
  const { id } = req.params;
  const { name, category, subcategory, description, price, duration, imageUrl, isPopular, rating, reviewsCount } = req.body;

  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        category: category !== undefined ? category : undefined,
        subcategory: subcategory !== undefined ? subcategory : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? Number(price) : undefined,
        duration: duration !== undefined ? Number(duration) : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        isPopular: isPopular !== undefined ? (isPopular === true || isPopular === 'true') : undefined,
        rating: rating !== undefined ? Number(rating) : undefined,
        reviewsCount: reviewsCount !== undefined ? Number(reviewsCount) : undefined
      }
    });
    res.json({ success: true, service: mapService(service) });
  } catch (error) {
    next(error);
  }
};

// Delete Service (Admin)
exports.deleteService = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.service.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};
