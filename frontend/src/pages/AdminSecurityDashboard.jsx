import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function AdminSecurityDashboard() {
  const [unverifiedProviders, setUnverifiedProviders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [providersRes, usersRes] = await Promise.all([
        api.get('/admin/providers/unverified'),
        api.get('/admin/users')
      ]);
      
      if (providersRes.data.success) setUnverifiedProviders(providersRes.data.data);
      if (usersRes.data.success) setAllUsers(usersRes.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data. Are you an admin?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      const res = await api.put(`/admin/providers/${id}/verify`, { status });
      if (res.data.success) {
        showToast(`Provider application marked as ${status}.`);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating verification status', true);
    }
  };

  const handleSuspend = async (id, currentStatus) => {
    const is_suspended = currentStatus === 1 ? 0 : 1;
    try {
      const res = await api.put(`/admin/users/${id}/suspend`, { is_suspended });
      if (res.data.success) {
        showToast(res.data.message || 'User status updated.');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating suspension status', true);
    }
  };

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Loading security & verification desk...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="container">
        {/* Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            padding: '14px 20px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 600,
            background: toast.isError ? '#fff1ed' : '#174d42',
            color: toast.isError ? '#9c3a27' : '#d7f7eb',
            border: `1px solid ${toast.isError ? '#f0bbae' : '#278b6a'}`,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: '0.2s fadeIn'
          }}>
            {toast.isError ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header Bar */}
        <div style={{ marginBottom: '32px' }}>
          <p className="eyebrow"><span /> Trust & Safety Moderation</p>
          <h1 style={{ 
            fontFamily: 'Manrope, sans-serif', 
            fontSize: 'clamp(2rem, 4vw, 2.8rem)', 
            fontWeight: 800, 
            letterSpacing: '-0.04em',
            margin: '0 0 8px',
            color: 'var(--ink)'
          }}>
            Admin Security & Verification Desk
          </h1>
          <p style={{ color: 'var(--ink-soft)', margin: 0, maxWidth: '640px', fontSize: '1rem', lineHeight: 1.6 }}>
            Review new provider registrations, approve verified service technicians, and enforce system-wide platform access controls.
          </p>
        </div>

        {error && (
          <div className="form-alert" role="alert" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Section 1: Provider Verification Queue */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
              Provider Verification Queue
            </h2>
            <span style={{ 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              padding: '4px 10px', 
              background: unverifiedProviders.length > 0 ? '#fff1ed' : '#eef8f3',
              color: unverifiedProviders.length > 0 ? '#9c3a27' : '#278b6a',
              borderRadius: '20px'
            }}>
              {unverifiedProviders.length} Pending
            </span>
          </div>

          {unverifiedProviders.length === 0 ? (
            <div style={{
              background: 'white',
              border: '1px solid var(--line)',
              borderRadius: '16px',
              padding: '36px 20px',
              textAlign: 'center',
              color: 'var(--ink-soft)'
            }}>
              <p style={{ margin: 0, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--forest)' }} />
                All provider applications have been reviewed. Verification queue is empty.
              </p>
            </div>
          ) : (
            <div className="brand-table-wrap">
              <table className="brand-table">
                <thead>
                  <tr>
                    <th>Provider Name</th>
                    <th>Email Address</th>
                    <th>Date Applied</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unverifiedProviders.map((provider) => (
                    <tr key={provider.id}>
                      <td><strong style={{ color: 'var(--ink)' }}>{provider.name}</strong></td>
                      <td style={{ color: 'var(--ink-soft)' }}>{provider.email}</td>
                      <td style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>
                        {new Date(provider.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            type="button"
                            onClick={() => handleVerify(provider.id, 'Approved')}
                            style={{
                              background: 'var(--forest)',
                              color: 'white',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Approve
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleVerify(provider.id, 'Rejected')}
                            style={{
                              background: '#fff1ed',
                              color: '#c94c32',
                              border: '1px solid #f0bbae',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: Platform Access Control */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
              System-Wide User Access Control
            </h2>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink-soft)' }}>
              {allUsers.length} Total Users Registered
            </span>
          </div>

          <div className="brand-table-wrap">
            <table className="brand-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Access Control</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td><strong style={{ color: 'var(--ink)' }}>{u.name}</strong></td>
                    <td style={{ color: 'var(--ink-soft)' }}>{u.email}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#f4f6f4',
                        color: 'var(--ink)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'capitalize'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.is_suspended === 1 ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#c94c32',
                          fontWeight: 700,
                          fontSize: '0.82rem'
                        }}>
                          ● Suspended
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          color: '#278b6a',
                          fontWeight: 700,
                          fontSize: '0.82rem'
                        }}>
                          ● Active
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        type="button"
                        onClick={() => handleSuspend(u.id, u.is_suspended)}
                        style={{
                          background: u.is_suspended === 1 ? '#eef8f3' : '#fff1ed',
                          color: u.is_suspended === 1 ? '#278b6a' : '#c94c32',
                          border: `1px solid ${u.is_suspended === 1 ? '#a7d9c5' : '#f0bbae'}`,
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {u.is_suspended === 1 ? 'Reactivate Account' : 'Suspend Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
}
