const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const { sendBookingReminder } = require('./notificationService');
const { getIsMock } = require('../config/db');
const { readMockDB, writeMockDB } = require('../config/mockDb');

const checkReminders = async () => {
  const now = new Date();
  // Scan for slots starting in the next 35 minutes
  if (getIsMock()) {
    try {
      const db = readMockDB();
      let dbUpdated = false;

      db.appointments.forEach((app) => {
        // Match Confirmed status (case-insensitive checks are safer)
        const isConfirmed = app.status && app.status.toLowerCase() === 'confirmed';
        if (isConfirmed && !app.reminderSent) {
          const appTime = new Date(`${app.appointmentDate} ${app.appointmentTime}`);
          if (!isNaN(appTime.getTime())) {
            const diffMs = appTime - now;
            const diffMins = diffMs / (1000 * 60);

            // Send reminder if starting in the next 35 minutes
            if (diffMins >= 0 && diffMins <= 35) {
              app.reminderSent = true;
              dbUpdated = true;
              
              sendBookingReminder({
                customerName: app.customerName,
                email: app.email,
                phone: app.phone,
                appointmentDate: app.appointmentDate,
                appointmentTime: app.appointmentTime
              }).catch(console.error);
            }
          }
        }
      });

      if (dbUpdated) {
        writeMockDB(db);
      }
    } catch (err) {
      console.error('[Mock DB Scheduler Error]', err);
    }
  } else {
    try {
      const activeAppointments = await Appointment.find({
        status: 'Confirmed',
        reminderSent: { $ne: true }
      });

      for (const app of activeAppointments) {
        const appTime = new Date(`${app.appointmentDate} ${app.appointmentTime}`);
        if (!isNaN(appTime.getTime())) {
          const diffMs = appTime - now;
          const diffMins = diffMs / (1000 * 60);

          if (diffMins >= 0 && diffMins <= 35) {
            app.reminderSent = true;
            await app.save();

            await sendBookingReminder(app);
          }
        }
      }
    } catch (err) {
      console.error('[Mongoose Scheduler Error]', err);
    }
  }
};

exports.startScheduler = () => {
  console.log('[Scheduler] Background cron job initialized.');
  cron.schedule('* * * * *', () => {
    checkReminders();
  });
};
