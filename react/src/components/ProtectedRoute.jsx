import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { auth } from '../utils/axios';
import LoadingSpinner from './common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRole }) => {
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // First check if user is authenticated locally
        const isValid = auth.isAuthenticated();
        const userData = auth.getUser();
        
        if (isValid && userData) {
          try {
            // Only verify with backend if we have a token
            const response = await auth.verifyToken();
            
            if (response.status) {
              setIsAuthenticated(true);
              setUser(userData);
            } else {
              console.error('Token verification returned false status');
              await auth.logout(true);
              setIsAuthenticated(false);
              setUser(null);
            }
          } catch (error) {
            // Log the specific error for debugging
            console.error('Token verification error:', error.message);
            
            // Only logout if it's a 401 error or specific authentication error
            if (error.response?.status === 401) {
              await auth.logout(true);
              setIsAuthenticated(false);
              setUser(null);
            } else {
              // For other errors (like network issues), still allow access based on localStorage
              console.warn('Using cached authentication due to API error');
              setIsAuthenticated(true);
              setUser(userData);
            }
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    
    verifyAuth();
  }, []);
  
  if (!authChecked) {
    return <LoadingSpinner />;
  }
  
  // If authenticated but wrong role, redirect to correct dashboard
  if (isAuthenticated && user && allowedRole && user.role !== allowedRole) {
    const correctPath = auth.getDefaultRoute(user.role);
    return <Navigate to={correctPath} replace />;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    // Store the current path for redirect after login
    localStorage.setItem('redirectUrl', location.pathname);
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }
  
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRole: PropTypes.oneOf(['admin', 'billing', 'admitting'])
};

export default ProtectedRoute;