const { prisma } = require('../config/db');

exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth(); // 0-indexed
    
    let lastMonthYear = currentYear;
    let lastMonthVal = currentMonth - 1;
    if (lastMonthVal < 0) {
      lastMonthVal = 11;
      lastMonthYear -= 1;
    }
    
    const todayStr = now.toISOString().split('T')[0];
    const thisMonthStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
    const lastMonthStr = `${lastMonthYear}-${(lastMonthVal + 1).toString().padStart(2, '0')}`;

    // Fetch data via Prisma
    const appointments = await prisma.appointment.findMany({
      include: { selectedServices: true }
    });
    const customersCount = await prisma.customer.count();
    const activeStaffCount = await prisma.stylist.count({
      where: { NOT: { status: 'Inactive' } }
    });
    const services = await prisma.service.findMany();
    const activeMembershipsCount = await prisma.membership.count({
      where: { status: 'Active' }
    });

    // Map service name/ID to category for fast lookup
    const serviceCategoryMap = {};
    services.forEach(s => {
      serviceCategoryMap[s.name] = s.category;
      serviceCategoryMap[s.id] = s.category;
    });

    // 2. Calculations
    const totalAppointments = appointments.length;
    const todayAppointments = appointments.filter(app => app.appointmentDate === todayStr).length;
    const pendingAppointments = appointments.filter(app => app.status === 'Pending').length;
    const completedAppointments = appointments.filter(app => app.status === 'Completed').length;
    
    const upcomingAppointments = appointments.filter(
      app => app.appointmentDate >= todayStr && ['Pending', 'Confirmed'].includes(app.status)
    ).length;
    
    // Revenue numbers
    const completedApps = appointments.filter(app => app.status === 'Completed');
    const totalRevenue = completedApps.reduce((sum, app) => sum + (app.totalAmount || 0), 0);
    const todayRevenue = completedApps
      .filter(app => app.appointmentDate === todayStr)
      .reduce((sum, app) => sum + (app.totalAmount || 0), 0);
    const thisMonthRevenue = completedApps
      .filter(app => app.appointmentDate && app.appointmentDate.startsWith(thisMonthStr))
      .reduce((sum, app) => sum + (app.totalAmount || 0), 0);
    const lastMonthRevenue = completedApps
      .filter(app => app.appointmentDate && app.appointmentDate.startsWith(lastMonthStr))
      .reduce((sum, app) => sum + (app.totalAmount || 0), 0);

    const thisYearStr = new Date().getFullYear().toString();
    const yearlyRevenue = completedApps
      .filter(app => app.appointmentDate && app.appointmentDate.startsWith(thisYearStr))
      .reduce((sum, app) => sum + (app.totalAmount || 0), 0);

    // This Month vs Last Month growth comparisons
    const thisMonthAppsCount = appointments.filter(app => app.appointmentDate && app.appointmentDate.startsWith(thisMonthStr)).length;
    const lastMonthAppsCount = appointments.filter(app => app.appointmentDate && app.appointmentDate.startsWith(lastMonthStr)).length;

    // Helper to calculate growth percentage
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const appointmentsGrowth = calculateGrowth(thisMonthAppsCount, lastMonthAppsCount);
    const revenueGrowth = calculateGrowth(thisMonthRevenue, lastMonthRevenue);

    // Customer comparison (New vs Returning) based on appointment history
    const customerBookings = {};
    appointments.forEach(app => {
      const cId = app.phone || app.mobileNumber;
      if (!cId) return;
      if (!customerBookings[cId]) {
        customerBookings[cId] = [];
      }
      customerBookings[cId].push(app.appointmentDate);
    });

    let newCustomers = 0;
    let returningCustomers = 0;

    Object.keys(customerBookings).forEach(cId => {
      const dates = customerBookings[cId].sort();
      const firstBooking = dates[0];
      const hasBookingThisMonth = dates.some(d => d.startsWith(thisMonthStr));

      if (hasBookingThisMonth) {
        if (firstBooking.startsWith(thisMonthStr)) {
          newCustomers++;
        } else {
          returningCustomers++;
        }
      }
    });

    // OTP Analytics (Zeroed out)
    const otpSentToday = 0;
    const otpVerifiedToday = 0;
    const failedOtpAttempts = 0;
    const verificationSuccessRate = 100;

    // Chart A: Monthly Revenue Chart
    const monthlyStats = {};
    completedApps.forEach(app => {
      if (app.appointmentDate) {
        const month = app.appointmentDate.substring(0, 7);
        monthlyStats[month] = (monthlyStats[month] || 0) + (app.totalAmount || 0);
      }
    });
    const monthlyRevenueChart = Object.keys(monthlyStats).map(month => ({
      month,
      revenue: monthlyStats[month]
    })).sort((a, b) => a.month.localeCompare(b.month));

    // Chart B: Daily Revenue Trend (Last 30 Days)
    const trendMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      trendMap[dStr] = 0;
    }
    completedApps.forEach(app => {
      if (app.appointmentDate && trendMap[app.appointmentDate] !== undefined) {
        trendMap[app.appointmentDate] += (app.totalAmount || 0);
      }
    });
    const revenueTrendGraph = Object.keys(trendMap).map(date => ({
      date,
      revenue: trendMap[date]
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Chart C: Revenue by Service Category
    const categoryStats = {};
    completedApps.forEach(app => {
      if (Array.isArray(app.selectedServices)) {
        app.selectedServices.forEach(srv => {
          const cat = serviceCategoryMap[srv.serviceName] || serviceCategoryMap[srv.serviceId] || 'Grooming';
          categoryStats[cat] = (categoryStats[cat] || 0) + (srv.price || 0);
        });
      }
    });
    const revenueByCategory = Object.keys(categoryStats).map(name => ({
      name,
      value: categoryStats[name]
    })).sort((a, b) => b.value - a.value);

    // Chart D: Stylist workload sharing
    const stylistStats = {};
    appointments.forEach(app => {
      if (app.status !== 'Cancelled') {
        const staffName = app.preferredStaffMember || app.staffMember || 'Unassigned';
        stylistStats[staffName] = (stylistStats[staffName] || 0) + 1;
      }
    });
    const stylistsChart = Object.keys(stylistStats).map(name => ({
      name,
      value: stylistStats[name]
    })).sort((a, b) => b.value - a.value);

    res.json({
      success: true,
      stats: {
        totalCustomers: customersCount,
        totalAppointments,
        todayAppointments,
        upcomingAppointments,
        pendingAppointments,
        completedAppointments,
        activeMemberships: activeMembershipsCount,
        monthlyRevenue: thisMonthRevenue,
        activeStaff: activeStaffCount,

        totalRevenue,
        todayRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        yearlyRevenue,

        otpSentToday,
        otpVerifiedToday,
        failedOtpAttempts,
        verificationSuccessRate,

        comparison: {
          appointments: {
            thisMonth: thisMonthAppsCount,
            lastMonth: lastMonthAppsCount,
            percentChange: appointmentsGrowth,
            growth: appointmentsGrowth >= 0
          },
          revenue: {
            thisMonth: thisMonthRevenue,
            lastMonth: lastMonthRevenue,
            percentChange: revenueGrowth,
            growth: revenueGrowth >= 0
          },
          customers: {
            newCustomers,
            returningCustomers
          }
        },

        monthlyRevenueChart,
        revenueTrendGraph,
        revenueByCategory,
        stylistsChart
      }
    });
  } catch (error) {
    next(error);
  }
};
