const mongoose = require('mongoose');

// Dataset Schema
const datasetSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileType: { type: String, enum: ['CSV', 'JSON'], default: 'CSV' },
  source: { type: String, default: 'Weather Station' },
  recordCount: { type: Number, default: 0 },
  fileSize: { type: Number, default: 0 }, // in bytes
  storagePath: { type: String, required: true },
  storageMode: { type: String, enum: ['HDFS', 'LOCAL'], default: 'LOCAL' },
  status: { type: String, enum: ['UPLOADED', 'VALIDATED', 'PROCESSED', 'FAILED'], default: 'VALIDATED' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploaderName: { type: String, default: 'System' },
}, { timestamps: true });

// Climate Record Schema
const climateRecordSchema = new mongoose.Schema({
  date: { type: String, required: true, index: true }, // YYYY-MM-DD
  location: { type: String, required: true, index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  temperature: { type: Number, required: true }, // Celsius
  humidity: { type: Number, required: true }, // %
  rainfall: { type: Number, required: true }, // mm
  windSpeed: { type: Number, required: true }, // km/h
  airPressure: { type: Number, required: true }, // hPa
  co2: { type: Number, required: true }, // ppm
  source: { type: String, default: 'Sensor Station' },
  isSimulated: { type: Boolean, default: false },
  datasetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dataset', index: true },
}, { timestamps: true });

// Processing Job Schema (Hadoop MapReduce / Analytics execution)
const processingJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  jobType: { 
    type: String, 
    enum: ['TEMPERATURE_STATS', 'RAINFALL_STATS', 'HUMIDITY_STATS', 'CO2_STATS', 'ANOMALY_DETECTION', 'COMPREHENSIVE_MAPREDUCE'],
    default: 'COMPREHENSIVE_MAPREDUCE'
  },
  status: { type: String, enum: ['Queued', 'Processing', 'Completed', 'Failed'], default: 'Queued' },
  storageMode: { type: String, enum: ['HDFS', 'LOCAL'], default: 'LOCAL' },
  recordCount: { type: Number, default: 0 },
  progress: { type: Number, default: 0 }, // 0 to 100
  resultSummary: { type: mongoose.Schema.Types.Mixed, default: {} },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: { type: String, default: 'INFO' },
    message: { type: String }
  }],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

// Anomaly Schema
const anomalySchema = new mongoose.Schema({
  date: { type: String, required: true },
  location: { type: String, required: true, index: true },
  parameter: { type: String, required: true }, // temperature, rainfall, humidity, co2, wind_speed
  observedValue: { type: Number, required: true },
  expectedRange: { type: String, required: true }, // e.g. "18.0 - 36.5 °C"
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  method: { type: String, enum: ['Z-score', 'IQR', 'Isolation Forest', 'Threshold MapReduce'], default: 'Z-score' },
  status: { type: String, enum: ['Detected', 'Investigating', 'Resolved', 'Dismissed'], default: 'Detected' },
  notes: { type: String, default: '' },
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClimateRecord' }
}, { timestamps: true });

// Prediction Schema
const predictionSchema = new mongoose.Schema({
  location: { type: String, required: true, index: true },
  parameter: { type: String, required: true, default: 'temperature' },
  horizon: { type: String, default: '1-Year' }, // '1-Month', '6-Month', '1-Year', '5-Year'
  predictionDate: { type: String, required: true },
  predictedValue: { type: Number, required: true },
  lowerBound: { type: Number },
  upperBound: { type: Number },
  modelName: { type: String, default: 'Polynomial Time-Series Regressor' },
  modelVersion: { type: String, default: 'v1.4.2' },
  confidenceScore: { type: Number, default: 0.91 },
  historicalBasisCount: { type: Number, default: 0 },
}, { timestamps: true });

// Alert Schema
const alertSchema = new mongoose.Schema({
  location: { type: String, required: true, index: true },
  parameter: { type: String, required: true },
  value: { type: Number, required: true },
  threshold: { type: Number, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'High' },
  message: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Acknowledged', 'Resolved'], default: 'Active' },
  resolvedBy: { type: String },
  resolvedAt: { type: Date }
}, { timestamps: true });

// Alert Threshold Settings Schema
const alertSettingSchema = new mongoose.Schema({
  key: { type: String, default: 'global_thresholds', unique: true },
  tempMax: { type: Number, default: 45.0 }, // °C
  tempMin: { type: Number, default: 0.0 }, // °C
  rainfallMax: { type: Number, default: 100.0 }, // mm
  humidityMax: { type: Number, default: 90.0 }, // %
  co2Max: { type: Number, default: 450.0 }, // ppm
  windSpeedMax: { type: Number, default: 80.0 }, // km/h
  airPressureMin: { type: Number, default: 980.0 }, // hPa
  airPressureMax: { type: Number, default: 1040.0 }, // hPa
  storageMode: { type: String, enum: ['HDFS', 'LOCAL'], default: 'LOCAL' },
  simulationIntervalSec: { type: Number, default: 3 },
  isSimulationActive: { type: Boolean, default: false }
}, { timestamps: true });

// Support Ticket Schema
const supportTicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Technical Issue', 'Data Issue', 'Account Issue', 'Dashboard Issue', 'Other'], 
    default: 'Technical Issue' 
  },
  message: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  adminResponse: { type: String, default: '' },
  adminName: { type: String, default: '' },
  resolvedAt: { type: Date }
}, { timestamps: true });

// System Activity Log Schema
const systemLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['AUTH', 'DATA_INGESTION', 'MAPREDUCE', 'ML_PREDICTION', 'ANOMALY', 'ALERT', 'USER_MGMT', 'SETTINGS', 'SYSTEM'],
    default: 'SYSTEM'
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'System' },
  details: { type: String, required: true },
  ipAddress: { type: String, default: '127.0.0.1' },
  status: { type: String, enum: ['SUCCESS', 'WARNING', 'FAILURE'], default: 'SUCCESS' }
}, { timestamps: true });

module.exports = {
  User: require('./User'),
  Dataset: mongoose.model('Dataset', datasetSchema),
  ClimateRecord: mongoose.model('ClimateRecord', climateRecordSchema),
  ProcessingJob: mongoose.model('ProcessingJob', processingJobSchema),
  Anomaly: mongoose.model('Anomaly', anomalySchema),
  Prediction: mongoose.model('Prediction', predictionSchema),
  Alert: mongoose.model('Alert', alertSchema),
  AlertSetting: mongoose.model('AlertSetting', alertSettingSchema),
  SupportTicket: mongoose.model('SupportTicket', supportTicketSchema),
  SystemLog: mongoose.model('SystemLog', systemLogSchema)
};
