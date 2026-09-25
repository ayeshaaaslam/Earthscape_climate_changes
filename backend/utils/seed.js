const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const csvParser = require('csv-parser');
const User = require('../models/User');
const { Dataset, ClimateRecord, Anomaly, AlertSetting, Alert } = require('../models');

async function seedDatabase() {
  try {
    console.log('[Seed] Checking default accounts...');

    // 1. Seed Admin
    const adminEmail = 'admin@earthscape.org';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Admin@123456', salt);
      admin = await User.create({
        name: 'Chief Climate Administrator',
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE'
      });
      console.log(`[Seed] Created Admin User: ${adminEmail} (Password: Admin@123456)`);
    }

    // 2. Seed Analyst
    const analystEmail = 'analyst@earthscape.org';
    let analyst = await User.findOne({ email: analystEmail });
    if (!analyst) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Analyst@123456', salt);
      analyst = await User.create({
        name: 'Senior Climate Analyst',
        email: analystEmail,
        passwordHash,
        role: 'ANALYST',
        status: 'ACTIVE'
      });
      console.log(`[Seed] Created Analyst User: ${analystEmail} (Password: Analyst@123456)`);
    }

    // 3. Seed Alert Settings
    let settings = await AlertSetting.findOne({ key: 'global_thresholds' });
    if (!settings) {
      settings = await AlertSetting.create({
        key: 'global_thresholds',
        tempMax: 45.0,
        tempMin: 0.0,
        rainfallMax: 100.0,
        humidityMax: 90.0,
        co2Max: 450.0,
        windSpeedMax: 80.0,
        storageMode: 'LOCAL'
      });
      console.log('[Seed] Created default Alert Threshold settings.');
    }

    // 4. Seed Sample Climate Records if empty
    const recordCount = await ClimateRecord.countDocuments();
    if (recordCount === 0) {
      console.log('[Seed] Database is empty. Ingesting baseline sample datasets...');
      const sampleFiles = ['normal_data.csv', 'anomaly_data.csv'];

      for (const fileName of sampleFiles) {
        const filePath = path.join(__dirname, '../../data/sample', fileName);
        if (!fs.existsSync(filePath)) continue;

        const stats = fs.statSync(filePath);
        const dataset = await Dataset.create({
          fileName,
          fileType: 'CSV',
          source: fileName.includes('anomaly') ? 'Synthetic Anomaly Testbed' : 'National Weather Station Network',
          fileSize: stats.size,
          storagePath: `/earthscape/raw/weather/${fileName}`,
          storageMode: 'LOCAL',
          status: 'VALIDATED',
          uploadedBy: admin._id,
          uploaderName: admin.name
        });

        const records = [];
        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
              records.push({
                date: row.date?.trim(),
                location: row.location?.trim(),
                latitude: parseFloat(row.latitude || 0),
                longitude: parseFloat(row.longitude || 0),
                temperature: parseFloat(row.temperature),
                humidity: parseFloat(row.humidity),
                rainfall: parseFloat(row.rainfall || 0),
                windSpeed: parseFloat(row.wind_speed || 10),
                airPressure: parseFloat(row.air_pressure || 1013),
                co2: parseFloat(row.co2 || 415),
                source: row.source || 'Station',
                datasetId: dataset._id
              });
            })
            .on('end', resolve)
            .on('error', reject);
        });

        if (records.length > 0) {
          const batchSize = 1000;
          for (let i = 0; i < records.length; i += batchSize) {
            await ClimateRecord.insertMany(records.slice(i, i + batchSize));
          }
          dataset.recordCount = records.length;
          await dataset.save();
          console.log(`[Seed] Ingested ${records.length} records from ${fileName}.`);
        }
      }

      // Populate initial anomalies & alerts for demonstration
      await Anomaly.create([
        {
          date: '2024-02-15',
          location: 'Karachi',
          parameter: 'temperature',
          observedValue: 48.5,
          expectedRange: '18.0 - 36.5 °C',
          severity: 'Critical',
          method: 'Z-score',
          status: 'Detected',
          notes: 'Unprecedented winter heatwave anomaly.'
        },
        {
          date: '2024-04-30',
          location: 'Lahore',
          parameter: 'rainfall',
          observedValue: 142.0,
          expectedRange: '0 - 45.0 mm',
          severity: 'Critical',
          method: 'IQR',
          status: 'Investigating',
          notes: 'Extreme monsoon flash flood anomaly.'
        },
        {
          date: '2024-07-19',
          location: 'Multan',
          parameter: 'co2',
          observedValue: 478.0,
          expectedRange: '395 - 435 ppm',
          severity: 'High',
          method: 'Isolation Forest',
          status: 'Detected',
          notes: 'Industrial emissions plume outlier.'
        }
      ]);

      await Alert.create([
        {
          location: 'Karachi',
          parameter: 'Temperature',
          value: 48.5,
          threshold: 45.0,
          severity: 'Critical',
          message: 'CRITICAL ALERT: Ambient temperature of 48.5°C exceeded 45.0°C in Karachi.',
          status: 'Active'
        },
        {
          location: 'Lahore',
          parameter: 'Rainfall',
          value: 142.0,
          threshold: 100.0,
          severity: 'Critical',
          message: 'FLASH FLOOD ALERT: Torrential precipitation of 142mm exceeded 100mm threshold in Lahore.',
          status: 'Active'
        }
      ]);
      console.log('[Seed] Created baseline demonstration alerts and anomalies.');
    }
  } catch (err) {
    console.error('[Seed Error]:', err);
  }
}

module.exports = seedDatabase;
