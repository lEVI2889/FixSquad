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
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-slate-800">{review.customer_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">for: {review.service_name}</p>
        </div>
        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{formatDate(review.created_at)}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{review.review_text}</p>
    </div>
  );
}

function ServiceCard({ service }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex justify-between items-center">
      <div>
        <p className="font-semibold text-slate-800">{service.name}</p>
        {service.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{service.description}</p>
        )}
      </div>
      <span className="ml-4 text-indigo-700 font-bold text-sm whitespace-nowrap">
        ${Number(service.base_price).toFixed(2)}
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
        // Fetch reviews (public) and provider's published services in parallel
        const [reviewsRes, servicesRes] = await Promise.all([
          fetchProviderReviews(providerId),
          // Services endpoint is protected, but we attempt a public variant via search
          api.get(`/services/search?provider_id=${providerId}`).catch(() => ({ data: { data: [] } }))
        ]);

        if (!cancelled) {
          const reviewData = reviewsRes.data || [];
          setReviews(reviewData);
          setServices(servicesRes.data?.data || []);

          // Derive provider name from reviews if available
          if (reviewData.length > 0) {
            // Reviews don't carry provider name but bookings→services join can give service_name
            // Provider name fetched separately for display
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
      <div className="container max-w-4xl mx-auto py-16 px-6 text-center text-gray-500">
        Loading provider profile…
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-16 px-6 text-center text-red-600 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <main className="container max-w-4xl mx-auto py-12 px-6">
      {/* Back navigation */}
      <Link
        to="/services"
        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
      >
        ← Back to Services
      </Link>

      {/* Provider header */}
      <div className="bg-gradient-to-r from-indigo-50 to-white rounded-2xl border border-indigo-100 p-8 mb-8 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 rounded-full bg-indigo-200 flex items-center justify-center text-2xl font-bold text-indigo-700 shrink-0">
            {providerName ? providerName[0].toUpperCase() : '#'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {providerName || `Provider #${providerId}`}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {reviews.length} customer review{reviews.length !== 1 ? 's' : ''}
              {services.length > 0 && ` · ${services.length} service${services.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      </div>

      {/* Services section */}
      {services.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-gray-200">
            Services Offered
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => (
              <ServiceCard key={svc.id} service={svc} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews section */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-gray-200">
          Customer Reviews
        </h2>

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="font-semibold">No reviews yet</p>
            <p className="text-sm mt-1">Be the first to leave feedback after your job is completed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
