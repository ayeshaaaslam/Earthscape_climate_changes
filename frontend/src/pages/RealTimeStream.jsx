import React, { useState, useEffect } from 'react';
import { useStream } from '../context/StreamContext';
import { useAuth } from '../context/AuthContext';
import LiveBadge from '../components/LiveBadge';
import {
  Radio,
  Play,
  Pause,
  Activity,
  AlertTriangle,
  Thermometer,
  CloudRain,
  Droplets,
  Wind,
  Gauge,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const RealTimeStream = () => {
  const { isStreaming, packets, latestPacket, toggleStream } = useStream();
  const { isAdmin } = useAuth();
  const [streamSpeed, setStreamSpeed] = useState(3);

  // Format telemetry packets for live charting
  const chartData = [...packets].slice(0, 20).reverse().map((p, idx) => ({
    time: p.timestamp ? new Date(p.timestamp).toLocaleTimeString() : `#${idx}`,
    temp: p.temperature,
    rainfall: p.rainfall,
    humidity: p.humidity,
    co2: p.co2,
    location: p.location
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Radio className={`h-5 w-5 ${isStreaming ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            <h2 className="text-lg font-bold text-slate-900">
              Real-Time Simulated Climate Telemetry Stream
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live environmental sensor feed broadcasting across multi-station regional monitoring nodes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LiveBadge />
          {isAdmin && (
            <button
              onClick={toggleStream}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                isStreaming
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isStreaming ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isStreaming ? 'Pause Simulation' : 'Start Live Telemetry'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200/80 text-xs text-cyan-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold bg-cyan-100/90 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase text-cyan-800">
            SIMULATED REAL-TIME DATA
          </span>
          <span className="font-medium">Continuous simulated telemetry arriving via Server-Sent Events (SSE).</span>
        </div>
        <span className="font-mono text-xs text-cyan-800 font-bold">{packets.length} Packets Received</span>
      </div>

      {/* Latest Telemetry Sensor Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase text-slate-500">Active Station</span>
            <Activity className="h-4 w-4 text-cyan-600" />
          </div>
          <p className="text-sm font-extrabold text-slate-900 truncate">{latestPacket?.location || 'Awaiting...'}</p>
          <p className="text-[10px] text-slate-400">{latestPacket?.date || 'Live'}</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase text-slate-500">Temperature</span>
            <Thermometer className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-sm font-extrabold text-amber-600 font-mono">
            {latestPacket ? `${latestPacket.temperature}°C` : '--'}
          </p>
          <p className="text-[10px] text-slate-400">Surface Sensor</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase text-slate-500">Precipitation</span>
            <CloudRain className="h-4 w-4 text-cyan-600" />
          </div>
          <p className="text-sm font-extrabold text-cyan-700 font-mono">
            {latestPacket ? `${latestPacket.rainfall} mm` : '--'}
          </p>
          <p className="text-[10px] text-slate-400">Pluviometer</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase text-slate-500">Humidity</span>
            <Droplets className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-sm font-extrabold text-emerald-600 font-mono">
            {latestPacket ? `${latestPacket.humidity}%` : '--'}
          </p>
          <p className="text-[10px] text-slate-400">Hygrometer</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase text-slate-500">CO2 Level</span>
            <Wind className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-sm font-extrabold text-rose-600 font-mono">
            {latestPacket ? `${latestPacket.co2} ppm` : '--'}
          </p>
          <p className="text-[10px] text-slate-400">NDIR Sensor</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase text-slate-500">Air Pressure</span>
            <Gauge className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-sm font-extrabold text-purple-600 font-mono">
            {latestPacket ? `${latestPacket.airPressure} hPa` : '--'}
          </p>
          <p className="text-[10px] text-slate-400">Barometer</p>
        </div>
      </div>

      {/* Live Oscilloscope / Telemetry Chart */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Live Dynamic Telemetry Waveform</h3>
            <p className="text-xs text-slate-500">Real-time incoming temperature (°C) & precipitation (mm) packets</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-mono font-bold text-emerald-700">STREAM ACTIVE</span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis yAxisId="left" stroke="#0284c7" fontSize={11} domain={['auto', 'auto']} unit="°C" />
              <YAxis yAxisId="right" orientation="right" stroke="#059669" fontSize={11} domain={['auto', 'auto']} unit="mm" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line yAxisId="left" isAnimationActive={false} type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line yAxisId="right" isAnimationActive={false} type="monotone" dataKey="rainfall" name="Rainfall (mm)" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Feed Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">Live Ingested Telemetry Packets Buffer</h3>
          <span className="text-[11px] text-slate-500 font-mono">Last 50 packets retained in memory</span>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Station</th>
                <th className="py-2.5 px-4">Temp</th>
                <th className="py-2.5 px-4">Rainfall</th>
                <th className="py-2.5 px-4">Humidity</th>
                <th className="py-2.5 px-4">CO2</th>
                <th className="py-2.5 px-4">Wind</th>
                <th className="py-2.5 px-4">Alert Triggered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {packets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-slate-400 font-sans text-xs">
                    Stream paused or awaiting incoming telemetry packets. Click "Start Live Telemetry".
                  </td>
                </tr>
              ) : (
                packets.slice(0, 30).map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-4 text-slate-500 text-[11px]">
                      {p.timestamp ? new Date(p.timestamp).toLocaleTimeString() : 'Live'}
                    </td>
                    <td className="py-2 px-4 font-sans font-semibold text-slate-900">{p.location}</td>
                    <td className="py-2 px-4 text-amber-600 font-semibold">{p.temperature}°C</td>
                    <td className="py-2 px-4 text-cyan-700 font-semibold">{p.rainfall} mm</td>
                    <td className="py-2 px-4">{p.humidity}%</td>
                    <td className="py-2 px-4 text-rose-600 font-semibold">{p.co2} ppm</td>
                    <td className="py-2 px-4">{p.windSpeed} km/h</td>
                    <td className="py-2 px-4 font-sans">
                      {p.alerts && p.alerts.length > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                          {p.alerts[0].param} Breach!
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-bold">None</span>
                      )}
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

export default RealTimeStream;