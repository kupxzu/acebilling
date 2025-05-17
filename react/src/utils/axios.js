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
            const response = await axiosClient.post('/login', { 
                email, 
                password, 
                remember 
            });

            const { data } = response;

            if (data.status) {
                // Always store auth data in localStorage for persistence
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data));
                localStorage.setItem('tokenExpiry', data.expires_at);
                localStorage.setItem('remember', data.remember.toString());

                if (remember) {
                    localStorage.setItem('remembered_email', email);
                } else {
                    localStorage.removeItem('remembered_email');
                }

                return data.data;
            }
            
            throw new Error(data.message || 'Login failed');
        } catch (error) {
            console.error('Login failed:', error);
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
            localStorage.clear();
            window.location.href = '/';
        }
    },

    async verifyToken() {
        try {
            const response = await axiosClient.get('/verify-token');
            return response.data;
        } catch (error) {
            console.error('Token verification failed:', error);
            this.logout();
            throw error;
        }
    },

    isAuthenticated() {
        const token = localStorage.getItem('token');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        const user = this.getUser();
        
        if (!token || !tokenExpiry || !user) {
            return false;
        }
        
        // Check if token is expired
        if (new Date(tokenExpiry) < new Date()) {
            this.logout();
            return false;
        }
        
        return true;
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

    logout() {
        const token = localStorage.getItem('token');
        
        if (token) {
            axiosClient.post('/logout').catch(console.error);
        }
        
        // Save current path before logout if it's not the login page
        const currentPath = window.location.hash.slice(1); // Remove the # from hash
        if (currentPath !== '/' && currentPath !== '/login') {
            localStorage.setItem('redirectUrl', currentPath);
        }
        
        // Clear auth data but preserve redirectUrl and remembered_email
        const redirectUrl = localStorage.getItem('redirectUrl');
        const rememberedEmail = localStorage.getItem('remembered_email');
        
        localStorage.clear();
        
        if (redirectUrl) {
            localStorage.setItem('redirectUrl', redirectUrl);
        }
        if (rememberedEmail) {
            localStorage.setItem('remembered_email', rememberedEmail);
        }
        
        window.location.href = '/';
    }
};

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
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
        if (error.response?.status === 401) {
            // Don't redirect if trying to login or verify token
            const skipRedirectUrls = ['/login', '/verify-token'];
            if (!skipRedirectUrls.some(url => error.config.url.includes(url))) {
                // Save current path before handling unauthorized error
                const currentPath = window.location.hash.slice(1);
                if (currentPath !== '/' && currentPath !== '/login') {
                    localStorage.setItem('redirectUrl', currentPath);
                }
                auth.logout();
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;