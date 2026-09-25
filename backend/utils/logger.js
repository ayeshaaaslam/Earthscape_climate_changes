const { SystemLog } = require('../models');

const logActivity = async ({ action, category = 'SYSTEM', userId = null, userName = 'System', details, ipAddress = '127.0.0.1', status = 'SUCCESS' }) => {
  try {
    console.log(`[AUDIT LOG] [${category}] [${status}] ${action} by ${userName}: ${details}`);
    await SystemLog.create({
      action,
      category,
      userId,
      userName,
      details,
      ipAddress,
      status
    });
  } catch (err) {
    console.error('[Logger Error]: Failed to save system log to database:', err.message);
  }
};

module.exports = { logActivity };
