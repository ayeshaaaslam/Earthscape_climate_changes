const fs = require('fs');
const path = require('path');
const axios = require('axios');

class HDFSService {
  constructor() {
    this.mode = process.env.HDFS_ENABLED === 'true' ? 'HDFS' : 'LOCAL';
    this.namenodeUrl = process.env.HDFS_NAMENODE_URL || 'http://localhost:9870/webhdfs/v1';
    this.localBaseDir = path.join(__dirname, '../../data');
    this.initDirectories();
  }

  initDirectories() {
    const dirs = [
      path.join(this.localBaseDir, 'raw/weather'),
      path.join(this.localBaseDir, 'raw/satellite'),
      path.join(this.localBaseDir, 'raw/sensors'),
      path.join(this.localBaseDir, 'processed/temperature'),
      path.join(this.localBaseDir, 'processed/rainfall'),
      path.join(this.localBaseDir, 'processed/humidity'),
      path.join(this.localBaseDir, 'processed/co2'),
      path.join(this.localBaseDir, 'processed/anomalies'),
      path.join(this.localBaseDir, 'ml/training'),
      path.join(this.localBaseDir, 'ml/predictions'),
      path.join(this.localBaseDir, 'reports')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  getMode() {
    return this.mode;
  }

  setMode(newMode) {
    this.mode = newMode === 'HDFS' ? 'HDFS' : 'LOCAL';
    return this.mode;
  }

  async saveRawFile(fileName, contentBuffer, subFolder = 'weather') {
    const targetPath = path.join(this.localBaseDir, `raw/${subFolder}`, fileName);
    fs.writeFileSync(targetPath, contentBuffer);

    if (this.mode === 'HDFS') {
      try {
        const hdfsPath = `/earthscape/raw/${subFolder}/${fileName}`;
        // WebHDFS create call
        await axios.put(`${this.namenodeUrl}${hdfsPath}?op=CREATE&overwrite=true`, contentBuffer, {
          headers: { 'Content-Type': 'application/octet-stream' },
          timeout: 4000
        });
        console.log(`[HDFS] Synced raw file to HDFS: ${hdfsPath}`);
        return { storagePath: hdfsPath, mode: 'HDFS' };
      } catch (err) {
        console.warn(`[HDFS] WebHDFS sync failed (${err.message}). Stored in Local Stage.`);
        return { storagePath: targetPath, mode: 'LOCAL (HDFS Fallback)' };
      }
    }

    return { storagePath: targetPath, mode: 'LOCAL' };
  }

  async saveProcessedData(category, fileName, dataJson) {
    const targetPath = path.join(this.localBaseDir, `processed/${category}`, fileName);
    fs.writeFileSync(targetPath, JSON.stringify(dataJson, null, 2));

    if (this.mode === 'HDFS') {
      try {
        const hdfsPath = `/earthscape/processed/${category}/${fileName}`;
        await axios.put(`${this.namenodeUrl}${hdfsPath}?op=CREATE&overwrite=true`, JSON.stringify(dataJson), {
          headers: { 'Content-Type': 'application/json' },
          timeout: 4000
        });
        return { path: hdfsPath, mode: 'HDFS' };
      } catch (err) {
        return { path: targetPath, mode: 'LOCAL' };
      }
    }
    return { path: targetPath, mode: 'LOCAL' };
  }

  getStatus() {
    return {
      activeMode: this.mode,
      hdfsConfigured: process.env.HDFS_ENABLED === 'true',
      namenodeUrl: this.namenodeUrl,
      localDirectory: this.localBaseDir,
      directories: [
        '/earthscape/raw/weather',
        '/earthscape/raw/satellite',
        '/earthscape/raw/sensors',
        '/earthscape/processed/temperature',
        '/earthscape/processed/rainfall',
        '/earthscape/processed/humidity',
        '/earthscape/processed/co2',
        '/earthscape/processed/anomalies',
        '/earthscape/ml/training',
        '/earthscape/ml/predictions',
        '/earthscape/reports'
      ]
    };
  }
}

module.exports = new HDFSService();
