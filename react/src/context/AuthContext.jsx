import { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from '../utils/axios';
import axios from 'axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const tokenExpiry = localStorage.getItem('tokenExpiry');
            
            // Check if token exists and is not expired
            if (token && storedUser) {
                if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
                    // Token has expired
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('tokenExpiry');
                    setUser(null);
                } else {
                    // Token is valid
                    setUser(JSON.parse(storedUser));
                    
                    // Verify with server
                    try {
                        const response = await axiosClient.get('/user');
                        setUser(response.data);
                    } catch (error) {
                        if (error.response?.status === 401) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('user');
                            localStorage.removeItem('tokenExpiry');
                            setUser(null);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Check auth error:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password, remember = false) => {
        try {
            // Get CSRF cookie first
            await axios.get('/sanctum/csrf-cookie', { withCredentials: true });

            const response = await axiosClient.post('/login', {
                email,
                password,
                remember
            });

            if (response.data.status) {
                const { token, data: user } = response.data;
                
                // Store auth data
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Handle remember me
                if (remember) {
                    // Set expiry to 30 days
                    const expiry = new Date();
                    expiry.setDate(expiry.getDate() + 30);
                    localStorage.setItem('tokenExpiry', expiry.toISOString());
                } else {
                    // Set expiry to 24 hours
                    const expiry = new Date();
                    expiry.setHours(expiry.getHours() + 24);
                    localStorage.setItem('tokenExpiry', expiry.toISOString());
                }

                setUser(user);
                return user;
            }
            
            throw new Error('Invalid response from server');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await axiosClient.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);