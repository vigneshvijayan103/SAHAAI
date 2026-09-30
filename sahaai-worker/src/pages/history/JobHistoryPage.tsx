import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, XCircle, Clock, MapPin, Calendar, FileText, ChevronRight } from 'lucide-react';
import { workerApi } from '../../api/workerApi';
import type { WorkerJobDto } from '../../types/worker.types';

export const JobHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<WorkerJobDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await workerApi.getJobHistory();
        setHistory(res.data || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Service & Job History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review all your completed, active, and resolved emergency dispatches.</p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-400">
          Total Records: {history.length}
        </span>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-400">Loading history logs...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-sm font-semibold text-white mb-1">No Past Missions Found</p>
          <p className="text-xs text-slate-400">Accepted and completed service calls will be archived here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((job) => {
            const isCompleted = job.status === 'Completed';
            const isCancelled = job.status === 'Cancelled';

            return (
              <div
                key={job.requestId}
                className="bg-slate-900/80 hover:bg-slate-850/80 rounded-2xl border border-slate-800 p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isCancelled
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {job.status}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                      Req #{job.requestId}
                    </span>

                    <span className="text-xs font-bold text-amber-400">{job.serviceName}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{job.title}</h3>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                    <span>Customer: <strong className="text-slate-200">{job.customerName}</strong></span>
                    {job.addressLine && <span>&bull; {job.addressLine}</span>}
                    <span>
                      &bull;{' '}
                      {new Date(job.createdOn).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {job.cancellationReason && (
                    <p className="text-xs text-red-400 bg-red-500/5 p-2 rounded-lg border border-red-500/20">
                      Reason: {job.cancellationReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {job.completedAt && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      Completed at {new Date(job.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

