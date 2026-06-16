const { prisma } = require('../config/db');

const { defaultSettings } = require('../utils/settingsDefaults');

// Fetch Settings
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "viva-settings" }
    });
    if (!settings) {
      settings = await prisma.settings.create({
        data: defaultSettings
      });
    }
    return res.json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

// Update Settings
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
    blockedHolidays,
    memberships
  } = req.body;

  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "viva-settings" }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: defaultSettings
      });
    }

    const updated = await prisma.settings.update({
      where: { id: "viva-settings" },
      data: {
        ownerName: ownerName !== undefined ? ownerName : undefined,
        salonPhone: salonPhone !== undefined ? salonPhone : undefined,
        ownerWhatsapp: ownerWhatsapp !== undefined ? ownerWhatsapp : undefined,
        ownerEmail: ownerEmail !== undefined ? ownerEmail : undefined,
        workingHoursStart: workingHoursStart !== undefined ? workingHoursStart : undefined,
        workingHoursEnd: workingHoursEnd !== undefined ? workingHoursEnd : undefined,
        slots: slots !== undefined ? slots : undefined,
        disabledSlots: disabledSlots !== undefined ? disabledSlots : undefined,
        blockedHolidays: blockedHolidays !== undefined ? blockedHolidays : undefined,
        memberships: memberships !== undefined ? memberships : undefined
      }
    });

    return res.json({ success: true, message: 'Settings updated successfully', settings: updated });
  } catch (err) {
    next(err);
  }
};
