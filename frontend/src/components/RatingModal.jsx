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
    <div className="booking-modal-overlay" onClick={onClose}>
      <div 
        className="booking-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="modal-header">
          <p className="eyebrow" style={{ marginBottom: '8px' }}>
            <span /> Customer Review & Quality
          </p>
          <h2 style={{ margin: '0 0 8px' }}>Rate Your Service</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', margin: '0 0 20px' }}>
            How was your experience with <strong style={{ color: 'var(--ink)' }}>{booking.provider_name}</strong> for <span style={{ color: 'var(--forest)', fontWeight: 600 }}>{booking.service_name}</span>?
          </p>
        </div>

        {error && (
          <div className="form-alert" role="alert">
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            padding: '12px 16px',
            background: '#eef8f3',
            color: '#123f36',
            border: '1px solid #bce6d4',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.88rem',
            marginBottom: '16px'
          }}>
            ✓ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label className="brand-label" style={{ textAlign: 'center', marginBottom: '10px' }}>
              Select Rating (1 to 5 Stars)
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    transition: 'transform 0.15s ease'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.2)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <svg
                    style={{
                      width: '36px',
                      height: '36px',
                      color: star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db',
                      fill: star <= (hoverRating || rating) ? '#f59e0b' : '#e5e7eb',
                      transition: 'color 0.15s ease, fill 0.15s ease'
                    }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              ))}
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#b45309', margin: '8px 0 0' }}>
              {rating === 5 && 'Outstanding! 🌟'}
              {rating === 4 && 'Very Good! 👍'}
              {rating === 3 && 'Average 👌'}
              {rating === 2 && 'Below Expectations 👎'}
              {rating === 1 && 'Poor Experience 😞'}
            </p>
          </div>

          <div>
            <label htmlFor="comment" className="brand-label">
              Feedback & Comments (Optional)
            </label>
            <textarea
              id="comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you liked or how the provider can improve..."
              className="brand-textarea"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="button button--ghost"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || successMsg}
              className="button button--primary"
              style={{ flex: 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
