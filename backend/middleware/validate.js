const { z } = require('zod');
const logger = require('../utils/logger');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    logger.warn('Request validation failed: %o', error.errors);
    const firstError = error.errors[0];
    const message = firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Invalid input data';
    return res.status(400).json({
      success: false,
      message,
      errors: error.errors
    });
  }
};

// --- Authentication Schemas ---
const loginSchema = z.object({
  body: z.object({
    mobileNumber: z.string().min(1, 'Mobile Number is required'),
    password: z.string().min(1, 'Password is required')
  })
});

const registerSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    mobileNumber: z.string().trim().min(1, 'Mobile Number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['owner', 'software_manager', 'software_developer', 'admin']).default('admin'),
    secretCode: z.string().refine(val => {
      const secret = process.env.ADMIN_REGISTRATION_SECRET;
      if (!secret) return false;
      return val === secret;
    }, {
      message: 'Unauthorized Registration Attempt'
    })
  })
});

// --- Appointment Schemas ---
const createAppointmentSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    service: z.string().min(1, 'Service name is required'),
    staffMember: z.string().min(1, 'Staff member is required'),
    appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    appointmentTime: z.string().min(1, 'Appointment time is required'),
    notes: z.string().optional().default('')
  })
});

const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled', 'pending', 'confirmed', 'completed', 'cancelled'], {
      errorMap: () => ({ message: 'Invalid status. Must be Pending, Confirmed, Completed, or Cancelled' })
    })
  })
});

const rescheduleAppointmentSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    timeSlot: z.string().min(1, 'Timeslot is required')
  })
});

// --- Billing Schemas ---
const createBillSchema = z.object({
  body: z.object({
    customerName: z.string().optional().default(''),
    mobileNumber: z.string().optional().default(''),
    staffMember: z.string().min(1, 'Staff selection is mandatory'),
    services: z.array(
      z.object({
        name: z.string().min(1, 'Service name is required'),
        price: z.union([z.number(), z.string()]).transform(val => Number(val))
      })
    ).min(1, 'At least one service must be selected'),
    addGst: z.boolean().optional().default(false),
    manualDiscountType: z.enum(['percent', 'rupees', 'None', '']).optional(),
    manualDiscountValue: z.union([z.number(), z.string(), z.null()]).optional()
  })
});

// --- Membership Schemas ---
const purchaseMembershipSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    phone: z.string().min(1, 'Phone is required'),
    membershipType: z.enum(['Student', 'Silver', 'Platinum'], {
      errorMap: () => ({ message: 'Invalid membership type. Must be Student, Silver, or Platinum' })
    }),
    email: z.string().email('Invalid email format').optional().or(z.literal(''))
  })
});

const applyStudentMembershipSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, 'Customer name is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    institutionName: z.string().min(1, 'Institution name is required'),
    studentIdNumber: z.string().min(1, 'Student ID number is required'),
    studentIdUrl: z.string().optional().default('')
  })
});

const manualUpdateMembershipSchema = z.object({
  body: z.object({
    type: z.enum(['Student', 'Silver', 'Platinum'], {
      errorMap: () => ({ message: 'Invalid membership type. Must be Student, Silver, or Platinum' })
    }),
    status: z.enum(['Pending Approval', 'Active', 'Rejected', 'Expired'], {
      errorMap: () => ({ message: 'Invalid membership status' })
    }),
    expiryDate: z.string().datetime('Invalid datetime format').optional().or(z.literal('')).or(z.null())
  })
});

module.exports = {
  validate,
  loginSchema,
  registerSchema,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  rescheduleAppointmentSchema,
  createBillSchema,
  purchaseMembershipSchema,
  applyStudentMembershipSchema,
  manualUpdateMembershipSchema
};
