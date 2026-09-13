import React from 'react';
import { 
  Sparkles, Wrench, Zap, Hammer, Palette, Cpu, Shield, 
  Scissors, Folder, Edit3, Trash2, Calendar, CheckCircle2, XCircle
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

export default function CategoryCard({ category, onEdit, onDelete }) {
  const IconComponent = iconMap[category.icon] || Folder;
  const isActive = Boolean(category.is_active);

  const formattedDate = category.created_at 
    ? new Date(category.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';

  return (
    <div 
      style={{
        background: 'white',
        border: '1px solid var(--line)',
        borderRadius: '16px',
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        boxShadow: '0 2px 10px rgba(18, 63, 54, 0.03)'
      }}
      className="group"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = '#a7d9c5';
        e.currentTarget.style.boxShadow = '0 14px 34px rgba(18, 63, 54, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'var(--line)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(18, 63, 54, 0.03)';
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'var(--mint-pale)',
              color: 'var(--forest)',
              border: '1px solid #bce6d4',
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0
            }}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '0.72rem',
                  color: 'var(--ink-soft)',
                  background: '#f4f6f4',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  border: '1px solid var(--line)'
                }}>
                  #{category.id}
                </span>
                <span className={isActive ? 'badge badge--completed' : 'badge badge--rejected'}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <h3 style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: '1.08rem',
                fontWeight: 800,
                color: 'var(--ink)',
                margin: 0
              }}>
                {category.name}
              </h3>
            </div>
          </div>
        </div>

        <p style={{
          color: 'var(--ink-soft)',
          fontSize: '0.86rem',
          lineHeight: 1.6,
          margin: '14px 0 0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {category.description || 'No description provided.'}
        </p>
      </div>

      <div style={{
        marginTop: '20px',
        paddingTop: '14px',
        borderTop: '1px solid #f0f4f2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
        color: 'var(--ink-soft)'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => onEdit(category)}
            style={{
              padding: '6px 10px',
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
              transition: 'background .2s, border-color .2s'
            }}
            title="Edit category"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            style={{
              padding: '6px 10px',
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
            title="Delete category"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
