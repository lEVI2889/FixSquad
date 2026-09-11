// Feature 4 (Customer Feedback & Text Review System) — Rohan (Week4_Rohan_CONTRACT.md)
import { useState } from 'react';
import api from '../services/api';

/**
 * ReviewFormModal
 * Props:
 *   bookingId  {number}   — the completed booking being reviewed
 *   onClose    {function} — called when modal should be dismissed
 *   onSuccess  {function} — called after a successful submission; parent refreshes state
 */
export default function ReviewFormModal({ bookingId, onClose, onSuccess }) {
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const MAX_CHARS = 1000;
  const MIN_CHARS = 20;
  const remaining = MAX_CHARS - reviewText.length;
  const isValid = reviewText.trim().length >= MIN_CHARS && reviewText.length <= MAX_CHARS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.post('/reviews', { booking_id: bookingId, review_text: reviewText.trim() });
      onSuccess();
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit review. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-slate-900">Write a Review</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500">
            Share your experience. Your honest feedback helps other customers and supports the provider.
          </p>

          <div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              maxLength={MAX_CHARS}
              placeholder="Describe the quality of the work, professionalism, punctuality…"
              className="w-full rounded-lg border border-gray-300 p-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              disabled={submitting}
            />
            {/* Character counter */}
            <div className="flex justify-between mt-1 text-xs">
              <span className={reviewText.trim().length < MIN_CHARS ? 'text-red-500' : 'text-green-600'}>
                {reviewText.trim().length < MIN_CHARS
                  ? `Minimum ${MIN_CHARS} characters required (${MIN_CHARS - reviewText.trim().length} more)`
                  : 'Minimum reached ✓'}
              </span>
              <span className={remaining < 50 ? 'text-orange-500 font-semibold' : 'text-gray-400'}>
                {remaining} / {MAX_CHARS} remaining
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
