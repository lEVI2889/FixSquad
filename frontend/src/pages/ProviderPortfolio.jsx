import React, { useState, useEffect } from 'react';
import ServiceList from '../components/ServiceList';
import ServiceFormModal from '../components/ServiceFormModal';
import { 
  fetchProviderServices, 
  createService, 
  updateService, 
  deleteService, 
  fetchCategories 
} from '../services/api';

const ProviderPortfolio = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const showFeedback = (msg, isError = false) => {
    setFeedbackMsg({ text: msg, isError });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        fetchProviderServices(),
        fetchCategories()
      ]);
      setServices(servicesRes.data || []);
      setCategories(categoriesRes.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load portfolio data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (service = null) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingService) {
        await updateService(editingService.id, formData);
        showFeedback('Service updated successfully!');
      } else {
        await createService(formData);
        showFeedback('New service added to your portfolio!');
      }
      handleCloseModal();
      loadData();
    } catch (err) {
      showFeedback(`Error: ${err.message}`, true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service from your portfolio?')) {
      try {
        await deleteService(id);
        showFeedback('Service deleted successfully.');
        loadData();
      } catch (err) {
        showFeedback(`Error: ${err.message}`, true);
      }
    }
  };

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Loading your service portfolio...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="container">
        {/* Header Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          flexWrap: 'wrap', 
          gap: '20px',
          marginBottom: '32px' 
        }}>
          <div>
            <p className="eyebrow"><span /> Provider Workspace</p>
            <h1 style={{ 
              fontFamily: 'Manrope, sans-serif', 
              fontSize: 'clamp(2rem, 4vw, 2.8rem)', 
              fontWeight: 800, 
              letterSpacing: '-0.04em',
              margin: '0 0 8px',
              color: 'var(--ink)'
            }}>
              Service Portfolio Manager
            </h1>
            <p style={{ color: 'var(--ink-soft)', margin: 0, maxWidth: '600px', fontSize: '1rem', lineHeight: 1.6 }}>
              Define, edit, and organize the specific household services and base pricing visible to customers across Bangladesh.
            </p>
          </div>

          <button 
            type="button"
            className="button button--primary"
            onClick={() => handleOpenModal()}
          >
            + Add New Service
          </button>
        </div>

        {/* Feedback Notifications */}
        {feedbackMsg && (
          <div style={{
            padding: '14px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            fontSize: '0.92rem',
            fontWeight: 600,
            background: feedbackMsg.isError ? '#fff1ed' : '#dff6ea',
            color: feedbackMsg.isError ? '#9c3a27' : '#123f36',
            border: `1px solid ${feedbackMsg.isError ? '#f0bbae' : '#a7d9c5'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>{feedbackMsg.isError ? '⚠️' : '✓'}</span>
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {error && (
          <div className="form-alert" role="alert" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Services Table List */}
        <ServiceList 
          services={services} 
          onEdit={handleOpenModal} 
          onDelete={handleDelete} 
        />

        {/* Add/Edit Modal */}
        <ServiceFormModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          initialData={editingService}
          categories={categories}
        />
      </div>
    </section>
  );
};

export default ProviderPortfolio;
