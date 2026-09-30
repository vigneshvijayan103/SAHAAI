import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Radio,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchServices, selectService } from '../../features/services/serviceSlice';
import { fetchAddresses } from '../../features/location/locationSlice';
import { fetchRequestHistory } from '../../features/serviceRequest/serviceRequestSlice';
import { Badge } from '../../components/common/Badge';

export const UserDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { services } = useAppSelector((state) => state.services);
  const { addresses } = useAppSelector((state) => state.location);
  const { history } = useAppSelector((state) => state.serviceRequest);

  useEffect(() => {
    dispatch(fetchServices());
    dispatch(fetchAddresses());
    dispatch(fetchRequestHistory());
  }, [dispatch]);

  // Find most recent active request (Pending, Searching, ExpandingRadius, Accepted, InProgress)
  const activeRequest = history.find((req) =>
    ['pending', 'searching', 'expandingradius', 'accepted', 'inprogress'].includes(
      req.status.toLowerCase()
    )
  );

  const completedCount = history.filter((r) => r.status.toLowerCase() === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-xs font-semibold mb-4 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            24/7 Rapid Emergency Dispatch Network
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
            Hello, {user?.userName || 'Customer'}!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Facing an emergency? Sahaai connects you directly with nearby certified professionals within
            minutes using GPS radar dispatch.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/request/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-bold text-sm shadow-lg shadow-black/20 hover:scale-105 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              Request Emergency Assistance
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md transition-colors"
            >
              Explore All Services
            </Link>
          </div>
        </div>
      </div>

      {/* Active Request Alert (If any) */}
      {activeRequest && (
        <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-200 text-amber-800 rounded-xl mt-0.5">
              <Radio className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Active Dispatch #{activeRequest.requestId}
                </span>
                <Badge status={activeRequest.status} />
              </div>
              <h4 className="text-base font-bold text-slate-900">{activeRequest.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Submitted on {new Date(activeRequest.createdOn).toLocaleString()}
              </p>
            </div>
          </div>

          <Link
            to={`/request/${activeRequest.requestId}`}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow transition-colors"
          >
            Track Live Radar
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Requests</p>
            <h3 className="text-2xl font-black text-slate-800">{history.length}</h3>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-black text-slate-800">{completedCount}</h3>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Addresses</p>
            <h3 className="text-2xl font-black text-slate-800">{addresses.length}</h3>
          </div>
        </div>
      </div>

      {/* Instant Services Dispatch Grid */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rapid Services</h2>
            <p className="text-xs text-slate-500">Select a category to dispatch a professional immediately</p>
          </div>
          <Link
            to="/services"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            View all catalog <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.slice(0, 6).map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                <img
                  src={service.imageUrl || 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&auto=format&fit=crop&q=80'}
                  alt={service.serviceName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-emerald-700 shadow">
                    Active Dispatch
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {service.serviceName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {service.description || 'Emergency verified on-site service support.'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                    Verified pros
                  </span>

                  <Link
                    to={`/request/new?serviceId=${service.id}`}
                    onClick={() => dispatch(selectService(service))}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Request Now <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Requests Section */}
      {history.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Recent Service Activity</h3>
            <Link to="/history" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
              View All History →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {history.slice(0, 4).map((item) => (
              <div
                key={item.requestId}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-semibold text-slate-400">
                      #{item.requestId}
                    </span>
                    <Badge status={item.status} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdOn).toLocaleString()}
                  </span>
                </div>

                <Link
                  to={`/request/${item.requestId}`}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-center"
                >
                  View Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
