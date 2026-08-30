import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('fixsquad_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid kicking out if unauthenticated public browsing
      const isPublicSearch = error.config?.url?.includes('/services/search') || error.config?.url?.includes('/check-availability');
      if (!isPublicSearch) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('fixsquad:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

// --- Feature 1: Dynamic Search & Filter APIs ---
export const searchServices = async (params = {}) => {
  const response = await api.get('/services/search', { params });
  return response.data;
};

export const fetchServiceById = async (id) => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

export const fetchCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// --- Feature 2: Interactive Booking Engine APIs ---
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

export const fetchCustomerBookings = async () => {
  const response = await api.get('/bookings/customer/mine');
  return response.data;
};

// --- Provider & Teammate APIs ---
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

export default api;
