const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createAppointment,
  getUserAppointments,
  getAdminAppointments,
  updateAppointmentStatus
} = require('../controllers/appointmentController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/slots', getAvailableSlots);
router.post('/', protect, createAppointment);
router.get('/my-bookings', protect, getUserAppointments);
router.get('/admin-bookings', protect, isAdmin, getAdminAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);

module.exports = router;
