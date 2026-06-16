const { prisma } = require('../config/db');
const { sendBookingCreated, sendBookingConfirmed, sendBookingCancelled } = require('../services/notificationService');

const { defaultSettings } = require('../utils/settingsDefaults');

const getActiveSettings = async () => {
  let settings = await prisma.settings.findUnique({
    where: { id: "viva-settings" }
  });
  if (!settings) {
    settings = await prisma.settings.create({
      data: defaultSettings
    });
  }
  return settings;
};

// Check available slots on a specific date
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

    const activeAppointments = await prisma.appointment.findMany({
      where: {
        appointmentDate: date,
        NOT: { status: 'Cancelled' }
      }
    });

    const bookedSlots = activeAppointments.map(app => app.appointmentTime);

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

// Create Appointment Booking (Public / Unauthenticated)
exports.createAppointment = async (req, res, next) => {
  const { customerName, mobileNumber, service, staffMember, appointmentDate, appointmentTime, notes } = req.body;

  if (!customerName || !mobileNumber || !service || !staffMember || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  // Check Tuesday closure (2 = Tuesday in UTC)
  const bookingDay = new Date(appointmentDate).getUTCDay();
  if (bookingDay === 2) {
    return res.status(400).json({ success: false, message: 'The salon is closed on Tuesdays. Please choose another day.' });
  }

  try {
    const settings = await getActiveSettings();

    // Check blocked holidays
    if (settings.blockedHolidays && settings.blockedHolidays.includes(appointmentDate)) {
      return res.status(400).json({ success: false, message: 'This date is a blocked holiday.' });
    }

    // Check if slot is disabled in settings
    if (settings.disabledSlots && settings.disabledSlots.includes(appointmentTime)) {
      return res.status(400).json({ success: false, message: 'This timeslot has been disabled.' });
    }

    // Check double booking
    const slotConflict = await prisma.appointment.findFirst({
      where: {
        appointmentDate,
        appointmentTime,
        NOT: { status: 'Cancelled' }
      }
    });

    if (slotConflict) {
      return res.status(400).json({ success: false, message: 'This slot is unavailable. Please choose another time.' });
    }

    // Resolve service cost
    const dbService = await prisma.service.findUnique({
      where: { name: service }
    });
    const price = dbService ? dbService.price : 150;
    const duration = dbService ? dbService.duration : 30;
    const serviceId = dbService ? dbService.id : 'unknown';

    // Link or create Stylist
    const dbStylist = await prisma.stylist.findUnique({
      where: { name: staffMember }
    });

    // Link or create Customer
    let customer = await prisma.customer.findUnique({
      where: { mobileNumber }
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: customerName,
          mobileNumber
        }
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId: customer.id,
        customerName,
        mobileNumber,
        service,
        staffMember,
        stylistId: dbStylist ? dbStylist.id : null,
        appointmentDate,
        appointmentTime,
        notes: notes || '',
        bookingStatus: 'Pending',
        phone: mobileNumber,
        preferredStaffMember: staffMember,
        status: 'Pending',
        totalAmount: price,
        totalDuration: duration,
        reminderSent: false,
        selectedServices: {
          create: [{
            serviceId,
            serviceName: service,
            price,
            duration
          }]
        }
      },
      include: {
        selectedServices: true
      }
    });

    // Trigger notifications
    sendBookingCreated({
      ...appointment,
      _id: appointment.id
    }, settings).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: {
        ...appointment,
        _id: appointment.id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Fetch Logged In User's Bookings (stub)
exports.getUserAppointments = async (req, res, next) => {
  res.json({ success: true, count: 0, appointments: [] });
};

// Fetch All Bookings (Admin)
exports.getAdminAppointments = async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        selectedServices: true,
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const populated = appointments.map(app => ({
      ...app,
      _id: app.id,
      userName: app.customerName,
      userEmail: app.customer ? app.customer.email : '',
      userPhone: app.phone || app.mobileNumber,
      serviceDetails: app.selectedServices.map(s => ({
        ...s,
        _id: s.id
      }))
    }));

    res.json({ success: true, count: populated.length, appointments: populated });
  } catch (error) {
    next(error);
  }
};

const logRevenueForAppointment = async (appointment) => {
  try {
    for (const srv of appointment.selectedServices) {
      const dbSrv = await prisma.service.findUnique({
        where: { name: srv.serviceName }
      });
      const category = dbSrv ? dbSrv.category : 'Grooming';

      await prisma.revenue.create({
        data: {
          appointmentId: appointment.id,
          amount: srv.price,
          category,
          date: appointment.appointmentDate
        }
      });
    }
  } catch (err) {
    console.error('Failed to log completed appointment revenue:', err.message);
  }
};

const createBillFromCompletedAppointment = async (appointment) => {
  try {
    const invoiceSuffix = appointment.id.slice(-6);
    const billId = `VIVA-APP-${invoiceSuffix}`;
    const phone = appointment.mobileNumber || appointment.phone;

    // Check if bill exists
    const billExists = await prisma.bill.findUnique({
      where: { billId }
    });
    if (billExists) return;

    const dateToday = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const activeMem = await prisma.membership.findFirst({
      where: { phone, status: 'Active' }
    });
    const membershipType = activeMem ? activeMem.membershipType : 'None';
    const discountPct = activeMem ? activeMem.discount : 0;

    const subtotal = appointment.totalAmount || 0;
    const discount = Math.round(subtotal * (discountPct / 100));
    const grandTotal = subtotal - discount;

    const customer = await prisma.customer.findUnique({
      where: { mobileNumber: phone }
    });

    await prisma.bill.create({
      data: {
        billId,
        customerId: customer ? customer.id : null,
        customerName: appointment.customerName || '',
        mobileNumber: phone || '',
        staffMember: appointment.staffMember || appointment.preferredStaffMember || 'None',
        stylistId: appointment.stylistId,
        membershipType,
        subtotal,
        discount,
        gst: 0,
        grandTotal,
        totalServices: appointment.selectedServices.length,
        date: appointment.appointmentDate || dateToday,
        time: appointment.appointmentTime || timeNow,
        services: {
          create: appointment.selectedServices.map(s => ({
            name: s.serviceName,
            price: s.price,
            serviceId: s.serviceId !== 'unknown' ? s.serviceId : null
          }))
        }
      }
    });
  } catch (err) {
    console.error('Failed to create bill from completed appointment:', err.message);
  }
};

// Update Appointment Status (Pending, Confirmed, Completed, Cancelled)
exports.updateAppointmentStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Please provide status' });
  }

  const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  try {
    const settings = await getActiveSettings();

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { selectedServices: true }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: normalizedStatus,
        bookingStatus: normalizedStatus
      },
      include: { selectedServices: true }
    });

    const mappedApp = {
      ...updated,
      _id: updated.id
    };

    // Trigger status notifications
    if (normalizedStatus === 'Confirmed') {
      sendBookingConfirmed(mappedApp, settings).catch(console.error);
    } else if (normalizedStatus === 'Cancelled') {
      sendBookingCancelled(mappedApp, settings).catch(console.error);
    } else if (normalizedStatus === 'Completed') {
      await logRevenueForAppointment(updated);
      await createBillFromCompletedAppointment(updated);
    }

    res.json({
      success: true,
      message: `Appointment status updated to ${normalizedStatus}`,
      appointment: mappedApp
    });
  } catch (error) {
    next(error);
  }
};

// Reschedule Appointment (Admin)
exports.rescheduleAppointment = async (req, res, next) => {
  const { id } = req.params;
  const { date, timeSlot } = req.body;

  if (!date || !timeSlot) {
    return res.status(400).json({ success: false, message: 'Please provide date and timeslot' });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: date,
        appointmentTime: timeSlot
      }
    });

    res.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: {
        ...updated,
        _id: updated.id
      }
    });
  } catch (error) {
    next(error);
  }
};
