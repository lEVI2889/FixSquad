import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function DashboardPage() {
  const { user } = useAuth();
  const isProvider = user?.role === 'provider';
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <section className="dashboard-page">
      <div className="container">
        <div className="dashboard-heading">
          <p className="eyebrow"><span /> Your workspace</p>
          <h1>Welcome, {user?.name?.split(' ')[0] || 'friend'}.</h1>
          <p>
            {isAdmin && 'Platform moderation and administrative tools.'}
            {isProvider && 'Manage your service business from one place.'}
            {isCustomer && 'Your FixSquad activity will appear here.'}
          </p>
        </div>
        
        <div className="dashboard-grid">
          {/* Admin Specific Action Cards */}
          {isAdmin && (
            <>
              <article className="dashboard-card dashboard-card--accent" style={{ background: '#1c4f3f' }}>
                <span className="dashboard-card__icon">🗂️</span>
                <p>Platform Structure</p>
                <h2>Category Manager</h2>
                <p>Dynamically insert, update, or delete the platform's service categories.</p>
                <Link className="button button--light" to="/admin/categories" style={{ marginTop: '15px', display: 'inline-block' }}>Manage Categories →</Link>
              </article>
              
              <article className="dashboard-card dashboard-card--accent" style={{ background: '#5a2e3d' }}>
                <span className="dashboard-card__icon">🛡️</span>
                <p>Quality Control</p>
                <h2>Security Desk</h2>
                <p>Verify new providers and suspend or reactivate platform users.</p>
                <Link className="button button--light" to="/admin/security" style={{ marginTop: '15px', display: 'inline-block' }}>Open Security Desk →</Link>
              </article>
            </>
          )}

          {/* Provider Specific Action Card */}
          {isProvider && (
            <article className="dashboard-card dashboard-card--accent">
              <span className="dashboard-card__icon">✦</span>
              <p>Provider account</p>
              <h2>Build your service portfolio</h2>
              <p>Add the services and prices customers can book.</p>
              <Link className="button button--light" to="/provider/portfolio">Manage services →</Link>
            </article>
          )}

          {/* Customer Specific Action Card */}
          {isCustomer && (
            <article className="dashboard-card dashboard-card--accent">
              <span className="dashboard-card__icon">⌂</span>
              <p>Customer account</p>
              <h2>Ready when you need a hand</h2>
              <p>Track your active bookings and manage your service requests.</p>
              <Link className="button button--light" to="/customer/bookings" style={{ marginTop: '15px', display: 'inline-block' }}>View My Bookings →</Link>
            </article>
          )}

          {/* Universal Profile Card */}
          <article className="dashboard-card">
            <span className="card-label">Account</span>
            <h3>{user?.name || 'FixSquad member'}</h3>
            <dl className="account-details">
              <div><dt>Email</dt><dd>{user?.email || 'Connected account'}</dd></div>
              <div><dt>Role</dt><dd style={{ textTransform: 'capitalize' }}>{user?.role || 'Member'}</dd></div>
            </dl>
          </article>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
