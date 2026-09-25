const { ClimateRecord, Alert, Anomaly, AlertSetting } = require('../models');

const stations = [
  { name: 'Karachi', lat: 24.8607, lon: 67.0011, baseTemp: 31, baseHum: 68, baseRain: 2, baseCo2: 419, basePress: 1011 },
  { name: 'Lahore', lat: 31.5204, lon: 74.3587, baseTemp: 28, baseHum: 54, baseRain: 8, baseCo2: 423, basePress: 1013 },
  { name: 'Islamabad', lat: 33.6844, lon: 73.0479, baseTemp: 23, baseHum: 50, baseRain: 12, baseCo2: 407, basePress: 1016 },
  { name: 'Peshawar', lat: 34.0151, lon: 71.5249, baseTemp: 25, baseHum: 46, baseRain: 6, baseCo2: 412, basePress: 1015 },
  { name: 'Quetta', lat: 30.1798, lon: 66.9750, baseTemp: 19, baseHum: 33, baseRain: 1, baseCo2: 399, basePress: 1019 },
  { name: 'Multan', lat: 30.1575, lon: 71.5249, baseTemp: 32, baseHum: 42, baseRain: 4, baseCo2: 421, basePress: 1012 },
  { name: 'Hyderabad', lat: 25.3960, lon: 68.3578, baseTemp: 30, baseHum: 64, baseRain: 3, baseCo2: 415, basePress: 1012 },
  { name: 'Faisalabad', lat: 31.4504, lon: 73.1350, baseTemp: 29, baseHum: 50, baseRain: 5, baseCo2: 425, basePress: 1013 }
];

class SimulationService {
  constructor() {
    this.timer = null;
    this.isRunning = false;
    this.subscribers = new Set();
    this.latestPackets = [];
    this.totalGenerated = 0;
  }

  async start(intervalSec = 3) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`[Simulator] Starting real-time climate stream (Interval: ${intervalSec}s)`);

    await AlertSetting.findOneAndUpdate(
      { key: 'global_thresholds' },
      { isSimulationActive: true, simulationIntervalSec: intervalSec },
      { upsert: true }
    );

    this.timer = setInterval(async () => {
      try {
        await this.generateTick();
      } catch (err) {
        console.error('[Simulator Tick Error]:', err.message);
      }
    }, intervalSec * 1000);
  }

  async stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[Simulator] Stopped real-time climate stream.');

    await AlertSetting.findOneAndUpdate(
      { key: 'global_thresholds' },
      { isSimulationActive: false },
      { upsert: true }
    );
  }

  async generateTick() {
    // Pick 1-3 random stations to emit new readings
    const count = 1 + Math.floor(Math.random() * 2);
    const shuffled = [...stations].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, count);

    const threshold = await AlertSetting.findOne({ key: 'global_thresholds' }) || {
      tempMax: 45, rainfallMax: 100, humidityMax: 90, co2Max: 450, windSpeedMax: 80
    };

    const newPackets = [];
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    for (const st of selected) {
      // Occasional random anomaly spike (5% chance)
      const injectAnomaly = Math.random() < 0.06;
      let temp = st.baseTemp + (Math.random() * 6 - 3);
      let humidity = st.baseHum + (Math.random() * 10 - 5);
      let rainfall = Math.max(0, st.baseRain + (Math.random() * 6 - 3));
      let windSpeed = 12 + Math.random() * 15;
      let pressure = st.basePress + (Math.random() * 4 - 2);
      let co2 = st.baseCo2 + (Math.random() * 8 - 4);

      if (injectAnomaly) {
        const spikeType = Math.floor(Math.random() * 4);
        if (spikeType === 0) temp = 46.8; // High temperature
        else if (spikeType === 1) rainfall = 115.0; // Heavy rainfall
        else if (spikeType === 2) co2 = 465.0; // High CO2
        else if (spikeType === 3) windSpeed = 86.0; // Gale wind
      }

      temp = parseFloat(temp.toFixed(1));
      humidity = parseFloat(Math.min(100, Math.max(5, humidity)).toFixed(1));
      rainfall = parseFloat(Math.max(0, rainfall).toFixed(1));
      windSpeed = parseFloat(windSpeed.toFixed(1));
      pressure = parseFloat(pressure.toFixed(1));
      co2 = parseFloat(co2.toFixed(1));

      const record = await ClimateRecord.create({
        date: dateStr,
        location: st.name,
        latitude: st.lat,
        longitude: st.lon,
        temperature: temp,
        humidity,
        rainfall,
        windSpeed,
        airPressure: pressure,
        co2,
        source: 'SIMULATED REAL-TIME DATA',
        isSimulated: true
      });

      this.totalGenerated++;

      // Check thresholds
      const alertsToTrigger = [];
      if (temp > threshold.tempMax) {
        alertsToTrigger.push({ param: 'Temperature', val: temp, thresh: threshold.tempMax, sev: 'Critical', msg: `Severe Heatwave: ${temp}°C exceeds safety threshold of ${threshold.tempMax}°C in ${st.name}.` });
      }
      if (rainfall > threshold.rainfallMax) {
        alertsToTrigger.push({ param: 'Rainfall', val: rainfall, thresh: threshold.rainfallMax, sev: 'Critical', msg: `Severe Torrential Precipitation: ${rainfall}mm exceeds critical limit of ${threshold.rainfallMax}mm in ${st.name}.` });
      }
      if (humidity > threshold.humidityMax) {
        alertsToTrigger.push({ param: 'Humidity', val: humidity, thresh: threshold.humidityMax, sev: 'High', msg: `Excess Humidity: ${humidity}% exceeds threshold of ${threshold.humidityMax}% in ${st.name}.` });
      }
      if (co2 > threshold.co2Max) {
        alertsToTrigger.push({ param: 'CO2', val: co2, thresh: threshold.co2Max, sev: 'High', msg: `Hazardous Carbon Level: ${co2} ppm exceeds safe threshold of ${threshold.co2Max} ppm in ${st.name}.` });
      }
      if (windSpeed > threshold.windSpeedMax) {
        alertsToTrigger.push({ param: 'Wind Speed', val: windSpeed, thresh: threshold.windSpeedMax, sev: 'High', msg: `Gale Warning: Wind speed ${windSpeed} km/h exceeds threshold in ${st.name}.` });
      }

      for (const al of alertsToTrigger) {
        await Alert.create({
          location: st.name,
          parameter: al.param,
          value: al.val,
          threshold: al.thresh,
          severity: al.sev,
          message: al.msg,
          status: 'Active'
        });

        await Anomaly.create({
          date: dateStr,
          location: st.name,
          parameter: al.param.toLowerCase().replace(' ', '_'),
          observedValue: al.val,
          expectedRange: `<= ${al.thresh}`,
          severity: al.sev,
          method: 'Threshold MapReduce',
          status: 'Detected',
          notes: 'Flagged during simulated real-time stream',
          recordId: record._id
        });
      }

      const packet = {
        _id: record._id,
        timestamp: new Date().toISOString(),
        date: dateStr,
        location: st.name,
        latitude: st.lat,
        longitude: st.lon,
        temperature: temp,
        humidity,
        rainfall,
        windSpeed,
        airPressure: pressure,
        co2,
        alerts: alertsToTrigger,
        source: 'SIMULATED REAL-TIME DATA'
      };

      newPackets.push(packet);
      this.latestPackets.unshift(packet);
      if (this.latestPackets.length > 50) this.latestPackets.pop();
    }

    // Broadcast to SSE clients
    for (const res of this.subscribers) {
      res.write(`data: ${JSON.stringify({ type: 'TELEMETRY_BATCH', packets: newPackets })}\n\n`);
    }
  }

  addSubscriber(res) {
    this.subscribers.add(res);
    // Send initial handshake and recent buffer
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', isRunning: this.isRunning, recent: this.latestPackets.slice(0, 15) })}\n\n`);
  }

  removeSubscriber(res) {
    this.subscribers.delete(res);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      subscribersCount: this.subscribers.size,
      totalGenerated: this.totalGenerated,
      recentPackets: this.latestPackets.slice(0, 10)
    };
  }
}

module.exports = new SimulationService();
