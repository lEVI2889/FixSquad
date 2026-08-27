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
