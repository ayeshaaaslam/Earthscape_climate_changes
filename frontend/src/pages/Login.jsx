import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Globe2, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@earthscape.org');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (role) => {
    if (role === 'ADMIN') {
      setEmail('admin@earthscape.org');
      setPassword('Admin@123456');
    } else {
      setEmail('analyst@earthscape.org');
      setPassword('Analyst@123456');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background soft glow ornaments */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-md shadow-cyan-600/10">
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white">
            <Globe2 className="h-8 w-8 text-cyan-600" />
          </div>
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
          EARTHSCAPE
        </h2>
        <p className="mt-1 text-xs text-slate-500 uppercase tracking-widest font-semibold">
          Climate Monitoring, Big Data & Prediction System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-200/90 sm:px-10">
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quick Demo Accounts:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoRole('ADMIN')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoRole('ANALYST')}
                className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-cyan-200 bg-cyan-50 text-cyan-700 text-xs font-semibold hover:bg-cyan-100 transition-colors cursor-pointer"
              >
                <Globe2 className="h-3.5 w-3.5" />
                <span>Analyst Portal</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Official Email
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600"
                  placeholder="analyst@earthscape.org"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Secure Password
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:border-cyan-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to EarthScape'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-xs text-slate-500 hover:text-cyan-700 transition-colors"
            >
              Need a new Analyst account? <span className="font-semibold text-cyan-700 underline">Register</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;