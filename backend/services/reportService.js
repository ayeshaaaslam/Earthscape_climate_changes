const { ClimateRecord, Anomaly, Prediction } = require('../models');
const mlService = require('./mlService');

class ReportService {
  async generateComprehensiveReport(location = 'All', startDate = null, endDate = null) {
    const query = {};
    if (location && location !== 'All') query.location = location;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const records = await ClimateRecord.find(query).lean();
    if (records.length === 0) {
      throw new Error('No climate records found matching the specified parameters.');
    }

    const temps = records.map(r => r.temperature);
    const humids = records.map(r => r.humidity);
    const rains = records.map(r => r.rainfall);
    const co2s = records.map(r => r.co2);
    const winds = records.map(r => r.windSpeed);

    const stats = {
      recordCount: records.length,
      location: location,
      period: {
        from: startDate || records[0]?.date || 'Start',
        to: endDate || records[records.length - 1]?.date || 'End'
      },
      temperature: {
        avg: parseFloat((temps.reduce((a, b) => a + b, 0) / records.length).toFixed(2)),
        min: Math.min(...temps),
        max: Math.max(...temps)
      },
      rainfall: {
        avg: parseFloat((rains.reduce((a, b) => a + b, 0) / records.length).toFixed(2)),
        total: parseFloat(rains.reduce((a, b) => a + b, 0).toFixed(2)),
        max: Math.max(...rains)
      },
      humidity: {
        avg: parseFloat((humids.reduce((a, b) => a + b, 0) / records.length).toFixed(2))
      },
      co2: {
        avg: parseFloat((co2s.reduce((a, b) => a + b, 0) / records.length).toFixed(2)),
        min: Math.min(...co2s),
        max: Math.max(...co2s)
      },
      windSpeed: {
        avg: parseFloat((winds.reduce((a, b) => a + b, 0) / records.length).toFixed(2))
      }
    };

    const anomQuery = location && location !== 'All' ? { location } : {};
    const recentAnomalies = await Anomaly.find(anomQuery).sort({ createdAt: -1 }).limit(10).lean();

    let correlations = null;
    try {
      correlations = await mlService.getCorrelations();
    } catch (e) {
      correlations = { error: e.message };
    }

    return {
      title: 'EarthScape Climate Agency - Comprehensive Environmental & Big Data Analysis Report',
      generatedAt: new Date().toISOString(),
      summaryStats: stats,
      anomalies: recentAnomalies,
      correlations: correlations?.data?.insights || []
    };
  }
}

module.exports = new ReportService();
