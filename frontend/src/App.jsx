import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StreamProvider } from './context/StreamContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AnalystDashboard from './pages/AnalystDashboard';
import ClimateData from './pages/ClimateData';
import DataIngestion from './pages/DataIngestion';
import HadoopMapReduce from './pages/HadoopMapReduce';
import Analytics from './pages/Analytics';
import Predictions from './pages/Predictions';
import Anomalies from './pages/Anomalies';
import RealTimeStream from './pages/RealTimeStream';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Support from './pages/Support';
import UserManagement from './pages/UserManagement';
import SystemLogs from './pages/SystemLogs';

const MainApp = () => {
  const { user, loading, isAdmin } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin_dashboard' : 'analyst_dashboard');

  // Sync default tab on user change
  React.useEffect(() => {
    if (user) {
      setActiveTab(user.role === 'ADMIN' ? 'admin_dashboard' : 'analyst_dashboard');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Initializing EarthScape Climate Monitoring System...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'admin_dashboard':
        return <AdminDashboard setActiveTab={setActiveTab} />;
      case 'analyst_dashboard':
        return <AnalystDashboard setActiveTab={setActiveTab} />;
      case 'climate_data':
        return <ClimateData />;
      case 'data_ingestion':
        return <DataIngestion />;
      case 'mapreduce':
        return <HadoopMapReduce />;
      case 'analytics':
        return <Analytics />;
      case 'predictions':
        return <Predictions />;
      case 'anomalies':
        return <Anomalies />;
      case 'live_stream':
        return <RealTimeStream />;
      case 'alerts':
        return <Alerts />;
      case 'reports':
        return <Reports />;
      case 'support':
        return <Support />;
      case 'users':
        return isAdmin ? <UserManagement /> : <AnalystDashboard setActiveTab={setActiveTab} />;
      case 'logs':
        return isAdmin ? <SystemLogs /> : <AnalystDashboard setActiveTab={setActiveTab} />;
      default:
        return isAdmin ? <AdminDashboard setActiveTab={setActiveTab} /> : <AnalystDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActivePage()}
    </DashboardLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <StreamProvider>
        <MainApp />
      </StreamProvider>
    </AuthProvider>
  );
}

export default App;