import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AnimatedBackground from './common/AnimatedBackground';
import { toast } from 'react-toastify';
import axios from 'axios';

// Don't import the auth module - we'll handle authentication directly

const LogoSection = () => (
  <div className="mb-4">
    <img 
      src="/your-logo.png" 
      alt="ACE Billing"
      className="w-34 h-34 object-cover"
    />
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  
  // DOM references
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  // State for form data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
      // Focus the password field if we have a remembered email
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    } else if (emailInputRef.current) {
      // Otherwise focus the email field
      emailInputRef.current.focus();
    }
  }, []);

  // Login function that makes a direct API call instead of using the auth utility
  const handleLogin = async (e) => {
    // If an event was passed, prevent default behavior
    if (e) e.preventDefault();
    
    // Don't proceed if already loading
    if (loading) return;
    
    // Set loading state
    setLoading(true);
    
    try {
      // Make direct API call to login endpoint
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
        email,
        password,
        remember
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      // Extract data from response
      const { data } = response;
      
      if (data.status) {
        // Store authentication data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        localStorage.setItem('tokenExpiry', data.expires_at);
        
        // Handle remember me
        if (remember) {
          localStorage.setItem('remembered_email', email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        
        // Show success message
        toast.success('Login successful!');
        
        // Handle redirect
        const redirectUrl = localStorage.getItem('redirectUrl');
        localStorage.removeItem('redirectUrl');
        
        // Determine target path
        const user = data.data;
        let targetPath;
        
        if (redirectUrl && isValidRedirect(redirectUrl, user.role)) {
          targetPath = redirectUrl;
        } else {
          targetPath = user.role === 'admin' ? '/admin' : 
                     user.role === 'billing' ? '/billing' : '/admitting';
        }
        
        // Navigate to target path
        navigate(targetPath, { replace: true });
      } else {
        // Handle unsuccessful login with status true but other issue
        setErrorMessage(data.message || 'Login failed. Please try again.');
        setPassword(''); // Clear password field
      }
    } catch (error) {
      // Handle error response
      console.error('Login error:', error);
      
      // Extract error message
      let message = 'Login failed. Please try again.';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        if (error.response.status === 401) {
          message = 'Email or password is incorrect';
        } else if (error.response.data && error.response.data.message) {
          message = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        message = 'No response from server. Please check your internet connection.';
      } else {
        // Something happened in setting up the request
        message = error.message;
      }
      
      // Update error state
      setErrorMessage(message);
      
      // Show toast notification with a delay to prevent interfering with state updates
      setTimeout(() => {
        toast.error(message);
      }, 100);
    } finally {
      // Reset loading state
      setLoading(false);
    }
  };

  // Helper function to validate redirect URLs
  const isValidRedirect = (url, role) => {
    const validPaths = {
      admin: ['/admin'],
      billing: ['/billing'],
      admitting: ['/admitting']
    };
    
    return validPaths[role]?.some(path => url.startsWith(path)) ?? false;
  };

  // Handle keydown events for form inputs
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleLogin();
    }
    
    // Clear error when user starts typing again
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <AnimatedBackground />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full p-8 bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-100">
          <div className="flex flex-col items-center space-y-4">
            <LogoSection />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-center max-w-xs">
              Sign in to your account!
            </p>
          </div>

          {/* Login Form - DIV INSTEAD OF FORM to prevent any form submission */}
          <div className="mt-8 space-y-6">
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative group">
                <input
                  id="email"
                  ref={emailInputRef}
                  type="email"
                  required
                  className={`block w-full px-4 py-3 bg-gray-50/50 border ${errorMessage ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all pl-11 group-hover:bg-gray-50/80`}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Email address"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${errorMessage ? 'text-red-400' : 'text-gray-400'}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                  </svg>
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <input
                  id="password"
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  required
                  className={`block w-full px-4 py-3 bg-gray-50/50 border ${errorMessage ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all pl-11 pr-12 group-hover:bg-gray-50/80`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Password"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${errorMessage ? 'text-red-400' : 'text-gray-400'}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-500 hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-500 hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer hover:text-gray-900">
                  Keep me signed in
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-gray-600 hover:text-indigo-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Sign in'
              )}
            </button>

            {/* Support Link */}
            <div className="text-center text-sm text-gray-600">
              Need help? Contact <a href="mailto:support@hospital.com" className="text-indigo-600 hover:text-indigo-700 hover:underline">IT Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;