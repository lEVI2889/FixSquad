import { useEffect, useState } from 'react';
import { 
  Clock, CheckCircle, Zap, CheckCheck, MessageSquare, 
  Star, FileText, AlertTriangle, Calendar 
} from 'lucide-react';
import api from '../services/api';
import MessagingModal from '../components/MessagingModal';
import RatingModal from '../components/RatingModal';
import DisputeModal from '../components/DisputeModal';
import { fetchCustomerBookings, cancelCustomerBooking } from '../services/bookingApi';
import { respondToQuote } from '../services/api';

const COLUMNS = ['Pending', 'Accepted', 'In-Progress', 'Completed'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
}

function BookingCard({ booking, onMessage, onInvoice, onCancel, onRate, onDispute, onQuoteResponse }) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancelClick = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    setCancelling(true);
    try {
      await onCancel(booking.id);
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge badge--pending';
      case 'Accepted': return 'badge badge--accepted';
      case 'In-Progress': return 'badge badge--in-progress';
      case 'Completed': return 'badge badge--completed';
      case 'Cancelled': return 'badge badge--cancelled';
      case 'Disputed': return 'badge badge--disputed';
      default: return 'badge badge--pending';
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-card__top">
        <h3 className="booking-card__title">{booking.service_name}</h3>
        <span className={getStatusBadgeClass(booking.status)}>
          {booking.status}
        </span>
      </div>

      <div className="booking-card__meta">
        Provider: <strong style={{ color: 'var(--ink)' }}>{booking.provider_name || 'Assigned Fixer'}</strong>
      </div>
      
      <div className="booking-card__schedule">
        <Calendar size={14} style={{ flexShrink: 0, color: 'var(--forest)' }} aria-hidden="true" />
        <span>{formatDate(booking.scheduled_date)} at {booking.scheduled_time}</span>
      </div>
      
      {booking.total_price != null && (
        <div className="booking-card__price-row">
          <span>Amount Payable</span>
          <div style={{ textAlign: 'right' }}>
            <strong style={{ textDecoration: booking.quoted_price ? 'line-through' : 'none', color: booking.quoted_price ? 'var(--ink-soft)' : 'inherit' }}>
                ৳{Number(booking.total_price).toFixed(2)}
            </strong>
            {booking.quoted_price && (
                <strong style={{ display: 'block', color: 'var(--forest)' }}>
                    New Quote: ৳{Number(booking.quoted_price).toFixed(2)}
                </strong>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="booking-card__actions">
        {booking.status === 'Pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              {booking.quoted_price && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => onQuoteResponse(booking.id, true)} style={{ flex: 1, padding: '6px', background: 'var(--forest)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>Accept Quote</button>
                      <button onClick={() => onQuoteResponse(booking.id, false)} style={{ flex: 1, padding: '6px', background: '#fff1ed', color: '#c94c32', borderRadius: '6px', border: '1px solid #f0bbae', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>Reject Quote</button>
                  </div>
              )}
              <button
                type="button"
                onClick={handleCancelClick}
                disabled={cancelling}
                style={{
                  width: '100%',
                  minHeight: '36px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#fff1ed',
                  color: '#c94c32',
                  border: '1px solid #f0bbae',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Request'}
              </button>
          </div>
        )}

        {(booking.status === 'Accepted' || booking.status === 'In-Progress') && (
          <button 
            type="button"
            onClick={() => onMessage(booking.id)} 
            className="button button--primary button--small"
            style={{ width: '100%', minHeight: '38px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <MessageSquare size={14} aria-hidden="true" /> Message Provider
          </button>
        )}

        {booking.status === 'Completed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => onRate(booking)} 
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Star size={13} fill="#d97706" color="#d97706" aria-hidden="true" /> Rate Job
              </button>
              <button 
                type="button"
                onClick={() => onInvoice(booking.id)} 
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: '#eef8f3',
                  color: '#278b6a',
                  border: '1px solid #bce6d4',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <FileText size={13} aria-hidden="true" /> Receipt
              </button>
            </div>
            <button 
              type="button"
              onClick={() => onDispute(booking)} 
              style={{
                width: '100%',
                padding: '7px 12px',
                borderRadius: '8px',
                background: '#fff1ed',
                color: '#c94c32',
                border: '1px solid #f0bbae',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <AlertTriangle size={13} aria-hidden="true" /> Open Dispute Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerBookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMessageBookingId, setActiveMessageBookingId] = useState(null);
  const [ratingTargetBooking, setRatingTargetBooking] = useState(null);
  const [disputeTargetBooking, setDisputeTargetBooking] = useState(null);

  const loadBookings = () => {
    setLoading(true);
    return fetchCustomerBookings()
      .then((data) => setBookings(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleQuoteResponse = async (bookingId, response) => {
    try {
        await respondToQuote(bookingId, response);
        loadBookings();
    } catch (e) {
        alert(e.message || 'Failed to respond to quote');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelCustomerBooking(bookingId);
    } catch (e) {
      console.warn('Backend warning:', e.message);
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'Cancelled' } : b))
    );
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const response = await api.get(`/invoices/${bookingId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Failed to download invoice:', err);
    }
  };

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Loading your bookings...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-page">
        <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="form-alert" role="alert">{error}</div>
        </div>
      </section>
    );
  }

  const byStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = bookings.filter((b) => b.status === status);
    return acc;
  }, {});

  const otherStatuses = bookings.filter((b) => !COLUMNS.includes(b.status));

  return (
    <section className="dashboard-page">
      <div className="container">
        {/* Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
          <div>
            <p className="eyebrow"><span /> Customer Workspace</p>
            <h1 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              margin: '0 0 8px',
              color: 'var(--ink)'
            }}>
              My Bookings
            </h1>
            <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '1rem' }}>
              Track real-time status of your household service appointments across Dhaka.
            </p>
          </div>
          <span className="badge badge--accepted" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            {bookings.length} Total Bookings
          </span>
        </div>

        {/* Kanban Board Columns */}
        <div className="board-columns-grid">
          {COLUMNS.map((status) => {
            const getStatusIcon = (s) => {
              switch (s) {
                case 'Pending': return <Clock size={15} style={{ color: '#d97706' }} aria-hidden="true" />;
                case 'Accepted': return <CheckCircle size={15} style={{ color: '#278b6a' }} aria-hidden="true" />;
                case 'In-Progress': return <Zap size={15} style={{ color: '#0284c7' }} aria-hidden="true" />;
                case 'Completed': return <CheckCheck size={15} style={{ color: '#15803d' }} aria-hidden="true" />;
                default: return <Clock size={15} aria-hidden="true" />;
              }
            };

            return (
              <div key={status} className="board-column">
                <div className="board-column-header">
                  <h2 className="board-column-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getStatusIcon(status)}
                    <span>{status}</span>
                  </h2>
                  <span className="board-column-count">
                    {byStatus[status].length}
                  </span>
                </div>
              
              <div style={{ minHeight: '160px' }}>
                {byStatus[status].length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '36px 14px',
                    borderRadius: '12px',
                    background: '#fafaf7',
                    border: '1px dashed var(--line)',
                    color: 'var(--ink-soft)',
                    fontSize: '0.84rem'
                  }}>
                    No {status.toLowerCase()} bookings
                  </div>
                ) : (
                  byStatus[status].map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onMessage={setActiveMessageBookingId}
                      onInvoice={handleDownloadInvoice}
                      onCancel={handleCancelBooking}
                      onRate={setRatingTargetBooking}
                      onDispute={setDisputeTargetBooking}
                      onQuoteResponse={handleQuoteResponse}
                    />
                  ))
                )}
              </div>
            </div>
            );
          })}
        </div>

        {/* Other Booking History (Cancelled, Disputed) */}
        {otherStatuses.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 18px', color: 'var(--ink)' }}>
              Historical & Resolved Bookings
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {otherStatuses.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onMessage={setActiveMessageBookingId}
                  onInvoice={handleDownloadInvoice}
                  onCancel={handleCancelBooking}
                  onRate={setRatingTargetBooking}
                  onDispute={setDisputeTargetBooking}
                />
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        {activeMessageBookingId && (
          <MessagingModal bookingId={activeMessageBookingId} onClose={() => setActiveMessageBookingId(null)} />
        )}

        {ratingTargetBooking && (
          <RatingModal
            booking={ratingTargetBooking}
            onClose={() => setRatingTargetBooking(null)}
            onReviewSubmitted={loadBookings}
          />
        )}

        {disputeTargetBooking && (
          <DisputeModal
            booking={disputeTargetBooking}
            onClose={() => setDisputeTargetBooking(null)}
            onDisputeSubmitted={() => {
              setBookings((prev) =>
                prev.map((b) => (b.id === disputeTargetBooking.id ? { ...b, status: 'Disputed' } : b))
              );
              loadBookings();
            }}
          />
        )}
      </div>
    </section>
  );
}
