import React, { useEffect, useState, useMemo } from 'react';
import {
  Star,
  Search,
  Users,
  Award,
  MessageSquare,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Phone,
  UserCheck,
} from 'lucide-react';
import { workerReviewApi } from '../../api/workerReviewApi';
import type { WorkerReviewDto, WorkerRatingSummaryDto } from '../../types/review.types';
import { Spinner } from '../../components/common/Spinner';

export const AdminWorkerReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<WorkerReviewDto[]>([]);
  const [summaries, setSummaries] = useState<WorkerRatingSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | 'All'>('All');
  const [selectedRating, setSelectedRating] = useState<number | 'All'>('All');

  const fetchData = async () => {
    try {
      setError(null);
      const [allReviews, workerSummaries] = await Promise.all([
        workerReviewApi.getAllReviews(),
        workerReviewApi.getWorkerRatingSummaries(),
      ]);
      setReviews(allReviews);
      setSummaries(workerSummaries);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch worker reviews and ratings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Metrics Calculations
  const totalReviews = reviews.length;
  const averageOverallRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : '0.0';
  const highSatisfactionCount = reviews.filter((r) => r.rating >= 4).length;
  const satisfactionRate =
    totalReviews > 0 ? Math.round((highSatisfactionCount / totalReviews) * 100) : 0;
  const totalRatedWorkers = summaries.length;

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Worker filter
      if (selectedWorkerId !== 'All' && r.workerUserId !== selectedWorkerId) {
        return false;
      }
      // Star rating filter
      if (selectedRating !== 'All' && r.rating !== selectedRating) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const customerMatch = r.customerName?.toLowerCase().includes(query);
        const workerMatch = r.workerName?.toLowerCase().includes(query);
        const textMatch = r.reviewText?.toLowerCase().includes(query);
        const titleMatch = r.serviceTitle?.toLowerCase().includes(query);
        return customerMatch || workerMatch || textMatch || titleMatch;
      }
      return true;
    });
  }, [reviews, selectedWorkerId, selectedRating, searchTerm]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-200">
              <Star className="w-5 h-5 fill-white" />
            </span>
            Worker Ratings & Reviews
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor technician performance, customer feedback, and service quality ratings across all completed jobs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-600' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Rating</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className="w-4 h-4 fill-amber-500" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{averageOverallRating}</span>
            <span className="text-xs font-semibold text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Based on {totalReviews} customer reviews</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Reviews</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalReviews}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified customer submissions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rated Technicians</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalRatedWorkers}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Workers with client ratings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Satisfaction Rate</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{satisfactionRate}%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Rated 4 or 5 stars</p>
        </div>
      </div>

      {/* Technician Rating Cards Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              Technician Performance Scorecards
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click on any technician to filter their detailed customer reviews below.
            </p>
          </div>
          {selectedWorkerId !== 'All' && (
            <button
              type="button"
              onClick={() => setSelectedWorkerId('All')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear Worker Filter
            </button>
          )}
        </div>

        {summaries.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No technicians have received ratings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {summaries.map((worker) => {
              const isSelected = selectedWorkerId === worker.workerUserId;
              return (
                <div
                  key={worker.workerUserId}
                  onClick={() =>
                    setSelectedWorkerId(isSelected ? 'All' : worker.workerUserId)
                  }
                  className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-200 shadow-sm'
                      : 'border-slate-200 hover:border-purple-300 hover:shadow-sm bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                        {worker.workerPhotoUrl ? (
                          <img
                            src={worker.workerPhotoUrl}
                            alt={worker.workerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserCheck className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {worker.workerName}
                        </h4>
                        {worker.workerPhone && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            {worker.workerPhone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/70 rounded-lg text-xs font-black">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {worker.averageRating.toFixed(1)}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                        {worker.totalReviews} {worker.totalReviews === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Breakdown Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                      <span>5★: {worker.star5Count}</span>
                      <span>4★: {worker.star4Count}</span>
                      <span>3★: {worker.star3Count}</span>
                      <span>2★: {worker.star2Count}</span>
                      <span>1★: {worker.star1Count}</span>
                    </div>
                    {/* Mini proportional bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{
                          width: `${(worker.star5Count / (worker.totalReviews || 1)) * 100}%`,
                        }}
                        title={`5 Stars: ${worker.star5Count}`}
                      />
                      <div
                        className="bg-teal-400 h-full"
                        style={{
                          width: `${(worker.star4Count / (worker.totalReviews || 1)) * 100}%`,
                        }}
                        title={`4 Stars: ${worker.star4Count}`}
                      />
                      <div
                        className="bg-amber-400 h-full"
                        style={{
                          width: `${(worker.star3Count / (worker.totalReviews || 1)) * 100}%`,
                        }}
                        title={`3 Stars: ${worker.star3Count}`}
                      />
                      <div
                        className="bg-orange-400 h-full"
                        style={{
                          width: `${(worker.star2Count / (worker.totalReviews || 1)) * 100}%`,
                        }}
                        title={`2 Stars: ${worker.star2Count}`}
                      />
                      <div
                        className="bg-rose-500 h-full"
                        style={{
                          width: `${(worker.star1Count / (worker.totalReviews || 1)) * 100}%`,
                        }}
                        title={`1 Star: ${worker.star1Count}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter and Reviews Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Controls Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Customer Reviews ({filteredReviews.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed feedback and ratings submitted upon service completion
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews, workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Filter by Worker */}
            <select
              value={selectedWorkerId}
              onChange={(e) =>
                setSelectedWorkerId(
                  e.target.value === 'All' ? 'All' : parseInt(e.target.value, 10)
                )
              }
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Technicians</option>
              {summaries.map((w) => (
                <option key={w.workerUserId} value={w.workerUserId}>
                  {w.workerName}
                </option>
              ))}
            </select>

            {/* Filter by Star Rating */}
            <select
              value={selectedRating}
              onChange={(e) =>
                setSelectedRating(
                  e.target.value === 'All' ? 'All' : parseInt(e.target.value, 10)
                )
              }
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Star Ratings</option>
              <option value={5}>5 Stars (★★★★★)</option>
              <option value={4}>4 Stars (★★★★)</option>
              <option value={3}>3 Stars (★★★)</option>
              <option value={2}>2 Stars (★★)</option>
              <option value={1}>1 Star (★)</option>
            </select>
          </div>
        </div>

        {/* Reviews Table / List */}
        {filteredReviews.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No Reviews Match Filters</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or selecting a different technician.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReviews.map((rev) => (
              <div key={rev.id} className="py-4.5 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Stars */}
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= rev.rating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {rev.rating}.0
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500">
                      Request #{rev.serviceRequestId}: <strong className="text-slate-700">{rev.serviceTitle}</strong>
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(rev.createdOn).toLocaleDateString()} at{' '}
                    {new Date(rev.createdOn).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Review Text */}
                {rev.reviewText ? (
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    "{rev.reviewText}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No additional written review.</p>
                )}

                {/* Customer & Worker Attribution */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                  <div>
                    Customer:{' '}
                    <strong className="text-slate-800 font-semibold">{rev.customerName}</strong>
                    {rev.customerPhone && <span className="text-slate-400 ml-1">({rev.customerPhone})</span>}
                  </div>
                  <span className="text-slate-300">•</span>
                  <div>
                    Technician:{' '}
                    <strong className="text-purple-700 font-semibold">{rev.workerName}</strong>
                    {rev.workerPhone && <span className="text-slate-400 ml-1">({rev.workerPhone})</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

