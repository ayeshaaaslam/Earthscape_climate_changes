import React, { useState, useEffect } from 'react';
import { mlService } from '../services/api';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sliders,
  RefreshCw,
  Brain,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#f43f5e', '#f59e0b', '#06b6d4', '#8b5cf6'];

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [location, setLocation] = useState('All');
  const [severity, setSeverity] = useState('All');
  const [status, setStatus] = useState('All');

  // Trigger new ML scan
  const [scanning, setScanning] = useState(false);
  const [scanMethod, setScanMethod] = useState('All');
  const [scanParam, setScanParam] = useState('temperature');
  const [scanResult, setScanResult] = useState(null);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await mlService.getAnomalies({
        page,
        limit: 20,
        location,
        severity,
        status
      });
      setAnomalies(res.data?.anomalies || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [page, location, severity, status]);

  const handleRunScan = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const res = await mlService.detectAnomalies({
        parameter: scanParam,
        method: scanMethod,
        contamination: 0.03
      });
      setScanResult(res.data);
      fetchAnomalies();
    } catch (err) {
      alert(err.response?.data?.message || 'Anomaly scan execution failed.');
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await mlService.updateAnomalyStatus(id, { status: newStatus });
      fetchAnomalies();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const locationsList = ['All', 'Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Multan', 'Hyderabad', 'Faisalabad'];

  const severityCounts = {
    Critical: anomalies.filter(a => a.severity === 'Critical').length,
    High: anomalies.filter(a => a.severity === 'High').length,
    Medium: anomalies.filter(a => a.severity === 'Medium').length,
    Low: anomalies.filter(a => a.severity === 'Low').length,
  };

  const pieData = Object.entries(severityCounts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            Machine Learning Climate Anomaly Detection Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify statistical outliers & multivariate anomalies using Z-Score, IQR, and Isolation Forest models.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full">
            {total} DETECTED EVENTS
          </span>
        </div>
      </div>

      {/* Trigger Anomaly Scan Box */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Brain className="h-4 w-4 text-cyan-600" />
            Trigger New Anomaly Detection Pass
          </h3>
          <span className="text-xs text-slate-500 font-medium">Unsupervised Multi-Model Scanner</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Parameter</label>
            <select
              value={scanParam}
              onChange={(e) => setScanParam(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
            >
              <option value="temperature">Temperature (°C)</option>
              <option value="rainfall">Precipitation (mm)</option>
              <option value="humidity">Humidity (%)</option>
              <option value="co2">CO2 Concentration (ppm)</option>
              <option value="wind_speed">Wind Speed (km/h)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detection Technique</label>
            <select
              value={scanMethod}
              onChange={(e) => setScanMethod(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
            >
              <option value="All">All Methods (Ensemble Scan)</option>
              <option value="Isolation Forest">Isolation Forest (ML Unsupervised)</option>
              <option value="Z-score">Z-Score Statistical (σ &gt; 2.5)</option>
              <option value="IQR">Interquartile Range (IQR 1.5x)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunScan}
              disabled={scanning}
              className="w-full py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 disabled:opacity-50 shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {scanning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span>{scanning ? 'Running Detection...' : 'Execute Anomaly Scan'}</span>
            </button>
          </div>
        </div>

        {scanResult && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
            <span>Detection Scan Complete: Flagged {scanResult.totalDetected} anomalies across climate archives.</span>
            <span className="font-mono font-bold">Status: Synchronized</span>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none"
          >
            {locationsList.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Detected">Detected</option>
            <option value="Investigating">Investigating</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <button
          onClick={fetchAnomalies}
          className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Anomalies Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Parameter</th>
                <th className="py-3 px-4">Observed Value</th>
                <th className="py-3 px-4">Expected Baseline</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-rose-600 mb-2" />
                    Loading anomaly database...
                  </td>
                </tr>
              ) : anomalies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No anomalies matching current criteria.
                  </td>
                </tr>
              ) : (
                anomalies.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600">{a.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{a.location}</td>
                    <td className="py-3 px-4 capitalize text-slate-700">{a.parameter}</td>
                    <td className="py-3 px-4 font-mono font-bold text-rose-600">
                      {a.observedValue}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{a.expectedRange}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        a.severity === 'Critical'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : a.severity === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">{a.method}</td>
                    <td className="py-3 px-4">
                      <select
                        value={a.status}
                        onChange={(e) => handleUpdateStatus(a._id, e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-md text-[11px] text-slate-800 focus:outline-none"
                      >
                        <option value="Detected">Detected</option>
                        <option value="Investigating">Investigating</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Dismissed">Dismissed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Anomalies;