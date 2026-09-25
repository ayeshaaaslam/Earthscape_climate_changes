import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStream } from '../context/StreamContext';
import LiveBadge from '../components/LiveBadge';
import StorageModeBadge from '../components/StorageModeBadge';
import {
  LayoutDashboard,
  LineChart,
  Table,
  UploadCloud,
  Cpu,
  TrendingUp,
  AlertTriangle,
  Radio,
  Bell,
  FileText,
  LifeBuoy,
  Users,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Globe2,
  ChevronRight,
  UserCheck
} from 'lucide-react';

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout, isAdmin, isAnalyst } = useAuth();
  const { activeAlertsCount } = useStream();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { id: 'admin_dashboard', name: 'Admin Dashboard', icon: LayoutDashboard, adminOnly: true },
    { id: 'analyst_dashboard', name: 'Analyst Dashboard', icon: LineChart },
    { id: 'climate_data', name: 'Climate Records', icon: Table },
    { id: 'data_ingestion', name: 'Data Ingestion', icon: UploadCloud },
    { id: 'mapreduce', name: 'Hadoop & MapReduce', icon: Cpu },
    { id: 'analytics', name: 'Climate Analytics', icon: Globe2 },
    { id: 'predictions', name: 'ML Predictions', icon: TrendingUp },
    { id: 'anomalies', name: 'Anomaly Detection', icon: AlertTriangle },
    { id: 'live_stream', name: 'Real-Time Stream', icon: Radio },
    { id: 'alerts', name: 'Alerts & Thresholds', icon: Bell, badge: activeAlertsCount > 0 ? activeAlertsCount : null },
    { id: 'reports', name: 'Analysis Reports', icon: FileText },
    { id: 'support', name: 'Help & Support', icon: LifeBuoy },
    { id: 'users', name: 'User Management', icon: Users, adminOnly: true },
    { id: 'logs', name: 'System Audit Logs', icon: ShieldAlert, adminOnly: true },
  ];

  const visibleNav = navigation.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0 shadow-sm ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-md shadow-cyan-600/10">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
                <Globe2 className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                EARTHSCAPE <span className="text-[10px] bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded font-mono font-bold border border-cyan-200">2.0</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Climate Big Data Agency</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-cyan-700 text-sm shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-xs text-slate-800 truncate">{user?.name || 'Climate Analyst'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isAdmin ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                }`}>
                  {user?.role || 'ANALYST'}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                  isActive
                    ? 'bg-cyan-50 text-cyan-800 border border-cyan-200/90 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-cyan-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="h-3.5 w-3.5 text-cyan-600" />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <StorageModeBadge mode="LOCAL" />
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
            title="Sign Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between px-5 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {navigation.find(n => n.id === activeTab)?.name || 'Climate Platform'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Live Environmental Telemetry & Big Data Prediction Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <LiveBadge />
            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
            <button
              onClick={() => setActiveTab('alerts')}
              className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              title="View Alerts"
            >
              <Bell className="h-4 w-4" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[10px] text-slate-500">{user?.email}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content Container */}
        <main className="flex-1 p-5 md:p-7 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;