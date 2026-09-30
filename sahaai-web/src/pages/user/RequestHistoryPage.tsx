import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, PlusCircle, Search, ChevronRight, Calendar, Radio, FileText, CheckCircle2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchRequestHistory } from '../../features/serviceRequest/serviceRequestSlice';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';

export const RequestHistoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { history, isLoading } = useAppSelector((state) => state.serviceRequest);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchRequestHistory());
  }, [dispatch]);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestId.toString().includes(searchTerm);
    const matchesStatus =
      filterStatus === 'all' || item.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Service Request History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and review all previous and ongoing emergency requests
          </p>
        </div>

        <Link
          to="/request/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          New Request
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or #ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'searching', 'accepted', 'inprogress', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'inprogress' ? 'In Progress' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Service Requests Found</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            {history.length === 0
              ? 'You have not raised any emergency assistance requests yet.'
              : 'No requests match your selected filters.'}
          </p>
          {history.length === 0 && (
            <Link
              to="/request/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Raise Your First Request
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {filteredHistory.map((item) => {
            const isCompleted = item.status.toLowerCase() === 'completed';
            const isCancelled = item.status.toLowerCase() === 'cancelled';
            const isLive = !isCompleted && !isCancelled;

            return (
              <Link
                key={item.requestId}
                to={`/request/${item.requestId}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group block"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{item.requestId}
                    </span>
                    <Badge status={item.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.createdOn).toLocaleString()}
                    </span>
                    {item.completedAt && (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Completed: {new Date(item.completedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white text-xs font-bold transition-all shadow-sm">
                      <FileText className="w-3.5 h-3.5" />
                      View Details
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  ) : isLive ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white text-xs font-bold transition-all shadow-sm">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      Track Live
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-slate-200 text-xs font-bold transition-all">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      View Details
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

