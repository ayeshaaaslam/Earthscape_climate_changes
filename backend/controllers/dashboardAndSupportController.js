const { SupportTicket, SystemLog, User, Dataset, ClimateRecord, Anomaly, Alert } = require('../models');
const { logActivity } = require('../utils/logger');
const reportService = require('../services/reportService');

// --- SUPPORT CONTROLLER ---
const createTicket = async (req, res, next) => {
  try {
    const { name, email, subject, category, message, priority } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required.' });
    }

    const ticket = await SupportTicket.create({
      userId: req.user?._id,
      name: name || req.user?.name || 'Anonymous User',
      email: email || req.user?.email || 'user@earthscape.org',
      subject,
      category: category || 'Technical Issue',
      message,
      priority: priority || 'Medium',
      status: 'Open'
    });

    await logActivity({
      action: 'SUPPORT_TICKET_CREATED',
      category: 'SYSTEM',
      userId: req.user?._id,
      userName: req.user?.name || name,
      details: `Support ticket #${ticket._id.toString().slice(-6)} created: "${subject}".`
    });

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    next(err);
  }
};

const getTickets = async (req, res, next) => {
  try {
    const { status = '', priority = '', category = '' } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (category && category !== 'All') query.category = category;

    // If Analyst, only return their own tickets
    if (req.user && req.user.role === 'ANALYST') {
      query.userId = req.user._id;
    }

    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: tickets.length, tickets });
  } catch (err) {
    next(err);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;

    const ticket = await SupportTicket.findById(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    if (status) ticket.status = status;
    if (adminResponse !== undefined) {
      ticket.adminResponse = adminResponse;
      ticket.adminName = req.user?.name || 'Support Admin';
    }
    if (status === 'Resolved' || status === 'Closed') {
      ticket.resolvedAt = new Date();
    }
    await ticket.save();

    await logActivity({
      action: 'SUPPORT_TICKET_UPDATED',
      category: 'SYSTEM',
      userId: req.user?._id,
      userName: req.user?.name,
      details: `Support ticket #${id.slice(-6)} updated to status: ${ticket.status}.`
    });

    res.json({ success: true, ticket });
  } catch (err) {
    next(err);
  }
};

// --- LOGS CONTROLLER ---
const getLogs = async (req, res, next) => {
  try {
    const { category = '', status = '', search = '', page = 1, limit = 50 } = req.query;
    const query = {};
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await SystemLog.countDocuments(query);
    const logs = await SystemLog.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      logs
    });
  } catch (err) {
    next(err);
  }
};

// --- DASHBOARD CONTROLLER ---
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalDatasets,
      totalRecords,
      totalAnomalies,
      totalAlerts,
      activeAlerts,
      locationsAgg
    ] = await Promise.all([
      User.countDocuments(),
      Dataset.countDocuments(),
      ClimateRecord.countDocuments(),
      Anomaly.countDocuments(),
      Alert.countDocuments(),
      Alert.countDocuments({ status: 'Active' }),
      ClimateRecord.aggregate([
        {
          $group: {
            _id: '$location',
            avgTemp: { $avg: '$temperature' },
            avgRainfall: { $avg: '$rainfall' },
            avgHumidity: { $avg: '$humidity' },
            avgCo2: { $avg: '$co2' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    // System wide averages
    const [overallAvg] = await ClimateRecord.aggregate([
      {
        $group: {
          _id: null,
          avgTemp: { $avg: '$temperature' },
          avgCo2: { $avg: '$co2' },
          avgRainfall: { $avg: '$rainfall' },
          avgHumidity: { $avg: '$humidity' }
        }
      }
    ]);

    // Anomaly count by location
    const anomaliesByLocation = await Anomaly.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Data sources breakdown
    const recordsBySource = await ClimateRecord.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDatasets,
        totalRecords,
        totalLocations: locationsAgg.length,
        totalAnomalies,
        totalAlerts,
        activeAlerts,
        avgTemperature: parseFloat((overallAvg?.avgTemp || 0).toFixed(2)),
        avgCo2: parseFloat((overallAvg?.avgCo2 || 0).toFixed(2)),
        avgRainfall: parseFloat((overallAvg?.avgRainfall || 0).toFixed(2)),
        avgHumidity: parseFloat((overallAvg?.avgHumidity || 0).toFixed(2))
      },
      locations: locationsAgg.map(l => ({
        location: l._id,
        avgTemp: parseFloat((l.avgTemp || 0).toFixed(1)),
        avgRainfall: parseFloat((l.avgRainfall || 0).toFixed(1)),
        avgHumidity: parseFloat((l.avgHumidity || 0).toFixed(1)),
        avgCo2: parseFloat((l.avgCo2 || 0).toFixed(1)),
        recordCount: l.count
      })),
      anomaliesByLocation: anomaliesByLocation.map(a => ({ location: a._id, count: a.count })),
      recordsBySource: recordsBySource.map(s => ({ source: s._id || 'Standard Station', count: s.count }))
    });
  } catch (err) {
    next(err);
  }
};

// --- REPORTS CONTROLLER ---
const getComprehensiveReport = async (req, res, next) => {
  try {
    const { location = 'All', startDate, endDate } = req.query;
    const report = await reportService.generateComprehensiveReport(location, startDate, endDate);
    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicket,
  getLogs,
  getDashboardStats,
  getComprehensiveReport
};
