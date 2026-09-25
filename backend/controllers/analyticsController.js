const mapReduceService = require('../services/mapReduceService');
const hdfsService = require('../services/hdfsService');
const { logActivity } = require('../utils/logger');

// POST /api/analytics/process
const runMapReduceJob = async (req, res, next) => {
  try {
    const { jobType = 'COMPREHENSIVE_MAPREDUCE', datasetId = null } = req.body;

    const job = await mapReduceService.runJob(jobType, datasetId);

    await logActivity({
      action: 'MAPREDUCE_JOB_SUBMITTED',
      category: 'MAPREDUCE',
      userId: req.user?._id,
      userName: req.user?.name || 'System',
      details: `Submitted Hadoop MapReduce job ${job.jobId} of type ${jobType}.`
    });

    res.status(202).json({
      success: true,
      message: `MapReduce processing job ${job.jobId} queued and running on cluster.`,
      job
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/jobs
const getMapReduceJobs = async (req, res, next) => {
  try {
    const jobs = await mapReduceService.getJobs();
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/jobs/:jobId
const getJobStatus = async (req, res, next) => {
  try {
    const job = await mapReduceService.getJobById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'MapReduce Job not found.' });
    }
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

// GET /api/hdfs/status
const getHdfsStatus = async (req, res) => {
  const status = hdfsService.getStatus();
  res.json({ success: true, status });
};

// POST /api/hdfs/mode
const setHdfsMode = async (req, res) => {
  const { mode } = req.body;
  const newMode = hdfsService.setMode(mode);
  res.json({ success: true, activeMode: newMode });
};

module.exports = { runMapReduceJob, getMapReduceJobs, getJobStatus, getHdfsStatus, setHdfsMode };
