import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Clock,
  Radio,
  Power,
  MapPin,
  TrendingUp,
  User,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useWorkerAuth } from '../../context/WorkerAuthContext';
import { workerApi } from '../../api/workerApi';
import type { WorkerDashboardStatsDto } from '../../types/worker.types';

export const WorkerDashboardPage: React.FC = () => {
  const { profile, isOnline, status, toggleOnline, currentCoords } = useWorkerAuth();
  const [stats, setStats] = useState<WorkerDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await workerApi.getDashboard();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const currentStatus = stats?.status || status || (isOnline ? 'Online' : 'Offline');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Sahaai Responder</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Welcome back, {profile?.fullName || 'Technician'}!
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Your live emergency responder dashboard & performance metrics overview.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (currentStatus !== 'OnDuty') {
                toggleOnline().catch((err) => console.warn(err.message));
              }
            }}
            disabled={currentStatus === 'OnDuty'}
            title={currentStatus === 'OnDuty' ? 'Status set to OnDuty while job in progress' : 'Toggle status'}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 ${
              currentStatus === 'OnDuty'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-not-allowed'
                : currentStatus === 'Online'
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20 cursor-pointer'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700 cursor-pointer'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {currentStatus === 'OnDuty'
                ? 'OnDuty (In Progress)'
                : currentStatus === 'Online'
                ? 'Active (Online)'
                : 'Go Online'}
            </span>
          </button>

          <Link
            to="/dispatch"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5"
          >
            <Radio className="w-4 h-4" />
            <span>Live Radar</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats ? stats.completedJobs : '0'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Resolved emergencies</p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats ? stats.activeJobs : '0'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Jobs in progress</p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Assigned</span>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats ? stats.totalAssignedJobs : '0'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Lifetime total dispatches</p>
        </div>

        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Duty Status</span>
            <Power
              className={`w-5 h-5 ${
                currentStatus === 'OnDuty'
                  ? 'text-amber-400'
                  : currentStatus === 'Online'
                  ? 'text-emerald-400'
                  : 'text-slate-600'
              }`}
            />
          </div>
          <p className="text-lg sm:text-xl font-extrabold text-white mt-1 uppercase">
            {currentStatus}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {currentStatus === 'OnDuty'
              ? 'Job in progress (No new alerts)'
              : currentStatus === 'Online'
              ? 'Receiving dispatches'
              : 'Off-duty'}
          </p>
        </div>
      </div>

      {/* Quick Mission Shortcut / Current Job Preview */}
      {stats?.activeJob && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 uppercase">
                {stats.activeJob.status}
              </span>
              <span className="text-xs text-amber-400 font-mono">Mission #{stats.activeJob.requestId}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">{stats.activeJob.title}</h3>
            <p className="text-xs text-slate-400">
              Customer: {stats.activeJob.customerName} ({stats.activeJob.customerPhone})
            </p>
          </div>

          <Link
            to="/mission"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <span>Continue Mission</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* GPS & Dispatch Coordinates Info */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Active GPS Geolocation Coordinates</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <p className="text-slate-500 text-[11px]">Latitude</p>
            <p className="text-white font-mono font-bold mt-0.5">
              {currentCoords ? currentCoords.latitude.toFixed(6) : 'Not calibrated'}
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <p className="text-slate-500 text-[11px]">Longitude</p>
            <p className="text-white font-mono font-bold mt-0.5">
              {currentCoords ? currentCoords.longitude.toFixed(6) : 'Not calibrated'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

