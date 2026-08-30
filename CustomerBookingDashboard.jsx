import { useEffect, useState } from 'react';
import { fetchCustomerBookings } from '../api/bookingApi';

const COLUMNS = ['Pending', 'Accepted', 'In-Progress', 'Completed'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
}

function BookingCard({ booking }) {
  return (
    <div className="booking-card">
      <div className="booking-card__service">{booking.service_name}</div>
      <div className="booking-card__provider">Provider: {booking.provider_name}</div>
      <div className="booking-card__schedule">
        {formatDate(booking.scheduled_date)} at {booking.scheduled_time}
      </div>
      {booking.total_price != null && (
        <div className="booking-card__price">${Number(booking.total_price).toFixed(2)}</div>
      )}
    </div>
  );
}

export default function CustomerBookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchCustomerBookings()
      .then((data) => {
        if (!cancelled) setBookings(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="dashboard-status">Loading your bookings...</div>;
  if (error) return <div className="dashboard-status dashboard-status--error">{error}</div>;

  const byStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = bookings.filter((b) => b.status === status);
    return acc;
  }, {});

  const otherStatuses = bookings.filter((b) => !COLUMNS.includes(b.status));

  return (
    <div className="customer-booking-dashboard">
      <h1>My Bookings</h1>
      <div className="booking-columns">
        {COLUMNS.map((status) => (
          <div key={status} className="booking-column">
            <h2>{status} ({byStatus[status].length})</h2>
            {byStatus[status].length === 0 && <p className="booking-column__empty">Nothing here yet.</p>}
            {byStatus[status].map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ))}
      </div>

      {otherStatuses.length > 0 && (
        <div className="booking-history">
          <h2>Other</h2>
          {otherStatuses.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
