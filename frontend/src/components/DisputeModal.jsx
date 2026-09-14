import React, { useState } from 'react';
import { submitDispute } from '../services/bookingApi';

const DISPUTE_REASONS = [
  'Incomplete Work',
  'Subpar Quality of Service',
  'Damage to Property',
  'Pricing Discrepancy / Overcharge',
  'Unprofessional Conduct',
  'Other Issue'
];

export default function DisputeModal({ booking, onClose, onDisputeSubmitted }) {
  const [reason, setReason] = useState(DISPUTE_REASONS[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a detailed description of the issue.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await submitDispute({
        booking_id: booking.id,
        reason,
        description
      });
      setSuccessMsg(res.message || 'Dispute ticket submitted successfully!');
      setTimeout(() => {
        if (onDisputeSubmitted) onDisputeSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit dispute ticket');
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
          <p className="eyebrow" style={{ marginBottom: '8px', color: '#c94c32' }}>
            <span style={{ background: '#c94c32' }} /> Dispute & Escalation
          </p>
          <h2 style={{ margin: '0 0 8px' }}>File a Dispute Ticket</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', margin: '0 0 20px' }}>
            Opening resolution ticket for booking <strong style={{ color: 'var(--ink)' }}>#{booking.id}</strong> ({booking.service_name}).
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="reason" className="brand-label">
              Primary Reason <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="brand-select"
            >
              {DISPUTE_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="brand-label">
              Detailed Description <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain clearly what went wrong so our resolution team can review and take action..."
              className="brand-textarea"
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
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
              style={{
                flex: 1,
                minHeight: '44px',
                borderRadius: '12px',
                background: '#c94c32',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'background .2s',
                opacity: loading || successMsg ? 0.6 : 1
              }}
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
