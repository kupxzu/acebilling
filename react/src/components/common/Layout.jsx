import { useState } from 'react';
import { NavLink } from 'react-router-dom';

// Moved navigation array outside the component for performance
const navigationItems = [
    {
        name: 'Dashboard',
        path: '/admin',
        icon: (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        name: 'Create Admin',
        path: '/admin/create-admin',
        icon: (
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
        ),
    },
    // Add more navigation items as needed
];

const Layout = ({ children, onLogout, showAdmins, onToggleAdmins }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navLinkClasses = ({ isActive }) =>
        `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out ${
            isActive
                ? 'bg-red-100 text-red-800'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }`;

    const mobileNavLinkClasses = ({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium ${
            isActive
                ? 'bg-red-100 text-red-800'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        }`;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navbar */}
            <header className="bg-white shadow-md fixed w-full z-20 top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            {/* Logo/Brand */}
                            <div className="flex-shrink-0">
                                <NavLink to="/admin" className="text-xl font-bold text-gray-900 tracking-tight">
                                    ACEMCT ADMIN
                                </NavLink>
                            </div>

                            {/* Desktop Navigation Links */}
                            <div className="hidden md:flex space-x-1">
                                {navigationItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={navLinkClasses}
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* Right side: Toggle, Logout, and Mobile Menu Button */}
                        <div className="flex items-center space-x-3">
                            {/* Admin/User Toggle Button */}
                            <button
                                onClick={onToggleAdmins}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    showAdmins
                                        ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                                        : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-50'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>{showAdmins ? 'View Users' : 'View Admins'}</span>
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={onLogout}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ease-in-out flex items-center space-x-1 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </button>

                            {/* Mobile menu button */}
                            <div className="md:hidden flex items-center">
                                <button
                                    onClick={toggleMobileMenu}
                                    type="button"
                                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                                    aria-controls="mobile-menu"
                                    aria-expanded={isMobileMenuOpen}
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMobileMenuOpen ? (
                                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile menu, show/hide based on menu state. */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white shadow-lg" id="mobile-menu">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navigationItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={mobileNavLinkClasses}
                                    onClick={() => setIsMobileMenuOpen(false)} // Close menu on link click
                                >
                                    {/* Mobile links usually don't have icons, but you can add them if needed */}
                                    {/* item.icon */}
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content - Add padding top to clear the fixed navbar */}
            <main className="flex-grow pt-16"> {/* flex-grow makes sure footer stays at bottom */}
                {/* Container for main content padding */}
                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white text-center p-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    &copy; {new Date().getFullYear()} ACE Billing. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;