import { Link } from 'react-router-dom';
import { 
  FolderKanban, ShieldCheck, Scale, Briefcase, 
  CalendarCheck, Home, ArrowRight, User 
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function DashboardPage() {
  const { user } = useAuth();
  const isProvider = user?.role === 'provider';
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';
  const [analytics, setAnalytics] = useState(null);
  const [providerEarnings, setProviderEarnings] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      api.get('/admin/analytics')
        .then(res => setAnalytics(res.data.data))
        .catch(err => console.error('Failed to fetch analytics', err));
    }
    if (isProvider) {
      api.get('/bookings/provider/earnings')
        .then(res => setProviderEarnings(res.data.data))
        .catch(err => console.error('Failed to fetch provider earnings', err));
    }
  }, [isAdmin, isProvider]);

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
          
          {isAdmin && analytics && (
            <article className="dashboard-card" style={{ gridColumn: '1 / -1', background: '#f8faf8', border: '1px solid #e2e8e0' }}>
              <h2 style={{ marginBottom: '15px' }}>Platform Analytics Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Total Transaction Volume</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#111827' }}>৳{Number(analytics.transaction_volume).toLocaleString()}</p>
                </div>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Total Active Jobs</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#111827' }}>{analytics.active_jobs}</p>
                </div>
                <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Total Users</p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#111827' }}>{analytics.total_users}</p>
                </div>
              </div>
            </article>
          )}

          {/* Admin Specific Action Cards - Preserved as requested */}
          {isAdmin && (
            <>
              <article className="dashboard-card dashboard-card--accent" style={{ background: '#1c4f3f' }}>
                <span className="dashboard-card__icon">
                  <FolderKanban size={24} aria-hidden="true" />
                </span>
                <p>Platform Structure</p>
                <h2>Category Manager</h2>
                <p>Dynamically insert, update, or delete the platform's service categories.</p>
                <Link className="button button--light" to="/admin/categories" style={{ marginTop: '15px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Manage Categories <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>
              
              <article className="dashboard-card dashboard-card--accent" style={{ background: '#5a2e3d' }}>
                <span className="dashboard-card__icon">
                  <ShieldCheck size={24} aria-hidden="true" />
                </span>
                <p>Quality Control</p>
                <h2>Security Desk</h2>
                <p>Verify new providers and suspend or reactivate platform users.</p>
                <Link className="button button--light" to="/admin/security" style={{ marginTop: '15px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Open Security Desk <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>

              <article className="dashboard-card dashboard-card--accent" style={{ background: '#1e384c' }}>
                <span className="dashboard-card__icon">
                  <Scale size={24} aria-hidden="true" />
                </span>
                <p>Conflict Resolution</p>
                <h2>Dispute Desk</h2>
                <p>Review customer dispute tickets and update booking statuses or issue refunds.</p>
                <Link className="button button--light" to="/admin/disputes" style={{ marginTop: '15px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Open Dispute Desk <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>
            </>
          )}

          {/* Provider Specific Action Cards */}
          {isProvider && (
            <>
              {providerEarnings && (
                <article className="dashboard-card" style={{ gridColumn: '1 / -1', background: '#f8faf8', border: '1px solid #e2e8e0' }}>
                  <h2 style={{ marginBottom: '15px' }}>Earnings Report</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Total Historical Earnings</p>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#111827' }}>৳{Number(providerEarnings.total_earnings || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                    <div style={{ padding: '15px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', fontWeight: 'bold' }}>Total Completed Jobs</p>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#111827' }}>{providerEarnings.recent_completed_jobs.length}</p>
                    </div>
                  </div>
                </article>
              )}
              <article className="dashboard-card dashboard-card--accent">
                <span className="dashboard-card__icon">
                  <Briefcase size={24} aria-hidden="true" />
                </span>
                <p>Provider account</p>
                <h2>Build your service portfolio</h2>
                <p>Add the services, set base prices, and manage service offerings.</p>
                <Link className="button button--light" to="/provider/portfolio" style={{ marginTop: '15px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Manage services <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>
              <article className="dashboard-card dashboard-card--accent" style={{ background: '#1e3a34' }}>
                <span className="dashboard-card__icon">
                  <CalendarCheck size={24} aria-hidden="true" />
                </span>
                <p>Operations & Schedule</p>
                <h2>Job & Request Management</h2>
                <p>Review incoming booking requests, manage availability blocks, and update job stages.</p>
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link className="button button--light" to="/provider/operations" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Operations <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                  <Link className="button button--ghost" to="/provider/jobs" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Job Workflow <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </>
          )}

          {/* Customer Specific Action Card */}
          {isCustomer && (
            <article className="dashboard-card dashboard-card--accent">
              <span className="dashboard-card__icon">
                <Home size={24} aria-hidden="true" />
              </span>
              <p>Customer account</p>
              <h2>Ready when you need a hand</h2>
              <p>Track your active bookings, request appointments, and review past services.</p>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link className="button button--light" to="/customer/bookings" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  View My Bookings <ArrowRight size={14} aria-hidden="true" />
                </Link>
                <Link className="button button--ghost" to="/services" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Explore Services <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
          )}

          {/* Universal Profile Card */}
          <article className="dashboard-card">
            <span className="dashboard-card__icon" style={{ background: 'var(--mint-pale)', color: 'var(--forest)' }}>
              <User size={24} aria-hidden="true" />
            </span>
            <span className="card-label" style={{ marginTop: '14px' }}>Account</span>
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
