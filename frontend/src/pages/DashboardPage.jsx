import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { fetchCustomerBookings } from '../services/api';

function DashboardPage() {
  const { user } = useAuth();
  const isProvider = user?.role === 'provider';

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  useEffect(() => {
    if (!isProvider) {
      setLoadingBookings(true);
      fetchCustomerBookings()
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setBookings(res.data);
          }
        })
        .catch((err) => console.error('Error loading customer bookings:', err))
        .finally(() => setLoadingBookings(false));
    }
  }, [isProvider]);

  const getStatusBadgeClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'accepted':
        return 'badge--accepted';
      case 'in-progress':
        return 'badge--in-progress';
      case 'completed':
        return 'badge--completed';
      case 'rejected':
      case 'cancelled':
        return 'badge--rejected';
      case 'pending':
      default:
        return 'badge--pending';
    }
  };

  return (
    <section className="dashboard-page">
      <div className="container">
        <div className="dashboard-heading">
          <p className="eyebrow"><span /> Your workspace</p>
          <h1>Welcome, {user?.name?.split(' ')[0] || 'friend'}.</h1>
          <p>
            {isProvider
              ? 'Manage your service business and customer orders from one place.'
              : 'Track your service bookings, appointments, and requests in real-time.'}
          </p>
        </div>

        <div className="dashboard-grid">
          <article className="dashboard-card dashboard-card--accent">
            <span className="dashboard-card__icon">{isProvider ? '✦' : '⌂'}</span>
            <p>{isProvider ? 'Provider account' : 'Customer account'}</p>
            <h2>{isProvider ? 'Build your service portfolio' : 'Need home repairs or cleaning?'}</h2>
            <p>
              {isProvider
                ? 'Add the services and prices customers can book.'
                : 'Browse our verified service squad, compare prices, and schedule appointments instantly.'}
            </p>
            {isProvider ? (
              <Link className="button button--light" to="/provider/portfolio">
                Manage services →
              </Link>
            ) : (
              <Link className="button button--light" to="/services">
                Explore Services & Book Now →
              </Link>
            )}
          </article>

          <article className="dashboard-card">
            <span className="card-label">Account Details</span>
            <h3>{user?.name || 'FixSquad member'}</h3>
            <dl className="account-details">
              <div><dt>Email</dt><dd>{user?.email || 'Connected account'}</dd></div>
              <div><dt>Role</dt><dd>{user?.role || 'Member'}</dd></div>
              <div><dt>Total Requests</dt><dd>{bookings.length} Bookings</dd></div>
            </dl>
          </article>
        </div>

        {/* Customer Active & Past Bookings Section */}
        {!isProvider && (
          <div className="customer-bookings-section">
            <div className="section-header-row">
              <div>
                <span className="eyebrow"><span /> My Service Orders</span>
                <h2>Your Bookings & Appointments</h2>
              </div>
              <Link className="button button--ghost button--small" to="/services">
                + Book Another Service
              </Link>
            </div>

            {loadingBookings ? (
              <div className="services-loading-state">
                <div className="spinner" />
                <p>Loading your appointments...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-bookings-box">
                <span className="empty-icon">📅</span>
                <h3>No active bookings yet</h3>
                <p>You haven't scheduled any services yet. Find a squad professional to get started!</p>
                <Link className="button button--primary" to="/services">
                  Browse Services
                </Link>
              </div>
            ) : (
              <div className="bookings-table-wrap">
                <table className="bookings-table">
                  <thead>
                    <tr>
                      <th>Ref #</th>
                      <th>Service</th>
                      <th>Provider</th>
                      <th>Scheduled Date</th>
                      <th>Time Slot</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td><strong>#{booking.id}</strong></td>
                        <td>
                          <div className="table-service-name">
                            <span>{booking.category_icon || '🛠'}</span>
                            <strong>{booking.service_name || 'Service Item'}</strong>
                          </div>
                        </td>
                        <td>{booking.provider_name || 'Assigned Provider'}</td>
                        <td>{booking.scheduled_date ? String(booking.scheduled_date).split('T')[0] : 'N/A'}</td>
                        <td>{booking.scheduled_time || 'N/A'}</td>
                        <td><strong>৳{Number(booking.total_price || 0).toFixed(2)}</strong></td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                            {booking.status || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default DashboardPage;
