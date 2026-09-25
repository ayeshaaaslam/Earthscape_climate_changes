const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');
const { Dataset, ClimateRecord } = require('../models');
const hdfsService = require('../services/hdfsService');
const { logActivity } = require('../utils/logger');

// POST /api/datasets/upload
const uploadDataset = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No dataset file provided.' });
    }

    const { originalname, path: tempPath, size } = req.file;
    const fileExt = path.extname(originalname).toLowerCase();
    const source = req.body.source || 'Weather Station';

    const rawBuffer = fs.readFileSync(tempPath);

    // Save to HDFS / Local storage
    const storageResult = await hdfsService.saveRawFile(originalname, rawBuffer, 'weather');

    // Create Dataset metadata record
    const dataset = await Dataset.create({
      fileName: originalname,
      fileType: fileExt === '.json' ? 'JSON' : 'CSV',
      source,
      fileSize: size,
      storagePath: storageResult.storagePath,
      storageMode: storageResult.mode.includes('HDFS') ? 'HDFS' : 'LOCAL',
      status: 'UPLOADED',
      uploadedBy: req.user?._id,
      uploaderName: req.user?.name || 'System'
    });

    const parsedRecords = [];
    const validationErrors = [];
    let duplicates = 0;
    let missingOrCorrupt = 0;

    if (fileExt === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(tempPath)
          .pipe(csvParser())
          .on('data', (row) => {
            // Validate required fields
            const date = row.date || row.Date;
            const location = row.location || row.Location;
            const lat = parseFloat(row.latitude || row.Latitude || row.lat || 0);
            const lon = parseFloat(row.longitude || row.Longitude || row.lon || 0);
            const temp = parseFloat(row.temperature || row.Temperature || row.temp);
            const humid = parseFloat(row.humidity || row.Humidity || row.humid);
            const rain = parseFloat(row.rainfall || row.Rainfall || row.rain || 0);
            const wind = parseFloat(row.wind_speed || row.windSpeed || row.WindSpeed || 0);
            const press = parseFloat(row.air_pressure || row.airPressure || row.pressure || 1013);
            const co2 = parseFloat(row.co2 || row.CO2 || 415);
            const rowSource = row.source || row.Source || source;

            if (!date || !location || isNaN(temp) || isNaN(humid)) {
              missingOrCorrupt++;
              return;
            }

            parsedRecords.push({
              date: date.trim(),
              location: location.trim(),
              latitude: lat,
              longitude: lon,
              temperature: temp,
              humidity: Math.min(100, Math.max(0, humid)),
              rainfall: Math.max(0, rain),
              windSpeed: wind,
              airPressure: press,
              co2,
              source: rowSource,
              datasetId: dataset._id
            });
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (fileExt === '.json') {
      const rawJson = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
      const items = Array.isArray(rawJson) ? rawJson : (rawJson.records || []);
      for (const row of items) {
        if (!row.date || !row.location || isNaN(row.temperature)) {
          missingOrCorrupt++;
          continue;
        }
        parsedRecords.push({
          date: String(row.date).trim(),
          location: String(row.location).trim(),
          latitude: parseFloat(row.latitude || 0),
          longitude: parseFloat(row.longitude || 0),
          temperature: parseFloat(row.temperature),
          humidity: parseFloat(row.humidity || 50),
          rainfall: parseFloat(row.rainfall || 0),
          windSpeed: parseFloat(row.wind_speed || row.windSpeed || 10),
          airPressure: parseFloat(row.air_pressure || row.airPressure || 1013),
          co2: parseFloat(row.co2 || 415),
          source: row.source || source,
          datasetId: dataset._id
        });
      }
    }

    if (parsedRecords.length === 0) {
      dataset.status = 'FAILED';
      await dataset.save();
      return res.status(400).json({
        success: false,
        message: 'No valid climate records found in the uploaded file. Check headers and numerical values.'
      });
    }

    // Insert records in batches of 1000
    const batchSize = 1000;
    for (let i = 0; i < parsedRecords.length; i += batchSize) {
      const chunk = parsedRecords.slice(i, i + batchSize);
      await ClimateRecord.insertMany(chunk);
    }

    dataset.recordCount = parsedRecords.length;
    dataset.status = 'VALIDATED';
    await dataset.save();

    await logActivity({
      action: 'DATASET_INGESTION',
      category: 'DATA_INGESTION',
      userId: req.user?._id,
      userName: req.user?.name || 'System',
      details: `Ingested dataset "${originalname}" with ${parsedRecords.length} records into ${storageResult.mode}.`
    });

    res.status(201).json({
      success: true,
      message: `Successfully ingested and validated ${parsedRecords.length} climate records.`,
      dataset: {
        id: dataset._id,
        fileName: dataset.fileName,
        fileType: dataset.fileType,
        recordCount: dataset.recordCount,
        fileSize: dataset.fileSize,
        storageMode: dataset.storageMode,
        storagePath: dataset.storagePath,
        status: dataset.status,
        createdAt: dataset.createdAt
      },
      validationStats: {
        totalParsed: parsedRecords.length,
        skippedCorruptRows: missingOrCorrupt
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/datasets
const getDatasets = async (req, res, next) => {
  try {
    const datasets = await Dataset.find().sort({ createdAt: -1 });
    res.json({ success: true, count: datasets.length, datasets });
  } catch (err) {
    next(err);
  }
};

// GET /api/datasets/:id
const getDatasetById = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found.' });
    }
    const sampleRecords = await ClimateRecord.find({ datasetId: dataset._id }).limit(20);
    res.json({ success: true, dataset, sampleRecords });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/datasets/:id
const deleteDataset = async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found.' });
    }

    await ClimateRecord.deleteMany({ datasetId: dataset._id });
    await Dataset.findByIdAndDelete(dataset._id);

    await logActivity({
      action: 'DATASET_DELETED',
      category: 'DATA_INGESTION',
      userId: req.user?._id,
      userName: req.user?.name || 'System',
      details: `Dataset "${dataset.fileName}" and associated climate records deleted.`
    });

    res.json({ success: true, message: `Dataset ${dataset.fileName} deleted successfully.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDataset, getDatasets, getDatasetById, deleteDataset };
