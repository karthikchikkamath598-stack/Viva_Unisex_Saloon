const Appointment = require('../models/Appointment');
const Stylist = require('../models/Stylist');
const Service = require('../models/Service');
const User = require('../models/User');
const { getIsMock } = require('../config/db');
const { readMockDB, writeMockDB } = require('../config/mockDb');

// Check available slots for a stylist on a specific date
exports.getAvailableSlots = async (req, res, next) => {
  const { stylistId, date } = req.query; // YYYY-MM-DD

  if (!stylistId || !date) {
    return res.status(400).json({ success: false, message: 'Please provide stylistId and date' });
  }

  // Check Tuesday closure (2 = Tuesday in UTC)
  const bookingDay = new Date(date).getUTCDay();
  if (bookingDay === 2) {
    return res.status(400).json({ success: false, message: 'The salon is closed on Tuesdays. Please choose another day.' });
  }

  try {
    let stylist;
    let bookedSlots = [];

    if (getIsMock()) {
      const db = readMockDB();
      stylist = db.stylists.find(s => s._id === stylistId);
      
      if (!stylist) {
        return res.status(404).json({ success: false, message: 'Stylist not found' });
      }

      bookedSlots = db.appointments
        .filter(app => app.stylist === stylistId && app.date === date && app.status !== 'cancelled')
        .map(app => app.timeSlot);
    } else {
      stylist = await Stylist.findById(stylistId);
      if (!stylist) {
        return res.status(404).json({ success: false, message: 'Stylist not found' });
      }

      const activeAppointments = await Appointment.find({
        stylist: stylistId,
        date,
        status: { $ne: 'cancelled' }
      });
      bookedSlots = activeAppointments.map(app => app.timeSlot);
    }

    // Get all potential slots for this stylist
    const allSlots = stylist.availability.slots || [];
    
    // Filter out booked slots
    const availableSlots = allSlots.map(slot => ({
      slot,
      isAvailable: !bookedSlots.includes(slot)
    }));

    res.json({
      success: true,
      stylist: stylist.name,
      date,
      slots: availableSlots
    });
  } catch (error) {
    next(error);
  }
};

// Create Appointment Booking
exports.createAppointment = async (req, res, next) => {
  const { services, stylistId, date, timeSlot, notes } = req.body;
  const userId = req.user._id;

  if (!services || services.length === 0 || !stylistId || !date || !timeSlot) {
    return res.status(400).json({ success: false, message: 'Please provide services, stylist, date and timeslot' });
  }

  // Check Tuesday closure (2 = Tuesday in UTC)
  const bookingDay = new Date(date).getUTCDay();
  if (bookingDay === 2) {
    return res.status(400).json({ success: false, message: 'The salon is closed on Tuesdays. Please choose another day.' });
  }

  try {
    let totalAmount = 0;
    let stylistExists = false;

    // Calculate total price of services
    if (getIsMock()) {
      const db = readMockDB();
      stylistExists = db.stylists.some(s => s._id === stylistId);

      if (!stylistExists) {
        return res.status(404).json({ success: false, message: 'Selected stylist does not exist' });
      }

      // Check slot conflict
      const slotConflict = db.appointments.some(
        app => app.stylist === stylistId && app.date === date && app.timeSlot === timeSlot && app.status !== 'cancelled'
      );
      if (slotConflict) {
        return res.status(400).json({ success: false, message: 'This timeslot has already been booked' });
      }

      services.forEach(srvId => {
        const srv = db.services.find(s => s._id === srvId);
        if (srv) totalAmount += srv.price;
      });

      // Reward membership points: 1 point per $10 spent
      const pointsEarned = Math.floor(totalAmount / 10);
      const userIndex = db.users.findIndex(u => u._id === userId);
      if (userIndex !== -1) {
        db.users[userIndex].membershipPoints = (db.users[userIndex].membershipPoints || 0) + pointsEarned;
        
        // Upgrade membership based on points
        const points = db.users[userIndex].membershipPoints;
        if (points >= 1000) db.users[userIndex].membershipType = 'VIP';
        else if (points >= 500) db.users[userIndex].membershipType = 'Platinum';
        else if (points >= 200) db.users[userIndex].membershipType = 'Gold';
        else db.users[userIndex].membershipType = 'Regular';
      }

      const newApp = {
        _id: 'appointment_' + Date.now(),
        user: userId,
        services,
        stylist: stylistId,
        date,
        timeSlot,
        status: 'pending',
        notes: notes || '',
        totalAmount,
        createdAt: new Date().toISOString()
      };

      db.appointments.push(newApp);
      writeMockDB(db);

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        appointment: newApp
      });
    } else {
      const stylist = await Stylist.findById(stylistId);
      if (!stylist) {
        return res.status(404).json({ success: false, message: 'Selected stylist does not exist' });
      }

      // Check slot conflict
      const slotConflict = await Appointment.findOne({
        stylist: stylistId,
        date,
        timeSlot,
        status: { $ne: 'cancelled' }
      });
      if (slotConflict) {
        return res.status(400).json({ success: false, message: 'This timeslot has already been booked' });
      }

      // Fetch service prices
      const dbServices = await Service.find({ _id: { $in: services } });
      dbServices.forEach(s => {
        totalAmount += s.price;
      });

      const appointment = await Appointment.create({
        user: userId,
        services,
        stylist: stylistId,
        date,
        timeSlot,
        status: 'pending',
        notes,
        totalAmount
      });

      // Update points
      const pointsEarned = Math.floor(totalAmount / 10);
      const user = await User.findById(userId);
      if (user) {
        user.membershipPoints += pointsEarned;
        if (user.membershipPoints >= 1000) user.membershipType = 'VIP';
        else if (user.membershipPoints >= 500) user.membershipType = 'Platinum';
        else if (user.membershipPoints >= 200) user.membershipType = 'Gold';
        await user.save();
      }

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        appointment
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get Logged In User's Bookings
exports.getUserAppointments = async (req, res, next) => {
  const userId = req.user._id;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const userApps = db.appointments.filter(app => app.user === userId);

      // Populate services and stylists names manually
      const populated = userApps.map(app => {
        const srvDetails = app.services.map(sId => db.services.find(s => s._id === sId)).filter(Boolean);
        const stylistDetail = db.stylists.find(s => s._id === app.stylist);
        return {
          ...app,
          serviceDetails: srvDetails,
          stylistName: stylistDetail ? stylistDetail.name : 'Unknown Stylist'
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ success: true, count: populated.length, appointments: populated });
    } else {
      const appointments = await Appointment.find({ user: userId }).sort({ createdAt: -1 });
      
      // Populate details
      const populated = await Promise.all(appointments.map(async (app) => {
        const srvDetails = await Service.find({ _id: { $in: app.services } });
        const stylistDetail = await Stylist.findById(app.stylist);
        return {
          ...app._doc,
          serviceDetails: srvDetails,
          stylistName: stylistDetail ? stylistDetail.name : 'Unknown Stylist'
        };
      }));

      res.json({ success: true, count: populated.length, appointments: populated });
    }
  } catch (error) {
    next(error);
  }
};

// Get All Bookings (Admin)
exports.getAdminAppointments = async (req, res, next) => {
  try {
    if (getIsMock()) {
      const db = readMockDB();
      const populated = db.appointments.map(app => {
        const userDetail = db.users.find(u => u._id === app.user);
        const srvDetails = app.services.map(sId => db.services.find(s => s._id === sId)).filter(Boolean);
        const stylistDetail = db.stylists.find(s => s._id === app.stylist);
        return {
          ...app,
          userName: userDetail ? userDetail.name : 'Unknown Client',
          userEmail: userDetail ? userDetail.email : '',
          userPhone: userDetail ? userDetail.phone : '',
          serviceDetails: srvDetails,
          stylistName: stylistDetail ? stylistDetail.name : 'Unknown Stylist'
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ success: true, count: populated.length, appointments: populated });
    } else {
      const appointments = await Appointment.find().sort({ createdAt: -1 });

      const populated = await Promise.all(appointments.map(async (app) => {
        const userDetail = await User.findById(app.user);
        const srvDetails = await Service.find({ _id: { $in: app.services } });
        const stylistDetail = await Stylist.findById(app.stylist);
        return {
          ...app._doc,
          userName: userDetail ? userDetail.name : 'Unknown Client',
          userEmail: userDetail ? userDetail.email : '',
          userPhone: userDetail ? userDetail.phone : '',
          serviceDetails: srvDetails,
          stylistName: stylistDetail ? stylistDetail.name : 'Unknown Stylist'
        };
      }));

      res.json({ success: true, count: populated.length, appointments: populated });
    }
  } catch (error) {
    next(error);
  }
};

// Update Appointment Status (Admin or User canceling)
exports.updateAppointmentStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // pending, confirmed, cancelled, completed

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const index = db.appointments.findIndex(app => app._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      // If user is trying to cancel, ensure they own the booking (or is admin)
      if (status === 'cancelled' && req.user.role !== 'admin' && db.appointments[index].user !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
      }

      db.appointments[index].status = status;
      writeMockDB(db);

      res.json({ success: true, message: `Appointment status updated to ${status}`, appointment: db.appointments[index] });
    } else {
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      if (status === 'cancelled' && req.user.role !== 'admin' && appointment.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
      }

      appointment.status = status;
      await appointment.save();

      res.json({ success: true, message: `Appointment status updated to ${status}`, appointment });
    }
  } catch (error) {
    next(error);
  }
};
