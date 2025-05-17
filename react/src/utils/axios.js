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

// Storage utility functions
const storage = {
    local: {
        set: (key, value) => localStorage.setItem(key, value),
        get: (key) => localStorage.getItem(key),
        remove: (key) => localStorage.removeItem(key),
        clear: () => localStorage.clear()
    },
    session: {
        set: (key, value) => sessionStorage.setItem(key, value),
        get: (key) => sessionStorage.getItem(key),
        remove: (key) => sessionStorage.removeItem(key),
        clear: () => sessionStorage.clear()
    },
    // Get from either storage
    getAuth: (key) => {
        return localStorage.getItem(key) || sessionStorage.getItem(key);
    },
    // Clear both storages
    clearAuth: () => {
        localStorage.clear();
        sessionStorage.clear();
    }
};

// Auth methods
export const auth = {
    async login(email, password, remember = false) {
        try {
            console.log('Login attempt with email:', email);
            
            const response = await axiosClient.post('/login', { 
                email, 
                password, 
                remember 
            });

            const { data } = response;

            if (data.status) {
                const storageType = remember ? storage.local : storage.session;
                
                // Store auth data in selected storage
                storageType.set('token', data.token);
                storageType.set('user', JSON.stringify(data.data));
                storageType.set('tokenExpiry', data.expires_at || new Date(Date.now() + 86400000).toISOString());
                
                if (remember) {
                    storageType.set('remembered_email', email);
                } else {
                    storage.local.remove('remembered_email');
                }

                console.log('Login successful!');
                return data.data;
            }
            
            throw new Error(data.message || 'Login failed');
        } catch (error) {
            console.error('Login failed:', error);
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
            const token = storage.getAuth('token');
            
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
            storage.clearAuth();
            window.location.href = '/';
        }
    },

    getUser() {
        try {
            const userStr = storage.getAuth('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            this.logout();
            return null;
        }
    },

    isAuthenticated() {
        const token = storage.getAuth('token');
        const tokenExpiry = storage.getAuth('tokenExpiry');
        
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
        const token = storage.getAuth('token');
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