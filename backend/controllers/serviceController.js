const Service = require('../models/Service');
const { getIsMock } = require('../config/db');
const { readMockDB, writeMockDB } = require('../config/mockDb');

// Get All Services
exports.getServices = async (req, res, next) => {
  try {
    if (getIsMock()) {
      const db = readMockDB();
      res.json({ success: true, count: db.services.length, services: db.services });
    } else {
      const services = await Service.find().sort({ createdAt: -1 });
      res.json({ success: true, count: services.length, services });
    }
  } catch (error) {
    next(error);
  }
};

// Get Service By ID
exports.getServiceById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (getIsMock()) {
      const db = readMockDB();
      const service = db.services.find(s => s._id === id);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
      res.json({ success: true, service });
    } else {
      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
      res.json({ success: true, service });
    }
  } catch (error) {
    next(error);
  }
};

// Create Service (Admin)
exports.createService = async (req, res, next) => {
  const { name, category, description, price, duration, imageUrl, isPopular } = req.body;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const newService = {
        _id: 'service_' + Date.now(),
        name,
        category,
        description,
        price: Number(price),
        duration: Number(duration),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=600',
        rating: 5.0,
        reviewsCount: 0,
        isPopular: isPopular === true || isPopular === 'true',
        createdAt: new Date().toISOString()
      };
      db.services.push(newService);
      writeMockDB(db);
      res.status(201).json({ success: true, service: newService });
    } else {
      const service = await Service.create({
        name,
        category,
        description,
        price: Number(price),
        duration: Number(duration),
        imageUrl,
        isPopular: isPopular === true
      });
      res.status(201).json({ success: true, service });
    }
  } catch (error) {
    next(error);
  }
};

// Update Service (Admin)
exports.updateService = async (req, res, next) => {
  const { id } = req.params;
  const { name, category, description, price, duration, imageUrl, isPopular, rating, reviewsCount } = req.body;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const index = db.services.findIndex(s => s._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }

      const updated = {
        ...db.services[index],
        name: name !== undefined ? name : db.services[index].name,
        category: category !== undefined ? category : db.services[index].category,
        description: description !== undefined ? description : db.services[index].description,
        price: price !== undefined ? Number(price) : db.services[index].price,
        duration: duration !== undefined ? Number(duration) : db.services[index].duration,
        imageUrl: imageUrl !== undefined ? imageUrl : db.services[index].imageUrl,
        isPopular: isPopular !== undefined ? (isPopular === true || isPopular === 'true') : db.services[index].isPopular,
        rating: rating !== undefined ? Number(rating) : db.services[index].rating,
        reviewsCount: reviewsCount !== undefined ? Number(reviewsCount) : db.services[index].reviewsCount
      };

      db.services[index] = updated;
      writeMockDB(db);
      res.json({ success: true, service: updated });
    } else {
      const service = await Service.findByIdAndUpdate(
        id,
        {
          name,
          category,
          description,
          price: price !== undefined ? Number(price) : undefined,
          duration: duration !== undefined ? Number(duration) : undefined,
          imageUrl,
          isPopular,
          rating: rating !== undefined ? Number(rating) : undefined,
          reviewsCount: reviewsCount !== undefined ? Number(reviewsCount) : undefined
        },
        { new: true, runValidators: true }
      );

      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
      res.json({ success: true, service });
    }
  } catch (error) {
    next(error);
  }
};

// Delete Service (Admin)
exports.deleteService = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const index = db.services.findIndex(s => s._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
      db.services.splice(index, 1);
      writeMockDB(db);
      res.json({ success: true, message: 'Service deleted successfully' });
    } else {
      const service = await Service.findByIdAndDelete(id);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
      res.json({ success: true, message: 'Service deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};
