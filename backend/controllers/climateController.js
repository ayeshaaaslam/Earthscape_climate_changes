const { ClimateRecord } = require('../models');

// GET /api/climate
const getClimateRecords = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      location = '',
      source = '',
      startDate = '',
      endDate = '',
      minTemp,
      maxTemp,
      minRain,
      maxRain,
      minCo2,
      maxCo2,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }
    if (source && source !== 'All') {
      query.source = { $regex: source, $options: 'i' };
    }
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }
    if (minTemp !== undefined || maxTemp !== undefined) {
      query.temperature = {};
      if (minTemp !== undefined && minTemp !== '') query.temperature.$gte = Number(minTemp);
      if (maxTemp !== undefined && maxTemp !== '') query.temperature.$lte = Number(maxTemp);
      if (Object.keys(query.temperature).length === 0) delete query.temperature;
    }
    if (minRain !== undefined || maxRain !== undefined) {
      query.rainfall = {};
      if (minRain !== undefined && minRain !== '') query.rainfall.$gte = Number(minRain);
      if (maxRain !== undefined && maxRain !== '') query.rainfall.$lte = Number(maxRain);
      if (Object.keys(query.rainfall).length === 0) delete query.rainfall;
    }
    if (minCo2 !== undefined || maxCo2 !== undefined) {
      query.co2 = {};
      if (minCo2 !== undefined && minCo2 !== '') query.co2.$gte = Number(minCo2);
      if (maxCo2 !== undefined && maxCo2 !== '') query.co2.$lte = Number(maxCo2);
      if (Object.keys(query.co2).length === 0) delete query.co2;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await ClimateRecord.countDocuments(query);
    const records = await ClimateRecord.find(query)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      records
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/climate/statistics
const getStatistics = async (req, res, next) => {
  try {
    const { location = '' } = req.query;
    const match = location && location !== 'All' ? { location } : {};

    const [summary] = await ClimateRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          avgTemp: { $avg: '$temperature' },
          minTemp: { $min: '$temperature' },
          maxTemp: { $max: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          minHumidity: { $min: '$humidity' },
          maxHumidity: { $max: '$humidity' },
          avgRainfall: { $avg: '$rainfall' },
          maxRainfall: { $max: '$rainfall' },
          totalRainfall: { $sum: '$rainfall' },
          avgCo2: { $avg: '$co2' },
          minCo2: { $min: '$co2' },
          maxCo2: { $max: '$co2' },
          avgWindSpeed: { $avg: '$windSpeed' },
          avgAirPressure: { $avg: '$airPressure' }
        }
      }
    ]);

    // Monthly aggregates for trends
    const monthlyTrends = await ClimateRecord.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $substr: ['$date', 0, 7] }, // YYYY-MM
          avgTemp: { $avg: '$temperature' },
          avgRainfall: { $avg: '$rainfall' },
          avgHumidity: { $avg: '$humidity' },
          avgCo2: { $avg: '$co2' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Location comparisons
    const locationStats = await ClimateRecord.aggregate([
      {
        $group: {
          _id: '$location',
          lat: { $first: '$latitude' },
          lon: { $first: '$longitude' },
          avgTemp: { $avg: '$temperature' },
          minTemp: { $min: '$temperature' },
          maxTemp: { $max: '$temperature' },
          avgRainfall: { $avg: '$rainfall' },
          avgHumidity: { $avg: '$humidity' },
          avgCo2: { $avg: '$co2' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgTemp: -1 } }
    ]);

    res.json({
      success: true,
      summary: summary ? {
        totalRecords: summary.totalRecords,
        avgTemp: parseFloat((summary.avgTemp || 0).toFixed(2)),
        minTemp: summary.minTemp,
        maxTemp: summary.maxTemp,
        avgHumidity: parseFloat((summary.avgHumidity || 0).toFixed(2)),
        minHumidity: summary.minHumidity,
        maxHumidity: summary.maxHumidity,
        avgRainfall: parseFloat((summary.avgRainfall || 0).toFixed(2)),
        maxRainfall: summary.maxRainfall,
        totalRainfall: parseFloat((summary.totalRainfall || 0).toFixed(2)),
        avgCo2: parseFloat((summary.avgCo2 || 0).toFixed(2)),
        minCo2: summary.minCo2,
        maxCo2: summary.maxCo2,
        avgWindSpeed: parseFloat((summary.avgWindSpeed || 0).toFixed(2)),
        avgAirPressure: parseFloat((summary.avgAirPressure || 0).toFixed(2))
      } : {},
      monthlyTrends: monthlyTrends.map(m => ({
        month: m._id,
        avgTemp: parseFloat((m.avgTemp || 0).toFixed(2)),
        avgRainfall: parseFloat((m.avgRainfall || 0).toFixed(2)),
        avgHumidity: parseFloat((m.avgHumidity || 0).toFixed(2)),
        avgCo2: parseFloat((m.avgCo2 || 0).toFixed(2)),
        count: m.count
      })),
      locationStats: locationStats.map(l => ({
        location: l._id,
        latitude: l.lat,
        longitude: l.lon,
        avgTemp: parseFloat((l.avgTemp || 0).toFixed(2)),
        minTemp: l.minTemp,
        maxTemp: l.maxTemp,
        avgRainfall: parseFloat((l.avgRainfall || 0).toFixed(2)),
        avgHumidity: parseFloat((l.avgHumidity || 0).toFixed(2)),
        avgCo2: parseFloat((l.avgCo2 || 0).toFixed(2)),
        count: l.count
      }))
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/climate/locations
const getLocations = async (req, res, next) => {
  try {
    const locations = await ClimateRecord.aggregate([
      {
        $group: {
          _id: '$location',
          latitude: { $first: '$latitude' },
          longitude: { $first: '$longitude' },
          recordCount: { $sum: 1 },
          latestDate: { $max: '$date' },
          latestTemp: { $last: '$temperature' },
          latestRain: { $last: '$rainfall' },
          latestCo2: { $last: '$co2' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, locations });
  } catch (err) {
    next(err);
  }
};

// GET /api/climate/export-csv (Tableau & Excel export)
const exportClimateCSV = async (req, res, next) => {
  try {
    const { location } = req.query;
    const query = location && location !== 'All' ? { location } : {};
    const records = await ClimateRecord.find(query).sort({ date: 1 }).lean();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=earthscape_climate_${Date.now()}.csv`);

    res.write('date,location,latitude,longitude,temperature,humidity,rainfall,wind_speed,air_pressure,co2,source,is_simulated\n');
    for (const r of records) {
      res.write(`${r.date},${r.location},${r.latitude},${r.longitude},${r.temperature},${r.humidity},${r.rainfall},${r.windSpeed},${r.airPressure},${r.co2},"${r.source}",${r.isSimulated || false}\n`);
    }
    res.end();
  } catch (err) {
    next(err);
  }
};

module.exports = { getClimateRecords, getStatistics, getLocations, exportClimateCSV };
