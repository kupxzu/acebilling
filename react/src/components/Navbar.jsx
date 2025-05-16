import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/admitting" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                ACE
              </span>
              <span className="text-2xl font-light text-gray-700">&nbsp;Medical</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user?.role === 'admitting' && (
              <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg">
                <NavLink to="/admitting" active={isActive('/admitting')}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </NavLink>
                <NavLink to="/admitting/new-patient" active={isActive('/admitting/new-patient')}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  New Admission
                </NavLink>
                <NavLink to="/admitting/patients" active={isActive('/admitting/patients')}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Patients
                </NavLink>
              </div>
            )}
            
            {user?.role === 'billing' && (
              <div className="flex space-x-1 bg-gray-50 p-1 rounded-lg">
                <NavLink to="/billing" active={isActive('/billing')}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Dashboard
                </NavLink>
                <NavLink to="/billing/patients" active={isActive('/billing/patients')}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Billing
                </NavLink>

              </div>
            )}

            {/* Profile Menu */}
            <div className="relative ml-4">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-medium">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-6 flex flex-col items-end space-y-1.5">
                <span className={`block h-0.5 bg-gray-600 transition-all transform duration-300 ${isOpen ? 'w-6 rotate-45 translate-y-2' : 'w-6'}`} />
                <span className={`block h-0.5 bg-gray-600 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'w-4'}`} />
                <span className={`block h-0.5 bg-gray-600 transition-all transform duration-300 ${isOpen ? 'w-6 -rotate-45 -translate-y-2' : 'w-5'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 py-2 space-y-1 bg-gray-50">
          {user?.role === 'admitting' && (
            <div className="space-y-1">
              <MobileNavLink to="/admitting" active={isActive('/admitting')}>Dashboard</MobileNavLink>
              <MobileNavLink to="/admitting/new-patient" active={isActive('/admitting/new-patient')}>New Admission</MobileNavLink>
              <MobileNavLink to="/admitting/patients" active={isActive('/admitting/patients')}>Patients</MobileNavLink>
            </div>
          )}
          {user?.role === 'billing' && (
            <div className="space-y-1">
              <MobileNavLink to="/billing" active={isActive('/billing')}>Dashboard</MobileNavLink>
              <MobileNavLink to="/billing/patients" active={isActive('/billing/patients')}>Billing</MobileNavLink>
              <MobileNavLink to="/billing/charges" active={isActive('/billing/charges')}>Charges</MobileNavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      active
        ? 'bg-white text-teal-600 shadow-sm'
        : 'text-gray-600 hover:text-teal-600 hover:bg-white'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? 'bg-white text-teal-600'
        : 'text-gray-600 hover:bg-white hover:text-teal-600'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;