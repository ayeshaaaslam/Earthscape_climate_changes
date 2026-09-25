import React, { useState, useEffect } from 'react';
import { dashboardService, climateService, mlService } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Layers,
  Database,
  Thermometer,
  CloudRain,
  AlertTriangle,
  Bell,
  TrendingUp,
  LineChart,
  Radio,
  FileText,
  LifeBuoy,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const AnalystDashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [climateStats, setClimateStats] = useState(null);
  const [recentAnomalies, setRecentAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalystData = async () => {
    setLoading(true);
    try {
      const [dashRes, climRes, anomRes] = await Promise.all([
        dashboardService.getStats(),
        climateService.getStatistics({}),
        mlService.getAnomalies({ limit: 5 })
      ]);
      setStats(dashRes.data);
      setClimateStats(climRes.data);
      setRecentAnomalies(anomRes.data?.anomalies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalystData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <RefreshCw className="h-8 w-8 text-cyan-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading Analyst Workbench & Model Summaries...</p>
      </div>
    );
  }

  const s = stats?.stats || {};
  const locationStats = climateStats?.locationStats || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-teal-950 text-white shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Climate Analyst Research Workbench
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Conduct multi-station variance queries, trigger predictive machine learning algorithms, and explore environmental trends.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('predictions')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-sm cursor-pointer"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Trend Predictor</span>
          </button>
          <button
            onClick={() => setActiveTab('climate_data')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
          >
            <Database className="h-4 w-4" />
            <span>Search Data</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Datasets"
          value={s.totalDatasets || 0}
          subtitle="Accessible"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Records"
          value={(s.totalRecords || 0).toLocaleString()}
          subtitle="Analyzable"
          icon={Database}
          color="cyan"
        />
        <StatCard
          title="Avg Temp"
          value={`${s.avgTemperature || 0}°C`}
          subtitle="All Stations"
          icon={Thermometer}
          color="amber"
        />
        <StatCard
          title="Avg Rainfall"
          value={`${s.avgRainfall || 0} mm`}
          subtitle="Precipitation"
          icon={CloudRain}
          color="cyan"
        />
        <StatCard
          title="Anomalies"
          value={s.totalAnomalies || 0}
          subtitle="Flagged Events"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Active Alerts"
          value={s.activeAlerts || 0}
          subtitle="Threshold Breaches"
          icon={Bell}
          color="amber"
        />
      </div>

      {/* Analyst Tool Navigation Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { id: 'analytics', title: 'Climate Analytics', desc: 'Station variance & correlations', icon: LineChart, color: 'text-cyan-600' },
          { id: 'predictions', title: 'ML Predictions', desc: '1-5 year climate regressions', icon: TrendingUp, color: 'text-emerald-600' },
          { id: 'anomalies', title: 'Anomaly Detection', desc: 'Z-score & Isolation Forest', icon: AlertTriangle, color: 'text-rose-600' },
          { id: 'live_stream', title: 'Live Telemetry', desc: 'Real-time sensor feed', icon: Radio, color: 'text-amber-600' },
          { id: 'climate_data', title: 'Dataset Browser', desc: 'Search, filter & export', icon: Database, color: 'text-blue-600' },
          { id: 'mapreduce', title: 'Hadoop MapReduce', desc: 'Run big data aggregations', icon: Layers, color: 'text-purple-600' },
          { id: 'reports', title: 'Analysis Reports', desc: 'Generate PDF & CSV reports', icon: FileText, color: 'text-emerald-600' },
          { id: 'support', title: 'Analyst Support', desc: 'Submit tickets to Admins', icon: LifeBuoy, color: 'text-pink-600' },
        ].map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className="p-4 rounded-xl bg-white border border-slate-200/90 hover:border-cyan-500/50 hover:bg-slate-50/80 transition-all text-left group shadow-xs cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${tool.color}`} />
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="font-bold text-xs text-slate-800 group-hover:text-cyan-700">{tool.title}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{tool.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Main Analysis Chart: Multi-Station Variance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-800">Multi-Station Temperature & Precipitation Variance</h3>
              <p className="text-xs text-slate-500">Comparative telemetry metrics across regional monitoring stations</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
            >
              Detailed Analytics →
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="location" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#0284c7" fontSize={11} unit="°C" />
                <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={11} unit="mm" />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar yAxisId="left" dataKey="avgTemp" name="Avg Temperature (°C)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avgRainfall" name="Avg Rainfall (mm)" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Anomalies Alert Feed */}
        <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Recent Anomalies
              </h3>
              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold">
                REVIEW
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Latest statistical & machine learning outlier flags</p>

            <div className="space-y-2.5">
              {recentAnomalies.length > 0 ? (
                recentAnomalies.map((anom, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{anom.location}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                          anom.severity === 'Critical' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {anom.severity}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-0.5 text-[11px]">
                        {anom.parameter}: <span className="text-slate-900 font-mono font-bold">{anom.observedValue}</span> ({anom.date})
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{anom.method}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No anomalies detected yet.</p>
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('anomalies')}
            className="w-full py-2 text-center text-xs font-bold text-cyan-700 hover:bg-cyan-50 rounded-xl border border-cyan-200 transition-colors cursor-pointer"
          >
            Investigate All Anomalies
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalystDashboard;