import React from 'react';
import { Layers, CheckCircle2, XCircle } from 'lucide-react';

export default function StatsCards({ stats, totalLoaded }) {
  const total = stats?.total_categories ?? totalLoaded ?? 0;
  const active = stats?.active_categories ?? 0;
  const inactive = stats?.inactive_categories ?? 0;

  return (
    <div className="brand-stats-grid">
      <div className="brand-stats-card">
        <div className="brand-stats-card__icon" style={{ background: 'var(--mint-pale)', color: 'var(--forest)' }}>
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <p className="brand-stats-card__label">Total Categories</p>
          <p className="brand-stats-card__value">{total}</p>
        </div>
      </div>

      <div className="brand-stats-card">
        <div className="brand-stats-card__icon" style={{ background: '#dcfce7', color: '#166534' }}>
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="brand-stats-card__label">Active Categories</p>
          <p className="brand-stats-card__value" style={{ color: '#166534' }}>{active}</p>
        </div>
      </div>

      <div className="brand-stats-card">
        <div className="brand-stats-card__icon" style={{ background: '#fef3c7', color: '#92400e' }}>
          <XCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="brand-stats-card__label">Inactive Categories</p>
          <p className="brand-stats-card__value" style={{ color: '#92400e' }}>{inactive}</p>
        </div>
      </div>
    </div>
  );
}

