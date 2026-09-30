import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  MapPin,
  RefreshCw,
  Clock,
  User,
  Phone,
  AlertTriangle,
  CheckCircle,
  Volume2,
  Image as ImageIcon,
  Compass,
  ArrowRight,
  ShieldAlert,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { useWorkerAuth } from '../../context/WorkerAuthContext';
import { workerApi } from '../../api/workerApi';
import type { WorkerJobDto } from '../../types/worker.types';

export const AvailableJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline, status, toggleOnline, currentCoords } = useWorkerAuth();

  const [jobs, setJobs] = useState<WorkerJobDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [selectedJobForAccept, setSelectedJobForAccept] = useState<WorkerJobDto | null>(null);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const lat = currentCoords?.latitude;
      const lng = currentCoords?.longitude;
      const res = await workerApi.getAvailableJobs(lat, lng, radiusKm);
      setJobs(res.data || []);
      setActionError(null);
    } catch (err: any) {
      console.warn('Failed to load dispatch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentCoords, radiusKm]);

  useEffect(() => {
    fetchJobs();
    if (!autoRefresh || status === 'OnDuty') return;
    const interval = setInterval(fetchJobs, 8000);
    return () => clearInterval(interval);
  }, [fetchJobs, autoRefresh, status]);

  const handleAcceptJob = async (job: WorkerJobDto) => {
    setIsAccepting(true);
    setActionError(null);
    try {
      await workerApi.acceptJob(job.requestId);
      setSelectedJobForAccept(null);
      // Navigate straight to the mission page
      navigate('/mission');
    } catch (err: any) {
      setActionError(err.message || 'Could not accept job. You may already have an active job in progress.');
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* OnDuty Banner */}
      {status === 'OnDuty' && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-400">Status: OnDuty (Job In Progress)</p>
              <p className="text-xs text-slate-300 mt-0.5">
                You are currently assigned to an active mission. New job alerts and dispatches are paused while you are on duty.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/mission')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer"
          >
            <span>View Active Mission</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Offline Alert Banner */}
      {status === 'Offline' && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-400">You are currently Off Duty (Offline)</p>
              <p className="text-xs text-slate-400">
                Go Online to broadcast your availability and receive emergency dispatches.
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleOnline()}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap cursor-pointer"
          >
            Go Online Now
          </button>
        </div>
      )}

      {/* Control Bar: Radar Header, Radius Selector & Auto-refresh */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="animate-ping absolute inset-0 rounded-full bg-amber-400 opacity-75"></div>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Live Emergency Dispatch Radar
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {jobs.length} Available
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
            <span>
              Searching near {currentCoords ? `${currentCoords.latitude.toFixed(3)}, ${currentCoords.longitude.toFixed(3)}` : 'Bengaluru'}
            </span>
            <span>&bull;</span>
            <span>Haversine Radius Filter: {radiusKm} km</span>
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Radius selector buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="px-2 text-[10px] text-slate-500 font-bold uppercase">Radius:</span>
            {[5, 15, 25, 50].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  radiusKm === r
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>

          {/* Auto Refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              autoRefresh
                ? 'bg-slate-800 border-amber-500/30 text-amber-400'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Live' : 'Paused'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={fetchJobs}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Jobs Grid or Empty State */}
      {loading && jobs.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-300">Scanning frequency for active service calls...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="w-full h-full rounded-full border border-slate-700 flex items-center justify-center">
              <Radio className="w-8 h-8 text-slate-600" />
            </div>
            <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping-slow"></div>
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Active Requests Within {radiusKm} km</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            There are currently no unassigned emergency requests in your selected radius. Expand your radius or keep
            this radar open — incoming jobs will appear automatically.
          </p>
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setRadiusKm(50)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Expand to 50 km
            </button>
            <button
              onClick={fetchJobs}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
            >
              Check Now
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job.requestId}
              className="group bg-slate-900/90 hover:bg-slate-850/90 rounded-2xl border border-slate-800 hover:border-amber-500/40 p-5 shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top: Service Badge & Distance */}
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 tracking-wide uppercase">
                    {job.serviceName || 'Emergency Service'}
                  </span>

                  <span className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <MapPin className="w-3 h-3" />
                    <span>{job.distanceKm !== null ? `${job.distanceKm} km` : 'Near you'}</span>
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-amber-400 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {job.description || 'No additional description provided by customer.'}
                </p>

                {/* Customer & Location Details */}
                <div className="space-y-1.5 py-3 border-y border-slate-800/80 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Customer:</span>
                    <span className="font-semibold text-white">{job.customerName || 'Verified User'}</span>
                  </div>
                  {job.addressLine && (
                    <div className="flex items-start justify-between">
                      <span className="text-slate-500 text-[11px]">Address:</span>
                      <span className="text-slate-300 text-right truncate max-w-[200px]" title={job.addressLine}>
                        {job.addressLine}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Time Posted:</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(job.createdOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Media attachments: Photos & Audio Note */}
                {(job.imageUrls?.length > 0 || job.audioUrl) && (
                  <div className="mt-3 flex items-center space-x-3 text-xs">
                    {job.imageUrls?.length > 0 && (
                      <button
                        onClick={() => setActivePhotoModal(job.imageUrls[0])}
                        className="flex items-center space-x-1 text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">{job.imageUrls.length} Photo(s)</span>
                      </button>
                    )}
                    {job.audioUrl && (
                      <div className="flex items-center space-x-1 text-amber-400">
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">Voice Note Attached</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button: Accept Job */}
              <div className="mt-5 pt-3">
                <button
                  onClick={() => setSelectedJobForAccept(job)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-all cursor-pointer"
                >
                  <span>Accept Job</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Job Confirmation Modal */}
      {selectedJobForAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Accept Service Request?</h3>
                <p className="text-xs text-slate-400">Request #{selectedJobForAccept.requestId}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5 text-xs text-slate-300">
              <p>
                <span className="text-slate-500">Service:</span>{' '}
                <span className="font-bold text-white">{selectedJobForAccept.serviceName}</span>
              </p>
              <p>
                <span className="text-slate-500">Title:</span>{' '}
                <span className="font-semibold text-white">{selectedJobForAccept.title}</span>
              </p>
              <p>
                <span className="text-slate-500">Customer:</span>{' '}
                <span className="font-semibold text-white">{selectedJobForAccept.customerName}</span>
              </p>
              <p>
                <span className="text-slate-500">Distance:</span>{' '}
                <span className="font-semibold text-emerald-400">
                  {selectedJobForAccept.distanceKm !== null ? `${selectedJobForAccept.distanceKm} km away` : 'Nearby'}
                </span>
              </p>
              {selectedJobForAccept.addressLine && (
                <p>
                  <span className="text-slate-500">Address:</span> {selectedJobForAccept.addressLine}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 mb-6">
              Accepting this job will immediately assign you to the customer, lock the request from other technicians,
              and notify the customer via SignalR in real time.
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setSelectedJobForAccept(null)}
                disabled={isAccepting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAcceptJob(selectedJobForAccept)}
                disabled={isAccepting}
                className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                {isAccepting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Confirm & Accept</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Enlarge Modal */}
      {activePhotoModal && (
        <div
          onClick={() => setActivePhotoModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl w-full">
            <img src={activePhotoModal} alt="Enlarged" className="w-full max-h-[80vh] object-contain rounded-xl" />
            <p className="text-center text-xs text-slate-400 mt-2">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};

