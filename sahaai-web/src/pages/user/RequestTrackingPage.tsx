import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  UserCheck,
  XCircle,
  CheckCircle2,
  Radio,
  ImageIcon,
  ArrowLeft,
  AlertCircle,
  Phone,
  Clock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchRequestDetails,
  fetchRequestStatus,
  cancelServiceRequest,
  workerAccepted,
  workerLocationUpdated,
  requestStatusUpdated,
} from '../../features/serviceRequest/serviceRequestSlice';
import { signalRService } from '../../services/signalrService';
import { RadarPulse } from '../../components/radar/RadarPulse';
import { AudioPlayer } from '../../components/audio/AudioPlayer';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { WorkerReviewCard } from '../../components/review/WorkerReviewCard';
import { LiveWorkerTracker } from '../../components/tracking/LiveWorkerTracker';

export const RequestTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const requestId = parseInt(id || '0', 10);

  const { currentDetails, currentStatus, isLoading } = useAppSelector(
    (state) => state.serviceRequest
  );
  const { user } = useAppSelector((state) => state.auth);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (requestId > 0) {
      dispatch(fetchRequestDetails(requestId));
      dispatch(fetchRequestStatus(requestId));
    }
  }, [requestId, dispatch]);

  // SignalR Real-Time Event Listener
  useEffect(() => {
    if (!requestId) return;

    let isMounted = true;
    const userId = user?.userId || 0;

    // Connect to SignalR hub and join groups
    signalRService.startConnection(userId, requestId);

    const handleRequestAccepted = (payload: any) => {
      console.log('[SignalR] RequestAccepted received:', payload);
      if (isMounted) {
        dispatch(
          workerAccepted({
            requestId: payload.requestId || requestId,
            workerId: payload.workerId,
            workerName: payload.workerName,
            workerPhone: payload.workerPhone,
            workerPhoto: payload.workerPhoto,
            workerLatitude: payload.workerLatitude,
            workerLongitude: payload.workerLongitude,
            status: payload.status || 'Accepted',
          })
        );
        // Also sync full request details from backend
        dispatch(fetchRequestDetails(requestId));
      }
    };

    const handleWorkerLocationUpdated = (payload: any) => {
      console.log('[SignalR] WorkerLocationUpdated received:', payload);
      if (isMounted) {
        dispatch(
          workerLocationUpdated({
            requestId: payload.requestId || requestId,
            workerId: payload.workerId,
            latitude: payload.latitude,
            longitude: payload.longitude,
          })
        );
      }
    };

    const handleRequestStarted = (payload: any) => {
      console.log('[SignalR] RequestStarted received:', payload);
      if (isMounted) {
        dispatch(
          requestStatusUpdated({
            requestId: payload.requestId || requestId,
            status: payload.status || 'InProgress',
          })
        );
        dispatch(fetchRequestDetails(requestId));
      }
    };

    const handleRequestCompleted = (payload: any) => {
      console.log('[SignalR] RequestCompleted received:', payload);
      if (isMounted) {
        dispatch(
          requestStatusUpdated({
            requestId: payload.requestId || requestId,
            status: payload.status || 'Completed',
          })
        );
        dispatch(fetchRequestDetails(requestId));
      }
    };

    signalRService.on('RequestAccepted', handleRequestAccepted);
    signalRService.on('WorkerLocationUpdated', handleWorkerLocationUpdated);
    signalRService.on('RequestStarted', handleRequestStarted);
    signalRService.on('RequestCompleted', handleRequestCompleted);

    return () => {
      isMounted = false;
      signalRService.off('RequestAccepted', handleRequestAccepted);
      signalRService.off('WorkerLocationUpdated', handleWorkerLocationUpdated);
      signalRService.off('RequestStarted', handleRequestStarted);
      signalRService.off('RequestCompleted', handleRequestCompleted);
    };
  }, [requestId, user?.userId, dispatch]);

  // Live polling fallback every 4 seconds
  useEffect(() => {
    if (!requestId) return;

    const currentStatusStr = (currentStatus?.status || currentDetails?.status || '').toLowerCase();
    const isCompletedOrCancelled = ['completed', 'cancelled'].includes(currentStatusStr);

    if (!isCompletedOrCancelled) {
      const interval = setInterval(async () => {
        const res = await dispatch(fetchRequestStatus(requestId));
        if (fetchRequestStatus.fulfilled.match(res)) {
          const st = res.payload;
          // If status transitioned to Accepted or has worker but details hasn't loaded worker name yet
          if (
            st &&
            (st.isAssigned || st.assignedWorkerId || ['accepted', 'inprogress', 'completed'].includes(st.status?.toLowerCase())) &&
            !currentDetails?.assignedWorkerName
          ) {
            dispatch(fetchRequestDetails(requestId));
          }
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [requestId, currentStatus?.status, currentDetails?.status, currentDetails?.assignedWorkerName, dispatch]);

  const handleCancel = async () => {
    setIsCancelling(true);
    setCancelError(null);
    try {
      const result = await dispatch(
        cancelServiceRequest({
          id: requestId,
          dto: { reason: cancelReason.trim() || undefined },
        })
      );
      if (cancelServiceRequest.fulfilled.match(result)) {
        setCancelMessage('Service request cancelled successfully.');
        setCancelModalOpen(false);
        navigate('/');
      } else {
        setCancelError(result.payload as string || 'Failed to cancel request.');
      }
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading && !currentDetails) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!currentDetails) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Request Not Found</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          The requested dispatch #{requestId} could not be located.
        </p>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
      </div>
    );
  }

  const status = currentStatus?.status || currentDetails?.status || 'Pending';
  const isSearching = ['searching', 'expandingradius'].includes(status.toLowerCase());
  const canCancel = ['pending', 'searching', 'expandingradius', 'accepted'].includes(
    status.toLowerCase()
  );

  const steps = [
    { label: 'Created', key: 'pending' },
    { label: 'Radar Search', key: 'searching' },
    { label: 'Accepted', key: 'accepted' },
    { label: 'In Progress', key: 'inprogress' },
    { label: 'Completed', key: 'completed' },
  ];

  const getStepIndex = (st: string) => {
    const s = st.toLowerCase();
    if (s === 'completed') return 4;
    if (s === 'inprogress') return 3;
    if (s === 'accepted') return 2;
    if (s === 'searching' || s === 'expandingradius') return 1;
    return 0;
  };

  const currentStepIdx = getStepIndex(status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Requests
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400">Request #{requestId}</span>
          <Badge status={status} />
        </div>
      </div>

      {cancelMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {cancelMessage}
        </div>
      )}

      {/* Completed Job Details Header */}
      {status.toLowerCase() === 'completed' && (
        <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-200 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Job Completed Successfully</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Fulfilled
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                This emergency service request has been resolved and completed by your technician.
              </p>
            </div>
          </div>
          {currentDetails.completedAt && (
            <div className="text-left sm:text-right sm:border-l sm:border-emerald-200 sm:pl-4 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Completion Time
              </span>
              <span className="text-xs font-bold text-emerald-800">
                {new Date(currentDetails.completedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Radar Pulse when Searching */}
      {isSearching && (
        <RadarPulse
          status={status}
          searchRadius={currentStatus?.searchRadius || 5}
        />
      )}

      {/* Visual Status Pipeline */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
          {status.toLowerCase() === 'completed'
            ? 'Service Completion Timeline'
            : status.toLowerCase() === 'cancelled'
            ? 'Request Cancellation Status'
            : 'Live Dispatch Progress'}
        </h3>

        <div className="relative flex items-center justify-between">
          {steps.map((step, idx) => {
            const isFinished = idx <= currentStepIdx && status.toLowerCase() !== 'cancelled';
            const isCurrent = idx === currentStepIdx && status.toLowerCase() !== 'cancelled';

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isFinished
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    } ${isCurrent ? 'ring-4 ring-emerald-100 animate-pulse' : ''}`}
                  >
                    {isFinished ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-bold mt-2 text-center ${
                      isFinished ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 -mt-5 rounded ${
                      idx < currentStepIdx && status.toLowerCase() !== 'cancelled'
                        ? 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {status.toLowerCase() === 'cancelled' && (
          <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-800">This request has been cancelled.</p>
              {currentDetails.cancellationReason && (
                <p className="text-xs text-rose-600 mt-0.5">
                  Reason: {currentDetails.cancellationReason}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Technician Tracking Map & Telemetry */}
      {['accepted', 'inprogress'].includes(status.toLowerCase()) && (
        <LiveWorkerTracker
          customerLat={currentDetails.latitude}
          customerLng={currentDetails.longitude}
          customerAddress={currentDetails.addressLine}
          workerLat={currentDetails.workerLatitude}
          workerLng={currentDetails.workerLongitude}
          workerName={currentDetails.assignedWorkerName}
          workerPhone={currentDetails.assignedWorkerPhone}
          workerPhoto={currentDetails.assignedWorkerPhoto}
          status={status}
        />
      )}

      {/* Main Request Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description, Media */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">{currentDetails.title}</h2>

            {currentDetails.description ? (
              <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">
                {currentDetails.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No additional description provided.</p>
            )}

            {/* Audio Voice Note Player */}
            {currentDetails.audioUrl && (
              <div className="pt-2">
                <AudioPlayer src={currentDetails.audioUrl} title="Recorded Emergency Voice Note" />
              </div>
            )}

            {/* Photos */}
            {currentDetails.imageUrls && currentDetails.imageUrls.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Attached Evidence Photos ({currentDetails.imageUrls.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currentDetails.imageUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square rounded-2xl overflow-hidden border border-slate-200 block hover:opacity-90 transition-opacity"
                    >
                      <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Customer Rating & Review (shown when service is completed) */}
          {status.toLowerCase() === 'completed' && (
            <WorkerReviewCard
              requestId={requestId}
              workerName={currentDetails.assignedWorkerName}
              workerPhoto={currentDetails.assignedWorkerPhoto}
              isCompleted={status.toLowerCase() === 'completed'}
            />
          )}
        </div>

        {/* Right 1 Col: Dispatch Info & Assigned Worker */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {status.toLowerCase() === 'completed'
                ? 'Job Details & Timeline'
                : 'Dispatch Coordinates'}
            </h3>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Destination</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5 leading-snug">
                  {currentDetails.addressLine || 'Coordinates on file'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Dispatched On</span>
                <p className="text-xs font-bold text-slate-800 mt-0.5">
                  {new Date(currentDetails.createdOn).toLocaleString()}
                </p>
              </div>
            </div>

            {currentDetails.acceptedAt && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Accepted By Tech</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {new Date(currentDetails.acceptedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {currentDetails.completedAt && (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">Service Completed</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">
                    {new Date(currentDetails.completedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Assigned Worker Card / Worker Matching */}
            {status.toLowerCase() === 'cancelled' ? null : currentDetails.assignedWorkerId || currentStatus?.assignedWorkerId || ['accepted', 'inprogress', 'completed'].includes(status.toLowerCase()) ? (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-semibold block mb-2">
                  Assigned Technician
                </span>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold overflow-hidden border border-emerald-400/40 shrink-0">
                      {currentDetails.assignedWorkerPhoto ? (
                        <img
                          src={currentDetails.assignedWorkerPhoto}
                          alt="Technician"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {currentDetails.assignedWorkerName || `Technician #${currentDetails.assignedWorkerId || currentStatus?.assignedWorkerId || ''}`}
                      </h4>
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        {status.toLowerCase() === 'inprogress'
                          ? 'Service in progress on site'
                          : status.toLowerCase() === 'completed'
                          ? 'Service completed'
                          : 'En route to your location'}
                      </p>
                    </div>
                  </div>

                  {currentDetails.assignedWorkerPhone && (
                    <a
                      href={`tel:${currentDetails.assignedWorkerPhone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-semibold block mb-1">
                  Worker Matching
                </span>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                  Connecting nearby technicians...
                </p>
              </div>
            )}

            {/* Cancel Button */}
            {canCancel && status.toLowerCase() !== 'cancelled' && (
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel Service Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Service Request"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to cancel this service request? This will recall the dispatched
            technicians.
          </p>

          {cancelError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
              {cancelError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Cancellation Reason (Optional)
            </label>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Issue resolved independently, incorrect address"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Keep Active
            </button>
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleCancel}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 disabled:opacity-50"
            >
              {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
