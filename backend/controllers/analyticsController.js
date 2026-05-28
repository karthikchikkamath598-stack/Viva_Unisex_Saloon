const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const Stylist = require('../models/Stylist');
const User = require('../models/User');
const { getIsMock } = require('../config/db');
const { readMockDB } = require('../config/mockDb');

exports.getAdminAnalytics = async (req, res, next) => {
  try {
    let totalBookings = 0;
    let totalRevenue = 0;
    let pendingBookings = 0;
    let completedBookings = 0;
    let activeUsers = 0;
    let serviceStats = {};
    let stylistStats = {};
    let monthlyStats = {};

    if (getIsMock()) {
      const db = readMockDB();
      totalBookings = db.appointments.length;
      activeUsers = db.users.filter(u => u.role === 'customer').length;
      
      db.appointments.forEach(app => {
        if (app.status !== 'cancelled') {
          totalRevenue += app.totalAmount;
        }
        if (app.status === 'pending') {
          pendingBookings++;
        }
        if (app.status === 'completed') {
          completedBookings++;
        }

        // Service aggregation
        app.services.forEach(srvId => {
          const service = db.services.find(s => s._id === srvId);
          const name = service ? service.name : 'Deleted Service';
          serviceStats[name] = (serviceStats[name] || 0) + 1;
        });

        // Stylist aggregation
        const stylist = db.stylists.find(s => s._id === app.stylist);
        const sName = stylist ? stylist.name : 'Unknown Stylist';
        stylistStats[sName] = (stylistStats[sName] || 0) + 1;

        // Monthly stats (based on date YYYY-MM-DD)
        if (app.date) {
          const month = app.date.substring(0, 7); // YYYY-MM
          monthlyStats[month] = (monthlyStats[month] || 0) + app.totalAmount;
        }
      });
    } else {
      totalBookings = await Appointment.countDocuments();
      activeUsers = await User.countDocuments({ role: 'customer' });
      pendingBookings = await Appointment.countDocuments({ status: 'pending' });
      completedBookings = await Appointment.countDocuments({ status: 'completed' });
      
      const revResult = await Appointment.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      totalRevenue = revResult.length > 0 ? revResult[0].total : 0;

      // Group appointments by date monthly
      const monthResult = await Appointment.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
            total: { $sum: '$totalAmount' }
          }
        }
      ]);
      monthResult.forEach(item => {
        monthlyStats[item._id] = item.total;
      });

      // Populate service statistics
      const allAppointments = await Appointment.find({ status: { $ne: 'cancelled' } });
      const allServices = await Service.find();
      const allStylists = await Stylist.find();

      const serviceMap = new Map(allServices.map(s => [s._id.toString(), s.name]));
      const stylistMap = new Map(allStylists.map(st => [st._id.toString(), st.name]));

      allAppointments.forEach(app => {
        app.services.forEach(sId => {
          const sName = serviceMap.get(sId.toString()) || 'Deleted Service';
          serviceStats[sName] = (serviceStats[sName] || 0) + 1;
        });

        const stName = stylistMap.get(app.stylist.toString()) || 'Unknown Stylist';
        stylistStats[stName] = (stylistStats[stName] || 0) + 1;
      });
    }

    // Format charts datasets
    const servicesChart = Object.keys(serviceStats).map(name => ({
      name,
      value: serviceStats[name]
    })).sort((a, b) => b.value - a.value).slice(0, 5); // top 5

    const stylistsChart = Object.keys(stylistStats).map(name => ({
      name,
      value: stylistStats[name]
    })).sort((a, b) => b.value - a.value);

    const revenueChart = Object.keys(monthlyStats).map(month => ({
      month,
      revenue: monthlyStats[month]
    })).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalRevenue,
        pendingBookings,
        completedBookings,
        activeUsers,
        servicesChart,
        stylistsChart,
        revenueChart
      }
    });
  } catch (error) {
    next(error);
  }
};
