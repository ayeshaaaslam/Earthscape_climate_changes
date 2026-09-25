const fs = require('fs');
const path = require('path');

const locations = [
  { name: 'Karachi', lat: 24.8607, lon: 67.0011, baseTemp: 30, baseHum: 70, baseRain: 5, baseCo2: 418, basePress: 1011 },
  { name: 'Lahore', lat: 31.5204, lat2: 31.5204, lon: 74.3587, baseTemp: 27, baseHum: 55, baseRain: 12, baseCo2: 422, basePress: 1014 },
  { name: 'Islamabad', lat: 33.6844, lon: 73.0479, baseTemp: 22, baseHum: 50, baseRain: 18, baseCo2: 405, basePress: 1016 },
  { name: 'Peshawar', lat: 34.0151, lon: 71.5249, baseTemp: 24, baseHum: 48, baseRain: 10, baseCo2: 410, basePress: 1015 },
  { name: 'Quetta', lat: 30.1798, lon: 66.9750, baseTemp: 18, baseHum: 35, baseRain: 4, baseCo2: 398, basePress: 1019 },
  { name: 'Multan', lat: 30.1575, lon: 71.5249, baseTemp: 31, baseHum: 45, baseRain: 6, baseCo2: 420, basePress: 1012 },
  { name: 'Hyderabad', lat: 25.3960, lon: 68.3578, baseTemp: 29, baseHum: 65, baseRain: 7, baseCo2: 414, basePress: 1012 },
  { name: 'Faisalabad', lat: 31.4504, lon: 73.1350, baseTemp: 28, baseHum: 52, baseRain: 9, baseCo2: 424, basePress: 1013 }
];

const sources = ['Weather Station', 'Sensor Network', 'Satellite Telemetry', 'Environmental IoT'];

function generateRecords(isAnomalyFile = false) {
  const records = [];
  const header = "date,location,latitude,longitude,temperature,humidity,rainfall,wind_speed,air_pressure,co2,source";
  records.push(header);

  const startDate = new Date('2024-01-01');

  for (let day = 0; day < 365; day++) {
    const currDate = new Date(startDate);
    currDate.setDate(currDate.getDate() + day);
    const dateStr = currDate.toISOString().split('T')[0];
    const month = currDate.getMonth(); // 0 to 11

    // Seasonal wave
    const seasonalFactor = Math.sin((month / 12) * 2 * Math.PI - Math.PI / 2); // colder in winter, hotter in summer

    for (const loc of locations) {
      let temp = loc.baseTemp + (seasonalFactor * 8) + (Math.random() * 4 - 2);
      let humidity = loc.baseHum + (Math.sin((month / 12) * Math.PI) * 15) + (Math.random() * 10 - 5);
      let rainfall = Math.max(0, (month >= 6 && month <= 8 ? loc.baseRain * 2.5 : loc.baseRain * 0.3) + (Math.random() * 8 - 4));
      let windSpeed = 10 + Math.random() * 18;
      let pressure = loc.basePress + (Math.random() * 6 - 3);
      let co2 = loc.baseCo2 + (day * 0.015) + (Math.random() * 6 - 3);

      // Inject explicit anomalies for anomaly file
      if (isAnomalyFile) {
        if (day === 45 && loc.name === 'Karachi') {
          temp = 48.5; // Extreme Heatwave Alert
        } else if (day === 120 && loc.name === 'Lahore') {
          rainfall = 142.0; // Severe Flash Flood
          humidity = 96.0;
        } else if (day === 200 && loc.name === 'Multan') {
          co2 = 478.0; // Dangerous CO2 Spike
        } else if (day === 270 && loc.name === 'Quetta') {
          windSpeed = 92.5; // Severe Gale
        } else if (day === 310 && loc.name === 'Islamabad') {
          temp = 46.2; // Unprecedented Autumn Heat
        }
      }

      records.push([
        dateStr,
        loc.name,
        loc.lat,
        loc.lon,
        temp.toFixed(1),
        Math.min(100, Math.max(10, humidity)).toFixed(1),
        Math.max(0, rainfall).toFixed(1),
        windSpeed.toFixed(1),
        pressure.toFixed(1),
        co2.toFixed(1),
        sources[Math.floor(Math.random() * sources.length)]
      ].join(','));
    }
  }

  return records.join('\n');
}

const sampleDir = path.join(__dirname, '../../data/sample');
if (!fs.existsSync(sampleDir)) {
  fs.mkdirSync(sampleDir, { recursive: true });
}

fs.writeFileSync(path.join(sampleDir, 'normal_data.csv'), generateRecords(false), 'utf8');
fs.writeFileSync(path.join(sampleDir, 'anomaly_data.csv'), generateRecords(true), 'utf8');

console.log('[Sample Data Generator] Created normal_data.csv and anomaly_data.csv successfully.');
