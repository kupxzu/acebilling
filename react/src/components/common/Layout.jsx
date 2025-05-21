import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';

// Assuming your logo is in the public folder or accessible via a direct path
// IMPORTANT: Replace './your-logo.png' with the correct path to image_961429.png
// For example, if it's in `public/images/logo.png`, use `/images/logo.png`
const logoUrl = './your-logo.png'; // <<< --- REPLACE THIS PATH!

// Custom Hook to detect clicks outside an element
function useOutsideAlerter(ref, buttonRef, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        (!buttonRef.current || !buttonRef.current.contains(event.target))
      ) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, buttonRef, callback]);
}

// Define navigation items outside the component
const navigationItems = [
  {
    name: 'Dashboard',
    path: '/admin',
    exact: true,
    icon: (props) => (
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


];

const Layout = ({ children, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const sidebarRef = useRef(null);
  const sidebarToggleRef = useRef(null);

  // Close mobile menu when clicking outside
  useOutsideAlerter(mobileMenuRef, mobileMenuButtonRef, () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  });

  // Check window size on resize to control sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Green theme for active elements
  const activeLinkBgColor = 'bg-emerald-600';
  const activeLinkTextColor = 'text-white';
  const hoverLinkBgColor = 'hover:bg-emerald-50';
  const hoverLinkTextColor = 'hover:text-emerald-700';
  const inactiveLinkTextColor = 'text-slate-700';

  // Sidebar nav link classes (desktop)
  const sidebarNavLinkClasses = ({ isActive }) =>
    `group flex items-center px-3 py-2.5 my-1 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 ${
      isActive
        ? `${activeLinkBgColor} ${activeLinkTextColor} shadow-md`
        : `${inactiveLinkTextColor} ${hoverLinkBgColor} ${hoverLinkTextColor}`
    }`;

  // Mobile menu nav link classes
  const mobileNavLinkClasses = ({ isActive }) =>
    `block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-150 ease-in-out focus:outline-none focus-visible:bg-emerald-100/80 ${
      isActive
        ? `bg-emerald-100 text-emerald-700`
        : `${inactiveLinkTextColor} ${hoverLinkBgColor} ${hoverLinkTextColor}`
    }`;
    
  // Red theme for logout button
  const logoutButtonBaseClasses = "items-center space-x-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500";
  const logoutButtonDesktopClasses = `hidden lg:flex text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 ${logoutButtonBaseClasses}`;
  const logoutButtonSidebarClasses = `w-full mt-3 flex text-red-600 hover:bg-red-50 hover:text-red-700 ${logoutButtonBaseClasses} justify-start ${isSidebarCollapsed ? 'justify-center' : ''}`;
  const logoutButtonMobileClasses = `w-full mt-3 flex text-red-600 hover:bg-red-50 focus-visible:bg-red-100 ${logoutButtonBaseClasses} justify-center`;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside 
        ref={sidebarRef}
        className={`fixed z-20 h-full bg-white border-r border-slate-200 shadow-lg transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } hidden lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className={`h-16 flex items-center justify-center px-4 border-b border-slate-200 ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
            <Link to="/admin" className="flex-shrink-0 flex items-center">
              <img
                src={logoUrl}
                alt="ACE Medical Center Tuguegarao Logo"
                className="h-9 w-auto mr-2"
              />
              {!isSidebarCollapsed && (
                <div className="flex flex-col justify-center overflow-hidden">
                  <span className="text-base font-bold text-emerald-700 leading-tight whitespace-nowrap">
                    ACEMCT
                  </span>
                  <span className="text-xs text-slate-600 leading-tight whitespace-nowrap">
                    ACE Medical Center
                  </span>
                </div>
              )}
            </Link>
          </div>
          
          {/* Navigation section */}
          <div className="flex-grow overflow-y-auto py-10 px-3">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={`sidebar-${item.name}`}
                    to={item.path}
                    end={item.exact}
                    className={sidebarNavLinkClasses}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    <IconComponent className={`w-5 h-5 ${isSidebarCollapsed ? 'mx-auto' : 'mr-3'} opacity-90 group-hover:opacity-100 transition-opacity`} />
                    {!isSidebarCollapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          
          {/* Footer section with logout and collapse button */}
          <div className="p-3 border-t border-slate-200 space-y-3">
            <button
              onClick={onLogout}
              className={logoutButtonSidebarClasses}
              title={isSidebarCollapsed ? "Logout" : undefined}
            >
              <svg className={`w-5 h-5 ${isSidebarCollapsed ? 'mx-auto' : 'mr-2'} opacity-90`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
            
            <button
              ref={sidebarToggleRef}
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col transition-all duration-300 lg:ml-16 ${
        !isSidebarCollapsed ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        {/* Top Navbar */}
        <header className="bg-white shadow-md fixed w-full z-30 top-0 lg:pl-16">
          <div className={`transition-all duration-300 ${!isSidebarCollapsed ? 'lg:pl-48' : ''}`}>
            <div className="max-w-screen-md mx-auto px-4 sm:px-6 lg:px-4">
              <div className="flex justify-between items-center h-16">
                {/* Mobile Logo */}
                <div className="flex items-center lg:hidden">
                  <Link to="/admin" className="flex-shrink-0 flex items-center group">
                    <img
                      src={logoUrl}
                      alt="ACE Medical Center Tuguegarao Logo"
                      className="h-10 w-auto mr-3 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="flex flex-col justify-center">
                      <span className="text-base font-bold text-emerald-700 leading-tight group-hover:text-emerald-800 transition-colors">
                        ACEMCT
                      </span>
                      <span className="text-xs text-slate-600 leading-tight group-hover:text-slate-700 transition-colors">
                        ACE Medical Center Tuguegarao
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Page Title (Desktop) */}
                <div className="hidden lg:block">
                  <h1 className="text-xl font-semibold text-slate-800">Admin Dashboard</h1>
                </div>

                {/* Right side: Search, Notifications, Profile and Mobile Menu Button */}
                <div className="flex items-center space-x-3">
                  {/* Search Bar (hidden on mobile) */}
                  {/* <div className="hidden md:flex relative">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                    <div className="absolute left-3 top-2.5 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div> */}

                  {/* Notifications Icon */}
                  {/* <button className="p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <span className="sr-only">View notifications</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button> */}

                  {/* User Profile */}
                  <div className="hidden sm:flex items-center">
                    <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium overflow-hidden">
                        <span>AT</span>
                      </div>
                      <span className="text-sm font-medium text-slate-700">Admin</span>
                    </button>
                  </div>

                  {/* Logout Button (Desktop) */}
                  <button onClick={onLogout} className={logoutButtonDesktopClasses}>
                    <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>

                  {/* Mobile Menu Button */}
                  <div className="lg:hidden flex items-center">
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
          </div>

          {/* Mobile Menu */}
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className={`lg:hidden bg-white shadow-xl border-t border-gray-200 fixed top-16 left-0 right-0 z-20 transition-all duration-300 ease-in-out origin-top
              ${isMobileMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100 visible overflow-y-auto' : 'max-h-0 opacity-0 invisible'}`}
          >
            <div className="px-3 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              {/* <div className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                  <div className="absolute left-3 top-2.5 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div> */}
            
              {/* Mobile Nav Links */}
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
                    <div className="flex items-center">
                      <IconComponent className="w-8 h-5 mr-3 opacity-80 group-[.bg-emerald-100]:text-emerald-700"/>
                      {item.name}
                    </div>
                  </NavLink>
                );
              })}
              
              {/* Mobile Profile */}
              <div className="px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">
                    <span>AT</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">Admin User</span>
                    <span className="text-xs text-slate-500">admin@acemct.com</span>
                  </div>
                </div>
              </div>
              
              {/* Mobile Logout Button */}
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

        {/* Main Content */}
        <main className="flex-grow pt-16 bg-slate-50">
          <div className="py-6 sm:py-8">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-6">
              {/* Breadcrumbs */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                {/* <nav className="flex" aria-label="Breadcrumb">
                  <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                      <Link to="/admin" className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-emerald-600">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                        </svg>
                        Home
                      </Link>
                    </li>
                    <li>
                      <div className="flex items-center">
                        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                        </svg>
                        <span className="ml-1 text-sm font-medium text-slate-500 md:ml-2">Dashboard</span>
                      </div>
                    </li>
                  </ol>
                </nav> */}
                
                {/* Action Buttons */}
                {/* <div className="mt-3 sm:mt-0 flex space-x-2">
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors">
                    New Patient
                  </button>
                  <button className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors">
                    Export
                  </button>
                </div> */}
              </div>

              {/* Content Container */}
              <div className="bg-white rounded-xl shadow-sm p-5 sm:p-6 border border-slate-200">
                {children}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 text-slate-300 text-center p-6 border-t border-slate-700">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            &copy; {new Date().getFullYear()} ACE Medical Center Tuguegarao - Admin Panel. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;