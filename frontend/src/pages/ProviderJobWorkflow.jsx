import { useEffect, useState } from 'react';
import { MessageSquare, Calendar, ClipboardList } from 'lucide-react';
import MessagingModal from '../components/MessagingModal';
import { fetchProviderBookings, updateBookingStatus } from '../services/bookingApi';

// Mirrors the backend's VALID_TRANSITIONS in controllers/bookingController.js.
// Each entry is the button label paired with the status it moves the
// booking to next.
const ACTIONS_BY_STATUS = {
  Pending: [
    { label: 'Accept', next: 'Accepted' },
    { label: 'Reject', next: 'Rejected' }
  ],
  Accepted: [
    { label: 'Start Job', next: 'In-Progress' },
    { label: 'Cancel', next: 'Cancelled' }
  ],
  'In-Progress': [
    { label: 'Mark Completed', next: 'Completed' },
    { label: 'Report Dispute', next: 'Disputed' }
  ]
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
}

export default function ProviderJobWorkflow() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [activeMessageBookingId, setActiveMessageBookingId] = useState(null);

  const loadBookings = () => {
    setLoading(true);
    return fetchProviderBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAction = async (bookingId, nextStatus) => {
    setUpdatingId(bookingId);
    setError(null);
    try {
      await updateBookingStatus(bookingId, nextStatus);
      await loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--ink-soft)', fontWeight: 600, marginTop: '12px' }}>Loading active job workflows...</p>
        </div>
      </section>
    );
  }

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge badge--pending';
      case 'Accepted': return 'badge badge--accepted';
      case 'In-Progress': return 'badge badge--in-progress';
      case 'Completed': return 'badge badge--completed';
      case 'Cancelled': return 'badge badge--cancelled';
      case 'Disputed': return 'badge badge--disputed';
      case 'Rejected': return 'badge badge--rejected';
      default: return 'badge badge--pending';
    }
  };

  return (
    <section className="dashboard-page">
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <p className="eyebrow"><span /> Execution & Stages</p>
            <h1 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(2rem, 3.5vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              margin: '0 0 8px',
              color: 'var(--ink)'
            }}>
              Job Workflow Controller
            </h1>
            <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '0.98rem' }}>
              Transition accepted jobs through active service stages and manage execution status in real-time.
            </p>
          </div>
          <span className="badge badge--accepted" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            {bookings.length} Total Jobs
          </span>
        </div>
        
        {error && <div className="form-alert" role="alert" style={{ marginBottom: '24px' }}>{error}</div>}

        {bookings.length === 0 && (
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
              <ClipboardList size={30} aria-hidden="true" />
            </div>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--ink)' }}>
              No Active Jobs
            </h3>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '440px', margin: '0 auto', fontSize: '0.92rem' }}>
              When you accept incoming customer booking requests, they will transition here to manage execution from Accepted to In-Progress and Completed.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map((booking) => {
            const actions = ACTIONS_BY_STATUS[booking.status] || [];
            return (
              <div 
                key={booking.id} 
                style={{
                  background: 'white',
                  border: '1px solid var(--line)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  boxShadow: '0 2px 10px rgba(18, 63, 54, 0.03)',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                        {booking.service_name}
                      </h2>
                      <span className={getBadgeClass(booking.status)}>
                        {booking.status}
                      </span>
                    </div>
                    <div style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', marginBottom: '10px' }}>
                      Customer: <strong style={{ color: 'var(--ink)' }}>{booking.customer_name}</strong>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#f4f8f6',
                        color: 'var(--forest)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 600
                      }}>
                        <Calendar size={14} style={{ flexShrink: 0 }} aria-hidden="true" />
                        {formatDate(booking.scheduled_date)} at {booking.scheduled_time}
                      </span>
                      {booking.total_price != null && (
                        <span style={{
                          background: 'var(--mint-pale)',
                          color: 'var(--forest)',
                          fontWeight: 800,
                          fontSize: '0.86rem',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #bce6d4'
                        }}>
                          ৳{Number(booking.total_price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions column */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                    {(booking.status === 'Accepted' || booking.status === 'In-Progress') && (
                      <button
                        type="button"
                        onClick={() => setActiveMessageBookingId(booking.id)}
                        className="button button--ghost"
                        style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <MessageSquare size={14} aria-hidden="true" /> Message Customer
                      </button>
                    )}
                    {actions.map((action) => {
                      const isDestructive = action.next === 'Rejected' || action.next === 'Cancelled' || action.next === 'Disputed';
                      return (
                        <button
                          key={action.next}
                          type="button"
                          disabled={updatingId === booking.id}
                          className={isDestructive ? 'button' : 'button button--primary'}
                          style={isDestructive ? {
                            padding: '8px 16px',
                            fontSize: '0.85rem',
                            background: '#fff1ed',
                            color: '#c94c32',
                            border: '1px solid #f0bbae',
                            borderRadius: '10px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          } : {
                            padding: '8px 18px',
                            fontSize: '0.85rem'
                          }}
                          onClick={() => handleAction(booking.id, action.next)}
                        >
                          {updatingId === booking.id ? 'Updating...' : action.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {activeMessageBookingId && <MessagingModal bookingId={activeMessageBookingId} onClose={() => setActiveMessageBookingId(null)} />}
      </div>
    </section>
  );
}
