import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus, Calendar, User, Building2, FileText, Eye, Edit, Search, LayoutGrid, List, Users, MoreVertical, X } from 'lucide-react'; // Added MoreVertical & X
import axiosClient from '../../utils/axios'; // Assuming this path is correct
import Navbar from '../Navbar'; // Assuming this path is correct

// ========================
// ENHANCED UTILITY COMPONENTS
// ========================

// Avatar Component (Slightly refined for clarity)
const Avatar = ({ firstName = '', lastName = '', size = 40, className = '' }) => {
  const getColor = () => {
    const colors = [
      { bg: 'bg-blue-100', text: 'text-blue-700' },
      { bg: 'bg-green-100', text: 'text-green-700' },
      { bg: 'bg-purple-100', text: 'text-purple-700' },
      { bg: 'bg-red-100', text: 'text-red-700' },
      { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      { bg: 'bg-indigo-100', text: 'text-indigo-700' },
      { bg: 'bg-pink-100', text: 'text-pink-700' },
      { bg: 'bg-teal-100', text: 'text-teal-700' },
    ];
    const name = (String(firstName) + String(lastName)).toLowerCase();
    if (!name) return colors[0];
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  const getInitials = () => {
    const first = String(firstName)?.charAt(0) || '';
    const last = String(lastName)?.charAt(0) || '';
    const initials = (first + last).toUpperCase();
    return initials || 'P'; // Fallback for Patient
  };

  const colorClasses = getColor();

  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold ${colorClasses.bg} ${colorClasses.text} ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.max(10, Math.round(size * 0.4))}px` }}
      title={`${firstName} ${lastName}`}
    >
      {getInitials()}
    </div>
  );
};

// Status Badge (Slightly refined design)
const StatusBadge = ({ status = 'unknown', size = 'md' }) => {
  const statusConfig = {
    active: { label: 'Active', dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    discharged: { label: 'Discharged', dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
    pending: { label: 'Pending', dot: 'bg-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    unknown: { label: 'Unknown', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.unknown;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5', // Adjusted padding
    lg: 'text-sm px-3 py-1'
  };

  return (
    <span
      className={`inline-flex items-center ${config.bg} ${config.border} ${config.text} ${sizeClasses[size] || sizeClasses.md} rounded-full border font-medium whitespace-nowrap leading-none`}
    >
      <span className={`mr-1.5 h-2 w-2 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

// PatientSearchInput (Refined focus and clear button)
const PatientSearchInput = ({ onSearch, initialValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // Assuming onSearch handles debouncing if needed
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full md:max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search patients..."
        value={searchTerm}
        onChange={handleChange}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-red-500 transition-colors"
          aria-label="Clear search"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

// ViewToggle (Minor style adjustments)
const ViewToggle = ({ viewMode, onChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-300 flex p-1 shadow-sm">
      {['grid', 'list'].map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`flex items-center px-3.5 py-1.5 text-sm font-medium rounded-md transition-all duration-150 ${
            viewMode === mode
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          aria-pressed={viewMode === mode}
        >
          {mode === 'grid' ? <LayoutGrid size={16} className="mr-1.5" /> : <List size={16} className="mr-1.5" />}
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
      ))}
    </div>
  );
};


// EmptyState (Improved styling)
const EmptyState = ({ searchTerm }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-[400px] flex items-center justify-center w-full text-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 max-w-md mx-auto">
        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          {searchTerm ? <Users size={32} className="text-indigo-500" /> : <UserPlus size={32} className="text-indigo-500" />}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {searchTerm ? 'No Patients Found' : 'No Patients Admitted Yet'}
        </h3>
        <p className="text-gray-500 mb-6 text-sm">
          {searchTerm
            ? `We couldn't find any patients matching "${searchTerm}". Try different keywords or clear the search.`
            : "It looks like there are no patients in the system. Get started by admitting a new patient."}
        </p>
        <button
          onClick={() => navigate('/admitting/new-patient')} // Assuming this is your route for adding new patient
          className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <UserPlus size={18} className="mr-2" />
          Admit New Patient
        </button>
      </div>
    </div>
  );
};

// Pagination Component (Visual enhancements)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const maxPagesToShow = 5;
  const halfPages = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, currentPage - halfPages);
  let endPage = Math.min(totalPages, currentPage + halfPages);

  if (currentPage <= halfPages) {
    endPage = Math.min(totalPages, maxPagesToShow);
  }
  if (currentPage + halfPages >= totalPages) {
    startPage = Math.max(1, totalPages - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  const renderPageButton = (page, label) => (
    <button
      key={page}
      onClick={() => onPageChange(page)}
      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors
        ${currentPage === page
          ? 'z-10 bg-indigo-600 border-indigo-600 text-white'
          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
        }`}
    >
      {label || page}
    </button>
  );

  return (
    <div className="py-3 flex items-center justify-center">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60"
        > Previous </button>

        {startPage > 1 && renderPageButton(1, '1')}
        {startPage > 2 && <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>}

        {pageNumbers.map(num => renderPageButton(num))}

        {endPage < totalPages -1 && <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>}
        {endPage < totalPages && renderPageButton(totalPages, String(totalPages))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60"
        > Next </button>
      </nav>
    </div>
  );
};


// ========================
// DATA DISPLAY COMPONENTS (ENHANCED & RESPONSIVE)
// ========================

// Helper for Icon + Text
const InfoItem = ({ icon: Icon, text, iconColor = 'text-gray-400', className = '' }) => (
  <div className={`flex items-center text-sm text-gray-600 ${className}`}>
    <Icon size={14} className={`mr-2 flex-shrink-0 ${iconColor}`} />
    <span className="truncate" title={text}>{text || 'N/A'}</span>
  </div>
);

// Enhanced Patient Card Component
const PatientCard = ({ patient, loading = false }) => {
  const navigate = useNavigate();

  if (loading || !patient) { // Skeleton Loader
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse flex flex-col justify-between min-h-[230px]">
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="ml-3 space-y-2">
                <div className="h-5 w-36 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded-full mt-1"></div>
          </div>
          <div className="space-y-2.5 mt-4">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end space-x-2">
          <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  const {
    first_name, last_name, date_of_birth, attending_physician,
    room_number, ward_type, admissions = [], id: patientId
  } = patient;

  const status = admissions?.[0]?.status?.toLowerCase() || 'unknown';
  const diagnosis = admissions?.[0]?.diagnosis || 'No diagnosis provided';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between min-h-[230px] group">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Avatar firstName={first_name} lastName={last_name} size={48} />
            <div className="ml-3">
              <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors leading-tight text-lg">
                {`${first_name || ''} ${last_name || ''}`}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {date_of_birth ? new Date(date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'DOB N/A'}
              </p>
            </div>
          </div>
          <StatusBadge status={status} size="md" />
        </div>

        <div className="space-y-2 mt-4 text-sm">
          <InfoItem icon={User} text={`Dr. ${attending_physician || 'N/A'}`} iconColor="text-indigo-500" />
          <InfoItem icon={Building2} text={`Room ${room_number || 'N/A'}${ward_type ? ` (${ward_type})` : ''}`} iconColor="text-purple-500" />
          <InfoItem icon={FileText} text={diagnosis} iconColor="text-red-500" className="line-clamp-1" />
        </div>
      </div>

      <div className="mt-auto p-5 pt-3 border-t border-gray-100 flex justify-end space-x-2">
        <button
          onClick={() => navigate(`/admitting/patients/${patientId}/view`)}
          className="px-3.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <Eye size={14} className="inline mr-1 relative -top-px" /> View
        </button>
        <button
          onClick={() => navigate(`/admitting/patients/${patientId}`)}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Edit size={14} className="inline mr-1 relative -top-px" /> Edit
        </button>
      </div>
    </div>
  );
};


// Enhanced Patient List Item Component (Responsive)
const PatientListItem = ({ patient, loading = false }) => {
  const navigate = useNavigate();
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => { // Close actions menu when clicking outside
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  if (loading || !patient) { // Skeleton Loader
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 animate-pulse">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gray-200 rounded-full mr-4"></div>
          <div className="flex-grow space-y-2">
            <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded-md ml-auto"></div>
        </div>
      </div>
    );
  }

  const {
    first_name, last_name, date_of_birth, attending_physician,
    room_number, ward_type, admissions = [], id: patientId
  } = patient;

  const status = admissions?.[0]?.status?.toLowerCase() || 'unknown';
  const diagnosis = admissions?.[0]?.diagnosis || '';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 group">
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center">
        {/* Left Section: Avatar & Main Info */}
        <div className="flex items-center mb-3 sm:mb-0 flex-grow min-w-0">
          <Avatar firstName={first_name} lastName={last_name} size={44} className="mr-3 sm:mr-4 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors text-base leading-tight truncate">
              {`${first_name || ''} ${last_name || ''}`}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              DOB: {date_of_birth ? new Date(date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>

        {/* Middle Section: Details (visible on larger screens) */}
        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center gap-x-4 gap-y-2 text-xs text-gray-600 sm:mx-4 mt-2 sm:mt-0 flex-wrap">
          <InfoItem icon={User} text={`Dr. ${attending_physician || 'N/A'}`} iconColor="text-indigo-500" className="col-span-2 sm:col-auto" />
          <InfoItem icon={Building2} text={`Room ${room_number || 'N/A'}${ward_type ? ` (${ward_type})` : ''}`} iconColor="text-purple-500" />
          {diagnosis && <InfoItem icon={FileText} text={diagnosis} iconColor="text-red-500" className="line-clamp-1 col-span-2 sm:col-auto sm:max-w-[150px] md:max-w-[200px]" />}
        </div>

        {/* Right Section: Status & Actions */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end mt-3 sm:mt-0 sm:ml-auto flex-shrink-0">
          <div className="mr-2 sm:mr-4">
            <StatusBadge status={status} size="md" />
          </div>
          {/* Actions: Desktop */}
          <div className="hidden sm:flex space-x-2">
            <button
              onClick={() => navigate(`/admitting/patients/${patientId}/view`)}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            > <Eye size={14} className="inline mr-1" /> View </button>
            <button
              onClick={() => navigate(`/admitting/patients/${patientId}`)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            > <Edit size={14} className="inline mr-1" /> Edit </button>
          </div>
          {/* Actions: Mobile (Kebab Menu) */}
          <div className="sm:hidden relative" ref={actionsRef}>
            <button
              onClick={() => setActionsOpen(prev => !prev)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            >
              <MoreVertical size={20} />
            </button>
            {actionsOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <button
                  onClick={() => { navigate(`/admitting/patients/${patientId}/view`); setActionsOpen(false); }}
                  className="w-full text-left flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                > <Eye size={16} className="mr-2" /> View Details </button>
                <button
                  onClick={() => { navigate(`/admitting/patients/${patientId}`); setActionsOpen(false); }}
                  className="w-full text-left flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                > <Edit size={16} className="mr-2" /> Edit Patient </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// ========================
// MAIN COMPONENT (PATIENT LIST)
// ========================
const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('patientViewModeAdmitting') || 'list'); // Unique key for this list's view mode

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: viewMode === 'grid' ? 9 : 8, // Adjust per_page
    total: 0
  });

  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('patientViewModeAdmitting', viewMode);
    // Re-fetch or adjust per_page when view mode changes
    setPagination(prev => ({ ...prev, per_page: viewMode === 'grid' ? 9 : 8 }));
    // No need to fetch immediately here, fetchPatients dependency on viewMode will handle it.
  }, [viewMode]);


  const fetchPatients = useCallback(async (page = 1, currentSearchTerm = searchTerm) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError('');

    try {
      const itemsPerPage = viewMode === 'grid' ? 9 : 8; // Grid can fit more potentially
      const response = await axiosClient.get('/patients', { // Ensure this endpoint is correct for general patient list
        params: {
          page,
          search: currentSearchTerm || undefined, // Send undefined if empty, not null
          per_page: itemsPerPage
        },
        signal: abortControllerRef.current.signal,
        cache: false // If this list needs to be super fresh, bypass axios client cache
      });

      // Adjust based on your API response structure for a paginated list
      // Assuming response.data.data is the paginated object, and response.data.data.data is the items array
      if (response?.data?.status === true && response?.data?.data) {
        const patientData = Array.isArray(response.data.data.data) ? response.data.data.data.filter(p => p) : [];
        setPatients(patientData);

        const { current_page, last_page, per_page, total } = response.data.data;
        setPagination({ current_page, last_page, per_page, total });

      } else {
        throw new Error(response?.data?.message || 'Failed to fetch patients: Invalid data structure');
      }
    } catch (err) {
      if (err.name === 'AbortError' || (axiosClient.isCancel && axiosClient.isCancel(err))) {
        // console.log('Patient fetch aborted');
        return;
      }
      console.error('Error fetching patients:', err);
      const errMsg = err.response?.data?.message || err.message || 'Error loading patients. Please try again.';
      setError(errMsg);
      // Only toast if it's not a known cancellation from our logic.
      if (!err.message?.includes('canceled by user') && !err.message?.includes('aborted')) {
        toast.error(errMsg);
      }
      setPatients([]); // Clear patients on error
    } finally {
      setLoading(false);
    }
  }, [viewMode]); // searchTerm removed, will be passed as argument

  const handleSearch = useCallback((term) => {
    setSearchTerm(term); // Update searchTerm state immediately for input field
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchPatients(1, term); // Fetch with the new term
    }, 500); // Debounce API call
  }, [fetchPatients]); // fetchPatients is stable due to its own dependencies

  useEffect(() => {
    fetchPatients(1, searchTerm); // Initial fetch and when searchTerm changes (via handleSearch)
    return () => { // Cleanup
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [fetchPatients]); // fetchPatients dependency will re-run if viewMode changes. searchTerm is handled inside.


  const renderSkeletons = () => {
    const count = pagination.per_page;
    return Array.from({ length: count }).map((_, index) => (
      viewMode === 'grid'
        ? <PatientCard key={`skeleton-grid-${index}`} loading={true} />
        : <PatientListItem key={`skeleton-list-${index}`} loading={true} />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Records</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage and view all admitted patients.
            </p>
          </div>
          <button
            onClick={() => navigate('/admitting/new-patient')} // Update route if different
            className="inline-flex items-center px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus size={18} className="mr-2" />
            Admit Patient
          </button>
        </div>

        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <PatientSearchInput onSearch={handleSearch} initialValue={searchTerm} />
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className={`min-h-[400px] ${ // Ensure a minimum height to prevent layout jumps
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5" // Max 3 cols for better card readability
              : "flex flex-col space-y-3"
          }`}
        >
          {loading ? (
            renderSkeletons()
          ) : patients.length === 0 ? (
            <div className={viewMode === 'grid' ? "sm:col-span-2 lg:col-span-3 xl:col-span-3" : ""}>
                <EmptyState searchTerm={searchTerm} />
            </div>
          ) : (
            patients.map((patient) => (
              viewMode === 'grid'
                ? <PatientCard key={patient.id || patient.patient_id} patient={patient} />
                : <PatientListItem key={patient.id || patient.patient_id} patient={patient} />
            ))
          )}
        </div>

        {!loading && patients.length > 0 && pagination.last_page > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              onPageChange={(page) => fetchPatients(page, searchTerm)}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientList;