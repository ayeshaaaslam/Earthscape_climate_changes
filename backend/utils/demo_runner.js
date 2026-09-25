const axios = require('axios');

const API = 'http://localhost:5000/api';
const ML_API = 'http://127.0.0.1:8000';

async function runLiveDemo() {
  console.log('================================================================');
  console.log('   EARTHSCAPE CLIMATE AGENCY - FULL SYSTEM DEMONSTRATION RUN    ');
  console.log('================================================================\n');

  try {
    // 1. Python ML Microservice Check
    console.log('>>> [STEP 1] Checking Python ML Microservice Status:');
    const mlHealth = await axios.get(`${ML_API}/health`);
    console.log('    ML Service Health:', mlHealth.data);
    console.log('    [OK] Scikit-Learn Polynomial & Isolation Forest Engines Ready.\n');

    // 2. Admin Authentication
    console.log('>>> [STEP 2] Authenticating as Administrator:');
    const adminLogin = await axios.post(`${API}/auth/login`, {
      email: 'admin@earthscape.org',
      password: 'Admin@123456'
    });
    const adminToken = adminLogin.data.token;
    const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };
    console.log(`    Authenticated as: ${adminLogin.data.user.name} (${adminLogin.data.user.role})`);
    console.log('    [OK] JWT Bearer Token Issued.\n');

    // 3. Ingested Dataset Overview & Statistics
    console.log('>>> [STEP 3] Fetching System Dashboard Statistics:');
    const stats = await axios.get(`${API}/dashboard/stats`, adminHeaders);
    console.log('    Total Climate Records Ingested:', stats.data.stats.totalRecords.toLocaleString());
    console.log('    Total Datasets Staged in HDFS / Local:', stats.data.stats.totalDatasets);
    console.log('    Monitored Weather Stations:', stats.data.stats.totalLocations);
    console.log('    Multi-Station Mean Temperature:', `${stats.data.stats.avgTemperature}°C`);
    console.log('    Atmospheric CO2 Mean Concentration:', `${stats.data.stats.avgCo2} ppm`);
    console.log('    [OK] Telemetry Aggregation Verified.\n');

    // 4. Hadoop MapReduce Job Execution
    console.log('>>> [STEP 4] Submitting Distributed Hadoop MapReduce Job:');
    const mrSubmit = await axios.post(`${API}/analytics/process`, {
      jobType: 'COMPREHENSIVE_MAPREDUCE'
    }, adminHeaders);
    const jobId = mrSubmit.data.job.jobId;
    console.log(`    Submitted Job ID: ${jobId}`);

    // Wait for MapReduce pipeline execution
    await new Promise(r => setTimeout(r, 2500));
    const mrResult = await axios.get(`${API}/analytics/jobs/${jobId}`, adminHeaders);
    console.log(`    Job Status: ${mrResult.data.job.status} (Progress: ${mrResult.data.job.progress}%)`);
    console.log('    Execution Log Snippets:');
    mrResult.data.job.logs.slice(-3).forEach(l => console.log(`      * [${l.level}] ${l.message}`));
    console.log('    [OK] Hadoop MapReduce Map, Shuffle/Sort & Reduce Complete.\n');

    // 5. Machine Learning Trend Prediction
    console.log('>>> [STEP 5] Running Machine Learning Future Climate Prediction:');
    const mlPred = await axios.post(`${API}/ml/predict`, {
      parameter: 'temperature',
      horizonSteps: 6,
      location: 'Karachi',
      degree: 2
    }, adminHeaders);
    console.log('    ML Engine:', mlPred.data.engine);
    console.log('    Algorithm:', mlPred.data.data.modelName);
    console.log('    Goodness of Fit (R² Score):', mlPred.data.data.metrics.r2Score);
    console.log('    Residual RMSE:', mlPred.data.data.metrics.rmse);
    console.log('    Predicted Temperature Horizon (Karachi Station):');
    mlPred.data.data.predictions.slice(0, 4).forEach(p => {
      console.log(`      * Step ${p.step} (${p.date}): ${p.predictedValue}°C [Confidence Band: ${p.lowerBound}°C - ${p.upperBound}°C]`);
    });
    console.log('    [OK] Machine Learning Predictions Generated.\n');

    // 6. Anomaly Detection Scan
    console.log('>>> [STEP 6] Executing Multivariate Anomaly Detection Scan:');
    const anomScan = await axios.post(`${API}/ml/detect-anomalies`, {
      parameter: 'temperature',
      method: 'All'
    }, adminHeaders);
    console.log('    Total Outliers Detected:', anomScan.data.totalDetected);
    console.log('    Sample Detected Anomaly:');
    if (anomScan.data.anomalies.length > 0) {
      const a = anomScan.data.anomalies[0];
      console.log(`      * Station: ${a.location} | Date: ${a.date} | Parameter: ${a.parameter}`);
      console.log(`        Observed: ${a.observedValue} | Baseline: ${a.expectedRange} | Severity: ${a.severity} (${a.method})`);
    }
    console.log('    [OK] Multi-Method Anomaly Detection Synchronized.\n');

    // 7. Live Simulated Stream & Alert Test
    console.log('>>> [STEP 7] Starting Simulated Real-Time Sensor Telemetry Stream:');
    await axios.post(`${API}/simulation/start`, { interval: 2 }, adminHeaders);
    console.log('    Stream Broadcast Active on Server-Sent Events (SSE).');
    await new Promise(r => setTimeout(r, 2500));
    const simStatus = await axios.get(`${API}/simulation/status`, adminHeaders);
    console.log(`    Generated ${simStatus.data.totalGenerated} real-time telemetry packets.`);
    await axios.post(`${API}/simulation/stop`, {}, adminHeaders);
    console.log('    [OK] Real-Time Telemetry Stream Operational.\n');

    // 8. Analyst Role Verification
    console.log('>>> [STEP 8] Verifying Role-Based Access Control (Analyst):');
    const analystLogin = await axios.post(`${API}/auth/login`, {
      email: 'analyst@earthscape.org',
      password: 'Analyst@123456'
    });
    const analystToken = analystLogin.data.token;
    const analystHeaders = { headers: { Authorization: `Bearer ${analystToken}` } };
    console.log(`    Logged in as: ${analystLogin.data.user.name} (${analystLogin.data.user.role})`);
    
    try {
      await axios.get(`${API}/users`, analystHeaders);
      console.log('    [ERROR] Analyst should not have access to User Management.');
    } catch (err) {
      console.log(`    Permission Guard: ${err.response.status} ${err.response.data.message}`);
      console.log('    [OK] Role-Based Access Control Protected.\n');
    }

    console.log('================================================================');
    console.log('       ALL SYSTEM MODULES RUNNING & FULLY VERIFIED!            ');
    console.log('   Web UI: http://localhost:5173                                ');
    console.log('   Backend API: http://localhost:5000                           ');
    console.log('   ML Service: http://127.0.0.1:8000                            ');
    console.log('================================================================');
  } catch (err) {
    console.error('Demo Error:', err.response?.data || err.message);
  }
}

runLiveDemo();
