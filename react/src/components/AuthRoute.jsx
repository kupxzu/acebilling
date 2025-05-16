import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { auth } from '../utils/axios';

const AuthRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = auth.isAuthenticated();
  const user = auth.getUser();

  if (isAuthenticated && user) {
    const redirect = user.role === 'billing' ? '/billing' : '/admitting';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

AuthRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthRoute;