const { Alert, AlertSetting } = require('../models');
const { logActivity } = require('../utils/logger');

// GET /api/alerts
const getAlerts = async (req, res, next) => {
  try {
    const { status = '', severity = '', location = '', page = 1, limit = 50 } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (severity && severity !== 'All') query.severity = severity;
    if (location && location !== 'All') query.location = { $regex: location, $options: 'i' };

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      alerts
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/alerts/:id
const updateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    alert.status = status || alert.status;
    if (status === 'Resolved') {
      alert.resolvedBy = req.user?.name || 'Administrator';
      alert.resolvedAt = new Date();
    }
    await alert.save();

    await logActivity({
      action: 'ALERT_STATUS_UPDATED',
      category: 'ALERT',
      userId: req.user?._id,
      userName: req.user?.name || 'System',
      details: `Alert in ${alert.location} (${alert.parameter}) changed status to ${alert.status}.`
    });

    res.json({ success: true, alert });
  } catch (err) {
    next(err);
  }
};

// GET /api/alerts/settings
const getSettings = async (req, res, next) => {
  try {
    let setting = await AlertSetting.findOne({ key: 'global_thresholds' });
    if (!setting) {
      setting = await AlertSetting.create({ key: 'global_thresholds' });
    }
    res.json({ success: true, setting });
  } catch (err) {
    next(err);
  }
};

// PUT /api/alerts/settings
const updateSettings = async (req, res, next) => {
  try {
    const { tempMax, tempMin, rainfallMax, humidityMax, co2Max, windSpeedMax, storageMode } = req.body;
    let setting = await AlertSetting.findOne({ key: 'global_thresholds' });
    if (!setting) {
      setting = new AlertSetting({ key: 'global_thresholds' });
    }

    if (tempMax !== undefined) setting.tempMax = Number(tempMax);
    if (tempMin !== undefined) setting.tempMin = Number(tempMin);
    if (rainfallMax !== undefined) setting.rainfallMax = Number(rainfallMax);
    if (humidityMax !== undefined) setting.humidityMax = Number(humidityMax);
    if (co2Max !== undefined) setting.co2Max = Number(co2Max);
    if (windSpeedMax !== undefined) setting.windSpeedMax = Number(windSpeedMax);
    if (storageMode) setting.storageMode = storageMode;

    await setting.save();

    await logActivity({
      action: 'ALERT_THRESHOLDS_MODIFIED',
      category: 'SETTINGS',
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      details: `Thresholds updated: TempMax=${setting.tempMax}°C, RainMax=${setting.rainfallMax}mm, CO2Max=${setting.co2Max}ppm.`
    });

    res.json({ success: true, message: 'Alert thresholds updated successfully.', setting });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlerts, updateAlert, getSettings, updateSettings };
