import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('fixsquad:unauthorized'));
    }

    return Promise.reject(error);
  },
);


export const searchServices = async (params = {}) => {
  const response = await api.get('/services/search', { params });
  return response.data;
};

export const fetchServiceById = async (id) => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

export const checkAvailability = async (providerId, date) => {
  const response = await api.get('/bookings/check-availability', {
    params: { provider_id: providerId, date }
  });
  return response.data;
};

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export default api;


export const fetchProviderServices = async () => {
    const response = await api.get('/services');
    return response.data;
};

export const createService = async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
};

export const updateService = async (id, serviceData) => {
    const response = await api.put(`/services/${id}`, serviceData);
    return response.data;
};

export const deleteService = async (id) => {
    const response = await api.delete(`/services/${id}`);
    return response.data;
};

// Mock function to get categories (until category manager is done)
export const fetchCategories = async () => {
    return {
        data: [
            { id: 1, name: 'Plumbing' },
            { id: 2, name: 'Electrical' },
            { id: 3, name: 'Cleaning' },
            { id: 4, name: 'Carpentry' }
        ]
    };
};

export const fetchPendingBookings = async () => {
    const response = await api.get('/bookings/provider/pending');
    return response.data;
};

export const updateBookingStatus = async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
};

// PUT /api/admin/disputes/:id/resolve — override disputed booking status (admin only)
// status: 'Completed' | 'Cancelled' | 'In-Progress'
export const resolveDispute = async (id, status) => {
  const response = await api.put(`/admin/disputes/${id}/resolve`, { status });
  return response.data;
};

// ── Sprint 4: Customer Text Reviews — Rohan (Week4_Rohan_CONTRACT.md) ─────────

// POST /api/reviews — submit a text review for a completed booking
export const submitReview = async (bookingId, reviewText) => {
  const response = await api.post('/reviews', { booking_id: bookingId, review_text: reviewText });
  return response.data;
};

// GET /api/reviews/provider/:providerId — fetch all text reviews for a provider (public)
export const fetchProviderReviews = async (providerId) => {
  const response = await api.get(`/reviews/provider/${providerId}`);
  return response.data;
};

// GET /api/reviews/my-reviews — fetch booking IDs the current customer has already reviewed
export const fetchMyReviewedBookingIds = async () => {
  const response = await api.get('/reviews/my-reviews');
  return response.data; // { success: true, data: [bookingId, ...] }
};

export const fetchAvailability = async () => {
    const response = await api.get('/availability');
    return response.data;
};

export const addAvailabilityBlock = async (data) => {
    const response = await api.post('/availability', data);
    return response.data;
};

export const removeAvailabilityBlock = async (id) => {
    const response = await api.delete(`/availability/${id}`);
    return response.data;
};

// ── Sprint 3: Admin Dispute Resolution — Naim (Week3_Naim_CONTRACT.md) ────────

// GET /api/admin/disputes — fetch all Disputed bookings (admin only)
export const fetchDisputedBookings = async () => {
  const response = await api.get('/admin/disputes');
  return response.data;
};
