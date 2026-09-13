import React from 'react';
import { 
  Sparkles, Wrench, Zap, Hammer, Palette, Cpu, Shield, 
  Scissors, Folder, Edit3, Trash2, Calendar
} from 'lucide-react';

const iconMap = {
  sparkles: Sparkles,
  wrench: Wrench,
  zap: Zap,
  hammer: Hammer,
  palette: Palette,
  cpu: Cpu,
  shield: Shield,
  scissors: Scissors,
  folder: Folder
};

export default function CategoryTable({ categories, onEdit, onDelete }) {
  return (
    <div className="brand-table-wrap">
      <table className="brand-table">
        <thead>
          <tr>
            <th style={{ width: '80px' }}>ID</th>
            <th>Category Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Created Date</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Folder;
            const isActive = Boolean(cat.is_active);
            const formattedDate = cat.created_at 
              ? new Date(cat.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : '-';

            return (
              <tr key={cat.id}>
                <td>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    color: 'var(--forest)',
                    fontWeight: 800,
                    background: '#f4f8f6',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    #{cat.id}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'var(--mint-pale)',
                      color: 'var(--forest)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <strong style={{ color: 'var(--ink)', fontSize: '0.92rem' }}>{cat.name}</strong>
                  </div>
                </td>
                <td style={{ color: 'var(--ink-soft)', maxWidth: '280px', fontSize: '0.85rem' }}>
                  {cat.description || '-'}
                </td>
                <td>
                  <span className={isActive ? 'badge badge--completed' : 'badge badge--rejected'}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ color: 'var(--ink-soft)', fontSize: '0.82rem' }}>
                  {formattedDate}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(cat)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid var(--line)',
                        borderRadius: '8px',
                        background: '#fafaf7',
                        color: 'var(--forest)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        transition: 'background .2s'
                      }}
                      title="Edit Category"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(cat)}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #f0bbae',
                        borderRadius: '8px',
                        background: '#fff1ed',
                        color: '#c94c32',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        transition: 'background .2s'
                      }}
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
