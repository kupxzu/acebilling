import React from 'react'; 
import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom'; 

// IMPORTANT: Replace with the correct path to your logo image
// If your logo is in the `public` folder, e.g., `public/images/your-logo.png`, use `/images/your-logo.png`
// If you import it: import appLogo from './path/to/your-logo.png'; and use src={appLogo}
const appLogoUrl = "./your-logo.png"; // <<<<< ------ REPLACE THIS! (e.g., '/image_961429.png' if in public root)

// Custom Hook to detect clicks outside an element
function useOutsideAlerter(menuRef, callback, ...ignoreRefs) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) { // This line had an error, should be menuRef
        const clickedOnIgnoredElement = ignoreRefs.some(
          (ignoreRef) => ignoreRef.current && ignoreRef.current.contains(event.target)
        );
        if (!clickedOnIgnoredElement) {
          callback();
        }
      }
    }
    // Corrected: use menuRef in the condition
    function handleClickOutsideCorrected(event) {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          const clickedOnIgnoredElement = ignoreRefs.some(
            (ignoreRef) => ignoreRef.current && ignoreRef.current.contains(event.target)
          );
          if (!clickedOnIgnoredElement) {
            callback();
          }
        }
      }

    document.addEventListener("mousedown", handleClickOutsideCorrected);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideCorrected);
    };
  }, [menuRef, callback, ignoreRefs]);
}


const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const mobileMenuContainerRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return {};
    }
  });

  // Corrected usage of useOutsideAlerter
  useOutsideAlerter(mobileMenuContainerRef, () => setIsMobileMenuOpen(false), mobileMenuButtonRef);
  useOutsideAlerter(profileDropdownRef, () => setIsProfileOpen(false), profileButtonRef);


  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry'); // Ensure tokenExpiry is also cleared
    setUser({});
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const updateUserStateFromStorage = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'));
      } catch (e) {
        console.error("Error parsing user from localStorage on storage event", e);
        setUser({});
      }
    };
    window.addEventListener('storage', updateUserStateFromStorage);
    return () => {
      window.removeEventListener('storage', updateUserStateFromStorage);
    };
  }, []);

  const isActive = useCallback((path) => location.pathname === path, [location.pathname]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);
  const toggleProfileOpen = () => setIsProfileOpen(prev => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const userInitial = user?.name?.[0]?.toUpperCase() || 'U';
  const userRoleDisplay = user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Role` : 'User';

  // SVG Icons
  const HomeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
  const NewAdmissionIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
  const PatientsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  const BillingDashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
  const BillingIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  const SignOutIcon = () => <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
  const ChevronDownIcon = ({isOpen}) => <svg className={`w-5 h-5 text-gray-400 group-hover:text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>;

  return (
    <nav className="bg-white border-b border-gray-200/75 shadow-lg sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Updated Logo Section */}
            <Link to={user?.role === 'admitting' ? "/admitting" : user?.role === 'billing' ? "/billing" : "/"} className="flex items-center group">
              <img 
                src={appLogoUrl} // Use the variable for the logo path
                alt="ACE Medical Center Tuguegarao Logo" 
                className="h-10 sm:h-11 w-auto mr-2.5 sm:mr-3 group-hover:opacity-90 transition-opacity duration-200" 
              />
              <div className="flex flex-col justify-center">
                <span className="text-base sm:text-lg font-bold text-slate-800 leading-tight group-hover:text-teal-600 transition-colors duration-200">
                  ACEMCT
                </span>
                <span className="text-xs sm:text-sm text-slate-500 leading-tight group-hover:text-slate-600 transition-colors duration-200">
                  ACE Medical Center Tuguegarao
                </span>
              </div>
            </Link>
          </div>

          {user?.name && ( // Only show nav and profile if user is logged in
            <div className="hidden md:flex md:items-center md:space-x-6">
              {(user?.role === 'admitting' || user?.role === 'billing') && (
                 <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shadow-inner">
                  {user?.role === 'admitting' && (
                    <>
                      <NavLinkDesktop to="/admitting" active={isActive('/admitting')} icon={<HomeIcon />}>Dashboard</NavLinkDesktop>
                      <NavLinkDesktop to="/admitting/new-patient" active={isActive('/admitting/new-patient')} icon={<NewAdmissionIcon />}>New Admission</NavLinkDesktop>
                      <NavLinkDesktop to="/admitting/patients" active={isActive('/admitting/patients')} icon={<PatientsIcon />}>Patients</NavLinkDesktop>
                    </>
                  )}
                  {user?.role === 'billing' && (
                    <>
                      <NavLinkDesktop to="/billing" active={isActive('/billing')} icon={<BillingDashboardIcon />}>Dashboard</NavLinkDesktop>
                      <NavLinkDesktop to="/billing/patients" active={isActive('/billing/patients')} icon={<BillingIcon />}>Billing</NavLinkDesktop>
                    </>
                  )}
                </div>
              )}

              <div className="relative" ref={profileDropdownRef}>
                <button
                  ref={profileButtonRef}
                  onClick={toggleProfileOpen}
                  aria-expanded={isProfileOpen}
                  aria-controls="profile-menu-desktop"
                  aria-label="User profile menu"
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500 group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-md shadow-sm ring-1 ring-inset ring-black/5">
                    {userInitial}
                  </div>
                  <span className="text-sm font-medium text-slate-700 hidden md:block group-hover:text-slate-900">{user?.name}</span>
                  <ChevronDownIcon isOpen={isProfileOpen}/>
                </button>

                {isProfileOpen && (
                  <div id="profile-menu-desktop" className="absolute right-0 mt-2.5 w-64 bg-white rounded-xl shadow-2xl py-2 border border-slate-200/70 origin-top-right animate-fade-in-down-navbar"> {/* Custom animation name */}
                    <div className="px-4 py-3 border-b border-slate-200/75">
                      <p className="text-sm font-semibold text-slate-800 truncate" title={user?.name}>{user?.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{userRoleDisplay}</p>
                    </div>
                    <div className="py-1">
                        <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors duration-150 group"
                        >
                        <SignOutIcon />
                        <span className="ml-1.5">Sign out</span>
                        </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile menu button: Show if user is logged in */}
          {user?.name && (
            <div className="md:hidden flex items-center">
              <button
                ref={mobileMenuButtonRef}
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu-content"
                aria-label="Open main menu"
                className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 transition-colors"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                    <span className={`block h-0.5 bg-slate-700 rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? 'w-6 rotate-45 translate-y-[0.28rem]' : 'w-6 mb-1.5'}`} />
                    <span className={`block h-0.5 bg-slate-700 rounded-full transition-all duration-300 ease-out ${isMobileMenuOpen ? 'w-6 -rotate-45 -translate-y-[0.28rem]' : 'w-5'}`} />
                </div>
              </button>
            </div>
          )}
          {/* If no user, perhaps show a Login button on mobile? For now, it's empty if no user. */}
           {!user?.name && (
            <div className="md:hidden">
                {/* Placeholder for potential login button on mobile if needed when logged out */}
            </div>
           )}
        </div>
      </div>

      {user?.name && (
        <div
          id="mobile-menu-content"
          ref={mobileMenuContainerRef} // Use the correct ref for outside click
          className={`md:hidden bg-white shadow-lg border-t border-gray-200/75 transition-all duration-300 ease-in-out origin-top ${isMobileMenuOpen ? 'max-h-[calc(100vh-4rem)] opacity-100 visible overflow-y-auto' : 'max-h-0 opacity-0 invisible'}`}
          // style={{ maxHeight: isMobileMenuOpen ? 'calc(100vh - 4rem)' : '0' }} // Handled by max-h class now
        >
          <div className="pt-3 pb-3 space-y-1.5 px-3">
            {/* Role-based navigation links for mobile */}
            {user?.role === 'admitting' && (
              <>
                <NavLinkMobile to="/admitting" active={isActive('/admitting')} onClick={closeMobileMenu} icon={<HomeIcon/>}>Dashboard</NavLinkMobile>
                <NavLinkMobile to="/admitting/new-patient" active={isActive('/admitting/new-patient')} onClick={closeMobileMenu} icon={<NewAdmissionIcon/>}>New Admission</NavLinkMobile>
                <NavLinkMobile to="/admitting/patients" active={isActive('/admitting/patients')} onClick={closeMobileMenu} icon={<PatientsIcon/>}>Patients</NavLinkMobile>
              </>
            )}
            {user?.role === 'billing' && (
              <>
                <NavLinkMobile to="/billing" active={isActive('/billing')} onClick={closeMobileMenu} icon={<BillingDashboardIcon/>}>Dashboard</NavLinkMobile>
                <NavLinkMobile to="/billing/patients" active={isActive('/billing/patients')} onClick={closeMobileMenu} icon={<BillingIcon/>}>Billing</NavLinkMobile>
              </>
            )}
             {/* Add other roles if necessary */}
          </div>
          {/* Profile Info and Logout for Mobile Menu */}
          <div className="pt-4 pb-4 border-t border-gray-200/75 px-3">
            <div className="flex items-center px-1 mb-3">
              <div className="flex-shrink-0 mr-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-xl shadow-md ring-1 ring-inset ring-black/5">
                  {userInitial}
                </div>
              </div>
              <div>
                <div className="font-semibold text-md text-slate-800 truncate">{user?.name}</div>
                <div className="font-medium text-sm text-slate-500 capitalize">{userRoleDisplay}</div>
              </div>
            </div>
            <button
              onClick={() => { handleLogout(); closeMobileMenu(); }}
              className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 group focus:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
            >
              <SignOutIcon /> <span className="ml-1.5">Sign out</span>
            </button>
          </div>
        </div>
      )}
      {/* NO <style jsx global> tag here. Keyframes go in global CSS. */}
    </nav>
  );
};

const NavLinkDesktop = ({ to, children, active, icon }) => (
  <NavLink // Changed Link to NavLink for activeClassName or style prop if needed later
    to={to}
    end={to === "/"} // `end` prop for exact match on root paths like dashboard
    className={`group flex items-center gap-2 px-3.5 py-1.5 text-sm rounded-lg transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-100 focus-visible:ring-teal-500
      ${active
        ? 'bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md font-semibold scale-100' // Adjusted scale
        : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/70 font-medium'
      }`}
  >
    {icon && React.cloneElement(icon, { className: `w-5 h-5 ${active ? 'text-white/90' : 'text-slate-500 group-hover:text-teal-600 transition-colors'}` })}
    <span className="hidden lg:inline">{children}</span> {/* Show on lg for more space */}
  </NavLink>
);

const NavLinkMobile = ({ to, children, active, onClick, icon }) => (
  <NavLink // Changed Link to NavLink
    to={to}
    end={to === "/"}
    className={`group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-base transition-colors duration-150 ease-in-out focus:outline-none focus-visible:bg-slate-200 focus-visible:text-slate-900
      ${active
        ? 'bg-teal-50 text-teal-700 font-semibold'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
      }`}
    onClick={onClick}
  >
    {icon && React.cloneElement(icon, { className: `w-5 h-5 ${active ? 'text-teal-600' : 'text-slate-500 group-hover:text-teal-600 transition-colors'}` })}
    {children}
  </NavLink>
);

export default Navbar;