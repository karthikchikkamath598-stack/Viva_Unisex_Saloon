const Stylist = require('../models/Stylist');
const { getIsMock } = require('../config/db');
const { readMockDB, writeMockDB } = require('../config/mockDb');

// Get All Stylists
exports.getStylists = async (req, res, next) => {
  try {
    if (getIsMock()) {
      const db = readMockDB();
      res.json({ success: true, count: db.stylists.length, stylists: db.stylists });
    } else {
      const stylists = await Stylist.find().sort({ createdAt: -1 });
      res.json({ success: true, count: stylists.length, stylists });
    }
  } catch (error) {
    next(error);
  }
};

// Get Stylist by ID
exports.getStylistById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (getIsMock()) {
      const db = readMockDB();
      const stylist = db.stylists.find(s => s._id === id);
      if (!stylist) {
        return res.status(404).json({ success: false, message: 'Stylist not found' });
      }
      res.json({ success: true, stylist });
    } else {
      const stylist = await Stylist.findById(id);
      if (!stylist) {
        return res.status(404).json({ success: false, message: 'Stylist not found' });
      }
      res.json({ success: true, stylist });
    }
  } catch (error) {
    next(error);
  }
};

// Create Stylist (Admin)
exports.createStylist = async (req, res, next) => {
  const { name, specialty, imageUrl, skills, availability } = req.body;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const newStylist = {
        _id: 'stylist_' + Date.now(),
        name,
        specialty,
        rating: 5.0,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
        skills: Array.isArray(skills) ? skills : [skills],
        availability: availability || {
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          slots: ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"]
        },
        createdAt: new Date().toISOString()
      };
      db.stylists.push(newStylist);
      writeMockDB(db);
      res.status(201).json({ success: true, stylist: newStylist });
    } else {
      const stylist = await Stylist.create({
        name,
        specialty,
        imageUrl,
        skills: Array.isArray(skills) ? skills : [skills],
        availability
      });
      res.status(201).json({ success: true, stylist });
    }
  } catch (error) {
    next(error);
  }
};

// Update Stylist (Admin)
exports.updateStylist = async (req, res, next) => {
  const { id } = req.params;
  const { name, specialty, imageUrl, skills, availability, rating } = req.body;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const index = db.stylists.findIndex(s => s._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Stylist not found' });
      }

      const updated = {
        ...db.stylists[index],
        name: name !== undefined ? name : db.stylists[index].name,
        specialty: specialty !== undefined ? specialty : db.stylists[index].specialty,
        imageUrl: imageUrl !== undefined ? imageUrl : db.stylists[index].imageUrl,
        skills: skills !== undefined ? (Array.isArray(skills) ? skills : [skills]) : db.stylists[index].skills,
        availability: availability !== undefined ? availability : db.stylists[index].availability,
        rating: rating !== undefined ? Number(rating) : db.stylists[index].rating
      };

      db.stylists[index] = updated;
      writeMockDB(db);
      res.json({ success: true, stylist: updated });
    } else {
      const stylist = await Stylist.findByIdAndUpdate(
        id,
        {
          name,
          specialty,
          imageUrl,
          skills: skills !== undefined ? (Array.isArray(skills) ? skills : [skills]) : undefined,
          availability,
          rating: rating !== undefined ? Number(rating) : undefined
        },
        { new: true, runValidators: true }
      );

      if (!stylist) {
        return res.status(404).json({ success: false, message: 'Stylist not found' });
      }
      res.json({ success: true, stylist });
    }
  } catch (error) {
    next(error);
  }
};

// Delete Stylist (Admin)
exports.deleteStylist = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const index = db.stylists.findIndex(s => s._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Stylist not found' });
      }
      db.stylists.splice(index, 1);
      writeMockDB(db);
      res.json({ success: true, message: 'Stylist deleted successfully' });
    } else {
      const stylist = await Stylist.findByIdAndDelete(id);
      if (!stylist) {
        return res.status(404).json({ success: false, message: 'Stylist not found' });
      }
      res.json({ success: true, message: 'Stylist deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};
