import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wrench, Zap, Hammer, Palette, Cpu, Shield, Scissors, Folder, Check } from 'lucide-react';

const icons = [
  { id: 'sparkles', label: 'Cleaning / Sparkles', Icon: Sparkles },
  { id: 'wrench', label: 'Plumbing / Wrench', Icon: Wrench },
  { id: 'zap', label: 'Electrical / Zap', Icon: Zap },
  { id: 'hammer', label: 'Carpentry / Hammer', Icon: Hammer },
  { id: 'palette', label: 'Painting / Palette', Icon: Palette },
  { id: 'cpu', label: 'Appliance / CPU', Icon: Cpu },
  { id: 'shield', label: 'Pest / Security', Icon: Shield },
  { id: 'scissors', label: 'Lawn / Scissors', Icon: Scissors },
  { id: 'folder', label: 'General / Folder', Icon: Folder }
];

export default function CategoryFormModal({ isOpen, onClose, onSave, category }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('folder');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setIcon(category.icon || 'folder');
      setIsActive(Boolean(category.is_active));
    } else {
      setName('');
      setDescription('');
      setIcon('folder');
      setIsActive(true);
    }
    setError('');
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        icon,
        is_active: isActive ? 1 : 0
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div 
        className="booking-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="modal-close-btn"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="modal-header">
          <p className="eyebrow" style={{ marginBottom: '8px' }}>
            <span /> {category ? 'Platform Structure' : 'Global Categories'}
          </p>
          <h2 style={{ margin: '0 0 8px' }}>
            {category ? `Edit Category #${category.id}` : 'Create New Category'}
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.9rem', margin: '0 0 20px' }}>
            {category 
              ? 'Update category name, icon, description, and provider visibility.' 
              : 'Add a new household service category for providers to list offerings under.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div className="form-alert" role="alert">
              {error}
            </div>
          )}

          <div>
            <label className="brand-label">
              Category Name <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Appliance Repair, Home Cleaning..."
              className="brand-input"
            />
          </div>

          <div>
            <label className="brand-label">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the services offered under this category..."
              className="brand-textarea"
            />
          </div>

          <div>
            <label className="brand-label" style={{ marginBottom: '8px' }}>
              Category Icon
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
              {icons.map(({ id, Icon }) => {
                const isSelected = icon === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setIcon(id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 6px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--forest)' : '1px solid var(--line)',
                      background: isSelected ? 'var(--mint-pale)' : '#fdfdfc',
                      color: isSelected ? 'var(--forest)' : 'var(--ink-soft)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '4px', textTransform: 'capitalize' }}>
                      {id}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ paddingTop: '4px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--forest)' }}
              />
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--ink)' }}>Active Status</span>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ink-soft)' }}>
                  Allow providers to select this category when creating services
                </p>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
            <button
              type="button"
              onClick={onClose}
              className="button button--ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="button button--primary"
            >
              {loading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
