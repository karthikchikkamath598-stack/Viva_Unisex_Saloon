const { prisma } = require('../config/db');

// Helper to determine discount percent
const getTierDiscount = (type) => {
  if (type === 'Student') return 5;
  if (type === 'Silver') return 10;
  if (type === 'Platinum') return 20;
  return 0;
};

// Purchase Membership (used by POS/admin or direct creation)
exports.purchaseMembership = async (req, res, next) => {
  try {
    const { customerName, phone, membershipType, email } = req.body;
    
    if (!phone || !membershipType) {
      return res.status(400).json({ success: false, message: 'Phone and membership type are required.' });
    }

    const discount = getTierDiscount(membershipType);
    const price = membershipType === 'Student' ? 999 : membershipType === 'Silver' ? 2999 : membershipType === 'Platinum' ? 4999 : 0;
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Link/create Customer
    let customer = await prisma.customer.findUnique({
      where: { mobileNumber: phone }
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: customerName || 'Unnamed Customer',
          mobileNumber: phone,
          email: email || ''
        }
      });
    }

    const memData = {
      customerName: customerName || customer.fullName,
      phone,
      email: email || customer.email || '',
      membershipType,
      price,
      startDate: new Date(),
      expiryDate,
      discount,
      status: 'Active'
    };

    let savedMem;
    const existing = await prisma.membership.findFirst({
      where: { customerId: customer.id }
    });

    if (existing) {
      savedMem = await prisma.membership.update({
        where: { id: existing.id },
        data: memData
      });
    } else {
      savedMem = await prisma.membership.create({
        data: {
          ...memData,
          customerId: customer.id
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Membership registered successfully.',
      membership: {
        ...savedMem,
        _id: savedMem.id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Apply Student Membership
exports.applyStudentMembership = async (req, res, next) => {
  try {
    const { customerName, phone, email, institutionName, studentIdNumber, studentIdUrl } = req.body;

    if (!phone || !studentIdNumber) {
      return res.status(400).json({ success: false, message: 'Phone and Student ID number are required.' });
    }

    // Link/create Customer
    let customer = await prisma.customer.findUnique({
      where: { mobileNumber: phone }
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          fullName: customerName || 'Unnamed Customer',
          mobileNumber: phone,
          email: email || ''
        }
      });
    }

    const memData = {
      customerName: customerName || customer.fullName,
      phone,
      email: email || customer.email || '',
      membershipType: 'Student',
      price: 999,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      discount: 5,
      studentIdImage: studentIdUrl || '',
      studentIdNumber,
      institutionName,
      status: 'Pending Approval'
    };

    let savedMem;
    const existing = await prisma.membership.findFirst({
      where: { customerId: customer.id }
    });

    if (existing) {
      savedMem = await prisma.membership.update({
        where: { id: existing.id },
        data: memData
      });
    } else {
      savedMem = await prisma.membership.create({
        data: {
          ...memData,
          customerId: customer.id
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Student verification submitted. Pending Admin approval.',
      membership: {
        ...savedMem,
        _id: savedMem.id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get All Memberships (Admin)
exports.getAllMemberships = async (req, res, next) => {
  try {
    const list = await prisma.membership.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const mappedList = list.map(m => ({
      _id: m.id,
      name: m.customerName,
      email: m.email || m.phone,
      phone: m.phone,
      membership: {
        type: m.membershipType,
        status: m.status,
        purchaseDate: m.startDate,
        expiryDate: m.expiryDate,
        studentIdUrl: m.studentIdImage,
        studentIdNumber: m.studentIdNumber || '',
        institutionName: m.institutionName || ''
      }
    }));

    res.json({ success: true, memberships: mappedList });
  } catch (error) {
    next(error);
  }
};

// Approve Student Membership (Admin)
exports.approveStudentMembership = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const updated = await prisma.membership.update({
      where: { id: userId },
      data: { status: 'Active' }
    });

    res.json({ success: true, message: 'Membership approved successfully.' });
  } catch (error) {
    next(error);
  }
};

// Reject Student Membership (Admin)
exports.rejectStudentMembership = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const updated = await prisma.membership.update({
      where: { id: userId },
      data: { status: 'Rejected' }
    });

    res.json({ success: true, message: 'Membership request rejected.' });
  } catch (error) {
    next(error);
  }
};

// Manual Update / Override Membership (Admin)
exports.manualUpdateMembership = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, status, expiryDate } = req.body;
    const discount = getTierDiscount(type);
    
    const updated = await prisma.membership.update({
      where: { id: userId },
      data: {
        membershipType: type,
        status,
        discount,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    res.json({
      success: true,
      message: 'Membership modified successfully.',
      membership: {
        ...updated,
        _id: updated.id
      }
    });
  } catch (error) {
    next(error);
  }
};
