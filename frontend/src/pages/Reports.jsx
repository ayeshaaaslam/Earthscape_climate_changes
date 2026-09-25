import React, { useState } from 'react';
import { reportService, climateService } from '../services/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  FileText,
  Download,
  Calendar,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Printer,
  FileSpreadsheet
} from 'lucide-react';

const Reports = () => {
  const [location, setLocation] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await reportService.getComprehensiveReport({
        location: location === 'All' ? '' : location,
        startDate,
        endDate
      });
      setReport(res.data?.report);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate climate report.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    const stats = report.summaryStats || {};

    // Header Title
    doc.setFontSize(16);
    doc.setTextColor(11, 21, 40);
    doc.text('EARTHSCAPE CLIMATE AGENCY', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text('Big Data Environmental & Climate Telemetry Analysis Report', 14, 27);
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()} | Scope: ${location} Station(s)`, 14, 33);

    // Summary Statistics Table
    doc.autoTable({
      startY: 40,
      head: [['Climate Parameter', 'Calculated Aggregate', 'Baseline Variance']],
      body: [
        ['Total Processed Records', `${stats.recordCount?.toLocaleString()} Records`, 'Validated Dataset Basis'],
        ['Mean Surface Temperature', `${stats.temperature?.avg}°C`, `Range: ${stats.temperature?.min}°C to ${stats.temperature?.max}°C`],
        ['Total Cumulative Rainfall', `${stats.rainfall?.total} mm`, `Peak Single Day: ${stats.rainfall?.max} mm`],
        ['Relative Humidity Average', `${stats.humidity?.avg}%`, 'Atmospheric Saturation Mean'],
        ['Atmospheric Carbon (CO2)', `${stats.co2?.avg} ppm`, `Range: ${stats.co2?.min} ppm to ${stats.co2?.max} ppm`],
        ['Mean Wind Velocity', `${stats.windSpeed?.avg} km/h`, 'Anemometer Index']
      ],
      theme: 'grid',
      headStyles: { fillColor: [6, 182, 212] }
    });

    // Anomalies Table
    if (report.anomalies && report.anomalies.length > 0) {
      const startY = doc.lastAutoTable.finalY + 12;
      doc.setFontSize(13);
      doc.setTextColor(11, 21, 40);
      doc.text('Detected Climate Outliers & Extreme Anomalies', 14, startY);

      doc.autoTable({
        startY: startY + 5,
        head: [['Date', 'Station', 'Parameter', 'Observed Value', 'Severity', 'Method']],
        body: report.anomalies.map(a => [
          a.date,
          a.location,
          a.parameter,
          a.observedValue,
          a.severity,
          a.method
        ]),
        theme: 'striped',
        headStyles: { fillColor: [244, 63, 94] }
      });
    }

    doc.save(`EarthScape_Report_${location}_${Date.now()}.pdf`);
  };

  const locationsList = ['All', 'Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta', 'Multan', 'Hyderabad', 'Faisalabad'];
  const stats = report?.summaryStats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Executive Climate Report Generator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synthesize multi-parameter environmental statistics, anomaly occurrences, and correlations into exportable reports.
          </p>
        </div>

        {report && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Export PDF Document</span>
            </button>
          </div>
        )}
      </div>

      {/* Query Filter Box */}
      <form onSubmit={handleGenerateReport} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Station Scope</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
            >
              {locationsList.map((loc) => (
                <option key={loc} value={loc}>{loc === 'All' ? 'All Stations (Comprehensive)' : `${loc} Weather Station`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date Range</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Date Range</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 shadow-xs transition-all cursor-pointer"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            <span>{loading ? 'Compiling Big Data Report...' : 'Generate Analysis Report'}</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Render Report if Available */}
      {report && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Official Agency Report</span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{report.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Station Scope: <span className="text-slate-800 font-semibold">{report.summaryStats?.location}</span> | Generated: {new Date(report.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-cyan-600" />
                <span>Save PDF</span>
              </button>
            </div>
          </div>

          {/* Statistical Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Records</span>
              <p className="text-base font-mono font-extrabold text-cyan-700 mt-0.5">{stats.recordCount?.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Temp</span>
              <p className="text-base font-mono font-extrabold text-amber-700 mt-0.5">{stats.temperature?.avg}°C</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Rain</span>
              <p className="text-base font-mono font-extrabold text-cyan-700 mt-0.5">{stats.rainfall?.total} mm</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Humidity</span>
              <p className="text-base font-mono font-extrabold text-emerald-700 mt-0.5">{stats.humidity?.avg}%</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Mean CO2</span>
              <p className="text-base font-mono font-extrabold text-rose-700 mt-0.5">{stats.co2?.avg} ppm</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/90 shadow-2xs">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Mean Wind</span>
              <p className="text-base font-mono font-extrabold text-purple-700 mt-0.5">{stats.windSpeed?.avg} km/h</p>
            </div>
          </div>

          {/* Anomalies section */}
          {report.anomalies && report.anomalies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Identified Extreme Weather Outliers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {report.anomalies.slice(0, 6).map((a, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/90 text-xs flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="font-bold text-slate-900">{a.location}</span>
                      <p className="text-[11px] text-slate-500">{a.parameter}: <span className="text-rose-600 font-mono font-bold">{a.observedValue}</span> ({a.date})</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {a.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;