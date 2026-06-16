const { prisma } = require('../config/db');

// Helper: Get active membership discount by phone number
const getMembershipDiscount = async (phone) => {
  if (!phone) return { type: 'None', discount: 0 };
  
  const activeMem = await prisma.membership.findFirst({
    where: { phone, status: 'Active' }
  });
  if (activeMem) {
    return { type: activeMem.membershipType, discount: Number(activeMem.discount) };
  }
  return { type: 'None', discount: 0 };
};

// Create a new bill (POS Checkout)
exports.createBill = async (req, res, next) => {
  try {
    const { customerName, mobileNumber, staffMember, services, addGst, manualDiscountType, manualDiscountValue } = req.body;

    if (!staffMember) {
      return res.status(400).json({ success: false, message: 'Staff selection is mandatory.' });
    }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one service must be selected.' });
    }

    // 1. Check Membership Discount
    const memDetails = await getMembershipDiscount(mobileNumber);

    // 2. Calculations
    const subtotal = services.reduce((sum, s) => sum + Number(s.price), 0);
    
    let discountAmount = 0;
    if (manualDiscountValue !== undefined && manualDiscountValue !== null && manualDiscountValue !== '' && Number(manualDiscountValue) > 0) {
      if (manualDiscountType === 'percent') {
        discountAmount = Math.round(subtotal * (Number(manualDiscountValue) / 100));
      } else if (manualDiscountType === 'rupees') {
        discountAmount = Math.round(Number(manualDiscountValue));
      }
    } else {
      discountAmount = Math.round(subtotal * (memDetails.discount / 100));
    }

    discountAmount = Math.min(discountAmount, subtotal);
    
    let gstAmount = 0;
    if (addGst) {
      gstAmount = Math.round((subtotal - discountAmount) * 0.18);
    }
    const grandTotal = subtotal - discountAmount + gstAmount;

    // Generate Invoice ID
    const invoiceSuffix = Date.now().toString().slice(-6);
    const billId = `VIVA-POS-${invoiceSuffix}`;

    const dateToday = new Date().toISOString().split('T')[0];
    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Link/create Customer
    let customer = null;
    if (mobileNumber) {
      customer = await prisma.customer.findUnique({
        where: { mobileNumber }
      });
      if (!customer && customerName) {
        customer = await prisma.customer.create({
          data: {
            fullName: customerName,
            mobileNumber
          }
        });
      }
    }

    const dbStylist = await prisma.stylist.findUnique({
      where: { name: staffMember }
    });

    const savedBill = await prisma.bill.create({
      data: {
        billId,
        customerId: customer ? customer.id : null,
        customerName: customerName || '',
        mobileNumber: mobileNumber || '',
        staffMember,
        stylistId: dbStylist ? dbStylist.id : null,
        membershipType: memDetails.type,
        subtotal,
        discount: discountAmount,
        gst: gstAmount,
        grandTotal,
        totalServices: services.length,
        date: dateToday,
        time: timeNow,
        services: {
          create: services.map(s => ({
            name: s.name,
            price: Number(s.price)
          }))
        }
      },
      include: {
        services: true
      }
    });

    const mappedBill = {
      ...savedBill,
      _id: savedBill.id,
      services: savedBill.services.map(s => ({ ...s, _id: s.id }))
    };

    res.status(201).json({
      success: true,
      message: 'Bill generated and saved successfully.',
      bill: mappedBill
    });
  } catch (error) {
    next(error);
  }
};

// Fetch all bills
exports.getBills = async (req, res, next) => {
  try {
    const billsList = await prisma.bill.findMany({
      include: { services: true },
      orderBy: { createdAt: 'desc' }
    });

    const mappedBills = billsList.map(b => ({
      ...b,
      _id: b.id,
      services: b.services.map(s => ({ ...s, _id: s.id }))
    }));

    res.json({ success: true, count: mappedBills.length, bills: mappedBills });
  } catch (error) {
    next(error);
  }
};

// Verify Membership by phone number
exports.verifyMembership = async (req, res, next) => {
  try {
    const { phone } = req.params;
    const memDetails = await getMembershipDiscount(phone);
    res.json({
      success: true,
      hasMembership: memDetails.type !== 'None',
      membershipType: memDetails.type,
      discount: memDetails.discount
    });
  } catch (error) {
    next(error);
  }
};

// Get POS Billing Analytics
exports.getBillingAnalytics = async (req, res, next) => {
  try {
    const bills = await prisma.bill.findMany({
      include: { services: true }
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const thisMonthStr = new Date().toISOString().substring(0, 7);

    const todayBills = bills.filter(b => b.date === todayStr);
    const todayRevenue = todayBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    const todayBillsCount = todayBills.length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thisWeekBills = bills.filter(b => new Date(b.date) >= sevenDaysAgo);
    const thisWeekRevenue = thisWeekBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

    const thisMonthBills = bills.filter(b => b.date && b.date.startsWith(thisMonthStr));
    const thisMonthRevenue = thisMonthBills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

    const totalRevenue = bills.reduce((sum, b) => sum + (b.grandTotal || 0), 0);

    const DBStylists = await prisma.stylist.findMany();
    const staffReport = {
      Fardeen: { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 },
      Hussain: { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 },
      Sandhya: { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 }
    };
    DBStylists.forEach(st => {
      if (!staffReport[st.name]) {
        staffReport[st.name] = { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 };
      }
    });

    bills.forEach(b => {
      const staff = b.staffMember;
      if (staffReport[staff]) {
        staffReport[staff].customersServed += 1;
        staffReport[staff].revenueGenerated += (b.grandTotal || 0);
        staffReport[staff].servicesCompleted += (b.totalServices || 0);
      }
    });

    let topStaffName = 'N/A';
    let topStaffRevenue = -1;
    Object.keys(staffReport).forEach(name => {
      if (staffReport[name].revenueGenerated > topStaffRevenue) {
        topStaffRevenue = staffReport[name].revenueGenerated;
        topStaffName = name;
      }
    });

    const serviceBookings = {};
    bills.forEach(b => {
      if (b.services && Array.isArray(b.services)) {
        b.services.forEach(s => {
          serviceBookings[s.name] = (serviceBookings[s.name] || 0) + 1;
        });
      }
    });

    const sortedServices = Object.keys(serviceBookings).map(name => ({
      name,
      bookings: serviceBookings[name]
    })).sort((a, b) => b.bookings - a.bookings);

    const mostBookedServices = sortedServices.slice(0, 5);

    const monthlyStats = {};
    bills.forEach(b => {
      if (b.date) {
        const month = b.date.substring(0, 7);
        monthlyStats[month] = (monthlyStats[month] || 0) + (b.grandTotal || 0);
      }
    });

    const monthlyRevenueChart = Object.keys(monthlyStats).map(month => ({
      month,
      revenue: monthlyStats[month]
    })).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      success: true,
      stats: {
        todayRevenue,
        thisWeekRevenue,
        thisMonthRevenue,
        totalRevenue,
        topStaff: { name: topStaffName, revenue: topStaffRevenue },
        mostBookedServices,
        dailyBillsCount: todayBillsCount,
        monthlyRevenueChart,
        staffReport
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get Stylist performance tracking lists
exports.getStaffReports = async (req, res, next) => {
  try {
    const bills = await prisma.bill.findMany();

    const DBStylists = await prisma.stylist.findMany();
    const report = {
      Fardeen: { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 },
      Hussain: { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 },
      Sandhya: { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 }
    };
    DBStylists.forEach(st => {
      if (!report[st.name]) {
        report[st.name] = { customersServed: 0, revenueGenerated: 0, servicesCompleted: 0 };
      }
    });

    bills.forEach(b => {
      const staff = b.staffMember;
      if (report[staff]) {
        report[staff].customersServed += 1;
        report[staff].revenueGenerated += (b.grandTotal || 0);
        report[staff].servicesCompleted += (b.totalServices || 0);
      }
    });

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};
