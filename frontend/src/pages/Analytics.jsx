import React, { useState, useEffect } from 'react';
import { climateService, mlService } from '../services/api';
import {
  Globe2,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Activity,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const Analytics = () => {
  const [climateStats, setClimateStats] = useState(null);
  const [correlations, setCorrelations] = useState(null);
  const [location, setLocation] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, corrRes] = await Promise.all([
        climateService.getStatistics({ location: location === 'All' ? '' : location }),
        mlService.getCorrelations()
      ]);
      setClimateStats(statsRes.data);
      setCorrelations(corrRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [location]);

  const locations = ['All', 'Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Multan', 'Hyderabad', 'Faisalabad'];
  const summary = climateStats?.summary || {};
  const monthlyTrends = climateStats?.monthlyTrends || [];
  const locationStats = climateStats?.locationStats || [];
  const insights = correlations?.data?.insights || [];
  const pearson = correlations?.data?.pearson || {};

  return (
    <div className="space-y-6">
      {/* Header & Station Selector */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-cyan-600" />
            Comprehensive Climate Analytics & Correlation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Deep-dive multi-variable climate statistics, variance matrices, and inter-parameter dependencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Station Filter:</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Summary Metric Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Thermometer className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Temp Extremes</p>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
              {summary.minTemp || 0}°C <span className="text-slate-400 font-normal">to</span> {summary.maxTemp || 0}°C
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Avg: {summary.avgTemp || 0}°C</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
            <CloudRain className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Total Rainfall</p>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
              {summary.totalRainfall || 0} mm
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Max single day: {summary.maxRainfall || 0} mm</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Mean Humidity</p>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
              {summary.avgHumidity || 0}%
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Range: {summary.minHumidity || 0}% - {summary.maxHumidity || 0}%</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <Wind className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Carbon Dioxide</p>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
              {summary.avgCo2 || 0} ppm
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Peak: {summary.maxCo2 || 0} ppm</p>
          </div>
        </div>
      </div>

      {/* Row 1: Temperature & Rainfall Deep Dives */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Temperature Progression & Seasonal Cycles</h3>
            <p className="text-xs text-slate-500">Monthly mean temperature curve for {location} Station(s)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#0284c7" fontSize={11} unit="°C" domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }} />
                <Line type="monotone" dataKey="avgTemp" name="Mean Temperature" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rainfall & Humidity Trend */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Precipitation Volume & Humidity Association</h3>
            <p className="text-xs text-slate-500">Monthly average precipitation vs relative humidity</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="avgRainfall" name="Rainfall (mm)" fill="#0891b2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgHumidity" name="Humidity (%)" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Climate Correlation Insights */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-cyan-600" />
              Machine Learning Inter-Parameter Correlation Matrix
            </h3>
            <p className="text-xs text-slate-500">Pearson correlation indices calculated from historical telemetry data</p>
          </div>
          <span className="text-xs font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 px-2.5 py-1 rounded">
            PEARSON R
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((ins, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-900">{ins.pair}</h4>
                <span className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
                  ins.correlation > 0.5 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                }`}>
                  r = {ins.correlation}
                </span>
              </div>
              <span className="inline-block text-[10px] font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded">
                {ins.relationship}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">{ins.interpretation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;