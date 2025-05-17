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
        const isValid = auth.isAuthenticated();
        const userData = auth.getUser();

        if (isValid && userData) {
          // Verify token with backend
          const response = await auth.verifyToken();
          if (response.status) {
            setIsAuthenticated(true);
            setUser(userData);
          } else {
            await auth.logout(true); // Silent logout
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        await auth.logout(true); // Silent logout
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

  // If authenticated but wrong role, redirect to correct dashboard
  if (isAuthenticated && user && allowedRole && user.role !== allowedRole) {
    const correctPath = auth.getDefaultRoute(user.role);
    return <Navigate to={correctPath} replace />;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location.pathname }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRole: PropTypes.oneOf(['admin', 'billing', 'admitting'])
};

export default ProtectedRoute;