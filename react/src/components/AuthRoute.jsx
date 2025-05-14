import { Navigate } from 'react-router-dom';

const AuthRoute = ({ children }) => {
    // Check both localStorage for existing authentication
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        const userData = JSON.parse(user);
        // If user is already logged in, redirect to their dashboard
        if (userData.role === 'billing') {
            return <Navigate to="/billing" replace />;
        } else if (userData.role === 'admitting') {
            return <Navigate to="/admitting" replace />;
        }
    }
    
    // If not logged in, render the auth page
    return children;
};

export default AuthRoute;