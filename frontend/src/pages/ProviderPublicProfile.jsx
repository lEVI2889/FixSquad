// Feature 4 (Customer Feedback & Text Review System) — Rohan (Week4_Rohan_CONTRACT.md)
// Public Provider Profile page — displays provider's services and customer text reviews.
// Route: /provider/:providerId/profile  (no auth required)
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProviderReviews } from '../services/api';
import api from '../services/api';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function ReviewCard({ review }) {
  const rating = Number(review.rating) || 5;
  const commentText = review.comment || review.review_text || 'No written feedback provided.';

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--line)',
      borderRadius: '16px',
      padding: '20px 24px',
      boxShadow: '0 2px 8px rgba(18, 63, 54, 0.03)',
      transition: 'border-color 0.2s, box-shadow 0.2s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        <div>
          <h4 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 2px', color: 'var(--ink)' }}>
            {review.customer_name}
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>
            for service: <strong style={{ color: 'var(--forest)' }}>{review.service_name || 'Household Service'}</strong>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: '2px' }}>
            {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
          </div>
          <span style={{ fontSize: '0.78rem', color: '#8c9c97' }}>
            {formatDate(review.created_at)}
          </span>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--ink)', lineHeight: 1.6 }}>
        "{commentText}"
      </p>
    </div>
  );
}

function ServiceCard({ service }) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--line)',
      borderRadius: '16px',
      padding: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      boxShadow: '0 2px 8px rgba(18, 63, 54, 0.03)'
    }}>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--ink)' }}>
          {service.name}
        </h4>
        {service.description && (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink-soft)', lineHeight: 1.5 }}>
            {service.description}
          </p>
        )}
      </div>
      <span style={{
        background: 'var(--mint-pale)',
        color: 'var(--forest)',
        fontWeight: 800,
        fontSize: '0.95rem',
        padding: '6px 14px',
        borderRadius: '10px',
        border: '1px solid #bce6d4',
        whiteSpace: 'nowrap'
      }}>
        ৳{Number(service.base_price).toFixed(2)}
      </span>
    </div>
  );
}

export default function ProviderPublicProfile() {
  const { providerId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const [providerName, setProviderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!providerId) return;

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const [reviewsRes, servicesRes] = await Promise.all([
          fetchProviderReviews(providerId),
          api.get(`/services/search?provider_id=${providerId}`).catch(() => ({ data: { data: [] } }))
        ]);

        if (!cancelled) {
          const reviewData = reviewsRes.data || [];
          const serviceData = servicesRes.data?.data || [];
          setReviews(reviewData);
          setServices(serviceData);

          if (serviceData.length > 0 && serviceData[0].provider_name) {
            setProviderName(serviceData[0].provider_name);
          } else if (reviewData.length > 0 && reviewData[0].provider_name) {
            setProviderName(reviewData[0].provider_name);
          }
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load provider profile. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();
    return () => { cancelled = true; };
  }, [providerId]);

  if (loading) {
    return (
      <section className="dashboard-page">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div className="spinner" />
          <p style={{ color: 'var(--ink-soft)', fontWeight: 600, marginTop: '12px' }}>Loading verified provider profile…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-page">
        <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="form-alert" role="alert">{error}</div>
          <Link to="/services" className="button button--ghost" style={{ marginTop: '16px', display: 'inline-block' }}>
            ← Back to Services
          </Link>
        </div>
      </section>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="dashboard-page">
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Back navigation */}
        <Link
          to="/services"
          className="button button--ghost button--small"
          style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back to Catalog
        </Link>

        {/* Provider header banner */}
        <div style={{
          background: 'white',
          border: '1px solid var(--line)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '36px',
          boxShadow: '0 4px 20px rgba(18, 63, 54, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'var(--mint-pale)',
            color: 'var(--forest)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '1.8rem',
            fontWeight: 800,
            flexShrink: 0
          }}>
            {providerName ? providerName[0].toUpperCase() : 'P'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{
                fontFamily: 'Manrope, sans-serif',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 800,
                color: 'var(--ink)',
                margin: 0
              }}>
                {providerName || `Service Provider #${providerId}`}
              </h1>
              <span className="badge badge--accepted" style={{ fontSize: '0.78rem' }}>
                Verified Provider
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', color: 'var(--ink-soft)', fontSize: '0.9rem' }}>
              {avgRating && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--ink)' }}>
                  <span style={{ color: '#f59e0b' }}>★</span> {avgRating} Rating
                </span>
              )}
              <span>{reviews.length} Verified Review{reviews.length !== 1 ? 's' : ''}</span>
              {services.length > 0 && <span>{services.length} Published Service{services.length !== 1 ? 's' : ''}</span>}
            </div>
          </div>
        </div>

        {/* Services section */}
        {services.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--ink)',
              margin: '0 0 16px'
            }}>
              Services Offered
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {services.map((svc) => (
                <ServiceCard key={svc.id} service={svc} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--ink)',
              margin: 0
            }}>
              Customer Reviews
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--ink-soft)', fontWeight: 600 }}>
              {reviews.length} Total
            </span>
          </div>

          {reviews.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px 20px',
              background: 'white',
              borderRadius: '16px',
              border: '1px dashed var(--line)',
              color: 'var(--ink-soft)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💬</div>
              <h3 style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--ink)' }}>
                No Reviews Yet
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>
                Be the first to rate and review this provider after your job is completed.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
