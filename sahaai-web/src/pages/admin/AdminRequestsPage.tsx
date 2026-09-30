import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  Search,
  AlertCircle,
  Eye,
  XCircle,
  Image,
  Headphones,
  MapPin,
  User,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  fetchAllRequests,
  adminCancelRequest,
  updateRequestStatus,
  setSelectedRequest,
} from '../../features/admin/adminSlice';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800',
  Searching: 'bg-blue-100 text-blue-800',
  ExpandingRadius: 'bg-cyan-100 text-cyan-800',
  Accepted: 'bg-indigo-100 text-indigo-800',
  InProgress: 'bg-violet-100 text-violet-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-rose-100 text-rose-800',
  NoWorkersAvailable: 'bg-slate-100 text-slate-800',
};

const allStatuses = [
  'All',
  'Pending',
  'Searching',
  'ExpandingRadius',
  'Accepted',
  'InProgress',
  'Completed',
  'Cancelled',
  'NoWorkersAvailable',
];

export const AdminRequestsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, selectedRequest, isLoading, error } = useAppSelector((state) => state.admin);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [statusChangeTarget, setStatusChangeTarget] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    dispatch(fetchAllRequests());
  }, [dispatch]);

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCancelConfirm = async () => {
    if (cancelTarget !== null) {
      await dispatch(adminCancelRequest({ id: cancelTarget, reason: cancelReason || undefined }));
      setCancelModalOpen(false);
      setCancelTarget(null);
      setCancelReason('');
    }
  };

  const handleStatusUpdate = async () => {
    if (statusChangeTarget !== null && newStatus) {
      await dispatch(updateRequestStatus({ id: statusChangeTarget, status: newStatus }));
      setStatusChangeTarget(null);
      setNewStatus('');
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold uppercase tracking-wider mb-2">
          <ClipboardList className="w-3.5 h-3.5" />
          Request Management
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Service Requests
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          View and manage all service requests across the platform
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, user, or service..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? 'All Statuses' : s}
            </option>
          ))}
        </select>

        <span className="text-xs font-semibold text-slate-400 ml-auto">
          {filteredRequests.length} request(s)
        </span>
      </div>

      {/* Table */}
      {isLoading && requests.length === 0 ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-xs uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Request</th>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.requestId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-900 text-xs truncate max-w-[200px]">
                          {req.title}
                        </p>
                        <span className="text-[11px] font-mono text-slate-400">#{req.requestId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{req.userName}</p>
                        <p className="text-[11px] text-slate-400">{req.userEmail}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs text-slate-600">{req.serviceName}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          statusColors[req.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(req.createdOn).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => dispatch(setSelectedRequest(req))}
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {req.status !== 'Completed' && req.status !== 'Cancelled' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setStatusChangeTarget(req.requestId);
                                setNewStatus('');
                              }}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                              title="Change Status"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCancelTarget(req.requestId);
                                setCancelModalOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Cancel Request"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRequests.length === 0 && (
            <div className="text-center py-16">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No service requests found</p>
            </div>
          )}
        </div>
      )}

      {/* Request Detail Modal */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => dispatch(setSelectedRequest(null))}
        title="Request Details"
        maxWidth="xl"
      >
        {selectedRequest && (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedRequest.title}</h3>
                <span className="text-xs font-mono text-slate-400">#{selectedRequest.requestId}</span>
              </div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  statusColors[selectedRequest.status] || 'bg-slate-100 text-slate-700'
                }`}
              >
                {selectedRequest.status}
              </span>
            </div>

            {selectedRequest.description && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</p>
                <p className="text-sm text-slate-700 leading-relaxed">{selectedRequest.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <DetailRow icon={User} label="User" value={`${selectedRequest.userName} (${selectedRequest.userEmail})`} />
              <DetailRow icon={ClipboardList} label="Service" value={selectedRequest.serviceName} />
              <DetailRow icon={MapPin} label="Address" value={selectedRequest.addressLine || 'N/A'} />
              <DetailRow icon={Clock} label="Created" value={formatDate(selectedRequest.createdOn)} />
              {selectedRequest.acceptedAt && (
                <DetailRow icon={CheckCircle2} label="Accepted" value={formatDate(selectedRequest.acceptedAt)} />
              )}
              {selectedRequest.completedAt && (
                <DetailRow icon={CheckCircle2} label="Completed" value={formatDate(selectedRequest.completedAt)} />
              )}
              {selectedRequest.cancelledAt && (
                <DetailRow icon={XCircle} label="Cancelled" value={`${formatDate(selectedRequest.cancelledAt)} by ${selectedRequest.cancelledBy || 'Unknown'}`} />
              )}
              {selectedRequest.cancellationReason && (
                <DetailRow icon={AlertCircle} label="Cancel Reason" value={selectedRequest.cancellationReason} />
              )}
              {selectedRequest.assignedWorkerId && (
                <DetailRow icon={User} label="Worker ID" value={String(selectedRequest.assignedWorkerId)} />
              )}
            </div>

            {/* Media */}
            {selectedRequest.imageUrls && selectedRequest.imageUrls.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <Image className="w-3 h-3" /> Photos ({selectedRequest.imageUrls.length})
                </p>
                <div className="flex gap-2 flex-wrap">
                  {selectedRequest.imageUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`Evidence ${i + 1}`}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 hover:border-purple-400 transition-colors"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {selectedRequest.audioUrl && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <Headphones className="w-3 h-3" /> Voice Note
                </p>
                <audio controls src={selectedRequest.audioUrl} className="w-full" />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setCancelTarget(null);
          setCancelReason('');
        }}
        title="Cancel Service Request"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to cancel this request? This action cannot be undone.
          </p>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Cancellation Reason (Optional)
            </label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Provide a reason for cancellation..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setCancelModalOpen(false);
                setCancelTarget(null);
                setCancelReason('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={handleCancelConfirm}
              className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        isOpen={statusChangeTarget !== null}
        onClose={() => {
          setStatusChangeTarget(null);
          setNewStatus('');
        }}
        title="Update Request Status"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              New Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select a status...</option>
              <option value="Pending">Pending</option>
              <option value="Searching">Searching</option>
              <option value="Accepted">Accepted</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setStatusChangeTarget(null);
                setNewStatus('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={!newStatus}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
            >
              Update Status
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const DetailRow: React.FC<{ icon: React.FC<any>; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-0.5">
      <Icon className="w-3 h-3" /> {label}
    </p>
    <p className="text-xs font-semibold text-slate-800">{value}</p>
  </div>
);
