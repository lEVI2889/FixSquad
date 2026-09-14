import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, RotateCcw, RefreshCw, ShieldAlert } from 'lucide-react';
import { fetchDisputedBookings, resolveDispute } from '../services/api';

// ─── Helper: format ISO date string into a readable local date ────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 100,
        padding: '14px 20px',
        borderRadius: '12px',
        fontSize: '0.9rem',
        fontWeight: 600,
        background: !isSuccess ? '#fff1ed' : '#174d42',
        color: !isSuccess ? '#9c3a27' : '#d7f7eb',
        border: `1px solid ${!isSuccess ? '#f0bbae' : '#278b6a'}`,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      {isSuccess ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      <span>{toast.message}</span>
    </div>
  );
}

// ─── Single Dispute Row ───────────────────────────────────────────────────────
function DisputeRow({ dispute, onResolve, resolving }) {
  return (
    <tr>
      <td>
        <span style={{
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          color: 'var(--ink-soft)',
          background: '#f4f6f4',
          padding: '2px 6px',
          borderRadius: '6px',
          border: '1px solid var(--line)'
        }}>
          #{dispute.id}
        </span>
      </td>
      <td>
        <strong style={{ color: 'var(--ink)', fontSize: '0.92rem', display: 'block' }}>{dispute.service_name}</strong>
      </td>
      <td>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)' }}>{dispute.customer_name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{dispute.customer_email}</div>
      </td>
      <td>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)' }}>{dispute.provider_name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{dispute.provider_email}</div>
      </td>
      <td style={{ color: 'var(--ink-soft)', fontSize: '0.86rem' }}>
        {formatDate(dispute.scheduled_date)} at {dispute.scheduled_time}
      </td>
      <td>
        <strong style={{ color: 'var(--forest)', fontSize: '1rem', fontWeight: 800 }}>
          ৳{Number(dispute.total_price).toFixed(2)}
        </strong>
      </td>
      <td>
        <span className="badge badge--disputed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={11} /> Disputed
        </span>
      </td>
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {/* Mark Completed */}
          <button
            type="button"
            disabled={resolving === dispute.id}
            onClick={() => onResolve(dispute.id, 'Completed')}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: '#eef8f3',
              color: '#278b6a',
              border: '1px solid #bce6d4',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background 0.15s'
            }}
            title="Mark as Completed"
          >
            <CheckCircle2 size={13} /> Complete
          </button>

          {/* Cancel & Refund */}
          <button
            type="button"
            disabled={resolving === dispute.id}
            onClick={() => onResolve(dispute.id, 'Cancelled')}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: '#fff1ed',
              color: '#c94c32',
              border: '1px solid #f0bbae',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background 0.15s'
            }}
            title="Cancel & Refund"
          >
            <XCircle size={13} /> Cancel
          </button>

          {/* Reopen */}
          <button
            type="button"
            disabled={resolving === dispute.id}
            onClick={() => onResolve(dispute.id, 'In-Progress')}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background 0.15s'
            }}
            title="Reopen job for provider"
          >
            <RotateCcw size={13} /> Reopen
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDisputeDesk() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [resolving, setResolving] = useState(null); // booking id currently being resolved

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadDisputes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetchDisputedBookings();
      if (res.success) {
        setDisputes(res.data);
      } else {
        setError(res.message || 'Failed to load disputes.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to the backend server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const handleResolve = async (id, status) => {
    setResolving(id);
    try {
      const res = await resolveDispute(id, status);
      if (res.success) {
        showToast(res.message, 'success');
        // Remove resolved dispute from the local list immediately
        setDisputes(prev => prev.filter(d => d.id !== id));
      } else {
        showToast(res.message || 'Failed to resolve dispute.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Server error while resolving dispute.', 'error');
    } finally {
      setResolving(null);
    }
  };

  return (
    <section className="dashboard-page">
      <div className="container">
        <Toast toast={toast} />

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <p className="eyebrow"><span /> Resolution & Mediation</p>
            <h1 style={{ 
              fontFamily: 'Manrope, sans-serif', 
              fontSize: 'clamp(2rem, 4vw, 2.8rem)', 
              fontWeight: 800, 
              letterSpacing: '-0.04em', 
              margin: '0 0 8px',
              color: 'var(--ink)'
            }}>
              Dispute Resolution Desk
            </h1>
            <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '1rem' }}>
              Administrative override — review customer escalation tickets and forcefully update booking states or issue refunds.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDisputes}
            disabled={loading}
            className="button button--ghost"
            style={{ minHeight: '42px', padding: '0 16px', fontSize: '0.88rem' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh Desk
          </button>
        </div>

        {/* ── Stats Banner ──────────────────────────────────────────────── */}
        <div style={{
          background: disputes.length > 0 ? '#fff1ed' : '#eef8f3',
          border: `1px solid ${disputes.length > 0 ? '#f0bbae' : '#bce6d4'}`,
          borderRadius: '14px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <AlertTriangle style={{ color: disputes.length > 0 ? '#c94c32' : '#278b6a' }} size={20} />
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: disputes.length > 0 ? '#9c3a27' : '#123f36' }}>
            {loading ? 'Checking dispute tickets…' : `${disputes.length} dispute ticket${disputes.length !== 1 ? 's' : ''} require${disputes.length === 1 ? 's' : ''} administrative resolution.`}
          </span>
        </div>

        {/* ── Error State ────────────────────────────────────────────────── */}
        {error && (
          <div className="form-alert" role="alert" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* ── Loading Skeleton ───────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Loading active dispute cases...</p>
          </div>
        ) : disputes.length === 0 ? (
          /* ── Empty State ──────────────────────────────────────────────── */
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'white',
            borderRadius: '20px',
            border: '1px solid var(--line)',
            boxShadow: '0 4px 20px rgba(18, 63, 54, 0.04)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'var(--mint-pale)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
              color: 'var(--forest)'
            }}>
              <CheckCircle2 size={30} aria-hidden="true" />
            </div>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--ink)' }}>
              All Disputes Cleared
            </h3>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto', fontSize: '0.92rem' }}>
              There are currently zero open customer or provider dispute escalation tickets requiring admin review.
            </p>
          </div>
        ) : (
          /* ── Disputes Table ───────────────────────────────────────────── */
          <div className="brand-table-wrap">
            <table className="brand-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Provider</th>
                  <th>Scheduled</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map(dispute => (
                  <DisputeRow
                    key={dispute.id}
                    dispute={dispute}
                    onResolve={handleResolve}
                    resolving={resolving}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
