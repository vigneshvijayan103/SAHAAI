import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Wrench,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchDashboardStats } from '../../features/admin/adminSlice';
import { Spinner } from '../../components/common/Spinner';

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

export const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, isLoading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        {error}
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100',
      link: '/admin/users',
    },
    {
      label: 'Total Services',
      value: stats?.totalServices ?? 0,
      icon: Wrench,
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100',
      link: '/admin/services',
    },
    {
      label: 'Active Requests',
      value: stats?.activeRequests ?? 0,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
      iconBg: 'bg-amber-100',
      link: '/admin/requests',
    },
    {
      label: 'Completed',
      value: stats?.completedRequests ?? 0,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600',
      iconBg: 'bg-emerald-100',
      link: '/admin/requests',
    },
    {
      label: 'Cancelled',
      value: stats?.cancelledRequests ?? 0,
      icon: XCircle,
      color: 'bg-rose-50 text-rose-600',
      iconBg: 'bg-rose-100',
      link: '/admin/requests',
    },
    {
      label: 'New This Month',
      value: stats?.newUsersThisMonth ?? 0,
      icon: UserPlus,
      color: 'bg-teal-50 text-teal-600',
      iconBg: 'bg-teal-100',
      link: '/admin/users',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Platform overview and key performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow group"
            >
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${card.color.split(' ')[1]}`} />
              </div>
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{card.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Status Breakdown & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Requests by Status</h3>
          <div className="space-y-2.5">
            {stats?.requestsByStatus &&
              Object.entries(stats.requestsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      statusColors[status] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {status}
                  </span>
                  <span className="text-sm font-bold text-slate-700">{count}</span>
                </div>
              ))}
            {(!stats?.requestsByStatus || Object.keys(stats.requestsByStatus).length === 0) && (
              <p className="text-xs text-slate-400 italic">No request data available</p>
            )}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800">Recent Service Requests</h3>
            <Link
              to="/admin/requests"
              className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recentRequests && stats.recentRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="pb-2.5 pr-4">Title</th>
                    <th className="pb-2.5 pr-4">User</th>
                    <th className="pb-2.5 pr-4">Service</th>
                    <th className="pb-2.5 pr-4">Status</th>
                    <th className="pb-2.5">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats.recentRequests.map((req) => (
                    <tr key={req.requestId} className="hover:bg-slate-50/50">
                      <td className="py-2.5 pr-4">
                        <p className="text-xs font-semibold text-slate-800 truncate max-w-[160px]">
                          {req.title}
                        </p>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-slate-600">{req.userName}</td>
                      <td className="py-2.5 pr-4 text-xs text-slate-600">{req.serviceName}</td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            statusColors[req.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(req.createdOn).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No recent requests</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats?.totalRequests ?? 0}</p>
              <p className="text-xs text-slate-500">Total Requests (All Time)</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats?.pendingRequests ?? 0}</p>
              <p className="text-xs text-slate-500">Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats?.completedRequests ?? 0}</p>
              <p className="text-xs text-slate-500">Completed Requests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

