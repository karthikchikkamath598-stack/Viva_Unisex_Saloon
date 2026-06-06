const Appointment = require('../models/Appointment');
const Settings = require('../models/Settings');
const Service = require('../models/Service');
const User = require('../models/User');
const mongoose = require('mongoose');
const { getIsMock } = require('../config/db');
const { readMockDB, writeMockDB } = require('../config/mockDb');
const { sendBookingCreated, sendBookingConfirmed, sendBookingCancelled } = require('../services/notificationService');

// Fetch default settings if no db record exists
const getActiveSettings = async () => {
  const defaultSettings = {
    ownerName: 'David Salon Owner',
    salonPhone: '+919999999999',
    ownerWhatsapp: '+919999999999',
    ownerEmail: 'owner@vivasalon.com',
    workingHoursStart: '10:00 AM',
    workingHoursEnd: '08:00 PM',
    slots: [
      "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
      "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
    ],
    disabledSlots: [],
    blockedHolidays: []
  };

  if (getIsMock()) {
    const db = readMockDB();
    if (!db.settings) {
      db.settings = { ...defaultSettings };
      writeMockDB(db);
    }
    return db.settings;
  } else {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return settings;
  }
};

// Check available slots on a specific date (filtering Tuesday closures, blocked holidays, disabled slots, and already booked appointments)
exports.getAvailableSlots = async (req, res, next) => {
  const { date } = req.query; // YYYY-MM-DD

  if (!date) {
    return res.status(400).json({ success: false, message: 'Please provide a date' });
  }

  // Check Tuesday closure (2 = Tuesday in UTC)
  const bookingDay = new Date(date).getUTCDay();
  if (bookingDay === 2) {
    return res.status(400).json({ success: false, message: 'The salon is closed on Tuesdays. Please choose another day.' });
  }

  try {
    const settings = await getActiveSettings();

    // Check blocked holidays
    const isHoliday = settings.blockedHolidays && settings.blockedHolidays.includes(date);
    if (isHoliday) {
      return res.json({
        success: true,
        date,
        message: 'The salon is closed for a holiday on this date.',
        slots: []
      });
    }

    let bookedSlots = [];

    if (getIsMock()) {
      const db = readMockDB();
      bookedSlots = db.appointments
        .filter(app => app.appointmentDate === date && app.status !== 'Cancelled')
        .map(app => app.appointmentTime);
    } else {
      const activeAppointments = await Appointment.find({
        appointmentDate: date,
        status: { $ne: 'Cancelled' }
      });
      bookedSlots = activeAppointments.map(app => app.appointmentTime);
    }

    // Get slots list from settings
    const allSlots = settings.slots || [];
    const disabledSlots = settings.disabledSlots || [];

    // Filter out disabled slots and already booked slots
    const availableSlots = allSlots.map(slot => {
      const isDisabled = disabledSlots.includes(slot);
      const isBooked = bookedSlots.includes(slot);
      return {
        slot,
        isAvailable: !isDisabled && !isBooked
      };
    });

    res.json({
      success: true,
      date,
      slots: availableSlots
    });
  } catch (error) {
    next(error);
  }
};

// Create Appointment Booking
// Accepts two formats from frontend:
//   1. serviceDetails[] - full objects { serviceId, serviceName, price, duration } (preferred - avoids ObjectId cast errors)
//   2. services[]       - array of IDs (only used as fallback when IDs are valid MongoDB ObjectIds)
exports.createAppointment = async (req, res, next) => {
  const { services, serviceDetails, date, timeSlot, notes, customerName, email, phone } = req.body;
  const userId = req.user._id;

  const hasServiceDetails = Array.isArray(serviceDetails) && serviceDetails.length > 0;
  const hasServiceIds = Array.isArray(services) && services.length > 0;

  if (!hasServiceDetails && !hasServiceIds) {
    return res.status(400).json({ success: false, message: 'Please provide services to book' });
  }
  if (!date || !timeSlot) {
    return res.status(400).json({ success: false, message: 'Please provide date and timeslot' });
  }

  // Check Tuesday closure (2 = Tuesday in UTC)
  const bookingDay = new Date(date).getUTCDay();
  if (bookingDay === 2) {
    return res.status(400).json({ success: false, message: 'The salon is closed on Tuesdays. Please choose another day.' });
  }

  try {
    const settings = await getActiveSettings();

    // Check blocked holidays
    if (settings.blockedHolidays && settings.blockedHolidays.includes(date)) {
      return res.status(400).json({ success: false, message: 'This date is a blocked holiday.' });
    }

    // Check if slot is disabled in settings
    if (settings.disabledSlots && settings.disabledSlots.includes(timeSlot)) {
      return res.status(400).json({ success: false, message: 'This timeslot has been disabled.' });
    }

    let totalAmount = 0;
    let totalDuration = 0;
    const selectedServicesData = [];

    if (getIsMock()) {
      const db = readMockDB();

      // Check double booking
      const slotConflict = db.appointments.some(
        app => app.appointmentDate === date && app.appointmentTime === timeSlot && app.status !== 'Cancelled'
      );
      if (slotConflict) {
        return res.status(400).json({ success: false, message: 'This slot is unavailable. Please choose another time.' });
      }

      if (hasServiceDetails) {
        // Use full details sent from frontend (handles non-ObjectId fallback IDs like "service_43")
        serviceDetails.forEach(srv => {
          const price = Number(srv.price) || 0;
          const duration = Number(srv.duration) || 0;
          totalAmount += price;
          totalDuration += duration;
          selectedServicesData.push({
            serviceId: String(srv.serviceId || srv._id || 'unknown'),
            serviceName: srv.serviceName || srv.name || 'Service',
            price,
            duration
          });
        });
      } else {
        // Fallback: look up by ID in mock DB
        services.forEach(srvId => {
          const srv = db.services.find(s => s._id === srvId);
          if (srv) {
            totalAmount += srv.price;
            totalDuration += srv.duration;
            selectedServicesData.push({
              serviceId: srv._id,
              serviceName: srv.name,
              price: srv.price,
              duration: srv.duration
            });
          }
        });
      }

      // Reward membership points
      const pointsEarned = Math.floor(totalAmount / 10);
      const userIndex = db.users.findIndex(u => u._id === userId);
      if (userIndex !== -1) {
        db.users[userIndex].membershipPoints = (db.users[userIndex].membershipPoints || 0) + pointsEarned;
        const points = db.users[userIndex].membershipPoints;
        if (points >= 1000) db.users[userIndex].membershipType = 'VIP';
        else if (points >= 500) db.users[userIndex].membershipType = 'Platinum';
        else if (points >= 200) db.users[userIndex].membershipType = 'Gold';
        else db.users[userIndex].membershipType = 'Regular';
      }

      const newApp = {
        _id: 'appointment_' + Date.now(),
        customerId: userId,
        customerName: customerName || req.user.name,
        email: email || req.user.email,
        phone: phone || req.user.phone,
        selectedServices: selectedServicesData,
        totalAmount,
        totalDuration,
        appointmentDate: date,
        appointmentTime: timeSlot,
        status: 'Pending',
        notes: notes || '',
        reminderSent: false,
        createdAt: new Date().toISOString()
      };

      db.appointments.push(newApp);
      writeMockDB(db);

      // Trigger asynchronous notifications
      sendBookingCreated(newApp, settings).catch(console.error);

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        appointment: newApp
      });

    } else {
      // MongoDB path

      // Check double booking
      const slotConflict = await Appointment.findOne({
        appointmentDate: date,
        appointmentTime: timeSlot,
        status: { $ne: 'Cancelled' }
      });
      if (slotConflict) {
        return res.status(400).json({ success: false, message: 'This slot is unavailable. Please choose another time.' });
      }

      if (hasServiceDetails) {
        // Use full details sent from frontend — avoids ObjectId cast error for IDs like "service_43"
        serviceDetails.forEach(srv => {
          const price = Number(srv.price) || 0;
          const duration = Number(srv.duration) || 0;
          totalAmount += price;
          totalDuration += duration;
          selectedServicesData.push({
            serviceId: String(srv.serviceId || srv._id || 'unknown'),
            serviceName: srv.serviceName || srv.name || 'Service',
            price,
            duration
          });
        });
      } else {
        // Only reach here when IDs are guaranteed valid MongoDB ObjectIds
        const validIds = services.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (validIds.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'No valid service IDs provided. Please re-select services from the catalog.'
          });
        }
        const dbServices = await Service.find({ _id: { $in: validIds } });
        dbServices.forEach(s => {
          totalAmount += s.price;
          totalDuration += s.duration;
          selectedServicesData.push({
            serviceId: s._id,
            serviceName: s.name,
            price: s.price,
            duration: s.duration
          });
        });
      }

      if (selectedServicesData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Could not resolve any services. Please re-select services from the catalog.'
        });
      }

      const appointment = await Appointment.create({
        customerId: userId,
        customerName: customerName || req.user.name,
        email: email || req.user.email,
        phone: phone || req.user.phone,
        selectedServices: selectedServicesData,
        totalAmount,
        totalDuration,
        appointmentDate: date,
        appointmentTime: timeSlot,
        status: 'Pending',
        notes: notes || '',
        reminderSent: false
      });

      // Update user membership points
      const pointsEarned = Math.floor(totalAmount / 10);
      const user = await User.findById(userId);
      if (user) {
        user.membershipPoints = (user.membershipPoints || 0) + pointsEarned;
        if (user.membershipPoints >= 1000) user.membershipType = 'VIP';
        else if (user.membershipPoints >= 500) user.membershipType = 'Platinum';
        else if (user.membershipPoints >= 200) user.membershipType = 'Gold';
        await user.save();
      }

      // Trigger notifications
      sendBookingCreated(appointment, settings).catch(console.error);

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

// Fetch Logged In User's Bookings
exports.getUserAppointments = async (req, res, next) => {
  const userId = req.user._id;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      const userApps = db.appointments.filter(app => app.customerId === userId || app.user === userId);
      const populated = userApps.map(app => ({
        ...app,
        serviceDetails: app.selectedServices || []
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ success: true, count: populated.length, appointments: populated });
    } else {
      const appointments = await Appointment.find({ customerId: userId }).sort({ createdAt: -1 });
      const populated = appointments.map(app => ({
        ...app._doc,
        serviceDetails: app.selectedServices || []
      }));

      res.json({ success: true, count: populated.length, appointments: populated });
    }
  } catch (error) {
    next(error);
  }
};

// Fetch All Bookings (Admin)
exports.getAdminAppointments = async (req, res, next) => {
  try {
    if (getIsMock()) {
      const db = readMockDB();
      const populated = db.appointments.map(app => ({
        ...app,
        userName: app.customerName,
        userEmail: app.email,
        userPhone: app.phone,
        serviceDetails: app.selectedServices || []
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      res.json({ success: true, count: populated.length, appointments: populated });
    } else {
      const appointments = await Appointment.find().sort({ createdAt: -1 });
      const populated = appointments.map(app => ({
        ...app._doc,
        userName: app.customerName,
        userEmail: app.email,
        userPhone: app.phone,
        serviceDetails: app.selectedServices || []
      }));

      res.json({ success: true, count: populated.length, appointments: populated });
    }
  } catch (error) {
    next(error);
  }
};

// Update Appointment Status (Pending, Confirmed, Completed, Cancelled)
exports.updateAppointmentStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // Pending, Confirmed, Completed, Cancelled

  if (!status) {
    return res.status(400).json({ success: false, message: 'Please provide status' });
  }

  // Normalise case to match schema enum: "Pending", "Confirmed", "Completed", "Cancelled"
  const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  try {
    const settings = await getActiveSettings();

    if (getIsMock()) {
      const db = readMockDB();
      const index = db.appointments.findIndex(app => app._id === id);
      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      // Authorization check for cancel
      if (normalizedStatus === 'Cancelled' && req.user.role !== 'admin' && db.appointments[index].customerId !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
      }

      db.appointments[index].status = normalizedStatus;
      writeMockDB(db);

      // Trigger status notifications
      const app = db.appointments[index];
      if (normalizedStatus === 'Confirmed') {
        sendBookingConfirmed(app, settings).catch(console.error);
      } else if (normalizedStatus === 'Cancelled') {
        sendBookingCancelled(app, settings).catch(console.error);
      }

      res.json({ success: true, message: `Appointment status updated to ${normalizedStatus}`, appointment: app });
    } else {
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      if (normalizedStatus === 'Cancelled' && req.user.role !== 'admin' && appointment.customerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
      }

      appointment.status = normalizedStatus;
      await appointment.save();

      // Trigger status notifications
      if (normalizedStatus === 'Confirmed') {
        sendBookingConfirmed(appointment, settings).catch(console.error);
      } else if (normalizedStatus === 'Cancelled') {
        sendBookingCancelled(appointment, settings).catch(console.error);
      }

      res.json({ success: true, message: `Appointment status updated to ${normalizedStatus}`, appointment });
    }
  } catch (error) {
    next(error);
  }
};
