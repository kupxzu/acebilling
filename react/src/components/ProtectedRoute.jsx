import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { auth } from '../utils/axios';
import LoadingSpinner from './common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRole }) => {
  const location = useLocation();
  const isAuthenticated = auth.isAuthenticated();
  const user = auth.getUser();
  
  // Check if token is expired
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
    auth.logout();
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Show loading spinner while checking auth
  if (!isAuthenticated && !user) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check role access
  if (allowedRole && user?.role !== allowedRole) {
    const redirect = user?.role === 'billing' ? '/billing' : '/admitting';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRole: PropTypes.oneOf(['admitting', 'billing']).isRequired
};

export default ProtectedRoute;