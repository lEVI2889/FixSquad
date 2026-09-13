import React from 'react';
import { Wrench } from 'lucide-react';

const ServiceList = ({ services, onEdit, onDelete }) => {
  if (!services || services.length === 0) {
    return (
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
          margin: '0 auto 18px',
          color: 'var(--forest)'
        }}>
          <Wrench size={28} aria-hidden="true" />
        </div>
        <h3 style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: '1.3rem',
          fontWeight: 800,
          margin: '0 0 8px',
          color: 'var(--ink)'
        }}>
          No Services in Your Portfolio
        </h3>
        <p style={{
          color: 'var(--ink-soft)',
          maxWidth: '440px',
          margin: '0 auto 20px',
          fontSize: '0.92rem',
          lineHeight: 1.6
        }}>
          Add your first household repair or maintenance service with a base price to start appearing in search results and receiving customer bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="brand-table-wrap">
      <table className="brand-table">
        <thead>
          <tr>
            <th>Service Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Base Price</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>
                <strong style={{ color: 'var(--ink)', fontSize: '0.95rem' }}>{service.name}</strong>
              </td>
              <td>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'var(--mint-pale)',
                  color: 'var(--forest)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  {service.category_name || 'General'}
                </span>
              </td>
              <td style={{ color: 'var(--ink-soft)', maxWidth: '300px', lineHeight: 1.5 }}>
                {service.description || '—'}
              </td>
              <td>
                <strong style={{ color: 'var(--forest)', fontSize: '1.05rem', fontWeight: 800 }}>
                  ৳{parseFloat(service.base_price).toFixed(2)}
                </strong>
              </td>
              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    onClick={() => onEdit(service)}
                    style={{
                      padding: '6px 14px',
                      background: '#f0faf5',
                      border: '1px solid #bce6d4',
                      borderRadius: '8px',
                      color: 'var(--forest)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    type="button"
                    onClick={() => onDelete(service.id)}
                    style={{
                      padding: '6px 14px',
                      background: '#fff1ed',
                      border: '1px solid #f0bbae',
                      borderRadius: '8px',
                      color: '#c94c32',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceList;
