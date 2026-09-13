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
    <div className="booking-modal-overlay" onClick={onClose}>
      <div 
        className="booking-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '520px' }}
      >
        <button 
          type="button" 
          className="modal-close-btn" 
          onClick={onClose} 
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="modal-header">
          <p className="eyebrow" style={{ marginBottom: '8px' }}>
            <span /> Customer Feedback
          </p>
          <h2 style={{ margin: '0 0 8px' }}>Write a Review</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.92rem', margin: '0 0 20px' }}>
            Share your experience. Your honest feedback helps other customers and supports verified providers across FixSquad.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              maxLength={MAX_CHARS}
              placeholder="Describe the quality of the work, professionalism, punctuality…"
              className="brand-textarea"
              disabled={submitting}
            />
            {/* Character counter */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.78rem' }}>
              <span style={{ color: reviewText.trim().length < MIN_CHARS ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                {reviewText.trim().length < MIN_CHARS
                  ? `Minimum ${MIN_CHARS} characters required (${MIN_CHARS - reviewText.trim().length} more)`
                  : 'Minimum reached ✓'}
              </span>
              <span style={{ color: remaining < 50 ? '#ea580c' : '#8c9c97', fontWeight: 600 }}>
                {remaining} / {MAX_CHARS} remaining
              </span>
            </div>
          </div>

          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="button button--ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="button button--primary"
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
