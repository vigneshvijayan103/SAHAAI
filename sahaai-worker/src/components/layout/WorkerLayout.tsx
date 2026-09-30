import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Radio,
  MapPin,
  Clock,
  History,
  User,
  LogOut,
  Power,
  AlertTriangle,
  ArrowRight,
  Compass,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { useWorkerAuth } from '../../context/WorkerAuthContext';
import { workerApi } from '../../api/workerApi';
import type { WorkerJobDto } from '../../types/worker.types';

export const WorkerLayout: React.FC = () => {
  const { user, profile, isOnline, toggleOnline, currentCoords, updateLocation, logout } = useWorkerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeJob, setActiveJob] = useState<WorkerJobDto | null>(null);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [customLat, setCustomLat] = useState(currentCoords?.latitude.toString() || '12.9716');
  const [customLng, setCustomLng] = useState(currentCoords?.longitude.toString() || '77.5946');

  // Check for active job periodically
  useEffect(() => {
    let isMounted = true;
    const checkActiveJob = async () => {
      try {
        const res = await workerApi.getCurrentJob();
        if (isMounted) {
          setActiveJob(res.data);
        }
      } catch {
        // ignore background poll errors
      }
    };

    checkActiveJob();
    const interval = setInterval(checkActiveJob, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleToggleOnline = async () => {
    try {
      setIsTogglingOnline(true);
      await toggleOnline();
    } catch (err: any) {
      alert(`Could not toggle availability: ${err.message}`);
    } finally {
      setIsTogglingOnline(false);
    }
  };

  const handleApplyLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid numerical latitude and longitude');
      return;
    }
    await updateLocation(lat, lng);
    setShowLocationModal(false);
  };

  const navItems = [
    { label: 'Radar / Dispatch', path: '/dispatch', icon: Radio },
    { label: 'Active Mission', path: '/mission', icon: Clock, badge: activeJob ? '1' : null },
    { label: 'Job History', path: '/history', icon: History },
    { label: 'Dashboard', path: '/dashboard', icon: Compass },
    { label: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Portal Name */}
            <div className="flex items-center space-x-3">
              <Link to="/dispatch" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg tracking-tight text-white">SAHAAI</span>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                      PARTNER
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Field Technician & Emergency Hub</p>
                </div>
              </Link>
            </div>

            {/* Middle: Live Availability Toggle & GPS Status */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Online/Offline Toggle */}
              <button
                onClick={handleToggleOnline}
                disabled={isTogglingOnline}
                className={`relative inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-md ${
                  isOnline
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/20 shadow-emerald-500/10'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                }`}
                title="Toggle duty availability"
              >
                <span className="relative flex h-2.5 w-2.5 mr-2">
                  {isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}
                  ></span>
                </span>
                <Power className="w-3.5 h-3.5 mr-1.5" />
                <span>{isOnline ? 'ON DUTY (ONLINE)' : 'OFF DUTY (OFFLINE)'}</span>
              </button>

              {/* GPS Coordinates Button */}
              <button
                onClick={() => setShowLocationModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-300 transition-colors"
                title="Click to adjust worker GPS coordinates"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-[11px]">
                  {currentCoords
                    ? `${currentCoords.latitude.toFixed(4)}, ${currentCoords.longitude.toFixed(4)}`
                    : 'Locating...'}
                </span>
              </button>
            </div>

            {/* Right: Worker Profile & Logout */}
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center border border-amber-500/40">
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="Worker" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">
                    {profile?.fullName || user?.userName || 'Worker'}
                  </p>
                  <p className="text-[10px] text-amber-400 font-mono">ID: #{profile?.workerId || user?.userId}</p>
                </div>
              </Link>

              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                title="Logout of Sahaai Partner"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Header for Duty Toggle */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 bg-slate-900 border-t border-slate-800/80 text-xs">
          <button
            onClick={handleToggleOnline}
            disabled={isTogglingOnline}
            className={`flex items-center px-3 py-1.5 rounded-full font-semibold ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}
            ></span>
            {isOnline ? 'ON DUTY' : 'OFF DUTY'}
          </button>

          <button
            onClick={() => setShowLocationModal(true)}
            className="flex items-center space-x-1 text-slate-400 hover:text-slate-200"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-[10px]">
              {currentCoords
                ? `${currentCoords.latitude.toFixed(2)}, ${currentCoords.longitude.toFixed(2)}`
                : 'Set GPS'}
            </span>
          </button>
        </div>

        {/* Navigation Bar */}
        <nav className="bg-slate-950/60 border-t border-slate-800/60 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 sm:space-x-4 py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Sticky Active Mission Banner if worker is assigned */}
      {activeJob && location.pathname !== '/mission' && (
        <div className="bg-gradient-to-r from-amber-600/90 to-amber-700/90 text-slate-950 px-4 py-2.5 shadow-lg border-b border-amber-400/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Active Mission in Progress: #{activeJob.requestId} - {activeJob.title}
                </p>
                <p className="text-[11px] font-medium opacity-90">
                  Customer: {activeJob.customerName} ({activeJob.customerPhone}) • Status: {activeJob.status}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/mission')}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-950 text-amber-400 text-xs font-bold hover:bg-slate-900 transition-colors shadow"
            >
              <span>View Mission</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/40 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <p>Sahaai Emergency Dispatch Network &bull; Partner Portal &bull; Real-time Geo Dispatch v1.0</p>
      </footer>

      {/* Location Simulation / GPS Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Worker GPS Coordinates</h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Available jobs are calculated using the Haversine formula relative to your GPS coordinates. You can
              use real device location or set simulated coordinates for testing.
            </p>

            <form onSubmit={handleApplyLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  placeholder="e.g. 12.9716"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                <input
                  type="text"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  placeholder="e.g. 77.5946"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomLat('12.9716');
                    setCustomLng('77.5946');
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700"
                >
                  Reset (Default)
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20"
                >
                  Update GPS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

