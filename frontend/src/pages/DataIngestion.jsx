import React, { useState, useEffect } from 'react';
import { datasetService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StorageModeBadge from '../components/StorageModeBadge';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  HardDrive,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

const DataIngestion = () => {
  const { isAdmin } = useAuth();
  const [file, setFile] = useState(null);
  const [source, setSource] = useState('National Weather Station Network');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);

  const fetchDatasets = async () => {
    setLoadingDatasets(true);
    try {
      const res = await datasetService.getDatasets();
      setDatasets(res.data.datasets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDatasets(false);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a valid CSV or JSON climate dataset.');
      return;
    }

    setUploading(true);
    setUploadProgress(20);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', source);

    try {
      setUploadProgress(60);
      const res = await datasetService.upload(formData);
      setUploadProgress(100);
      setResult(res.data);
      setFile(null);
      fetchDatasets();
    } catch (err) {
      setError(err.response?.data?.message || 'Dataset upload and validation failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dataset archive and all associated records?')) return;
    try {
      await datasetService.deleteDataset(id);
      fetchDatasets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete dataset.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-cyan-600" />
            Big Data Telemetry Ingestion Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest, validate, clean, and stage raw environmental datasets into HDFS / Local storage partitions.
          </p>
        </div>
        <StorageModeBadge mode="LOCAL" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form Box */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-sm text-slate-800">Upload Climate Dataset</h3>
            <p className="text-xs text-slate-500">Supports standard CSV & JSON telemetry formats</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Ingestion Validated!</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Parsed {result.validationStats?.totalParsed} records ({result.dataset?.storageMode}).
              </p>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Data Source Attribution
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-600 shadow-2xs"
              >
                <option value="National Weather Station Network">National Weather Station Network</option>
                <option value="Satellite Remote Sensing">Satellite Remote Sensing</option>
                <option value="Environmental IoT Sensors">Environmental IoT Sensors</option>
                <option value="Oceanographic Buoy System">Oceanographic Buoy System</option>
                <option value="Synthetic Anomaly Testbed">Synthetic Anomaly Testbed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Select Dataset File (.csv / .json)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-cyan-600 bg-slate-50/70 transition-colors">
                <div className="space-y-1 text-center">
                  <FileSpreadsheet className="mx-auto h-8 w-8 text-cyan-600" />
                  <div className="flex text-xs text-slate-600 justify-center">
                    <label className="relative cursor-pointer rounded-md font-bold text-cyan-700 hover:text-cyan-800 focus-within:outline-none">
                      <span>Choose a file</span>
                      <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {file ? file.name : 'CSV/JSON up to 50MB'}
                  </p>
                </div>
              </div>
            </div>

            {uploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Uploading & Validating...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              <span>{uploading ? 'Ingesting Dataset...' : 'Ingest & Validate File'}</span>
            </button>
          </form>

          {/* Expected CSV Schema Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Expected Schema Headers:</p>
            <code className="block p-1.5 rounded bg-white border border-slate-200 text-cyan-800 font-mono text-[10px] overflow-x-auto">
              date, location, latitude, longitude, temperature, humidity, rainfall, wind_speed, air_pressure, co2, source
            </code>
          </div>
        </div>

        {/* Uploaded Datasets Archive List */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-sm text-slate-800">Staged & Processed Dataset Archives</h3>
                <p className="text-xs text-slate-500">Historical climate bundles stored in HDFS / Local partitions</p>
              </div>
              <button
                onClick={fetchDatasets}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              >
                <RefreshCw className={`h-4 w-4 ${loadingDatasets ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {loadingDatasets ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto text-cyan-600 mb-2" />
                  Loading dataset catalog...
                </div>
              ) : datasets.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No dataset archives found. Use the uploader to stage your first climate file.
                </div>
              ) : (
                datasets.map((ds) => (
                  <div
                    key={ds._id}
                    className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 mt-0.5">
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{ds.fileName}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-600">
                          <span>Source: {ds.source}</span>
                          <span>•</span>
                          <span className="font-mono text-cyan-700 font-bold">{ds.recordCount?.toLocaleString()} records</span>
                          <span>•</span>
                          <span>{(ds.fileSize / 1024).toFixed(1)} KB</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">
                          Path: {ds.storagePath} ({ds.storageMode})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {ds.status}
                      </span>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(ds._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Dataset and Records"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>Total Staged Datasets: {datasets.length}</span>
            <span className="font-mono text-cyan-700 font-bold">
              Total Records: {datasets.reduce((sum, d) => sum + (d.recordCount || 0), 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataIngestion;