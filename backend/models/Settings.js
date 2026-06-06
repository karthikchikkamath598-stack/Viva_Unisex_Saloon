const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  ownerName: {
    type: String,
    default: 'David Salon Owner'
  },
  salonPhone: {
    type: String,
    default: '+919999999999'
  },
  ownerWhatsapp: {
    type: String,
    default: '+919999999999'
  },
  ownerEmail: {
    type: String,
    default: 'owner@vivasalon.com'
  },
  workingHoursStart: {
    type: String,
    default: '10:00 AM'
  },
  workingHoursEnd: {
    type: String,
    default: '08:00 PM'
  },
  slots: {
    type: [String],
    default: [
      "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
      "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
    ]
  },
  disabledSlots: {
    type: [String],
    default: []
  },
  blockedHolidays: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
