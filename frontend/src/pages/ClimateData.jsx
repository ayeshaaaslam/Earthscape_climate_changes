import React, { useState, useEffect } from 'react';
import { climateService } from '../services/api';
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  SlidersHorizontal,
  Table as TableIcon
} from 'lucide-react';

const ClimateData = () => {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);

  // Filters
  const [location, setLocation] = useState('All');
  const [source, setSource] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minTemp, setMinTemp] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await climateService.getRecords({
        page,
        limit,
        location,
        source,
        startDate,
        endDate,
        minTemp,
        maxTemp,
        sortBy,
        sortOrder
      });
      setRecords(res.data.records || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, limit, location, source, sortBy, sortOrder]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExportTableau = () => {
    const url = climateService.getExportUrl(location === 'All' ? null : location);
    window.open(url, '_blank');
  };

  const locationsList = ['All', 'Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Multan', 'Hyderabad', 'Faisalabad'];
  const sourcesList = ['All', 'Weather Station', 'Sensor Network', 'Satellite Telemetry', 'Environmental IoT', 'SIMULATED REAL-TIME DATA'];

  return (
    <div className="space-y-6">
      {/* Header & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-cyan-600" />
            Climate Data Repository & Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query, filter, and inspect {total.toLocaleString()} multi-parameter climate records across stations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              showAdvancedFilters
                ? 'bg-cyan-50 border-cyan-200 text-cyan-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{showAdvancedFilters ? 'Hide Filters' : 'Filters & Ranges'}</span>
          </button>

          <button
            onClick={handleExportTableau}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm transition-all cursor-pointer"
            title="Export CSV dataset optimized for Tableau and PowerBI"
          >
            <Download className="h-4 w-4" />
            <span>Tableau / CSV Export</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Box */}
      {showAdvancedFilters && (
        <form onSubmit={handleApplyFilters} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Station Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
            >
              {locationsList.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Telemetry Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
            >
              {sourcesList.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Min Temp (°C)</label>
            <input
              type="number"
              value={minTemp}
              onChange={(e) => setMinTemp(e.target.value)}
              placeholder="e.g. 15"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Max Temp (°C)</label>
            <input
              type="number"
              value={maxTemp}
              onChange={(e) => setMaxTemp(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-cyan-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-xs cursor-pointer"
            >
              Apply Filter Query
            </button>
            <button
              type="button"
              onClick={() => {
                setLocation('All');
                setSource('All');
                setStartDate('');
                setEndDate('');
                setMinTemp('');
                setMaxTemp('');
                setPage(1);
              }}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      )}

      {/* Main Data Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th onClick={() => handleSort('date')} className="py-3.5 px-4 cursor-pointer hover:text-cyan-700">
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('location')} className="py-3.5 px-4 cursor-pointer hover:text-cyan-700">
                  <div className="flex items-center gap-1.5">
                    <span>Location</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('temperature')} className="py-3.5 px-4 cursor-pointer hover:text-cyan-700">
                  <div className="flex items-center gap-1.5">
                    <span>Temp (°C)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('humidity')} className="py-3.5 px-4 cursor-pointer hover:text-cyan-700">
                  <div className="flex items-center gap-1.5">
                    <span>Humidity (%)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('rainfall')} className="py-3.5 px-4 cursor-pointer hover:text-cyan-700">
                  <div className="flex items-center gap-1.5">
                    <span>Rainfall (mm)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('windSpeed')} className="py-3.5 px-4 cursor-pointer hover:text-cyan-700">
                  <div className="flex items-center gap-1.5">
                    <span>Wind (km/h)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th onClick={() => handleSort('co2')} className="py-3.5 px-4 cursor-pointer hover:text-cyan-700">
                  <div className="flex items-center gap-1.5">
                    <span>CO2 (ppm)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-cyan-600 mb-2" />
                    Loading climate records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No matching climate records found. Try adjusting filter criteria.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={r._id || i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-600">{r.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.location}</td>
                    <td className="py-3 px-4 font-mono font-medium">
                      <span className={r.temperature > 45 ? 'text-rose-600 font-bold' : r.temperature > 35 ? 'text-amber-600 font-semibold' : 'text-cyan-700'}>
                        {r.temperature?.toFixed(1)}°C
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{r.humidity?.toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono">
                      <span className={r.rainfall > 80 ? 'text-cyan-700 font-bold' : 'text-slate-600'}>
                        {r.rainfall?.toFixed(1)} mm
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{r.windSpeed?.toFixed(1)}</td>
                    <td className="py-3 px-4 font-mono">
                      <span className={r.co2 > 450 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {r.co2?.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        r.isSimulated
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {r.source}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Showing {records.length} of {total.toLocaleString()} records</span>
            <span className="text-slate-300">|</span>
            <span>Page {page} of {totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none text-xs"
            >
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>

            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateData;