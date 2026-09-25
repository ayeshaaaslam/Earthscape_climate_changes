import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StorageModeBadge from '../components/StorageModeBadge';
import {
  Cpu,
  Play,
  RefreshCw,
  Terminal,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const HadoopMapReduce = () => {
  const { isAdmin } = useAuth();
  const [jobType, setJobType] = useState('COMPREHENSIVE_MAPREDUCE');
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [running, setRunning] = useState(false);
  const [storageMode, setStorageMode] = useState('LOCAL');
  const [hdfsStatus, setHdfsStatus] = useState(null);

  const fetchStatusAndJobs = async () => {
    try {
      const [jobsRes, hdfsRes] = await Promise.all([
        analyticsService.getJobs(),
        analyticsService.getHdfsStatus()
      ]);
      const fetchedJobs = jobsRes.data.jobs || [];
      setJobs(fetchedJobs);
      if (fetchedJobs.length > 0 && !activeJob) {
        setActiveJob(fetchedJobs[0]);
      }
      setHdfsStatus(hdfsRes.data.status);
      setStorageMode(hdfsRes.data.status?.activeMode || 'LOCAL');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatusAndJobs();
  }, []);

  // Poll active job while processing
  useEffect(() => {
    let interval = null;
    if (activeJob && (activeJob.status === 'Processing' || activeJob.status === 'Queued')) {
      interval = setInterval(async () => {
        try {
          const res = await analyticsService.getJobById(activeJob.jobId);
          if (res.data && res.data.job) {
            setActiveJob(res.data.job);
            if (res.data.job.status === 'Completed' || res.data.job.status === 'Failed') {
              setRunning(false);
              fetchStatusAndJobs();
            }
          }
        } catch (e) {
          console.error(e);
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [activeJob]);

  const handleRunMapReduce = async () => {
    setRunning(true);
    try {
      const res = await analyticsService.runMapReduce({ jobType });
      if (res.data && res.data.job) {
        setActiveJob(res.data.job);
        setJobs(prev => [res.data.job, ...prev]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit MapReduce job.');
      setRunning(false);
    }
  };

  const handleToggleMode = async (newMode) => {
    try {
      const res = await analyticsService.setHdfsMode(newMode);
      setStorageMode(res.data.activeMode);
      fetchStatusAndJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle mode');
    }
  };

  const jobTypes = [
    { id: 'COMPREHENSIVE_MAPREDUCE', name: 'Comprehensive Climate MapReduce', desc: 'Full pipeline: Temp, Rain, Humidity, CO2 & Anomaly reducers' },
    { id: 'TEMPERATURE_STATS', name: 'Temperature Min/Max/Avg Reducer', desc: 'Calculates thermal extremes and mean indices across stations' },
    { id: 'RAINFALL_STATS', name: 'Monthly Precipitation Aggregator', desc: 'Aggregates monthly rainfall volume and historical means' },
    { id: 'CO2_STATS', name: 'Atmospheric CO2 Matrix Reducer', desc: 'Scans carbon concentrations across sensor partitions' },
    { id: 'ANOMALY_DETECTION', name: 'Threshold Outlier Scan MapReduce', desc: 'High-throughput MapReduce pass identifying threshold breaches' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-600" />
            Hadoop / MapReduce Big Data Execution Cluster
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distributed Map, Shuffle/Sort, and Reduce processing pipeline for high-volume climate records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StorageModeBadge mode={storageMode} />
          {isAdmin && (
            <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => handleToggleMode('LOCAL')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  storageMode === 'LOCAL' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Local Dev Mode
              </button>
              <button
                onClick={() => handleToggleMode('HDFS')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  storageMode === 'HDFS' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HDFS Mode
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Job Launcher & Presets */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Select MapReduce Algorithm</h3>
            <p className="text-xs text-slate-500">Choose mapper & reducer logic to dispatch to the cluster</p>
          </div>

          <div className="space-y-2.5">
            {jobTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setJobType(t.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  jobType === t.id
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{t.name}</h4>
                  {jobType === t.id && <Sparkles className="h-3.5 w-3.5 text-purple-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">{t.desc}</p>
              </button>
            ))}
          </div>

          <button
            onClick={handleRunMapReduce}
            disabled={running}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
            <span>{running ? 'Executing MapReduce on Cluster...' : 'Execute MapReduce Job'}</span>
          </button>

          {/* HDFS Directory Structure Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">HDFS Storage Strategy:</p>
            <p className="font-mono text-[10px] text-cyan-800">/earthscape/raw/[weather|satellite|sensors]</p>
            <p className="font-mono text-[10px] text-emerald-800">/earthscape/processed/[temperature|rainfall|co2]</p>
          </div>
        </div>

        {/* Right: Active Job Terminal Logs & Progress */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-cyan-600" />
                  <h3 className="font-bold text-sm text-slate-800">
                    {activeJob ? activeJob.jobId : 'Cluster Execution Console'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Algorithm: <span className="text-slate-800 font-semibold">{activeJob?.jobType || jobType}</span>
                </p>
              </div>

              {activeJob && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    activeJob.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : activeJob.status === 'Processing'
                      ? 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {activeJob.status} ({activeJob.progress}%)
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {activeJob && (
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-mono font-medium">
                  <span>Hadoop Task Tracker Progress</span>
                  <span>{activeJob.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${activeJob.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Terminal Log Console */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-100 h-64 overflow-y-auto space-y-1.5 shadow-inner">
              <div className="text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                [Hadoop Streaming Yarn Cluster Logs - {activeJob?.storageMode || storageMode} MODE]
              </div>
              {activeJob?.logs && activeJob.logs.length > 0 ? (
                activeJob.logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-400 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`font-bold text-[10px] ${
                      log.level === 'ERROR' ? 'text-rose-400' : log.level === 'WARN' ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      [{log.level}]
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-400">
                  No active MapReduce job selected. Click "Execute MapReduce Job" to begin processing.
                </div>
              )}
            </div>
          </div>

          {/* Results Summary if Completed */}
          {activeJob?.resultSummary?.aggregatesByLocation && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  MapReduce Output Summary Matrix ({Object.keys(activeJob.resultSummary.aggregatesByLocation).length} Stations)
                </h4>
                <span className="text-[11px] text-slate-500 font-mono font-medium">
                  {activeJob.resultSummary.totalRecordsProcessed} Records Reduced
                </span>
              </div>

              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="text-slate-700 border-b border-slate-200 bg-white font-bold">
                    <tr>
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3">Avg Temp</th>
                      <th className="py-2 px-3">Min/Max Temp</th>
                      <th className="py-2 px-3">Total Rain</th>
                      <th className="py-2 px-3">Avg CO2</th>
                      <th className="py-2 px-3">Anomalies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {Object.entries(activeJob.resultSummary.aggregatesByLocation).map(([loc, data]) => (
                      <tr key={loc} className="hover:bg-white/80">
                        <td className="py-1.5 px-3 font-semibold text-slate-900">{loc}</td>
                        <td className="py-1.5 px-3 font-mono text-cyan-700 font-semibold">{data.temperature?.average}°C</td>
                        <td className="py-1.5 px-3 font-mono text-slate-500">{data.temperature?.minimum}° / {data.temperature?.maximum}°</td>
                        <td className="py-1.5 px-3 font-mono">{data.rainfall?.total} mm</td>
                        <td className="py-1.5 px-3 font-mono">{data.co2?.average} ppm</td>
                        <td className="py-1.5 px-3 font-mono font-bold text-rose-600">{data.anomaliesDetected || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HadoopMapReduce;