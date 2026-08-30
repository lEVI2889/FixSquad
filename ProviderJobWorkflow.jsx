import { useEffect, useState } from 'react';
import { fetchProviderBookings, updateBookingStatus } from '../api/bookingApi';

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

  if (loading) return <div className="dashboard-status">Loading your jobs...</div>;

  return (
    <div className="provider-job-workflow">
      <h1>Job Workflow</h1>
      {error && <div className="dashboard-status dashboard-status--error">{error}</div>}

      {bookings.length === 0 && <p>No bookings yet.</p>}

      <div className="job-list">
        {bookings.map((booking) => {
          const actions = ACTIONS_BY_STATUS[booking.status] || [];
          return (
            <div key={booking.id} className="job-card">
              <div className="job-card__header">
                <span className="job-card__service">{booking.service_name}</span>
                <span className={`status-badge status-badge--${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </div>
              <div className="job-card__customer">Customer: {booking.customer_name}</div>
              <div className="job-card__schedule">
                {formatDate(booking.scheduled_date)} at {booking.scheduled_time}
              </div>

              {actions.length > 0 && (
                <div className="job-card__actions">
                  {actions.map((action) => (
                    <button
                      key={action.next}
                      type="button"
                      disabled={updatingId === booking.id}
                      onClick={() => handleAction(booking.id, action.next)}
                    >
                      {updatingId === booking.id ? 'Updating...' : action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
