import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../utils/axios';

const NotFound = () => {
    const navigate = useNavigate();
    const user = auth.getUser();

    const handleReturn = () => {
        if (!user) return navigate('/');
        
        switch (user.role) {
            case 'admin':
                navigate('/admin');
                break;
            case 'billing':
                navigate('/billing');
                break;
            case 'admitting':
                navigate('/admitting');
                break;
            default:
                navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-6 py-12">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-red-600">404</h1>
                <p className="mt-4 text-3xl font-semibold text-gray-800">Page Not Found</p>
                <p className="mt-4 text-lg text-gray-600">
                    Sorry, the page you are looking for doesn't exist or has been moved.
                </p>
                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleReturn}
                        className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
                    >
                        Return to Dashboard
                    </button>
                    {!user && (
                        <div className="mt-4">
                            <Link
                                to="/"
                                className="text-red-600 hover:text-red-700 font-medium"
                            >
                                Go to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotFound;