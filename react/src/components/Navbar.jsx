// Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// Import these libraries in your project:
// npm install @headlessui/react @heroicons/react

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo section */}
                    <div className="flex items-center">
                        <span className="text-teal-600 font-semibold text-xl">ACE Medical</span>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center">
                        {user?.role === 'admitting' && (
                            <>
                                <Link
                                    to="/admitting"
                                    className={`px-3 py-2 mx-1 rounded-md text-sm font-medium ${
                                        location.pathname === '/admitting'
                                            ? 'text-teal-700 bg-teal-50'
                                            : 'text-gray-600 hover:text-teal-600'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/admitting/new-patient"
                                    className={`px-3 py-2 mx-1 rounded-md text-sm font-medium ${
                                        location.pathname === '/admitting/new-patient'
                                            ? 'text-teal-700 bg-teal-50'
                                            : 'text-gray-600 hover:text-teal-600'
                                    }`}
                                >
                                    New Admission
                                </Link>
                                <Link
                                    to="/admitting/patients"
                                    className={`px-3 py-2 mx-1 rounded-md text-sm font-medium ${
                                        location.pathname === '/admitting/patients'
                                            ? 'text-teal-700 bg-teal-50'
                                            : 'text-gray-600 hover:text-teal-600'
                                    }`}
                                >
                                    View Patients
                                </Link>
                            </>
                        )}
                        {user?.role === 'billing' && (
                            <>
                                <Link
                                    to="/billing"
                                    className={`px-3 py-2 mx-1 rounded-md text-sm font-medium ${
                                        location.pathname === '/billing'
                                            ? 'text-teal-700 bg-teal-50'
                                            : 'text-gray-600 hover:text-teal-600'
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/billing/patients"
                                    className={`px-3 py-2 mx-1 rounded-md text-sm font-medium ${
                                        location.pathname === '/billing/patients'
                                            ? 'text-teal-700 bg-teal-50'
                                            : 'text-gray-600 hover:text-teal-600'
                                    }`}
                                >
                                    Patient Bills
                                </Link>
                                <Link
                                    to="/billing/charges"
                                    className={`px-3 py-2 mx-1 rounded-md text-sm font-medium ${
                                        location.pathname === '/billing/charges'
                                            ? 'text-teal-700 bg-teal-50'
                                            : 'text-gray-600 hover:text-teal-600'
                                    }`}
                                >
                                    Add Charges
                                </Link>
                                <Link
                                    to="/billing/reports"
                                    className={`px-3 py-2 mx-1 rounded-md text-sm font-medium ${
                                        location.pathname === '/billing/reports'
                                            ? 'text-teal-700 bg-teal-50'
                                            : 'text-gray-600 hover:text-teal-600'
                                    }`}
                                >
                                    Reports
                                </Link>
                            </>
                        )}
                    </div>

                    {/* User section */}
                    <div className="flex items-center">
                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center text-gray-600 hover:text-teal-600 focus:outline-none"
                            >
                                <div className="h-8 w-8 rounded-full bg-teal-100 flex items-center justify-center">
                                    <span className="text-teal-600 font-medium">{user?.name?.[0] || 'U'}</span>
                                </div>
                            </button>
                            
                            {/* Dropdown */}
                            {isOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                                    <div className="px-4 py-2 text-sm text-gray-600">
                                        <div className="font-medium">{user?.name || 'User'}</div>
                                        <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                                    </div>
                                    <div className="border-t border-gray-100"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Mobile menu button */}
                        <div className="md:hidden ml-2">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-1 rounded-md text-gray-500 hover:text-teal-600 focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 pt-2 pb-3">
                    {user?.role === 'admitting' && (
                        <div className="space-y-1 px-2">
                            <Link
                                to="/admitting"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === '/admitting'
                                        ? 'text-teal-700 bg-teal-50'
                                        : 'text-gray-600 hover:text-teal-600'
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/admitting/new-patient"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === '/admitting/new-patient'
                                        ? 'text-teal-700 bg-teal-50'
                                        : 'text-gray-600 hover:text-teal-600'
                                }`}
                            >
                                New Admission
                            </Link>
                            <Link
                                to="/admitting/patients"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === '/admitting/patients'
                                        ? 'text-teal-700 bg-teal-50'
                                        : 'text-gray-600 hover:text-teal-600'
                                }`}
                            >
                                View Patients
                            </Link>
                        </div>
                    )}
                    {user?.role === 'billing' && (
                        <div className="space-y-1 px-2">
                            <Link
                                to="/billing"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === '/billing'
                                        ? 'text-teal-700 bg-teal-50'
                                        : 'text-gray-600 hover:text-teal-600'
                                }`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/billing/patients"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === '/billing/patients'
                                        ? 'text-teal-700 bg-teal-50'
                                        : 'text-gray-600 hover:text-teal-600'
                                }`}
                            >
                                Patient Bills
                            </Link>
                            <Link
                                to="/billing/charges"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === '/billing/charges'
                                        ? 'text-teal-700 bg-teal-50'
                                        : 'text-gray-600 hover:text-teal-600'
                                }`}
                            >
                                Add Charges
                            </Link>
                            <Link
                                to="/billing/reports"
                                className={`block px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === '/billing/reports'
                                        ? 'text-teal-700 bg-teal-50'
                                        : 'text-gray-600 hover:text-teal-600'
                                }`}
                            >
                                Reports
                            </Link>
                        </div>
                    )}
                    <div className="border-t border-gray-200 pt-4 pb-3 px-4">
                        <div className="flex items-center">
                            <div className="text-base font-medium text-gray-800">{user?.name || 'User'}</div>
                        </div>
                        <div className="mt-3">
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-50"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;