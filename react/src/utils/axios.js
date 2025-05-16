import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with default config
const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: false, // Changed to false to avoid CSRF token requirements
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Auth methods
export const auth = {
    async login(email, password, remember = false) {
        try {
            console.log('Login attempt with email:', email);
            
            // Direct API request without CSRF token
            const response = await axiosClient.post('/login', { 
                email, 
                password, 
                remember 
            });

            const { data } = response;

            if (data.status) {
                // Store user data and token in localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data));
                
                // Set token expiry
                const expiry = new Date();
                if (remember) {
                    localStorage.setItem('remembered_email', email);
                    expiry.setDate(expiry.getDate() + 30);
                } else {
                    localStorage.removeItem('remembered_email');
                    expiry.setHours(expiry.getHours() + 24);
                }
                localStorage.setItem('tokenExpiry', data.expires_at || expiry.toISOString());

                console.log('Login successful!');
                return data.data;
            }
            
            throw new Error(data.message || 'Login failed');
        } catch (error) {
            console.error('Login failed:', error);
            
            // Enhanced error logging
            if (error.response) {
                console.error('Server response:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            
            throw error;
        }
    },

    async logout() {
        try {
            const token = localStorage.getItem('token');
            
            if (token) {
                await axiosClient.post('/logout', {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // Clear local storage regardless of API success
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            window.location.href = '/';
        }
    },

    getUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            this.logout();
            return null;
        }
    },

    isAuthenticated() {
        const token = localStorage.getItem('token');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        
        if (!token || !tokenExpiry) {
            return false;
        }
        
        // Check if token is expired
        if (new Date(tokenExpiry) < new Date()) {
            this.logout();
            return false;
        }
        
        return true;
    }
};

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        // Add auth token to all requests if it exists
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 (Unauthorized)
        if (error.response?.status === 401) {
            // Only handle true auth failures (not during login)
            if (!error.config.url.includes('/login')) {
                toast.error('Your session has expired. Please sign in again.');
                auth.logout();
            }
        }
        
        // Let the original error proceed
        return Promise.reject(error);
    }
);

export default axiosClient;