const Settings = require('../models/Settings');
const { getIsMock } = require('../config/db');
const { readMockDB, writeMockDB } = require('../config/mockDb');

const defaultSettings = {
  ownerName: 'David Salon Owner',
  salonPhone: '+919999999999',
  ownerWhatsapp: '+919999999999',
  ownerEmail: 'owner@vivasalon.com',
  workingHoursStart: '10:00 AM',
  workingHoursEnd: '08:00 PM',
  slots: [
    "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
    "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
  ],
  disabledSlots: [],
  blockedHolidays: []
};

exports.getSettings = async (req, res, next) => {
  try {
    if (getIsMock()) {
      const db = readMockDB();
      if (!db.settings) {
        db.settings = { ...defaultSettings };
        writeMockDB(db);
      }
      return res.json({ success: true, settings: db.settings });
    } else {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({});
      }
      return res.json({ success: true, settings });
    }
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  const { 
    ownerName, 
    salonPhone, 
    ownerWhatsapp, 
    ownerEmail, 
    workingHoursStart, 
    workingHoursEnd, 
    slots, 
    disabledSlots, 
    blockedHolidays 
  } = req.body;

  try {
    if (getIsMock()) {
      const db = readMockDB();
      if (!db.settings) {
        db.settings = { ...defaultSettings };
      }
      db.settings = {
        ...db.settings,
        ownerName: ownerName !== undefined ? ownerName : db.settings.ownerName,
        salonPhone: salonPhone !== undefined ? salonPhone : db.settings.salonPhone,
        ownerWhatsapp: ownerWhatsapp !== undefined ? ownerWhatsapp : db.settings.ownerWhatsapp,
        ownerEmail: ownerEmail !== undefined ? ownerEmail : db.settings.ownerEmail,
        workingHoursStart: workingHoursStart !== undefined ? workingHoursStart : db.settings.workingHoursStart,
        workingHoursEnd: workingHoursEnd !== undefined ? workingHoursEnd : db.settings.workingHoursEnd,
        slots: slots !== undefined ? slots : db.settings.slots,
        disabledSlots: disabledSlots !== undefined ? disabledSlots : db.settings.disabledSlots,
        blockedHolidays: blockedHolidays !== undefined ? blockedHolidays : db.settings.blockedHolidays
      };
      writeMockDB(db);
      return res.json({ success: true, message: 'Settings updated successfully', settings: db.settings });
    } else {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings();
      }
      if (ownerName !== undefined) settings.ownerName = ownerName;
      if (salonPhone !== undefined) settings.salonPhone = salonPhone;
      if (ownerWhatsapp !== undefined) settings.ownerWhatsapp = ownerWhatsapp;
      if (ownerEmail !== undefined) settings.ownerEmail = ownerEmail;
      if (workingHoursStart !== undefined) settings.workingHoursStart = workingHoursStart;
      if (workingHoursEnd !== undefined) settings.workingHoursEnd = workingHoursEnd;
      if (slots !== undefined) settings.slots = slots;
      if (disabledSlots !== undefined) settings.disabledSlots = disabledSlots;
      if (blockedHolidays !== undefined) settings.blockedHolidays = blockedHolidays;

      await settings.save();
      return res.json({ success: true, message: 'Settings updated successfully', settings });
    }
  } catch (err) {
    next(err);
  }
};
