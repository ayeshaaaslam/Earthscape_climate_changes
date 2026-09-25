import React, { useState, useEffect } from 'react';
import { alertService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Filter,
  RefreshCw,
  Clock,
  ShieldAlert,
  X
} from 'lucide-react';

const Alerts = () => {
  const { isAdmin } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Active');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings form state
  const [tempMax, setTempMax] = useState(45);
  const [rainfallMax, setRainfallMax] = useState(100);
  const [humidityMax, setHumidityMax] = useState(90);
  const [co2Max, setCo2Max] = useState(450);
  const [windSpeedMax, setWindSpeedMax] = useState(80);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchAlertsAndSettings = async () => {
    setLoading(true);
    try {
      const [alertsRes, settingsRes] = await Promise.all([
        alertService.getAlerts({ status: filterStatus, severity: filterSeverity }),
        alertService.getSettings()
      ]);
      setAlerts(alertsRes.data?.alerts || []);
      if (settingsRes.data?.setting) {
        const s = settingsRes.data.setting;
        setSettings(s);
        setTempMax(s.tempMax);
        setRainfallMax(s.rainfallMax);
        setHumidityMax(s.humidityMax);
        setCo2Max(s.co2Max);
        setWindSpeedMax(s.windSpeedMax);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndSettings();
  }, [filterStatus, filterSeverity]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await alertService.updateAlert(id, { status });
      fetchAlertsAndSettings();
    } catch (err) {
      alert('Failed to update alert.');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await alertService.updateSettings({
        tempMax: Number(tempMax),
        rainfallMax: Number(rainfallMax),
        humidityMax: Number(humidityMax),
        co2Max: Number(co2Max),
        windSpeedMax: Number(windSpeedMax)
      });
      setShowSettingsModal(false);
      fetchAlertsAndSettings();
    } catch (err) {
      alert('Failed to update threshold settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-500" />
            Climate Alert & Threshold Management Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time threshold breaches, automated notifications, and incident resolution workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-cyan-800 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            >
              <Sliders className="h-4 w-4" />
              <span>Configure Thresholds</span>
            </button>
          )}
        </div>
      </div>

      {/* Threshold Overview Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Max Temp</span>
          <p className="text-sm font-extrabold text-amber-600 font-mono mt-0.5">&gt; {settings?.tempMax || 45}°C</p>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Max Rainfall</span>
          <p className="text-sm font-extrabold text-cyan-600 font-mono mt-0.5">&gt; {settings?.rainfallMax || 100} mm</p>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Max Humidity</span>
          <p className="text-sm font-extrabold text-emerald-600 font-mono mt-0.5">&gt; {settings?.humidityMax || 90}%</p>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Max CO2</span>
          <p className="text-sm font-extrabold text-rose-600 font-mono mt-0.5">&gt; {settings?.co2Max || 450} ppm</p>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Max Wind</span>
          <p className="text-sm font-extrabold text-purple-600 font-mono mt-0.5">&gt; {settings?.windSpeedMax || 80} km/h</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2">
          {['Active', 'Acknowledged', 'Resolved', 'All'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterStatus === st
                  ? 'bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st} Alerts
            </button>
          ))}
        </div>

        <button
          onClick={fetchAlertsAndSettings}
          className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-cyan-600 mb-2" />
            Loading alert incidents...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-slate-200/90 shadow-xs text-center text-slate-500 text-xs">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">No {filterStatus} Alerts</p>
            <p className="mt-0.5">All monitored environmental variables are operating within configured bounds.</p>
          </div>
        ) : (
          alerts.map((al) => (
            <div
              key={al._id}
              className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-3 rounded-xl mt-0.5 ${
                  al.severity === 'Critical'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}>
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{al.location} Station Alert</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      al.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {al.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(al.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{al.message}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-1">
                    Observed: <span className="font-bold text-slate-900">{al.value}</span> | Threshold: <span className="text-amber-600 font-bold">{al.threshold}</span> ({al.parameter})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {al.status === 'Active' && (
                  <button
                    onClick={() => handleUpdateStatus(al._id, 'Acknowledged')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                  >
                    Acknowledge
                  </button>
                )}
                {al.status !== 'Resolved' ? (
                  <button
                    onClick={() => handleUpdateStatus(al._id, 'Resolved')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                  >
                    Resolve Alert
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Threshold Configuration Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-600" />
                Configure Global Alert Thresholds
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Temp Limit (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={tempMax}
                    onChange={(e) => setTempMax(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Rainfall (mm)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={rainfallMax}
                    onChange={(e) => setRainfallMax(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Humidity (%)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={humidityMax}
                    onChange={(e) => setHumidityMax(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max CO2 Limit (ppm)</label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={co2Max}
                    onChange={(e) => setCo2Max(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Wind Speed (km/h)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={windSpeedMax}
                    onChange={(e) => setWindSpeedMax(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-xs transition-all"
                >
                  {savingSettings ? 'Saving...' : 'Save Thresholds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;