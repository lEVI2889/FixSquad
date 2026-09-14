import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Filter, LayoutGrid, List, RefreshCw, 
  AlertCircle, CheckCircle2, Link2, Sparkles, FolderPlus
} from 'lucide-react';
import { categoryApi } from '../api/categoryApi';
import StatsCards from '../components/StatsCards';
import CategoryCard from '../components/CategoryCard';
import CategoryTable from '../components/CategoryTable';
import CategoryFormModal from '../components/CategoryFormModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function GlobalCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [catRes, statsRes] = await Promise.all([
        categoryApi.getAll(),
        categoryApi.getStats()
      ]);
      setCategories(catRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError(err.message || 'Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNew = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (category) => {
    setCategoryToDelete(category);
    setIsDeleteOpen(true);
  };

  const handleSaveCategory = async (formData) => {
    if (selectedCategory) {
      // Update
      const res = await categoryApi.update(selectedCategory.id, formData);
      showToast(`Category "${res.data.name}" updated successfully.`);
    } else {
      // Create
      const res = await categoryApi.create(formData);
      showToast(`Category "${res.data.name}" created successfully.`);
    }
    loadData();
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleteLoading(true);
      await categoryApi.delete(categoryToDelete.id);
      showToast(`Category "${categoryToDelete.name}" deleted successfully.`);
      setIsDeleteOpen(false);
      setCategoryToDelete(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to delete category.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        const matchesSearch = 
          cat.name.toLowerCase().includes(search.toLowerCase()) ||
          (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()));
        
        const matchesStatus = 
          statusFilter === 'all' 
            ? true 
            : statusFilter === 'active' 
              ? Boolean(cat.is_active) 
              : !Boolean(cat.is_active);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'newest') return b.id - a.id;
        return a.id - b.id;
      });
  }, [categories, search, statusFilter, sortBy]);

  return (
    <section className="dashboard-page">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100,
            padding: '14px 20px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 600,
            background: toast.type === 'error' ? '#fff1ed' : '#dff6ea',
            color: toast.type === 'error' ? '#9c3a27' : '#123f36',
            border: `1px solid ${toast.type === 'error' ? '#f0bbae' : '#a7d9c5'}`,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-rose-600" /> : <CheckCircle2 className="w-5 h-5 text-emerald-700" />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Hero / Header Banner */}
        <div style={{
          background: 'var(--forest)',
          color: 'white',
          borderRadius: '20px',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 10px 30px rgba(18, 63, 54, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ maxWidth: '680px' }}>
              <p className="eyebrow eyebrow--light" style={{ marginBottom: '10px' }}>
                <span /> Platform Foundation & Categories
              </p>
              <h1 style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 'clamp(2rem, 3.6vw, 2.7rem)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                margin: '0 0 10px',
                color: 'white',
                lineHeight: 1.15
              }}>
                Global Service Category Manager
              </h1>
              <p style={{ color: '#c0d3cd', margin: 0, fontSize: '0.96rem', lineHeight: 1.6 }}>
                Dynamically manage system-wide service categories. Configure category definitions, icons, and visibility to structure household offerings for providers and customers.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCreateNew}
              className="button button--light"
              style={{ minHeight: '44px', fontWeight: 800 }}
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Category</span>
            </button>
          </div>
        </div>

        {/* Aggregate Statistics */}
        <StatsCards stats={stats} totalLoaded={categories.length} />

        {/* Search, Filter, and Controls Bar */}
        <div style={{
          background: 'white',
          border: '1px solid var(--line)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 2px 10px rgba(18, 63, 54, 0.03)'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-soft)' }} className="w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories by name or description..."
              className="brand-input"
              style={{ paddingLeft: '40px' }}
            />
          </div>

          {/* Filters and View Controls */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="brand-select"
                style={{ width: 'auto', minWidth: '130px', height: '40px', fontSize: '0.85rem' }}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="brand-select"
              style={{ width: 'auto', minWidth: '160px', height: '40px', fontSize: '0.85rem' }}
            >
              <option value="id">Sort by ID (Ascending)</option>
              <option value="name">Sort by Name (A-Z)</option>
              <option value="newest">Sort by Newest</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#f4f6f4', border: '1px solid var(--line)', borderRadius: '10px', padding: '3px' }}>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: viewMode === 'grid' ? 'white' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--forest)' : 'var(--ink-soft)',
                  boxShadow: viewMode === 'grid' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: viewMode === 'table' ? 'white' : 'transparent',
                  color: viewMode === 'table' ? 'var(--forest)' : 'var(--ink-soft)',
                  boxShadow: viewMode === 'table' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="button button--ghost"
              style={{ minHeight: '40px', padding: '0 12px' }}
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="form-alert" role="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Backend Connection Notice:</strong> {error}
            </div>
            <button
              type="button"
              onClick={loadData}
              className="button button--ghost button--small"
              style={{ border: '1px solid #f0bbae', background: 'white' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Category List Render */}
        {loading && categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--ink-soft)', fontWeight: 600 }}>Loading category catalog...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: 'white',
            borderRadius: '20px',
            border: '1px solid var(--line)',
            boxShadow: '0 4px 20px rgba(18, 63, 54, 0.04)'
          }}>
            <FolderPlus className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--ink)' }}>
              No Categories Found
            </h3>
            <p style={{ color: 'var(--ink-soft)', maxWidth: '420px', margin: '0 auto 20px', fontSize: '0.92rem' }}>
              {search ? `No categories match your search "${search}".` : 'Get started by creating your first service category.'}
            </p>
            <button
              type="button"
              onClick={handleCreateNew}
              className="button button--primary"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEdit}
                onDelete={handleDeletePrompt}
              />
            ))}
          </div>
        ) : (
          <CategoryTable
            categories={filteredCategories}
            onEdit={handleEdit}
            onDelete={handleDeletePrompt}
          />
        )}

      {/* Modals */}
      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveCategory}
        category={selectedCategory}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        category={categoryToDelete}
        loading={deleteLoading}
      />

      </div>
    </section>
  );
}
