import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Shield, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useWorkerAuth } from '../../context/WorkerAuthContext';

export const WorkerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useWorkerAuth();

  const searchParams = new URLSearchParams(window.location.search);
  const isDeactivated = searchParams.get('deactivated') === 'true';
  const isExpired = searchParams.get('expired') === 'true';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(username.trim(), password.trim());
      navigate('/dispatch');
    } catch (err: any) {
      setError(err.message || 'Worker login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLoginRamesh = async () => {
    setUsername('rameshworker');
    setPassword('WorkerPassword@123');
    setLoading(true);
    setError(null);
    try {
      await login('rameshworker', 'WorkerPassword@123');
      navigate('/dispatch');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Background radial glowing effects */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Icon & Heading */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 shadow-xl shadow-amber-500/20 mb-4 transform hover:scale-105 transition-transform">
            <Wrench className="w-8 h-8 text-slate-950" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SAHAAI <span className="text-amber-400">PARTNER</span>
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Emergency Dispatch & Field Technician Operations Portal
          </p>
          <div className="mt-3 inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Dedicated Worker & Technician Access (Port 5174)</span>
          </div>
        </div>

        {/* Card Box */}
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800">
            {/* Quick Demo Test Account Banner */}
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-amber-400 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Quick One-Click Testing
                  </p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Pre-configured verified test technician account (Ramesh Kumar)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickLoginRamesh}
                  disabled={loading}
                  className="px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider transition-colors shadow"
                >
                  Quick Fill
                </button>
              </div>
            </div>

            {/* Status Banners */}
            {isDeactivated && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Your technician account has been deactivated by administrator. You have been logged out.</span>
              </div>
            )}

            {isExpired && !isDeactivated && (
              <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Your session has expired. Please sign in again.</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. rameshworker"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter worker password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In to Field Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Register Onboarding Link */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Want to work as a field partner?{' '}
                <Link
                  to="/register"
                  className="font-bold text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4"
                >
                  Register as Technician / Responder
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

