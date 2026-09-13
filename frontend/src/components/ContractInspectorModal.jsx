import React, { useState } from 'react';
import { X, Copy, Check, Database, Code, FileText, CheckCircle2 } from 'lucide-react';

export default function ContractInspectorModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const rawSqlSchema = `CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(100) DEFAULT 'folder',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;

  const copyContract = () => {
    navigator.clipboard.writeText(rawSqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div 
        className="booking-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '720px', padding: '32px' }}
      >
        <button 
          type="button" 
          className="modal-close-btn" 
          onClick={onClose} 
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="modal-header">
          <p className="eyebrow" style={{ marginBottom: '8px' }}>
            <span /> System Architecture & DDL
          </p>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem' }}>
            Integration Contract: Week 1 (Feature 12)
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem', margin: '0 0 20px' }}>
            Global Category Manager • Target Contract for Rohan, Shan & Wasik
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ 
                fontFamily: 'Manrope, sans-serif', 
                fontSize: '0.85rem', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em', 
                color: 'var(--forest)', 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}>
                <Database className="w-4 h-4" />
                1. Exact Database Schema (Raw SQL)
              </h3>
              <button
                type="button"
                onClick={copyContract}
                style={{
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  background: '#f4f8f6',
                  color: 'var(--forest)',
                  border: '1px solid #c9ded6',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL' : 'Copy DDL'}</span>
              </button>
            </div>
            <pre style={{
              padding: '16px',
              background: '#f8faf9',
              borderRadius: '12px',
              border: '1px solid var(--line)',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              color: 'var(--ink)',
              overflowX: 'auto',
              margin: 0,
              lineHeight: 1.5
            }}>
              {rawSqlSchema}
            </pre>
          </div>

          <div>
            <h3 style={{ 
              fontFamily: 'Manrope, sans-serif', 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              color: 'var(--forest)', 
              margin: '0 0 8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              <Code className="w-4 h-4" />
              2. Teammate Foreign Key Alignment
            </h3>
            <div style={{
              background: '#f8faf9',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '0.84rem'
            }}>
              <p style={{ margin: '0 0 6px' }}>
                <strong style={{ color: 'var(--ink)' }}>Rohan's Feature 6 (`services` table):</strong>
              </p>
              <p style={{
                fontFamily: 'monospace',
                background: '#eef8f3',
                color: 'var(--forest)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #bce6d4',
                margin: '0 0 8px',
                fontSize: '0.8rem'
              }}>
                category_id INT FOREIGN KEY REFERENCES categories(id)
              </p>
              <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '0.82rem' }}>
                Guaranteed: Table is <code>categories</code>, PK is <code>id</code> (type <code>INT</code>), name column is <code>name</code> (type <code>VARCHAR</code>).
              </p>
            </div>
          </div>

          <div>
            <h3 style={{ 
              fontFamily: 'Manrope, sans-serif', 
              fontSize: '0.85rem', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              color: 'var(--forest)', 
              margin: '0 0 8px' 
            }}>
              3. API Endpoints Catalog
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { method: 'GET', path: '/api/categories', desc: 'Returns array of all categories' },
                { method: 'GET', path: '/api/categories/:id', desc: 'Returns single category by ID' },
                { method: 'POST', path: '/api/categories', desc: 'Creates a new category' },
                { method: 'PUT', path: '/api/categories/:id', desc: 'Updates existing category' },
                { method: 'DELETE', path: '/api/categories/:id', desc: 'Deletes category (FK protected)' }
              ].map((ep) => (
                <div key={ep.path + ep.method} style={{
                  padding: '10px 14px',
                  background: '#f8faf9',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      fontSize: '0.74rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: ep.method === 'GET' ? '#dcfce7' : ep.method === 'POST' ? '#e0f2fe' : ep.method === 'PUT' ? '#fef3c7' : '#fee2e2',
                      color: ep.method === 'GET' ? '#166534' : ep.method === 'POST' ? '#075985' : ep.method === 'PUT' ? '#92400e' : '#991b1b'
                    }}>
                      {ep.method}
                    </span>
                    <span style={{ fontFamily: 'monospace', color: 'var(--ink)' }}>{ep.path}</span>
                  </div>
                  <span style={{ color: 'var(--ink-soft)', fontSize: '0.78rem' }}>{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
            Contract Document: <code>Week1_Naim_CONTRACT.md</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="button button--primary button--small"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
