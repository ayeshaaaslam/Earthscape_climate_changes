const simulationService = require('../services/simulationService');
const { logActivity } = require('../utils/logger');

// POST /api/simulation/start
const startSimulation = async (req, res, next) => {
  try {
    const { interval = 3 } = req.body;
    await simulationService.start(interval);

    await logActivity({
      action: 'SIMULATION_STARTED',
      category: 'SYSTEM',
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      details: `Started simulated real-time climate stream at ${interval}s frequency.`
    });

    res.json({ success: true, message: 'Simulated real-time climate telemetry streaming started.', isRunning: true });
  } catch (err) {
    next(err);
  }
};

// POST /api/simulation/stop
const stopSimulation = async (req, res, next) => {
  try {
    await simulationService.stop();

    await logActivity({
      action: 'SIMULATION_STOPPED',
      category: 'SYSTEM',
      userId: req.user?._id,
      userName: req.user?.name || 'Admin',
      details: 'Halted simulated real-time climate stream.'
    });

    res.json({ success: true, message: 'Simulated stream paused.', isRunning: false });
  } catch (err) {
    next(err);
  }
};

// GET /api/simulation/status
const getSimulationStatus = (req, res) => {
  res.json({ success: true, ...simulationService.getStatus() });
};

// GET /api/simulation/stream (SSE)
const streamSimulation = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  simulationService.addSubscriber(res);

  req.on('close', () => {
    simulationService.removeSubscriber(res);
  });
};

module.exports = { startSimulation, stopSimulation, getSimulationStatus, streamSimulation };
