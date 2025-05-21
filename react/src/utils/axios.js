import axios from 'axios';
import { toast } from 'react-toastify';

// Cache and request tracking
const responseCache = new Map();
const pendingRequests = new Map();
const debouncedFunctions = new Map();

// Configuration
const CACHE_TTL = 60000; // 1 minute cache lifetime
const MAX_CACHE_SIZE = 100;
const RETRY_DELAY = 1000;
const MAX_RETRIES = 2;

// Create axios instance with enhanced config
const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    decompress: true,
    timeout: 30000
});

// Helper functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const trimCache = () => {
    if (responseCache.size <= MAX_CACHE_SIZE) return;
    const entries = Array.from(responseCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.2));
    toRemove.forEach(([key]) => responseCache.delete(key));
};

const getRequestKey = (method, url, params = {}, data = {}) => {
    const paramString = typeof params === 'object' ? JSON.stringify(params) : params;
    const dataString = data ? JSON.stringify(data) : '';
    return `${method.toUpperCase()}:${url}:${paramString}:${dataString}`;
};

// Auth methods with enhanced caching
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
                // Always store in localStorage for consistency
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data));
                localStorage.setItem('tokenExpiry', data.expires_at);
                
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

    isAuthenticated() {
        const token = localStorage.getItem('token');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        const user = this.getUser();
        
        if (!token || !tokenExpiry || !user) {
            return false;
        }
        
        // Check if token is expired
        if (new Date(tokenExpiry) < new Date()) {
            this.logout(true);
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
            this.logout(true);
            return null;
        }
    },

async verifyToken() {
    try {
        const response = await axiosClient.get('/verify-token');
        return response.data;
    } catch (error) {
        // Only log the error, don't automatically logout
        console.error('Token verification failed:', error);
        
        // Check if it's specifically an auth error
        if (error.response?.status === 401) {
            this.logout(true);
        }
        
        throw error;
    }
},

    getDefaultRoute(role) {
        switch (role) {
            case 'admin':
                return '/admin';
            case 'billing':
                return '/billing';
            case 'admitting':
                return '/admitting';
            default:
                return '/';
        }
    },

    async logout(silent = false) {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await axiosClient.post('/logout');
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            const rememberedEmail = localStorage.getItem('remembered_email');
            localStorage.clear();
            
            if (rememberedEmail) {
                localStorage.setItem('remembered_email', rememberedEmail);
            }
            
            if (!silent) {
                window.location.href = '/';
            }
        }
    }
};

// Request interceptor with enhanced features
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Set up cancellation
    const controller = new AbortController();
    config.signal = controller.signal;

    // Generate request key
    const method = config.method || 'get';
    const requestKey = config.requestKey ||
        getRequestKey(method, config.url, config.params, config.data);
    config.requestKey = requestKey;

    // Check cache for GET requests
    if (method === 'get' && config.cache !== false) {
        const cached = responseCache.get(requestKey);
        if (cached && Date.now() - cached.timestamp < (config.cacheTTL || CACHE_TTL)) {
            if (config.resolveFromCache) {
                return { ...config, cachedResponse: cached };
            }
        }
    }

    // Cancel existing request with same key
    axiosClient.cancelRequest(requestKey);
    pendingRequests.set(requestKey, controller);

    return config;
}, error => Promise.reject(error));

// Response interceptor with enhanced error handling
axiosClient.interceptors.response.use(
    (response) => {
        const { config } = response;

        if (config.cachedResponse) {
            return {
                ...response,
                data: config.cachedResponse.data,
                headers: config.cachedResponse.headers,
                fromCache: true,
                status: 200,
            };
        }

        if (config.requestKey) {
            pendingRequests.delete(config.requestKey);
        }

        if (config.method === 'get' && config.cache !== false) {
            responseCache.set(config.requestKey, {
                data: response.data,
                timestamp: Date.now(),
                headers: response.headers
            });
            trimCache();
        }

        return response;
    },
    (error) => {
        // Special handling for cancellation errors
        if (axios.isCancel(error)) {
            console.log('Request canceled:', error.message);
            return Promise.resolve({ 
                data: { status: true, message: 'Request canceled', data: [] },
                status: 200,
                fromCancel: true
            });
        }
        
        if (error.response?.status === 401) {
            auth.logout(true);
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);
// Add enhanced methods to axiosClient
Object.assign(axiosClient, {
    cancelRequest(key) {
        if (pendingRequests.has(key)) {
            const controller = pendingRequests.get(key);
            controller.abort();
            pendingRequests.delete(key);
            return true;
        }
        return false;
    },

    /**
     * POST with cache invalidation and cancellation
     */
    postWithCancel(url, data = {}, options = {}) {
        const requestKey = options.requestKey || getRequestKey('post', url, {}, data);

        // Invalidate affected caches if needed
        if (options.invalidateCache !== false) {
            const cachePrefix = options.cachePrefix || url.split('/')[1];
            this.invalidateCache(`GET:/${cachePrefix}`);
        }

        return this.post(url, data, {
            ...options,
            requestKey,
            cache: false
        });
    },

    /**
     * Invalidate cache entries by prefix
     */
    invalidateCache(keyPrefix) {
        let count = 0;
        for (const key of responseCache.keys()) {
            if (key.startsWith(keyPrefix)) {
                responseCache.delete(key);
                count++;
            }
        }
        return count;
    }
});

export default axiosClient;