// API Service wrapper
const API_BASE_URL = '/api';

// Utility to handle fetch responses
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'API request failed');
    }
    return data;
};

// Gets auth headers assuming a token is stored in localStorage
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

export const fetchProviderServices = async () => {
    const response = await fetch(`${API_BASE_URL}/services`, {
        headers: getHeaders(),
    });
    return handleResponse(response);
};

export const createService = async (serviceData) => {
    const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(serviceData)
    });
    return handleResponse(response);
};

export const updateService = async (id, serviceData) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(serviceData)
    });
    return handleResponse(response);
};

export const deleteService = async (id) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(response);
};

// Mock function to get categories (until category manager is done)
export const fetchCategories = async () => {
    // In reality this would be: await fetch(`${API_BASE_URL}/categories`)
    return {
        data: [
            { id: 1, name: 'Plumbing' },
            { id: 2, name: 'Electrical' },
            { id: 3, name: 'Cleaning' },
            { id: 4, name: 'Carpentry' }
        ]
    };
};
