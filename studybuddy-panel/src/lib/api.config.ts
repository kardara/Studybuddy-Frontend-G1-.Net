import axios from 'axios';

// Backend API base URL - update this to your MonsterASP.NET backend URL
// For local development: 'http://localhost:5103'
// For production: 'https://your-app-name.monsterasp.net'
export const API_BASE_URL = 'http://localhost:5103'; // TODO: Replace with your actual MonsterASP.NET URL
export const API_VERSION = '/api/v1';

// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: `${API_BASE_URL}${API_VERSION}`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);
