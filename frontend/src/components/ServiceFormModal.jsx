import React, { useState, useEffect } from 'react';

const ServiceFormModal = ({ isOpen, onClose, onSubmit, initialData, categories }) => {
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    base_price: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category_id: initialData.category_id || '',
        description: initialData.description || '',
        base_price: initialData.base_price || ''
      });
    } else {
      setFormData({ name: '', category_id: '', description: '', base_price: '' });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div 
        className="booking-modal" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '540px' }}
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
            <span /> {initialData ? 'Update Offering' : 'New Offering'}
          </p>
          <h2 style={{ margin: '0 0 8px' }}>
            {initialData ? 'Edit Service' : 'Add New Service'}
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.92rem', margin: '0 0 24px' }}>
            {initialData 
              ? 'Modify details and base pricing for this service in your portfolio.'
              : 'Add a new household service with transparent base pricing for customers.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              color: 'var(--ink)', 
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Service Name <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. AC Filter Deep Cleaning"
              required 
              style={{
                width: '100%',
                height: '46px',
                padding: '0 14px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: '#fdfdfc',
                fontSize: '0.92rem',
                color: 'var(--ink)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              color: 'var(--ink)', 
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Category <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <select 
              name="category_id"
              value={formData.category_id} 
              onChange={handleChange} 
              required
              style={{
                width: '100%',
                height: '46px',
                padding: '0 14px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: '#fdfdfc',
                fontSize: '0.92rem',
                color: 'var(--ink)',
                outline: 'none'
              }}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              color: 'var(--ink)', 
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Base Price (৳ BDT) <span style={{ color: 'var(--coral)' }}>*</span>
            </label>
            <input 
              type="number" 
              name="base_price"
              min="0"
              step="0.01"
              value={formData.base_price} 
              onChange={handleChange} 
              placeholder="e.g. 1200"
              required 
              style={{
                width: '100%',
                height: '46px',
                padding: '0 14px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: '#fdfdfc',
                fontSize: '0.92rem',
                color: 'var(--ink)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              color: 'var(--ink)', 
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              Description
            </label>
            <textarea 
              name="description"
              value={formData.description} 
              onChange={handleChange} 
              placeholder="What does this service include? Any specific equipment or requirements?"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: '#fdfdfc',
                fontSize: '0.92rem',
                color: 'var(--ink)',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button 
              type="button" 
              className="button button--ghost" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="button button--primary"
            >
              {initialData ? 'Update Service' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceFormModal;
