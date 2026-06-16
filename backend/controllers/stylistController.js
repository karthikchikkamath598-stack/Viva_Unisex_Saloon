const { prisma } = require('../config/db');

const mapStylist = (s) => {
  if (!s) return null;
  return {
    ...s,
    _id: s.id,
    availability: {
      days: s.availableDays,
      slots: s.availableSlots
    }
  };
};

// Get All Stylists (with performance stats)
exports.getStylists = async (req, res, next) => {
  try {
    const stylists = await prisma.stylist.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const appointments = await prisma.appointment.findMany({
      where: {
        NOT: { status: 'Cancelled' }
      }
    });
    const bills = await prisma.bill.findMany();

    const stylistsWithStats = stylists.map(st => {
      const assignedApps = appointments.filter(app => 
        app.preferredStaffMember === st.name || 
        app.staffMember === st.name ||
        app.stylistId === st.id
      ).length;
      const assignedBills = bills.filter(b => 
        !b.billId.startsWith('VIVA-APP-') && 
        (b.staffMember === st.name || b.stylistId === st.id)
      ).length;
      const assigned = assignedApps + assignedBills;

      const appRevenue = appointments
        .filter(app => 
          app.status === 'Completed' && 
          (app.preferredStaffMember === st.name || app.staffMember === st.name || app.stylistId === st.id)
        )
        .reduce((sum, app) => sum + (app.totalAmount || 0), 0);
      const billRevenue = bills
        .filter(b => 
          !b.billId.startsWith('VIVA-APP-') && 
          (b.staffMember === st.name || b.stylistId === st.id)
        )
        .reduce((sum, b) => sum + (b.grandTotal || 0), 0);
      const revenue = appRevenue + billRevenue;

      const mapped = mapStylist(st);
      return {
        ...mapped,
        assignedAppointments: assigned,
        revenueGenerated: revenue
      };
    });

    res.json({ success: true, count: stylistsWithStats.length, stylists: stylistsWithStats });
  } catch (error) {
    next(error);
  }
};

// Get Stylist by ID
exports.getStylistById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const stylist = await prisma.stylist.findUnique({
      where: { id }
    });
    if (!stylist) {
      return res.status(404).json({ success: false, message: 'Stylist not found' });
    }
    res.json({ success: true, stylist: mapStylist(stylist) });
  } catch (error) {
    next(error);
  }
};

// Create Stylist (Admin)
exports.createStylist = async (req, res, next) => {
  const { name, specialty, imageUrl, skills, availability } = req.body;

  try {
    const stylist = await prisma.stylist.create({
      data: {
        name,
        specialty,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
        skills: Array.isArray(skills) ? skills : [skills],
        availableDays: (availability && availability.days) || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        availableSlots: (availability && availability.slots) || ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"],
        status: "Active"
      }
    });
    res.status(201).json({ success: true, stylist: mapStylist(stylist) });
  } catch (error) {
    next(error);
  }
};

// Update Stylist (Admin)
exports.updateStylist = async (req, res, next) => {
  const { id } = req.params;
  const { name, specialty, imageUrl, skills, availability, rating, status } = req.body;

  try {
    const stylist = await prisma.stylist.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        specialty: specialty !== undefined ? specialty : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        skills: skills !== undefined ? (Array.isArray(skills) ? skills : [skills]) : undefined,
        availableDays: (availability && availability.days) !== undefined ? availability.days : undefined,
        availableSlots: (availability && availability.slots) !== undefined ? availability.slots : undefined,
        rating: rating !== undefined ? Number(rating) : undefined,
        status: status !== undefined ? status : undefined
      }
    });
    res.json({ success: true, stylist: mapStylist(stylist) });
  } catch (error) {
    next(error);
  }
};

// Delete Stylist (Admin)
exports.deleteStylist = async (req, res, next) => {
  const { id } = req.params;

  try {
    await prisma.stylist.delete({
      where: { id }
    });
    res.json({ success: true, message: 'Stylist deleted successfully' });
  } catch (error) {
    next(error);
  }
};
