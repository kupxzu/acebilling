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
        // Check authentication and verify token with backend
        const isValid = auth.isAuthenticated();
        const userData = auth.getUser();

        if (isValid && userData) {
          // Verify token with backend
          const response = await auth.verifyToken();
          if (response.status) {
            setIsAuthenticated(true);
            setUser(userData);
          } else {
            // Token invalid - clear and redirect
            auth.logout();
            setIsAuthenticated(false);
            setUser(null);
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

  // Show loading spinner while checking authentication
  if (!authChecked) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  // Check role access
  if (allowedRole && user.role !== allowedRole) {
    const redirect = user.role === 'billing' ? '/billing' : '/admitting';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRole: PropTypes.oneOf(['admin', 'billing', 'admitting'])
};

export default ProtectedRoute;