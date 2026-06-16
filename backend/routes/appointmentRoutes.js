const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createAppointment,
  getUserAppointments,
  getAdminAppointments,
  updateAppointmentStatus,
  rescheduleAppointment
} = require('../controllers/appointmentController');
const { protect, isAdmin } = require('../middleware/auth');
const {
  validate,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
  rescheduleAppointmentSchema
} = require('../middleware/validate');
const rateLimit = require('express-rate-limit');

const appointmentCreationLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10,
  message: { success: false, message: 'Too many appointment requests from this IP. Please try again after 30 minutes.' }
});

router.get('/slots', getAvailableSlots);
router.post('/', appointmentCreationLimiter, validate(createAppointmentSchema), createAppointment);
router.get('/my-bookings', protect, getUserAppointments);
router.get('/admin-bookings', protect, isAdmin, getAdminAppointments);
router.put('/:id/status', protect, validate(updateAppointmentStatusSchema), updateAppointmentStatus);
router.put('/:id/reschedule', protect, isAdmin, validate(rescheduleAppointmentSchema), rescheduleAppointment);

module.exports = router;
