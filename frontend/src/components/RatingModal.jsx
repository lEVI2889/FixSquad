import React, { useState } from 'react';
import { submitReview } from '../services/bookingApi';

export default function RatingModal({ booking, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await submitReview({
        booking_id: booking.id,
        rating,
        comment
      });
      setSuccessMsg(res.message || 'Review submitted successfully!');
      setTimeout(() => {
        if (onReviewSubmitted) onReviewSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit review');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-1">Rate Your Service</h2>
        <p className="text-sm text-slate-500 mb-6">
          How was your experience with <span className="font-semibold text-slate-700">{booking.provider_name}</span> for <span className="font-semibold text-slate-700">{booking.service_name}</span>?
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100 font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 text-center">
              Select Rating (1 to 5 Stars)
            </label>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform transform hover:scale-110 focus:outline-none"
                >
                  <svg
                    className={`w-9 h-9 ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-200 fill-slate-200'
                    } transition-colors`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-center text-xs font-semibold text-amber-600 mt-2">
              {rating === 5 && 'Outstanding! 🌟'}
              {rating === 4 && 'Very Good! 👍'}
              {rating === 3 && 'Average 👌'}
              {rating === 2 && 'Below Expectations 👎'}
              {rating === 1 && 'Poor Experience 😞'}
            </p>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-semibold text-slate-700 mb-2">
              Feedback & Comments (Optional)
            </label>
            <textarea
              id="comment"
              rows="3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or how the provider can improve..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-800 placeholder-slate-400 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || successMsg}
              className="flex-1 py-2.5 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors text-sm shadow-sm"
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
