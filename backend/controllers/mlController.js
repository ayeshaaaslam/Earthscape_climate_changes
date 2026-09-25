const mlService = require('../services/mlService');
const { Anomaly, Prediction } = require('../models');
const { logActivity } = require('../utils/logger');

// POST /api/ml/predict
const predictTrends = async (req, res, next) => {
  try {
    const { parameter = 'temperature', horizonSteps = 12, location = null, degree = 2 } = req.body;
    const result = await mlService.predictTrends({ parameter, horizonSteps, location, degree });

    await logActivity({
      action: 'ML_TREND_PREDICTION',
      category: 'ML_PREDICTION',
      userId: req.user?._id,
      userName: req.user?.name || 'System',
      details: `Executed ${result.data?.modelName || 'ML Predictor'} for ${parameter} in ${location || 'All Stations'}.`
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// POST /api/ml/detect-anomalies
const detectAnomalies = async (req, res, next) => {
  try {
    const { parameter = 'temperature', method = 'All', contamination = 0.03 } = req.body;
    const result = await mlService.detectAnomalies({ parameter, method, contamination });

    await logActivity({
      action: 'ANOMALY_DETECTION_RUN',
      category: 'ANOMALY',
      userId: req.user?._id,
      userName: req.user?.name || 'System',
      details: `Executed Anomaly Detector (${method}) for ${parameter}. Detected ${result.totalDetected} anomalies.`
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/anomalies
const getAnomalies = async (req, res, next) => {
  try {
    const { location = '', severity = '', status = '', page = 1, limit = 50 } = req.query;
    const query = {};
    if (location && location !== 'All') query.location = { $regex: location, $options: 'i' };
    if (severity && severity !== 'All') query.severity = severity;
    if (status && status !== 'All') query.status = status;

    const total = await Anomaly.countDocuments(query);
    const anomalies = await Anomaly.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      anomalies
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/anomalies/:id
const updateAnomalyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const anomaly = await Anomaly.findById(id);
    if (!anomaly) {
      return res.status(404).json({ success: false, message: 'Anomaly record not found.' });
    }
    if (status) anomaly.status = status;
    if (notes !== undefined) anomaly.notes = notes;
    await anomaly.save();

    res.json({ success: true, anomaly });
  } catch (err) {
    next(err);
  }
};

// GET /api/ml/correlations
const getCorrelations = async (req, res, next) => {
  try {
    const result = await mlService.getCorrelations();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { predictTrends, detectAnomalies, getAnomalies, updateAnomalyStatus, getCorrelations };
