// EarthScape Mock Data & Standalone Simulation Engine for Live Vercel Deployments

const LOCATIONS = [
  { name: 'Karachi Coastal Station', lat: 24.8607, lng: 67.0011, baseTemp: 32, baseHum: 75, baseRain: 5, baseCo2: 418 },
  { name: 'Lahore Urban Observatory', lat: 31.5204, lng: 74.3587, baseTemp: 30, baseHum: 58, baseRain: 12, baseCo2: 435 },
  { name: 'Islamabad Foothills Lab', lat: 33.6844, lng: 73.0479, baseTemp: 24, baseHum: 62, baseRain: 25, baseCo2: 405 },
  { name: 'Quetta Valley Station', lat: 30.1798, lng: 66.9750, baseTemp: 18, baseHum: 35, baseRain: 2, baseCo2: 402 },
  { name: 'Peshawar North Sensor', lat: 34.0151, lng: 71.5249, baseTemp: 28, baseHum: 50, baseRain: 15, baseCo2: 415 },
  { name: 'Gilgit Glacial Monitor', lat: 35.9208, lng: 74.3089, baseTemp: 12, baseHum: 45, baseRain: 8, baseCo2: 395 },
  { name: 'Gwadar Deep-Sea Outpost', lat: 25.1264, lng: 62.3225, baseTemp: 31, baseHum: 80, baseRain: 3, baseCo2: 410 }
];

// Generate 60 historical climate records
function generateInitialRecords() {
  const records = [];
  const now = new Date();
  
  for (let i = 59; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    
    LOCATIONS.forEach((loc, idx) => {
      const tempVariation = (Math.sin((i + idx) * 0.3) * 4) + (Math.random() * 2 - 1);
      const humVariation = (Math.cos((i + idx) * 0.2) * 8) + (Math.random() * 4 - 2);
      const rain = Math.max(0, Math.sin((i + idx) * 0.5) * loc.baseRain + (Math.random() * 8 - 4));
      
      records.push({
        _id: `rec_${i}_${idx}`,
        date: dateStr,
        location: loc.name,
        latitude: loc.lat,
        longitude: loc.lng,
        temperature: parseFloat((loc.baseTemp + tempVariation).toFixed(1)),
        humidity: parseFloat(Math.min(99, Math.max(20, loc.baseHum + humVariation)).toFixed(1)),
        rainfall: parseFloat(rain.toFixed(1)),
        windSpeed: parseFloat((12 + Math.random() * 20).toFixed(1)),
        airPressure: parseFloat((1012 + (Math.random() * 6 - 3)).toFixed(1)),
        co2: parseFloat((loc.baseCo2 + Math.random() * 10 - 5).toFixed(1)),
        source: 'Automated Weather Station (AWS-IoT)'
      });
    });
  }
  return records;
}

// Initial Storage State
let mockRecords = generateInitialRecords();

let mockUsers = [
  {
    _id: 'u_admin_1',
    name: 'Chief Climate Administrator',
    email: 'admin@earthscape.org',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'u_analyst_1',
    name: 'Senior Climate Analyst',
    email: 'analyst@earthscape.org',
    role: 'ANALYST',
    status: 'ACTIVE',
    createdAt: new Date().toISOString()
  }
];

let mockDatasets = [
  {
    _id: 'ds_1',
    fileName: 'national_weather_stations_2026.csv',
    fileType: 'CSV',
    source: 'National Meteorological Network',
    fileSize: 2458900,
    storagePath: '/earthscape/raw/weather/national_weather_stations_2026.csv',
    storageMode: 'LOCAL',
    status: 'VALIDATED',
    recordCount: 1420,
    uploaderName: 'Chief Climate Administrator',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    _id: 'ds_2',
    fileName: 'satellite_telemetry_telecom_q1.csv',
    fileType: 'CSV',
    source: 'Sentinel-5P / MODIS Telemetry',
    fileSize: 5820400,
    storagePath: '/earthscape/raw/satellite/satellite_telemetry_telecom_q1.csv',
    storageMode: 'LOCAL',
    status: 'VALIDATED',
    recordCount: 3840,
    uploaderName: 'Senior Climate Analyst',
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  }
];

let mockAlertSettings = {
  tempMax: 45.0,
  tempMin: 0.0,
  rainfallMax: 100.0,
  humidityMax: 90.0,
  co2Max: 450.0,
  windSpeedMax: 80.0,
  storageMode: 'LOCAL'
};

let mockAlerts = [
  {
    _id: 'alt_1',
    parameter: 'temperature',
    value: 46.8,
    threshold: 45.0,
    severity: 'HIGH',
    location: 'Lahore Urban Observatory',
    message: 'Extreme Temperature Wave: 46.8°C exceeds critical threshold 45.0°C',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    _id: 'alt_2',
    parameter: 'rainfall',
    value: 122.4,
    threshold: 100.0,
    severity: 'CRITICAL',
    location: 'Karachi Coastal Station',
    message: 'Flash Flood Alert: Rainfall intensity 122.4 mm/hr exceeds safety limit',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  }
];

let mockAnomalies = [
  {
    _id: 'ano_1',
    date: new Date().toISOString().split('T')[0],
    location: 'Lahore Urban Observatory',
    parameter: 'temperature',
    value: 46.8,
    expectedValue: 34.2,
    deviation: 12.6,
    method: 'ISOLATION_FOREST',
    confidence: 0.94,
    status: 'DETECTED',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'ano_2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    location: 'Karachi Coastal Station',
    parameter: 'co2',
    value: 472.1,
    expectedValue: 418.0,
    deviation: 54.1,
    method: 'Z_SCORE',
    confidence: 0.89,
    status: 'ACKNOWLEDGED',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

let mockJobs = [
  {
    _id: 'mr_1',
    jobId: 'MR-JOB-2026-0925-1049',
    jobType: 'TEMPERATURE_AGGREGATION',
    status: 'COMPLETED',
    parameters: { algorithm: 'Distributed MapReduce V2', dataset: 'national_weather_stations_2026.csv' },
    metrics: { mapTasks: 8, reduceTasks: 4, inputRecords: 1420, outputRecords: 28, executionTimeSeconds: 4.2 },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

let mockTickets = [
  {
    _id: 'tkt_1',
    title: 'HDFS Distributed Node Latency in Sector 4',
    description: 'Telemetry ingest buffering observed during high-volume satellite polling.',
    priority: 'MEDIUM',
    status: 'OPEN',
    userEmail: 'analyst@earthscape.org',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

let mockLogs = [
  { timestamp: new Date().toISOString(), level: 'INFO', module: 'INGEST', message: 'AWS Telemetry batch ingested from 7 active stations.' },
  { timestamp: new Date(Date.now() - 60000).toISOString(), level: 'INFO', module: 'ANALYTICS', message: 'MapReduce climate baseline computation completed in 4.2s.' },
  { timestamp: new Date(Date.now() - 120000).toISOString(), level: 'WARN', module: 'ALERT_ENGINE', message: 'Threshold trigger: High humidity index recorded at Gwadar.' }
];

// Helper delay
const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));

export const mockApiHandler = {
  // Auth
  login: async ({ email, password }) => {
    await delay(200);
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user && (password === 'Admin@123456' || password === 'Analyst@123456' || password.length >= 6)) {
      const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
      return { data: { success: true, token, user } };
    }
    // Fallback for custom logins
    if (email) {
      const role = email.includes('admin') ? 'ADMIN' : 'ANALYST';
      const dummyUser = { _id: 'u_' + Date.now(), name: email.split('@')[0], email, role, status: 'ACTIVE' };
      const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
      return { data: { success: true, token, user: dummyUser } };
    }
    throw new Error('Invalid email or password');
  },

  register: async ({ name, email, role }) => {
    await delay(200);
    const newUser = { _id: 'u_' + Date.now(), name, email, role: role || 'ANALYST', status: 'ACTIVE', createdAt: new Date().toISOString() };
    mockUsers.push(newUser);
    const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
    return { data: { success: true, token, user: newUser } };
  },

  getProfile: async () => {
    await delay(100);
    const saved = localStorage.getItem('earthscape_user');
    const user = saved ? JSON.parse(saved) : mockUsers[0];
    return { data: { success: true, user } };
  },

  // Users
  getUsers: async () => {
    await delay(150);
    return { data: { success: true, users: mockUsers } };
  },
  createUser: async (data) => {
    await delay(150);
    const u = { _id: 'u_' + Date.now(), ...data, status: 'ACTIVE', createdAt: new Date().toISOString() };
    mockUsers.push(u);
    return { data: { success: true, user: u } };
  },
  updateUser: async (id, data) => {
    await delay(150);
    mockUsers = mockUsers.map(u => u._id === id ? { ...u, ...data } : u);
    return { data: { success: true } };
  },
  deleteUser: async (id) => {
    await delay(150);
    mockUsers = mockUsers.filter(u => u._id !== id);
    return { data: { success: true } };
  },

  // Climate Records
  getRecords: async (params = {}) => {
    await delay(200);
    let list = [...mockRecords];
    if (params.location && params.location !== 'All Locations') {
      list = list.filter(r => r.location === params.location);
    }
    return {
      data: {
        success: true,
        records: list.slice(0, 100),
        pagination: { totalRecords: list.length, page: 1, limit: 100 }
      }
    };
  },

  getStatistics: async (params = {}) => {
    await delay(150);
    const records = mockRecords;
    const avgTemp = (records.reduce((a, b) => a + b.temperature, 0) / records.length).toFixed(1);
    const avgHum = (records.reduce((a, b) => a + b.humidity, 0) / records.length).toFixed(1);
    const totalRain = records.reduce((a, b) => a + b.rainfall, 0).toFixed(1);
    const avgCo2 = (records.reduce((a, b) => a + b.co2, 0) / records.length).toFixed(1);

    return {
      data: {
        success: true,
        stats: {
          totalRecords: records.length,
          avgTemperature: parseFloat(avgTemp),
          avgHumidity: parseFloat(avgHum),
          totalRainfall: parseFloat(totalRain),
          avgCo2: parseFloat(avgCo2),
          locationsCount: LOCATIONS.length,
          activeAlerts: mockAlerts.filter(a => a.status === 'ACTIVE').length,
          anomaliesDetected: mockAnomalies.length
        }
      }
    };
  },

  getLocations: async () => {
    await delay(100);
    return { data: { success: true, locations: LOCATIONS.map(l => l.name) } };
  },

  // Datasets
  getDatasets: async () => {
    await delay(150);
    return { data: { success: true, datasets: mockDatasets } };
  },
  uploadDataset: async () => {
    await delay(500);
    const newDs = {
      _id: 'ds_' + Date.now(),
      fileName: 'telemetry_stream_batch_upload.csv',
      fileType: 'CSV',
      source: 'Operator Web Ingestion Portal',
      fileSize: 1048576,
      storagePath: '/earthscape/raw/user_uploads/batch.csv',
      storageMode: 'LOCAL',
      status: 'VALIDATED',
      recordCount: 350,
      uploaderName: 'Authenticated User',
      createdAt: new Date().toISOString()
    };
    mockDatasets.unshift(newDs);
    return { data: { success: true, dataset: newDs } };
  },
  deleteDataset: async (id) => {
    await delay(150);
    mockDatasets = mockDatasets.filter(d => d._id !== id);
    return { data: { success: true } };
  },

  // Analytics & MapReduce
  runMapReduce: async ({ jobType, location }) => {
    await delay(600);
    const newJob = {
      _id: 'mr_' + Date.now(),
      jobId: `MR-JOB-${Date.now().toString().slice(-6)}`,
      jobType: jobType || 'CLIMATE_AGGREGATION',
      status: 'COMPLETED',
      parameters: { location: location || 'ALL', mapper: 'temperature_mapper.py', reducer: 'temperature_reducer.py' },
      metrics: {
        mapTasks: 16,
        reduceTasks: 4,
        inputRecords: mockRecords.length,
        outputRecords: 12,
        executionTimeSeconds: 3.8
      },
      results: [
        { key: 'Karachi Coastal Station', count: 60, min: 24.5, max: 39.2, avg: 31.8, stdDev: 3.1 },
        { key: 'Lahore Urban Observatory', count: 60, min: 21.0, max: 46.8, avg: 33.4, stdDev: 5.2 },
        { key: 'Islamabad Foothills Lab', count: 60, min: 14.2, max: 32.5, avg: 23.9, stdDev: 4.0 },
        { key: 'Quetta Valley Station', count: 60, min: 8.5, max: 28.1, avg: 17.6, stdDev: 4.8 },
        { key: 'Peshawar North Sensor', count: 60, min: 18.0, max: 38.0, avg: 27.5, stdDev: 4.3 },
        { key: 'Gilgit Glacial Monitor', count: 60, min: 2.1, max: 22.0, avg: 12.4, stdDev: 5.0 },
        { key: 'Gwadar Deep-Sea Outpost', count: 60, min: 23.0, max: 37.5, avg: 30.6, stdDev: 2.9 }
      ],
      createdAt: new Date().toISOString()
    };
    mockJobs.unshift(newJob);
    return { data: { success: true, job: newJob } };
  },
  getJobs: async () => {
    await delay(150);
    return { data: { success: true, jobs: mockJobs } };
  },
  getHdfsStatus: async () => {
    await delay(100);
    return {
      data: {
        success: true,
        mode: mockAlertSettings.storageMode || 'LOCAL',
        connected: true,
        capacity: '500 GB',
        used: '14.2 GB',
        blocks: 42,
        liveNodes: 3
      }
    };
  },
  setHdfsMode: async ({ mode }) => {
    mockAlertSettings.storageMode = mode;
    return { data: { success: true, mode } };
  },

  // Machine Learning
  predictTrends: async ({ parameter = 'temperature', horizonSteps = 12 }) => {
    await delay(500);
    const forecasts = [];
    const base = parameter === 'temperature' ? 30 : parameter === 'co2' ? 420 : parameter === 'humidity' ? 65 : 15;
    const now = new Date();
    
    for (let i = 1; i <= horizonSteps; i++) {
      const d = new Date(now.getTime() + i * 30 * 24 * 60 * 60 * 1000);
      const trend = i * 0.12;
      const seasonal = Math.sin(i * 0.5) * 4;
      forecasts.push({
        step: i,
        month: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
        forecast: parseFloat((base + trend + seasonal).toFixed(2)),
        upperBound: parseFloat((base + trend + seasonal + 2.5).toFixed(2)),
        lowerBound: parseFloat((base + trend + seasonal - 2.5).toFixed(2))
      });
    }

    return {
      data: {
        success: true,
        model: 'ARIMA (Auto-Regressive Integrated Moving Average) & Multi-linear Regressor',
        r2Score: 0.942,
        mae: 0.86,
        forecasts
      }
    };
  },

  detectAnomalies: async () => {
    await delay(400);
    return {
      data: {
        success: true,
        anomaliesCount: mockAnomalies.length,
        anomalies: mockAnomalies
      }
    };
  },
  getAnomalies: async () => {
    await delay(150);
    return { data: { success: true, anomalies: mockAnomalies } };
  },
  updateAnomalyStatus: async (id, data) => {
    mockAnomalies = mockAnomalies.map(a => a._id === id ? { ...a, ...data } : a);
    return { data: { success: true } };
  },
  getCorrelations: async () => {
    await delay(200);
    return {
      data: {
        success: true,
        matrix: {
          temperature: { temperature: 1.0, humidity: -0.42, rainfall: -0.18, co2: 0.68, airPressure: -0.55 },
          humidity: { temperature: -0.42, humidity: 1.0, rainfall: 0.74, co2: -0.12, airPressure: -0.31 },
          rainfall: { temperature: -0.18, humidity: 0.74, rainfall: 1.0, co2: -0.08, airPressure: -0.48 },
          co2: { temperature: 0.68, humidity: -0.12, rainfall: -0.08, co2: 1.0, airPressure: -0.22 },
          airPressure: { temperature: -0.55, humidity: -0.31, rainfall: -0.48, co2: -0.22, airPressure: 1.0 }
        }
      }
    };
  },

  // Alerts
  getAlerts: async () => {
    await delay(150);
    return { data: { success: true, alerts: mockAlerts } };
  },
  updateAlert: async (id, data) => {
    mockAlerts = mockAlerts.map(a => a._id === id ? { ...a, ...data } : a);
    return { data: { success: true } };
  },
  getSettings: async () => {
    await delay(100);
    return { data: { success: true, settings: mockAlertSettings } };
  },
  updateSettings: async (data) => {
    mockAlertSettings = { ...mockAlertSettings, ...data };
    return { data: { success: true, settings: mockAlertSettings } };
  },

  // Simulation & Telemetry
  getSimulationStatus: async () => {
    return { data: { success: true, isRunning: true, frequencySeconds: 3 } };
  },
  startSimulation: async () => {
    return { data: { success: true, isRunning: true } };
  },
  stopSimulation: async () => {
    return { data: { success: true, isRunning: false } };
  },

  // Support Tickets
  getTickets: async () => {
    await delay(150);
    return { data: { success: true, tickets: mockTickets } };
  },
  createTicket: async (data) => {
    await delay(200);
    const t = { _id: 'tkt_' + Date.now(), ...data, status: 'OPEN', createdAt: new Date().toISOString() };
    mockTickets.unshift(t);
    return { data: { success: true, ticket: t } };
  },
  updateTicket: async (id, data) => {
    mockTickets = mockTickets.map(t => t._id === id ? { ...t, ...data } : t);
    return { data: { success: true } };
  },

  // Logs
  getLogs: async () => {
    await delay(100);
    return { data: { success: true, logs: mockLogs } };
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    await delay(150);
    return {
      data: {
        success: true,
        stats: {
          activeStations: LOCATIONS.length,
          totalRecords: mockRecords.length,
          activeAlerts: mockAlerts.filter(a => a.status === 'ACTIVE').length,
          anomalyCount: mockAnomalies.length,
          storageMode: mockAlertSettings.storageMode || 'LOCAL',
          storageUsed: '14.2 GB',
          mapReduceJobs: mockJobs.length,
          recentTelemetry: mockRecords.slice(0, 7)
        }
      }
    };
  },

  // Reports
  getComprehensiveReport: async () => {
    await delay(300);
    return {
      data: {
        success: true,
        report: {
          generatedAt: new Date().toISOString(),
          totalStations: LOCATIONS.length,
          totalObservations: mockRecords.length,
          averageMetrics: {
            temperature: 26.4,
            humidity: 58.2,
            rainfall: 14.8,
            co2: 412.5
          },
          highestTempStation: 'Lahore Urban Observatory (46.8°C)',
          lowestTempStation: 'Gilgit Glacial Monitor (2.1°C)',
          topAnomalies: mockAnomalies,
          systemHealth: '100% Operational (All Telemetry Pipelines Active)'
        }
      }
    };
  }
};
