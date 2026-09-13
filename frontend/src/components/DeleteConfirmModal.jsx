import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, category, loading }) {
  if (!isOpen || !category) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div 
        className="booking-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '480px' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#fff1ed',
            color: '#c94c32',
            border: '1px solid #f0bbae',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--ink)' }}>
              Delete Category
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
              This action cannot be undone
            </p>
          </div>
        </div>

        <p style={{ color: 'var(--ink-soft)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--ink)' }}>"{category.name}"</strong> (ID: <span style={{ fontFamily: 'monospace', color: 'var(--forest)', fontWeight: 700 }}>#{category.id}</span>)? 
          Ensure no active provider services are currently linked to this category before deleting.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
          <button
            type="button"
            onClick={onClose}
            className="button button--ghost"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              background: '#c94c32',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0 20px',
              minHeight: '44px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background .2s'
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
