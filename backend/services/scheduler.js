const cron = require('node-cron');
const { prisma } = require('../config/db');
const { sendBookingReminder } = require('./notificationService');

// Helper: Convert "10:00 AM" → 24-hour minutes since midnight in IST
const parseSlotToDateIST = (dateStr, timeSlot) => {
  try {
    const [time, meridiem] = timeSlot.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    const [year, month, day] = dateStr.split('-').map(Number);

    // Create a Date object in UTC representing the IST date/time
    // Since IST is UTC + 5.5 hours, we subtract 5.5 hours to convert IST input to UTC
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));
    const istTimeMs = utcDate.getTime() - (5.5 * 60 * 60 * 1000); 
    return new Date(istTimeMs);
  } catch {
    return new Date(`${dateStr} ${timeSlot}`);
  }
};

const checkReminders = async () => {
  const now = new Date();

  try {
    const activeAppointments = await prisma.appointment.findMany({
      where: {
        status: { in: ['Confirmed', 'Pending'] },
        reminderSent: false
      },
      include: {
        selectedServices: true
      }
    });

    for (const app of activeAppointments) {
      const appTime = parseSlotToDateIST(app.appointmentDate, app.appointmentTime);

      if (!isNaN(appTime.getTime())) {
        const diffMs = appTime - now;
        const diffMins = diffMs / (1000 * 60);

        // Send reminder if appointment is 55–65 minutes away (1-hour window)
        if (diffMins >= 55 && diffMins <= 65) {
          console.log(`[Scheduler] 🔔 Sending 1-hour reminder to ${app.customerName} for ${app.appointmentTime}`);
          
          try {
            await sendBookingReminder({
              ...app,
              _id: app.id
            });

            await prisma.appointment.update({
              where: { id: app.id },
              data: { reminderSent: true }
            });
          } catch (sendErr) {
            console.error(`[Scheduler] Failed to send reminder for appointment ${app.id}:`, sendErr.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Prisma Scheduler Error]', err);
  }
};

exports.startScheduler = () => {
  console.log('[Scheduler] ✅ Background cron initialized — checking every minute for 1-hour appointment reminders.');
  cron.schedule('* * * * *', () => {
    checkReminders();
  });
};
