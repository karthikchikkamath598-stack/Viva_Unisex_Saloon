const { prisma } = require('../config/db');

const { convertTimeTo24h } = require('../utils/timeUtils');

exports.getCustomersList = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        appointments: true,
        memberships: {
          where: { status: 'Active' }
        }
      }
    });

    const customerDetails = customers.map(cust => {
      const activeMem = cust.memberships[0];
      const membershipTier = activeMem ? activeMem.membershipType : 'None';

      const completedVisits = cust.appointments.filter(
        app => app.status === 'Completed' || app.bookingStatus === 'Completed'
      ).length;

      // Sort appointments by date descending
      const sortedApps = [...cust.appointments].sort((a, b) => {
        try {
          const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime ? (a.appointmentTime.includes('AM') || a.appointmentTime.includes('PM') ? convertTimeTo24h(a.appointmentTime) : a.appointmentTime) : '00:00'}`);
          const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime ? (b.appointmentTime.includes('AM') || b.appointmentTime.includes('PM') ? convertTimeTo24h(b.appointmentTime) : b.appointmentTime) : '00:00'}`);
          return dateB - dateA;
        } catch {
          return 0;
        }
      });

      const lastApp = sortedApps[0] ? `${sortedApps[0].appointmentDate} at ${sortedApps[0].appointmentTime}` : 'None';

      // Map back-compat appointment ID representation
      const backCompatApps = sortedApps.map(app => ({
        ...app,
        _id: app.id
      }));

      return {
        _id: 'cust_' + cust.mobileNumber,
        fullName: cust.fullName,
        mobileNumber: cust.mobileNumber,
        membershipTier: membershipTier,
        membershipType: membershipTier, // backward compatibility
        totalCompletedVisits: completedVisits,
        totalVisits: completedVisits, // backward compatibility
        lastAppointmentDate: sortedApps[0] ? sortedApps[0].appointmentDate : null,
        lastAppointmentTime: sortedApps[0] ? sortedApps[0].appointmentTime : null,
        lastAppointment: lastApp, // backward compatibility
        appointments: backCompatApps
      };
    });

    res.json({ success: true, customers: customerDetails });
  } catch (error) {
    next(error);
  }
};
