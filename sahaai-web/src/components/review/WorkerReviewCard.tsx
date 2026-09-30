import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { workerReviewApi } from '../../api/workerReviewApi';
import type { WorkerReviewDto } from '../../types/review.types';
import { Spinner } from '../common/Spinner';

interface WorkerReviewCardProps {
  requestId: number;
  workerName?: string;
  workerPhoto?: string;
  isCompleted: boolean;
}

export const WorkerReviewCard: React.FC<WorkerReviewCardProps> = ({
  requestId,
  workerName,
  workerPhoto,
  isCompleted,
}) => {
  const [existingReview, setExistingReview] = useState<WorkerReviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (requestId && isCompleted) {
      setLoading(true);
      workerReviewApi
        .getReviewByRequestId(requestId)
        .then((res) => {
          if (isMounted) {
            setExistingReview(res);
          }
        })
        .catch(() => {
          // No review found or error
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [requestId, isCompleted]);

  if (!isCompleted) return null;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-center py-8">
        <Spinner size="sm" />
      </div>
    );
  }

  const ratingLabels: Record<number, string> = {
    1: 'Poor Service',
    2: 'Needs Improvement',
    3: 'Average Service',
    4: 'Great Service',
    5: 'Excellent Service!',
  };

  const activeRating = hoverRating || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setSubmitError('Please select a star rating from 1 to 5.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const created = await workerReviewApi.submitReview({
        serviceRequestId: requestId,
        rating,
        reviewText: reviewText.trim() || undefined,
      });
      setExistingReview(created);
      setSubmitSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If a review already exists
  if (existingReview) {
    return (
      <div className="bg-gradient-to-br from-amber-50/60 to-emerald-50/60 p-6 rounded-3xl border border-amber-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-200">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Your Feedback</h3>
              <p className="text-[11px] text-slate-500">Submitted on {new Date(existingReview.createdOn).toLocaleDateString()}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Rated
          </span>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 space-y-3">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= existingReview.rating
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-slate-700 ml-2">
              {ratingLabels[existingReview.rating] || `${existingReview.rating} Stars`}
            </span>
          </div>

          {existingReview.reviewText ? (
            <p className="text-xs text-slate-700 italic bg-amber-50/40 p-3 rounded-xl border border-amber-100/60">
              "{existingReview.reviewText}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">No written comments provided.</p>
          )}

          <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-2">
            {workerPhoto && (
              <img src={workerPhoto} alt="" className="w-5 h-5 rounded-full object-cover" />
            )}
            <span>Technician: <strong className="text-slate-800">{existingReview.workerName || workerName || 'Worker'}</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // Submission Form
  return (
    <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden shadow-sm shadow-amber-200">
          {workerPhoto ? (
            <img src={workerPhoto} alt={workerName || 'Technician'} className="w-full h-full object-cover" />
          ) : (
            <Star className="w-5 h-5 fill-white" />
          )}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Rate {workerName ? workerName : 'Your Technician'}
          </h3>
          <p className="text-xs text-slate-500">
            How was your service experience? Your review helps maintain high quality standards.
          </p>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Thank you! Your rating has been submitted.
        </div>
      )}

      {submitError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Overall Rating
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= activeRating
                        ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                        : 'text-slate-200 hover:text-amber-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 ml-2">
              {ratingLabels[activeRating]}
            </span>
          </div>
        </div>

        {/* Written Review */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            Review Comments (Optional)
          </label>
          <textarea
            rows={3}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share details about the technician's punctuality, skill, behavior, or any feedback..."
            maxLength={1000}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all resize-none text-slate-800"
          />
          <div className="flex justify-end text-[10px] text-slate-400 mt-1">
            {reviewText.length}/1000
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Spinner size="sm" />
              Submitting Review...
            </>
          ) : (
            <>
              <Star className="w-4 h-4 fill-white" />
              Submit Rating & Review
            </>
          )}
        </button>
      </form>
    </div>
  );
};
