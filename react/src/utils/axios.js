import axios from 'axios';

const axiosClient = axios.create({
    baseURL: '/api',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        // Skip authentication for portal routes
        const isPortalRoute = config.url.includes('/portal/patient/');
        
        if (!isPortalRoute) {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API error:', error.response?.data);
        
        // Skip authentication redirect for portal routes
        const isPortalRoute = error.config?.url?.includes('/portal/patient/');
        
        if (error.response?.status === 401 && !isPortalRoute) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        
        return Promise.reject(error);
    }
);

export default axiosClient;