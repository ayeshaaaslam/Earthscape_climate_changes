const express = require('express');
const router = express.Router();

const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Controllers
const authCtrl = require('../controllers/authController');
const userCtrl = require('../controllers/userController');
const datasetCtrl = require('../controllers/datasetController');
const climateCtrl = require('../controllers/climateController');
const analyticsCtrl = require('../controllers/analyticsController');
const mlCtrl = require('../controllers/mlController');
const alertCtrl = require('../controllers/alertController');
const simCtrl = require('../controllers/simulationController');
const dashCtrl = require('../controllers/dashboardAndSupportController');

// 1. AUTH ROUTES
router.post('/auth/login', authCtrl.login);
router.post('/auth/register', authCtrl.register);
router.get('/auth/profile', authenticate, authCtrl.getProfile);
router.post('/auth/forgot-password', authCtrl.forgotPassword);
router.post('/auth/reset-password', authCtrl.resetPassword);

// 2. USER MANAGEMENT ROUTES (Admin only)
router.get('/users', authenticate, requireRole('ADMIN'), userCtrl.getUsers);
router.post('/users', authenticate, requireRole('ADMIN'), userCtrl.createUser);
router.put('/users/:id', authenticate, requireRole('ADMIN'), userCtrl.updateUser);
router.delete('/users/:id', authenticate, requireRole('ADMIN'), userCtrl.deleteUser);

// 3. DATASET INGESTION ROUTES
router.post('/datasets/upload', authenticate, upload.single('file'), datasetCtrl.uploadDataset);
router.get('/datasets', authenticate, datasetCtrl.getDatasets);
router.get('/datasets/:id', authenticate, datasetCtrl.getDatasetById);
router.delete('/datasets/:id', authenticate, requireRole('ADMIN'), datasetCtrl.deleteDataset);

// 4. CLIMATE DATA & EXPORT
router.get('/climate', authenticate, climateCtrl.getClimateRecords);
router.get('/climate/statistics', authenticate, climateCtrl.getStatistics);
router.get('/climate/locations', authenticate, climateCtrl.getLocations);
router.get('/climate/export-csv', authenticate, climateCtrl.exportClimateCSV);

// 5. BIG DATA / HADOOP MAPREDUCE & HDFS
router.post('/analytics/process', authenticate, analyticsCtrl.runMapReduceJob);
router.get('/analytics/jobs', authenticate, analyticsCtrl.getMapReduceJobs);
router.get('/analytics/jobs/:jobId', authenticate, analyticsCtrl.getJobStatus);
router.get('/hdfs/status', authenticate, analyticsCtrl.getHdfsStatus);
router.post('/hdfs/mode', authenticate, requireRole('ADMIN'), analyticsCtrl.setHdfsMode);

// 6. MACHINE LEARNING & ANOMALIES
router.post('/ml/predict', authenticate, mlCtrl.predictTrends);
router.post('/ml/detect-anomalies', authenticate, mlCtrl.detectAnomalies);
router.get('/ml/correlations', authenticate, mlCtrl.getCorrelations);
router.get('/anomalies', authenticate, mlCtrl.getAnomalies);
router.put('/anomalies/:id', authenticate, mlCtrl.updateAnomalyStatus);

// 7. ALERTS & SETTINGS
router.get('/alerts', authenticate, alertCtrl.getAlerts);
router.put('/alerts/:id', authenticate, alertCtrl.updateAlert);
router.get('/alerts/settings', authenticate, alertCtrl.getSettings);
router.put('/alerts/settings', authenticate, requireRole('ADMIN'), alertCtrl.updateSettings);

// 8. REAL-TIME SIMULATION
router.post('/simulation/start', authenticate, requireRole('ADMIN'), simCtrl.startSimulation);
router.post('/simulation/stop', authenticate, requireRole('ADMIN'), simCtrl.stopSimulation);
router.get('/simulation/status', authenticate, simCtrl.getSimulationStatus);
router.get('/simulation/stream', simCtrl.streamSimulation);

// 9. SUPPORT TICKETING
router.post('/support', authenticate, dashCtrl.createTicket);
router.get('/support', authenticate, dashCtrl.getTickets);
router.put('/support/:id', authenticate, requireRole('ADMIN'), dashCtrl.updateTicket);

// 10. SYSTEM AUDIT LOGS (Admin only)
router.get('/logs', authenticate, requireRole('ADMIN'), dashCtrl.getLogs);

// 11. DASHBOARDS & REPORTS
router.get('/dashboard/stats', authenticate, dashCtrl.getDashboardStats);
router.get('/reports/comprehensive', authenticate, dashCtrl.getComprehensiveReport);

module.exports = router;
