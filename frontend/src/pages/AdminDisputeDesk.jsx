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
      className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all
        ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {isSuccess ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
      {toast.message}
    </div>
  );
}

// ─── Single Dispute Row ───────────────────────────────────────────────────────
function DisputeRow({ dispute, onResolve, resolving }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm font-mono text-gray-500">#{dispute.id}</td>
      <td className="px-4 py-3">
        <div className="font-semibold text-slate-800 text-sm">{dispute.service_name}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-700">{dispute.customer_name}</div>
        <div className="text-xs text-gray-400">{dispute.customer_email}</div>
      </td>
      <td className="px-4 py-3">
        <div className="text-sm text-slate-700">{dispute.provider_name}</div>
        <div className="text-xs text-gray-400">{dispute.provider_email}</div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatDate(dispute.scheduled_date)} at {dispute.scheduled_time}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-indigo-700">
        ${Number(dispute.total_price).toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <AlertTriangle size={11} /> Disputed
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mark Completed */}
          <button
            disabled={resolving === dispute.id}
            onClick={() => onResolve(dispute.id, 'Completed')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 transition-colors"
            title="Mark as Completed"
          >
            <CheckCircle2 size={13} /> Complete
          </button>

          {/* Cancel & Refund */}
          <button
            disabled={resolving === dispute.id}
            onClick={() => onResolve(dispute.id, 'Cancelled')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 transition-colors"
            title="Cancel & Refund"
          >
            <XCircle size={13} /> Cancel
          </button>

          {/* Reopen */}
          <button
            disabled={resolving === dispute.id}
            onClick={() => onResolve(dispute.id, 'In-Progress')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 disabled:opacity-50 transition-colors"
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
    <div className="min-h-screen bg-gray-50 p-6">
      <Toast toast={toast} />

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <ShieldAlert className="text-red-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dispute Resolution Desk</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Admin override — forcefully resolve disputed bookings
            </p>
          </div>
        </div>
        <button
          onClick={loadDisputes}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Stats Banner ──────────────────────────────────────────────── */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
        <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
        <span className="text-sm text-red-700 font-medium">
          {loading ? 'Loading…' : `${disputes.length} dispute${disputes.length !== 1 ? 's' : ''} require${disputes.length === 1 ? 's' : ''} admin attention.`}
        </span>
      </div>

      {/* ── Error State ────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* ── Loading Skeleton ───────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : disputes.length === 0 ? (
        /* ── Empty State ──────────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <CheckCircle2 size={48} className="mb-3 text-green-400" />
          <p className="text-lg font-semibold text-slate-600">No active disputes</p>
          <p className="text-sm mt-1">All bookings are resolved. Great job!</p>
        </div>
      ) : (
        /* ── Disputes Table ───────────────────────────────────────────── */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Scheduled</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
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
  );
}
