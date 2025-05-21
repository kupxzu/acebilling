import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';

// Assuming your logo is in the public folder or accessible via a direct path
// IMPORTANT: Replace './your-logo.png' with the correct path to image_961429.png
// For example, if it's in `public/images/logo.png`, use `/images/logo.png`
// If you are importing it directly into your JS (e.g. with Create React App or Vite):
// import DOHBicolCHDLogo from './path/to/your/image_961429.png';
// then use `src={DOHBicolCHDLogo}` in the <img> tag.
const logoUrl = './your-logo.png'; // <<< --- REPLACE THIS PATH!

// Custom Hook to detect clicks outside an element
function useOutsideAlerter(menuRef, buttonRef, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        (!buttonRef.current || !buttonRef.current.contains(event.target))
      ) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, buttonRef, callback]);
}

// Define navigation items outside the component
const navigationItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    exact: true,
    icon: (props) => ( // Green theme for icons in active state
      <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Create Admin',
    path: '/admin/create-admin',
    exact: false,
    icon: (props) => (
      <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  // Add more admin-specific navigation items here
];

const Layout = ({ children, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  useOutsideAlerter(mobileMenuRef, mobileMenuButtonRef, () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  });

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Red & Green Theme: Green as primary for active links
  const activeLinkBgColor = 'bg-emerald-600'; // A nice green
  const activeLinkTextColor = 'text-white';
  const hoverLinkBgColor = 'hover:bg-emerald-50';
  const hoverLinkTextColor = 'hover:text-emerald-700';
  const inactiveLinkTextColor = 'text-slate-700';

  const navLinkClasses = ({ isActive }) =>
    `group flex items-center px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 ${
      isActive
        ? `${activeLinkBgColor} ${activeLinkTextColor} shadow-md`
        : `${inactiveLinkTextColor} ${hoverLinkBgColor} ${hoverLinkTextColor}`
    }`;

  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-150 ease-in-out focus:outline-none focus-visible:bg-emerald-100/80 ${
      isActive
        ? `bg-emerald-100 text-emerald-700`
        : `${inactiveLinkTextColor} ${hoverLinkBgColor} ${hoverLinkTextColor}`
    }`;
    
  // Red theme for logout button
  const logoutButtonBaseClasses = "items-center space-x-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500";
  const logoutButtonDesktopClasses = `hidden sm:flex text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 ${logoutButtonBaseClasses}`;
  const logoutButtonMobileClasses = `w-full mt-3 flex text-red-600 hover:bg-red-50 focus-visible:bg-red-100 ${logoutButtonBaseClasses} justify-center`;


  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-lg fixed w-full z-30 top-0">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* Logo/Brand with Image and Two-Line Text */}
              <Link to="/admin" className="flex-shrink-0 flex items-center group">
                <img
                  src={logoUrl} // Use the variable for the logo path
                  alt="ACE Medical Center Tuguegarao Logo"
                  className="h-10 sm:h-12 w-auto mr-3 group-hover:opacity-90 transition-opacity" // Adjusted height, added hover effect
                />
                <div className="flex flex-col justify-center">
                  <span className="text-base sm:text-lg font-bold text-emerald-700 leading-tight group-hover:text-emerald-800 transition-colors">
                    ACEMCT
                  </span>
                  <span className="text-xs sm:text-sm text-slate-600 leading-tight group-hover:text-slate-700 transition-colors">
                    ACE Medical Center Tuguegarao
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex flex-grow justify-center items-center space-x-2 px-4">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    end={item.exact}
                    className={navLinkClasses}
                  >
                    <IconComponent className="w-5 h-5 mr-2 opacity-90 group-[.bg-emerald-600]:text-white group-hover:opacity-100 transition-opacity" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right side: Logout and Mobile Menu Button */}
            <div className="flex items-center space-x-3">
              <button onClick={onLogout} className={logoutButtonDesktopClasses}>
                <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>

              <div className="md:hidden flex items-center">
                <button
                  ref={mobileMenuButtonRef}
                  onClick={toggleMobileMenu}
                  type="button"
                  className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 transition-colors"
                  aria-controls="mobile-menu"
                  aria-expanded={isMobileMenuOpen}
                  aria-label="Open main menu"
                >
                  <div className="w-6 h-6 flex flex-col justify-center items-center">
                    <span className={`block h-0.5 bg-slate-700 rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? 'w-6 rotate-45 translate-y-[0.28rem]' : 'w-6 mb-1.5'}`} />
                    <span className={`block h-0.5 bg-slate-700 rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-[0.28rem]' : 'w-5'}`} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className={`md:hidden bg-white shadow-xl border-t border-gray-200 fixed top-16 left-0 right-0 z-20 transition-all duration-300 ease-in-out origin-top
            ${isMobileMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100 visible overflow-y-auto' : 'max-h-0 opacity-0 invisible'}`}
        >
          <div className="px-3 pt-3 pb-4 space-y-1.5">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <NavLink
                  key={`mobile-${item.name}`}
                  to={item.path}
                  end={item.exact}
                  className={mobileNavLinkClasses}
                  onClick={closeMobileMenu}
                >
                  <IconComponent className="w-5 h-5 mr-3 opacity-80 group-[.bg-emerald-100]:text-emerald-700"/>
                  {item.name}
                </NavLink>
              );
            })}
            <button
              onClick={() => { onLogout(); closeMobileMenu(); }}
              className={logoutButtonMobileClasses}
            >
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16 bg-slate-50"> {/* Content background */}
        <div className="py-6 sm:py-8">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-300 text-center p-6 border-t border-slate-700">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} ACE Medical Center Tuguegarao - Admin Panel. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;