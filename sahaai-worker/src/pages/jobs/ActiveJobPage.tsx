import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  Play,
  CheckCircle2,
  XCircle,
  Phone,
  Navigation,
  MapPin,
  AlertTriangle,
  User,
  Volume2,
  Image as ImageIcon,
  ArrowRight,
  ShieldAlert,
  Radio,
  FileText,
  Calendar,
} from 'lucide-react';
import { workerApi } from '../../api/workerApi';
import type { WorkerJobDto } from '../../types/worker.types';
import { WorkerLiveBeacon } from '../../components/tracking/WorkerLiveBeacon';

export const ActiveJobPage: React.FC = () => {
  const navigate = useNavigate();

  const [job, setJob] = useState<WorkerJobDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modals
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [completionNotes, setCompletionNotes] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);

  const fetchCurrentJob = useCallback(async () => {
    try {
      const res = await workerApi.getCurrentJob();
      setJob(res.data);
      setActionError(null);
    } catch (err: any) {
      console.warn('Failed to load current job:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentJob();
    const interval = setInterval(fetchCurrentJob, 6000);
    return () => clearInterval(interval);
  }, [fetchCurrentJob]);

  const [showProximityAlert, setShowProximityAlert] = useState<boolean>(false);

  // Start Job (Accepted -> InProgress)
  const handleStartJob = async () => {
    if (!job) return;
    setActionLoading(true);
    setActionError(null);
    setShowProximityAlert(false);

    let workerLat: number | undefined;
    let workerLng: number | undefined;

    try {
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 4000,
          });
        });
        workerLat = pos.coords.latitude;
        workerLng = pos.coords.longitude;
      }
    } catch (e) {
      console.warn('Geolocation capture failed prior to startJob:', e);
    }

    try {
      await workerApi.startJob(job.requestId, workerLat, workerLng);
      await fetchCurrentJob();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to start job.';
      setActionError(errMsg);
      setShowProximityAlert(true);
    } finally {
      setActionLoading(false);
    }
  };

  // Complete Job (InProgress -> Completed)
  const handleCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await workerApi.completeJob(job.requestId, { notes: completionNotes.trim() });
      setShowCompleteModal(false);
      setCompletionNotes('');
      // Navigate to history or show success
      navigate('/history');
    } catch (err: any) {
      setActionError(err.message || 'Failed to complete job.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject / Release Job
  const handleRejectJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await workerApi.rejectJob(job.requestId, { reason: rejectReason.trim() });
      setShowRejectModal(false);
      setRejectReason('');
      setJob(null);
      navigate('/dispatch');
    } catch (err: any) {
      setActionError(err.message || 'Failed to release job.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-slate-300">Checking active mission status...</p>
      </div>
    );
  }

  // Empty State: No active job
  if (!job) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Active Mission in Progress</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            You currently have no accepted or ongoing emergency requests assigned. Switch to the dispatch radar to
            scan and accept new incoming requests.
          </p>
          <Link
            to="/dispatch"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all"
          >
            <Radio className="w-4 h-4" />
            <span>Open Dispatch Radar</span>
          </Link>
        </div>
      </div>
    );
  }

  const isAccepted = job.status === 'Accepted';
  const isInProgress = job.status === 'InProgress';
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Mission Status Banner */}
      <div
        className={`p-5 rounded-2xl border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isAccepted
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
            : isInProgress
            ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-slate-950 font-bold ${
              isAccepted ? 'bg-amber-400' : 'bg-cyan-400'
            }`}
          >
            {isAccepted ? <Clock className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Mission #{job.requestId} &bull; {job.status}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/60 uppercase">
                {isAccepted ? 'Assigned & En Route' : 'Service In Progress'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">{job.title}</h1>
          </div>
        </div>

        {/* Status indicator pill */}
        <div className="flex items-center space-x-2">
          {job.distanceKm !== null && (
            <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs font-bold text-emerald-400 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{job.distanceKm} km away</span>
            </span>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Live GPS Beacon & Navigation Map */}
      <WorkerLiveBeacon
        destinationLat={job.latitude}
        destinationLng={job.longitude}
        destinationAddress={job.addressLine}
        requestId={job.requestId}
        status={job.status}
      />

      {/* Main Content Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Customer, Description, Photos, Voice note */}
        <div className="md:col-span-2 space-y-5">
          {/* Customer & Address Card */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-amber-400" />
              <span>Customer Information & Location</span>
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div>
                  <p className="text-slate-500 text-[11px]">Customer Name</p>
                  <p className="text-sm font-bold text-white mt-0.5">{job.customerName || 'Verified Customer'}</p>
                </div>
                {job.customerPhone && (
                  <a
                    href={`tel:${job.customerPhone}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40 font-bold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call: {job.customerPhone}</span>
                  </a>
                )}
              </div>

              <div>
                <p className="text-slate-500 text-[11px] mb-1">Destination Address / Coordinates</p>
                <p className="text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono">
                  {job.addressLine || `GPS: ${job.latitude}, ${job.longitude}`}
                </p>
              </div>

              {/* One-click Google Maps Navigation Button */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-500/30 font-bold text-xs transition-colors shadow"
              >
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Open Turn-by-Turn Directions in Google Maps</span>
              </a>
            </div>
          </div>

          {/* Emergency Description & Details Card */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Incident Details</span>
            </h2>

            <div className="space-y-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                  {job.serviceName}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  {job.description || 'No additional issue description entered.'}
                </p>
              </div>

              {/* Audio Voice Note Player if provided */}
              {job.audioUrl && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-xs font-bold text-amber-400 mb-2 flex items-center space-x-1.5">
                    <Volume2 className="w-4 h-4" />
                    <span>Customer Voice Note:</span>
                  </p>
                  <audio controls className="w-full h-8" src={job.audioUrl} />
                </div>
              )}

              {/* Photo attachments */}
              {job.imageUrls?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 mb-2 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Site & Damage Photos ({job.imageUrls.length}):</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {job.imageUrls.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActivePhotoModal(url)}
                        className="h-24 rounded-xl border border-slate-800 overflow-hidden cursor-pointer hover:border-amber-500/50 transition-colors"
                      >
                        <img src={url} alt={`Site ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Actions Panel */}
        <div className="space-y-5">
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-lg">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Mission Controls</h2>

            <div className="space-y-3">
              {/* If Accepted: Show Start Job */}
              {isAccepted && (
                <button
                  onClick={handleStartJob}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Job (I Have Arrived)</span>
                    </>
                  )}
                </button>
              )}

              {/* If InProgress: Show Complete Job */}
              {isInProgress && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Job Completed</span>
                </button>
              )}

              {/* Decline / Release Request */}
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
              >
                Decline / Release Request
              </button>
            </div>

            {/* Timestamps */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Created:</span>
                <span className="text-slate-200 font-mono">
                  {new Date(job.createdOn).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              {job.acceptedAt && (
                <div className="flex justify-between">
                  <span>Accepted:</span>
                  <span className="text-slate-200 font-mono">
                    {new Date(job.acceptedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Job Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Complete Service Request</h3>
                <p className="text-xs text-slate-400">Request #{job.requestId}</p>
              </div>
            </div>

            <form onSubmit={handleCompleteJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Completion Notes / Work Done (Optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Replaced faulty circuit breaker, verified power restoration."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Confirm Completion</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject / Release Job Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Release Service Request</h3>
                <p className="text-xs text-slate-400">Release back to available dispatch pool</p>
              </div>
            </div>

            <form onSubmit={handleRejectJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Reason for Releasing (Required)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Tools missing, customer unreachable, vehicle issue."
                  required
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-red-500"
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-bold shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Confirm Release</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Proximity / Location Alert Modal Popup */}
      {showProximityAlert && actionError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center transform transition-all">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 shadow-inner">
              <MapPin className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight">Reach Customer Location</h3>
              <p className="text-xs text-amber-400 font-bold mt-1 uppercase tracking-wider">Arrival Verification Required</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-mono text-left">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{actionError}</span>
              </div>
            </div>
            <div className="flex space-x-3 pt-2">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all cursor-pointer uppercase tracking-wider"
              >
                <Navigation className="w-4 h-4" />
                <span>Open Maps</span>
              </a>
              <button
                type="button"
                onClick={() => setShowProximityAlert(false)}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold border border-slate-700 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Dismiss
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

