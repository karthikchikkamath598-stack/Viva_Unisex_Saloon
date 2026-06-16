const { prisma } = require('../config/db');

// Get All System Notification Logs (Admin)
exports.getNotifications = async (req, res, next) => {
  try {
    const logs = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const mappedLogs = logs.map(log => ({
      ...log,
      _id: log.id
    }));

    res.json({ success: true, count: mappedLogs.length, notifications: mappedLogs });
  } catch (error) {
    next(error);
  }
};
