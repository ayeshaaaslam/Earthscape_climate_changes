const { ClimateRecord, ProcessingJob, Anomaly, AlertSetting } = require('../models');
const hdfsService = require('./hdfsService');

class MapReduceService {
  /**
   * Simulates MapReduce job lifecycle with realistic mapper/reducer pipeline
   */
  async runJob(jobType = 'COMPREHENSIVE_MAPREDUCE', targetDatasetId = null) {
    const jobId = `MR-JOB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const storageMode = hdfsService.getMode();

    const job = await ProcessingJob.create({
      jobId,
      jobType,
      status: 'Processing',
      storageMode,
      progress: 5,
      logs: [
        { level: 'INFO', message: `Job ${jobId} submitted to Hadoop MapReduce cluster queue.` },
        { level: 'INFO', message: `Execution mode: ${storageMode} STORAGE & PROCESSING ENGINE.` },
        { level: 'INFO', message: `Initializing InputFormat and calculating InputSplits...` }
      ]
    });

    // Execute MapReduce asynchronously so user receives immediate job reference
    this.executePipeline(job, targetDatasetId).catch(err => {
      console.error(`[MapReduce Service Error in ${jobId}]:`, err);
    });

    return job;
  }

  async executePipeline(job, targetDatasetId) {
    try {
      const query = targetDatasetId ? { datasetId: targetDatasetId } : {};
      const records = await ClimateRecord.find(query).lean();
      const recordCount = records.length;

      job.recordCount = recordCount;
      job.progress = 20;
      job.logs.push({ 
        level: 'INFO', 
        message: `InputSplits created: ${Math.max(1, Math.ceil(recordCount / 500))} split(s) across ${recordCount} climate records.` 
      });
      await job.save();

      // Simulate step delay for realistic processing feedback
      await new Promise(r => setTimeout(r, 600));

      // PHASE 1: MAP STAGE
      job.progress = 40;
      job.logs.push({ level: 'INFO', message: `Map Stage started: Running Python/Hadoop Streaming Mappers...` });
      
      const mappedKeyValues = [];
      const thresholdSetting = await AlertSetting.findOne({ key: 'global_thresholds' }) || {
        tempMax: 45, rainfallMax: 100, humidityMax: 90, co2Max: 450
      };

      for (const rec of records) {
        // Map function: Emit key (location) and values
        mappedKeyValues.push({
          key: rec.location,
          value: {
            temp: rec.temperature,
            humidity: rec.humidity,
            rainfall: rec.rainfall,
            windSpeed: rec.windSpeed,
            airPressure: rec.airPressure,
            co2: rec.co2,
            date: rec.date,
            isAnomaly: (
              rec.temperature > thresholdSetting.tempMax ||
              rec.rainfall > thresholdSetting.rainfallMax ||
              rec.humidity > thresholdSetting.humidityMax ||
              rec.co2 > thresholdSetting.co2Max
            )
          }
        });
      }

      job.logs.push({ level: 'INFO', message: `Map Stage completed. Generated ${mappedKeyValues.length} key-value intermediate tuples.` });
      await job.save();
      await new Promise(r => setTimeout(r, 600));

      // PHASE 2: SHUFFLE & SORT
      job.progress = 65;
      job.logs.push({ level: 'INFO', message: `Shuffle & Sort Stage: Partitioning keys across reducer nodes by location...` });
      
      const groupedByKey = {};
      for (const item of mappedKeyValues) {
        if (!groupedByKey[item.key]) {
          groupedByKey[item.key] = [];
        }
        groupedByKey[item.key].push(item.value);
      }

      const uniqueLocations = Object.keys(groupedByKey);
      job.logs.push({ level: 'INFO', message: `Sorted and partitioned into ${uniqueLocations.length} location partitions.` });
      await job.save();
      await new Promise(r => setTimeout(r, 600));

      // PHASE 3: REDUCE STAGE
      job.progress = 85;
      job.logs.push({ level: 'INFO', message: `Reduce Stage: Executing Reducers to compute aggregates (Min/Max/Avg/Anomalies)...` });

      const locationAggregates = {};
      let totalAnomaliesDetected = 0;

      for (const loc of uniqueLocations) {
        const values = groupedByKey[loc];
        const count = values.length;

        const temps = values.map(v => v.temp);
        const humids = values.map(v => v.humidity);
        const rains = values.map(v => v.rainfall);
        const co2s = values.map(v => v.co2);
        const winds = values.map(v => v.windSpeed);

        const avgTemp = temps.reduce((a, b) => a + b, 0) / count;
        const minTemp = Math.min(...temps);
        const maxTemp = Math.max(...temps);

        const avgHumid = humids.reduce((a, b) => a + b, 0) / count;
        const avgRain = rains.reduce((a, b) => a + b, 0) / count;
        const totalRain = rains.reduce((a, b) => a + b, 0);

        const avgCo2 = co2s.reduce((a, b) => a + b, 0) / count;
        const minCo2 = Math.min(...co2s);
        const maxCo2 = Math.max(...co2s);

        const avgWind = winds.reduce((a, b) => a + b, 0) / count;
        const anomalyCount = values.filter(v => v.isAnomaly).length;
        totalAnomaliesDetected += anomalyCount;

        locationAggregates[loc] = {
          recordCount: count,
          temperature: {
            average: parseFloat(avgTemp.toFixed(2)),
            minimum: parseFloat(minTemp.toFixed(2)),
            maximum: parseFloat(maxTemp.toFixed(2)),
          },
          humidity: {
            average: parseFloat(avgHumid.toFixed(2)),
          },
          rainfall: {
            average: parseFloat(avgRain.toFixed(2)),
            total: parseFloat(totalRain.toFixed(2)),
          },
          co2: {
            average: parseFloat(avgCo2.toFixed(2)),
            minimum: parseFloat(minCo2.toFixed(2)),
            maximum: parseFloat(maxCo2.toFixed(2)),
          },
          windSpeed: {
            average: parseFloat(avgWind.toFixed(2))
          },
          anomaliesDetected: anomalyCount
        };
      }

      // Save processed results to HDFS / storage
      await hdfsService.saveProcessedData(
        'temperature',
        `${job.jobId}_climate_summary.json`,
        locationAggregates
      );

      job.progress = 100;
      job.status = 'Completed';
      job.completedAt = new Date();
      job.resultSummary = {
        totalRecordsProcessed: recordCount,
        locationsAnalyzed: uniqueLocations.length,
        anomaliesFlagged: totalAnomaliesDetected,
        aggregatesByLocation: locationAggregates
      };
      job.logs.push({ 
        level: 'INFO', 
        message: `Hadoop MapReduce job finished successfully. Output written to HDFS/Storage.` 
      });

      await job.save();
    } catch (err) {
      job.status = 'Failed';
      job.progress = 100;
      job.logs.push({ level: 'ERROR', message: `Job execution failed: ${err.message}` });
      await job.save();
    }
  }

  async getJobs() {
    return ProcessingJob.find().sort({ createdAt: -1 }).limit(30);
  }

  async getJobById(jobId) {
    return ProcessingJob.findOne({ jobId });
  }
}

module.exports = new MapReduceService();
