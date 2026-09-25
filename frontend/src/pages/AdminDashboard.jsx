import React, { useState, useEffect } from 'react';
import { dashboardService, climateService } from '../services/api';
import StatCard from '../components/StatCard';
import MapView from '../components/MapView';
import {
  Users,
  Database,
  Layers,
  MapPin,
  AlertTriangle,
  Bell,
  Thermometer,
  CloudRain,
  Wind,
  Cpu,
  TrendingUp,
  Download,
  UploadCloud,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6'];

const AdminDashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [climateStats, setClimateStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, climRes] = await Promise.all([
        dashboardService.getStats(),
        climateService.getStatistics({})
      ]);
      setStats(dashRes.data);
      setClimateStats(climRes.data);
    } catch (err) {
      setError('Unable to fetch live dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="h-8 w-8 text-cyan-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Aggregating Planetary Climate Telemetry & Hadoop Indices...</p>
      </div>
    );
  }

  const s = stats?.stats || {};
  const monthlyTrends = climateStats?.monthlyTrends || [];
  const locationStats = climateStats?.locationStats || [];
  const anomaliesByLocation = stats?.anomaliesByLocation || [];
  const recordsBySource = stats?.recordsBySource || [];

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 text-white shadow-md border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            System Operations Command Center
            <span className="text-xs font-mono font-bold bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-400/30">
              CLUSTER ACTIVE
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Real-time multi-station aggregation, distributed MapReduce jobs & automated climate alert engines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveTab('data_ingestion')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Ingest Data</span>
          </button>

          <button
            onClick={() => setActiveTab('mapreduce')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <Cpu className="h-4 w-4" />
            <span>Run MapReduce</span>
          </button>

          <button
            onClick={() => setActiveTab('predictions')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
          >
            <TrendingUp className="h-4 w-4" />
            <span>ML Projections</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={s.totalUsers || 0}
          subtitle="Admin & Analysts"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Climate Records"
          value={(s.totalRecords || 0).toLocaleString()}
          subtitle="Processed Records"
          icon={Database}
          color="cyan"
        />
        <StatCard
          title="Active Datasets"
          value={s.totalDatasets || 0}
          subtitle="CSV & JSON Archives"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Monitored Stations"
          value={s.totalLocations || 0}
          subtitle="Telemetry Stations"
          icon={MapPin}
          color="emerald"
        />
        <StatCard
          title="Avg Temperature"
          value={`${s.avgTemperature || 0}°C`}
          subtitle="Multi-Station Mean"
          icon={Thermometer}
          color="amber"
        />
        <StatCard
          title="Average CO2"
          value={`${s.avgCo2 || 0} ppm`}
          subtitle="Atmospheric Carbon"
          icon={Wind}
          color="rose"
        />
        <StatCard
          title="Detected Anomalies"
          value={s.totalAnomalies || 0}
          subtitle="Z-Score / IQR / ML"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Active Alerts"
          value={s.activeAlerts || 0}
          subtitle="Requires Attention"
          icon={Bell}
          color="amber"
        />
      </div>

      {/* Main Charts & Map Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Temperature & CO2 Trend */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Global Temperature & CO2 Concentration Trend</h3>
              <p className="text-xs text-slate-500">Monthly aggregate data stream across all monitored weather stations</p>
            </div>
            <span className="text-[11px] font-mono font-bold bg-cyan-50 text-cyan-800 px-2.5 py-1 rounded-md border border-cyan-200">
              TIME-SERIES
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#0284c7" fontSize={11} domain={['auto', 'auto']} unit="°C" />
                <YAxis yAxisId="right" orientation="right" stroke="#e11d48" fontSize={11} domain={['auto', 'auto']} unit="ppm" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="avgTemp" name="Avg Temperature (°C)" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="avgCo2" name="CO2 Concentration (ppm)" stroke="#e11d48" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Geographic Station Network Map */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Station Geographic Network</h3>
              <p className="text-xs text-slate-500">Live coordinates & station status</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              GIS ACTIVE
            </span>
          </div>

          <MapView locations={locationStats} height="280px" />

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
            <span>● Green: Normal</span>
            <span>● Orange: High Temp</span>
            <span>● Red: Anomaly</span>
          </div>
        </div>
      </div>

      {/* Second Row: Rainfall vs Humidity & Anomalies by Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Rainfall & Humidity Area Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Precipitation & Relative Humidity Dynamics</h3>
              <p className="text-xs text-slate-500">Monthly correlation between rainfall volume (mm) and ambient humidity (%)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="humGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="avgRainfall" name="Avg Rainfall (mm)" stroke="#0891b2" fillOpacity={1} fill="url(#rainGrad)" />
                <Area type="monotone" dataKey="avgHumidity" name="Avg Humidity (%)" stroke="#059669" fillOpacity={1} fill="url(#humGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Sources Breakdown */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Telemetry Ingestion Sources</h3>
            <p className="text-xs text-slate-500">Distribution of ingested climate datasets</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {recordsBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recordsBySource}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={40}
                    paddingAngle={4}
                  >
                    {recordsBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No records ingested yet</p>
            )}
          </div>

          <div className="space-y-1.5 text-xs">
            {recordsBySource.map((src, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="truncate max-w-[140px] font-medium">{src.source}</span>
                </div>
                <span className="font-mono text-slate-800 font-bold">{src.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Third Row: Anomalies by Location Bar Chart */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Anomalies Detected by Station Location</h3>
            <p className="text-xs text-slate-500">Outliers identified by Big Data MapReduce threshold and ML Isolation Forest passes</p>
          </div>
          <button
            onClick={() => setActiveTab('anomalies')}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline"
          >
            View All Anomalies →
          </button>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={anomaliesByLocation.length > 0 ? anomaliesByLocation : locationStats.map(l => ({ location: l.location, count: 0 }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="location" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }} />
              <Bar dataKey="count" name="Anomalies Flagged" fill="#e11d48" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;