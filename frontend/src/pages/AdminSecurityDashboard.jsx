import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function AdminSecurityDashboard() {
  const [unverifiedProviders, setUnverifiedProviders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        alert(`Provider has been ${status}!`);
        fetchData(); // Refresh lists
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating verification status');
    }
  };

  const handleSuspend = async (id, currentStatus) => {
    const is_suspended = currentStatus === 1 ? 0 : 1;
    try {
      const res = await api.put(`/admin/users/${id}/suspend`, { is_suspended });
      if (res.data.success) {
        alert(res.data.message);
        fetchData(); // Refresh lists
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating suspension status');
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px 0' }}>Loading security data...</div>;
  if (error) return <div className="container" style={{ padding: '40px 0', color: 'red' }}>{error}</div>;

  return (
    <section className="dashboard-page" style={{ padding: '40px 0' }}>
      <div className="container">
        <h1 style={{ marginBottom: '10px' }}>Admin Security & Verification</h1>
        <p style={{ color: 'var(--ink-soft)', marginBottom: '30px' }}>Features 11 and 14: Approve providers and manage platform access.</p>

        {/* Feature 11: Provider Verification System */}
        <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>Provider Verification Queue (Feature 11)</h2>
          {unverifiedProviders.length === 0 ? (
            <p>No providers are currently pending verification.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Name</th>
                  <th style={{ padding: '10px' }}>Email</th>
                  <th style={{ padding: '10px' }}>Date Applied</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {unverifiedProviders.map(provider => (
                  <tr key={provider.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px' }}>{provider.name}</td>
                    <td style={{ padding: '10px' }}>{provider.email}</td>
                    <td style={{ padding: '10px' }}>{new Date(provider.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '10px', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleVerify(provider.id, 'Approved')}
                        style={{ background: '#278b6a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                        Approve
                      </button>
                      <button 
                        onClick={() => handleVerify(provider.id, 'Rejected')}
                        style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Feature 14: System-Wide Access Control */}
        <div className="card" style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>System-Wide Access Control (Feature 14)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Role</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px' }}>{user.name}</td>
                  <td style={{ padding: '10px' }}>{user.email}</td>
                  <td style={{ padding: '10px', textTransform: 'capitalize' }}>{user.role}</td>
                  <td style={{ padding: '10px' }}>
                    {user.is_suspended === 1 
                      ? <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Suspended</span> 
                      : <span style={{ color: '#278b6a' }}>Active</span>}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleSuspend(user.id, user.is_suspended)}
                      style={{ 
                        background: user.is_suspended === 1 ? '#ffc107' : '#dc3545', 
                        color: user.is_suspended === 1 ? 'black' : 'white', 
                        border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' 
                      }}>
                      {user.is_suspended === 1 ? 'Reactivate' : 'Suspend'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
