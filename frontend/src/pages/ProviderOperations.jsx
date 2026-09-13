import React, { useState, useEffect } from 'react';
import { 
    fetchPendingBookings, updateBookingStatus, 
    fetchAvailability, addAvailabilityBlock, removeAvailabilityBlock 
} from '../services/api';
import ProviderZoneManager from '../components/ProviderZoneManager';

const ProviderOperations = () => {
    const [bookings, setBookings] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [loadingAvailability, setLoadingAvailability] = useState(true);
    
    const [blockForm, setBlockForm] = useState({ date: '', start_time: '', end_time: '' });

    useEffect(() => {
        loadBookings();
        loadAvailability();
    }, []);

    const loadBookings = async () => {
        setLoadingBookings(true);
        try {
            const res = await fetchPendingBookings();
            if (res.success) setBookings(res.data);
        } catch (error) {
            console.error('Failed to load bookings', error);
        } finally {
            setLoadingBookings(false);
        }
    };

    const loadAvailability = async () => {
        setLoadingAvailability(true);
        try {
            const res = await fetchAvailability();
            if (res.success) setAvailability(res.data);
        } catch (error) {
            console.error('Failed to load availability', error);
        } finally {
            setLoadingAvailability(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await updateBookingStatus(id, status);
            loadBookings(); // refresh list
        } catch (error) {
            console.error(`Failed to ${status} booking`, error);
        }
    };

    const handleAddBlock = async (e) => {
        e.preventDefault();
        try {
            await addAvailabilityBlock(blockForm);
            setBlockForm({ date: '', start_time: '', end_time: '' });
            loadAvailability();
        } catch (error) {
            console.error('Failed to add block', error);
        }
    };

    const handleRemoveBlock = async (id) => {
        try {
            await removeAvailabilityBlock(id);
            loadAvailability();
        } catch (error) {
            console.error('Failed to remove block', error);
        }
    };

    return (
        <section className="dashboard-page">
            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                <div>
                    <p className="eyebrow"><span /> Operations & Dispatch</p>
                    <h1 style={{ 
                        fontFamily: 'Manrope, sans-serif', 
                        fontSize: 'clamp(2rem, 4vw, 2.8rem)', 
                        fontWeight: 800, 
                        letterSpacing: '-0.04em',
                        margin: '0 0 8px',
                        color: 'var(--ink)'
                    }}>
                        Provider Operations
                    </h1>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, maxWidth: '640px', fontSize: '1rem', lineHeight: 1.6 }}>
                        Manage incoming booking requests from local customers and schedule blocked-out hours to keep your availability calendar up to date.
                    </p>
                </div>

                {/* Booking Requests Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
                            Incoming Booking Requests
                        </h2>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, padding: '4px 10px', background: bookings.length > 0 ? '#fff1ed' : '#eef8f3', color: bookings.length > 0 ? '#9c3a27' : '#278b6a', borderRadius: '20px' }}>
                            {bookings.length} Pending
                        </span>
                    </div>

                    {loadingBookings ? (
                        <div style={{ textAlign: 'center', padding: '50px 20px', background: 'white', borderRadius: '16px', border: '1px solid var(--line)' }}>
                            <div className="spinner" style={{ width: '32px', height: '32px' }} />
                            <p style={{ color: 'var(--ink-soft)', margin: '10px 0 0', fontSize: '0.9rem' }}>Loading incoming requests...</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '48px 20px',
                            background: 'white',
                            borderRadius: '16px',
                            border: '1px solid var(--line)',
                            color: 'var(--ink-soft)'
                        }}>
                            <p style={{ margin: 0, fontWeight: 600 }}>No pending booking requests right now. New requests will appear here in real time.</p>
                        </div>
                    ) : (
                        <div className="brand-table-wrap">
                            <table className="brand-table">
                                <thead>
                                    <tr>
                                        <th>Service Requested</th>
                                        <th>Customer</th>
                                        <th>Scheduled Date/Time</th>
                                        <th>Base Price</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b.id}>
                                            <td><strong style={{ color: 'var(--ink)' }}>{b.service_name}</strong></td>
                                            <td style={{ color: 'var(--ink-soft)' }}>{b.customer_name}</td>
                                            <td style={{ color: 'var(--ink-soft)' }}>
                                                {new Date(b.scheduled_date).toLocaleDateString()} at {b.scheduled_time}
                                            </td>
                                            <td>
                                                <strong style={{ color: 'var(--forest)', fontSize: '0.95rem' }}>
                                                    ৳{Number(b.total_price || 0).toFixed(2)}
                                                </strong>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleUpdateStatus(b.id, 'Accepted')}
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
                                                        Accept
                                                    </button>
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleUpdateStatus(b.id, 'Rejected')}
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

                {/* Availability Calendar Section */}
                <div>
                    <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.35rem', fontWeight: 800, margin: '0 0 16px', color: 'var(--ink)' }}>
                        Availability & Calendar Management
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                        {/* Block Out Time Form */}
                        <div style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '16px',
                            border: '1px solid var(--line)',
                            boxShadow: '0 2px 10px rgba(18, 63, 54, 0.04)'
                        }}>
                            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 14px', color: 'var(--ink)' }}>
                                Block Out Time Slot
                            </h3>
                            <form onSubmit={handleAddBlock} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>Date</label>
                                    <input 
                                        type="date" 
                                        required 
                                        value={blockForm.date} 
                                        onChange={(e) => setBlockForm({...blockForm, date: e.target.value})} 
                                        style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fafaf7' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>Start Time</label>
                                        <input 
                                            type="time" 
                                            required 
                                            value={blockForm.start_time} 
                                            onChange={(e) => setBlockForm({...blockForm, start_time: e.target.value})} 
                                            style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fafaf7' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '4px' }}>End Time</label>
                                        <input 
                                            type="time" 
                                            required 
                                            value={blockForm.end_time} 
                                            onChange={(e) => setBlockForm({...blockForm, end_time: e.target.value})} 
                                            style={{ width: '100%', height: '42px', padding: '0 12px', border: '1px solid var(--line)', borderRadius: '8px', background: '#fafaf7' }}
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    className="button button--primary"
                                    style={{ width: '100%', marginTop: '6px' }}
                                >
                                    + Add Calendar Block
                                </button>
                            </form>
                        </div>

                        {/* Blocked Dates List */}
                        <div style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '16px',
                            border: '1px solid var(--line)',
                            boxShadow: '0 2px 10px rgba(18, 63, 54, 0.04)'
                        }}>
                            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 14px', color: 'var(--ink)' }}>
                                Current Calendar Blocks
                            </h3>
                            {loadingAvailability ? (
                                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                                    <div className="spinner" style={{ width: '28px', height: '28px' }} />
                                    <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', margin: '8px 0 0' }}>Loading calendar blocks...</p>
                                </div>
                            ) : availability.length === 0 ? (
                                <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', fontStyle: 'italic', margin: '20px 0' }}>
                                    No dates or times currently blocked. Customers can book all standard slots.
                                </p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {availability.map((block) => (
                                        <li key={block.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '12px 16px',
                                            background: '#fafaf7',
                                            border: '1px solid var(--line)',
                                            borderRadius: '10px'
                                        }}>
                                            <div>
                                                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--ink)' }}>
                                                    {new Date(block.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </strong>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
                                                    {block.start_time} – {block.end_time}
                                                </span>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => handleRemoveBlock(block.id)} 
                                                style={{
                                                    background: '#fff1ed',
                                                    color: '#c94c32',
                                                    border: '1px solid #f0bbae',
                                                    borderRadius: '6px',
                                                    padding: '4px 10px',
                                                    fontSize: '0.78rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Service Zones Component */}
                <ProviderZoneManager />
            </div>
        </section>
    );
};

export default ProviderOperations;
