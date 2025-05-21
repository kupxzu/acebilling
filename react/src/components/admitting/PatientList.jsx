import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserPlus, Calendar, User, Building2, FileText, Eye, Edit, Search, LayoutGrid, List, Users } from 'lucide-react';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';

// ========================
// UTILITY COMPONENTS
// ========================

// Avatar Component
const Avatar = ({ firstName = '', lastName = '', size = 40, className = '' }) => {
  // Generate color based on name
  const getColorClass = () => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800',
      'bg-indigo-100 text-indigo-800',
      'bg-pink-100 text-pink-800',
    ];
    
    const name = (firstName + lastName).toLowerCase();
    const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };
  
  // Get initials with fallback
  const getInitials = () => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };
  
  return (
    <div
      className={`flex items-center justify-center rounded-full ${getColorClass()} font-medium ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.4)}px` }}
    >
      {getInitials()}
    </div>
  );
};

// Status Badge
const StatusBadge = ({ status = 'unknown', size = 'md' }) => {
  const statusConfig = {
    active: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
    },
    discharged: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
    },
    pending: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
    },
    unknown: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
    }
  };
  
  const config = statusConfig[status] || statusConfig.unknown;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };
  
  return (
    <span className={`inline-flex items-center ${config.bg} ${config.border} ${config.text} 
      ${sizeClasses[size] || sizeClasses.md} rounded-full border font-medium whitespace-nowrap`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
        status === 'active' ? 'bg-green-500' : 
        status === 'discharged' ? 'bg-gray-500' : 
        'bg-yellow-500'
      }`}></span>
      <span className="capitalize">{status}</span>
    </span>
  );
};

// PatientSearchInput Component
const PatientSearchInput = ({ onSearch, initialValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };
  
  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      
      <input
        type="text"
        placeholder="Search patients by name, room, physician..."
        value={searchTerm}
        onChange={handleChange}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
      />
      
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

// View 
// gle Component
const ViewToggle = ({ viewMode, onChange }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 flex p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          viewMode === 'grid'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <LayoutGrid size={16} className="mr-1.5" />
        Cards
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          viewMode === 'list'
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
      >
        <List size={16} className="mr-1.5" />
        List
      </button>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ searchTerm }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-[400px] flex items-center justify-center w-full">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center max-w-lg mx-auto">
        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
          {searchTerm ? <Users size={28} className="text-indigo-400" /> : <UserPlus size={28} className="text-indigo-400" />}
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchTerm ? 'No matching patients found' : 'No patients yet'}
        </h3>
        
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
          {searchTerm 
            ? `We couldn't find any patients matching "${searchTerm}". Try adjusting your search terms.` 
            : "There are no patients in the system yet. Add your first patient to get started."}
        </p>
        
        <div className="flex justify-center space-x-4">
          {searchTerm && (
            <button
              onClick={() => navigate('/admitting/patients')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Users size={16} className="mr-2" />
              View all patients
            </button>
          )}
          
          <button
            onClick={() => navigate('/admitting/new-patient')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus size={16} className="mr-2" />
            Add new patient
          </button>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="mt-6 flex justify-center">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNumber = i + 1;
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                currentPage === pageNumber
                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {pageNumber}
            </button>
          );
        })}
        
        {totalPages > 5 && (
          <>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              ...
            </span>
            <button
              onClick={() => onPageChange(totalPages)}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

// Patient Card Component
const PatientCard = ({ patient, loading = false }) => {
  const navigate = useNavigate();
  
  if (loading || !patient) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 animate-pulse h-[220px]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="ml-3">
              <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-2 mt-3">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end space-x-2">
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  const {
    first_name = '',
    last_name = '',
    date_of_birth,
    attending_physician = 'Unknown',
    room_number = 'N/A',
    ward_type = '',
    admissions = [],
    id: patientId = ''
  } = patient || {};

  const status = admissions?.[0]?.status || 'unknown';
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 h-[220px]">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <Avatar 
              firstName={first_name} 
              lastName={last_name} 
              size={40}
              className="border-2 border-white shadow-sm"
            />
            <div className="ml-3">
              <h3 className="font-medium text-gray-900 leading-tight line-clamp-1">
                {`${first_name} ${last_name}`}
              </h3>
              <div className="text-xs text-gray-500 mt-0.5">
                {date_of_birth ? new Date(date_of_birth).toLocaleDateString() : 'No DOB'}
              </div>
            </div>
          </div>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Info */}
        <div className="space-y-1.5 text-sm text-gray-600">
          <div className="flex items-center">
            <User size={14} className="mr-2 text-gray-400" />
            <span className="line-clamp-1">Dr. {attending_physician}</span>
          </div>
          <div className="flex items-center">
            <Building2 size={14} className="mr-2 text-gray-400" />
            <span>Room {room_number}</span>
            {ward_type && (
              <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-100 rounded">
                {ward_type}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-2 border-t border-gray-100 flex justify-end space-x-2">
          <button
            onClick={() => navigate(`/admitting/patients/${patientId}/view`)}
            className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <Eye size={14} className="inline mr-1" />
            View
          </button>
          <button
            onClick={() => navigate(`/admitting/patients/${patientId}`)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Edit size={14} className="inline mr-1" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// Patient List Item Component 
const PatientListItem = ({ patient, loading = false }) => {
  const navigate = useNavigate();
  
  if (loading || !patient) {
    return (
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 animate-pulse">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
          
          <div className="ml-3 flex-grow">
            <div className="h-4.5 w-40 bg-gray-200 rounded mb-2"></div>
            <div className="flex space-x-5">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-36 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          <div className="mx-4">
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </div>
          
          <div className="flex-shrink-0 space-x-2">
            <div className="inline-block h-8 w-16 bg-gray-200 rounded"></div>
            <div className="inline-block h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Safe extraction of patient data with fallbacks
  const firstName = patient?.first_name || '';
  const middleName = patient?.middle_name ? patient.middle_name + ' ' : '';
  const lastName = patient?.last_name || '';
  const fullName = `${firstName} ${middleName}${lastName}` || 'Unknown Patient';
  
  const dateOfBirth = patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Unknown';
  const physician = patient?.attending_physician || 'Unknown';
  const roomNumber = patient?.room_number || 'N/A';
  const wardType = patient?.ward_type || '';
  const diagnosis = patient?.admissions?.[0]?.diagnosis || '';
  const status = patient?.admissions?.[0]?.status || 'unknown';
  const patientId = patient?.id || '';
  
  // Safe navigation functions
  const handleView = (e) => {
    e.stopPropagation();
    if (patientId) navigate(`/admitting/patients/${patientId}/view`);
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    if (patientId) navigate(`/admitting/patients/${patientId}`);
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="p-3 flex items-center">
        {/* Avatar */}
        <div className="relative mr-3">
          <Avatar
            firstName={firstName}
            lastName={lastName}
            size={40}
            className="border-2 border-white shadow-sm"
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        
        {/* Patient Info */}
        <div className="flex-grow min-w-0">
          <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
            {fullName}
          </h3>
          
          <div className="flex flex-wrap items-center mt-1 gap-x-4 gap-y-1 text-xs text-gray-600">
            <div className="flex items-center">
              <Calendar size={12} className="mr-1" />
              {dateOfBirth}
            </div>
            
            <div className="flex items-center">
              <User size={12} className="mr-1 text-indigo-500" />
              Dr. {physician}
            </div>
            
            <div className="flex items-center">
              <Building2 size={12} className="mr-1 text-purple-500" />
              Room {roomNumber}
              {wardType && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                  {wardType}
                </span>
              )}
            </div>
            
            {diagnosis && (
              <div className="flex items-center max-w-xs truncate">
                <FileText size={12} className="mr-1 text-red-500 flex-shrink-0" />
                <span className="truncate">{diagnosis}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="mx-4">
          <StatusBadge status={status} size="sm" />
        </div>
        
        {/* Action Buttons */}
        <div className="flex-shrink-0 flex space-x-2">
          <button
            onClick={handleView}
            className="flex items-center px-2 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors"
          >
            <Eye size={14} className="mr-1" />
            View
          </button>
          
          <button
            onClick={handleEdit}
            className="flex items-center px-2 py-1 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
          >
            <Edit size={14} className="mr-1" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================
// MAIN COMPONENT
// ========================

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('patientViewMode') || 'list';
  });
  
  // Pagination state
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  });
  
  // Add ref for request cancellation
  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Save view mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('patientViewMode', viewMode);
  }, [viewMode]);
  
  // Fetch patients function with cancellation
  const fetchPatients = useCallback(async (page = 1) => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axiosClient.get('/patients', {
        params: {
          page,
          search: searchTerm || null, // Only send if not empty
          per_page: viewMode === 'grid' ? 9 : 10
        },
        signal: abortControllerRef.current.signal
      });
      
      if (response.data.status) {
        // Make sure data exists and is an array
        let patientData = [];
        
        if (response.data.data?.data && Array.isArray(response.data.data.data)) {
          patientData = response.data.data.data.filter(patient => patient != null);
        } else {
          console.warn('Unexpected API response structure:', response.data);
        }
        
        setPatients(patientData);
        
        // Extract pagination info
        if (response.data.data) {
          const { data, ...paginationData } = response.data.data;
          setPagination(paginationData);
        } else {
          setPagination({
            current_page: 1,
            last_page: 1, 
            per_page: viewMode === 'grid' ? 9 : 10,
            total: 0
          });
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch patients');
      }
    } catch (err) {
      // Don't set error state if request was cancelled
      if (err.name === 'AbortError') {
        return;
      }
      
      console.error('Error fetching patients:', err);
      setError(err.response?.data?.message || err.message || 'Error loading patients');
      
      if (!err.message?.includes('canceled')) {
        toast.error('Failed to load patients');
      }
      
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, viewMode]);

  // Update search handling with debounce
  const handleSearch = useCallback((term) => {
    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(term);
    }, 300); // 300ms debounce
  }, []);

  // Initial data load
  useEffect(() => {
    fetchPatients(1);
    return () => setError('');
  }, [fetchPatients]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Render skeleton loaders while loading
  const renderSkeletons = () => {
    const count = viewMode === 'grid' ? 9 : 10;
    const skeletons = Array.from({ length: count }).map((_, index) => (
      viewMode === 'grid' 
        ? <PatientCard key={`skeleton-${index}`} loading={true} />
        : <PatientListItem key={`skeleton-${index}`} loading={true} />
    ));

    return viewMode === 'grid' ? (
      <>{skeletons}</>
    ) : (
      <div className="min-h-[400px]">{skeletons}</div>
    );
  };
  
  // Render patients safely
  const renderPatients = () => {
    if (loading) {
      return renderSkeletons();
    }
    
    if (!patients || patients.length === 0) {
      return <EmptyState searchTerm={searchTerm} />;
    }
    
    return patients.map((patient, index) => {
      if (!patient) return null;
      const key = patient.id ? `patient-${patient.id}` : `patient-index-${index}`;
      
      return (
        viewMode === 'grid'
          ? <PatientCard key={key} patient={patient} />
          : <PatientListItem key={key} patient={patient} />
      );
    }).filter(Boolean);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              View, search and manage all patient records
            </p>
          </div>
          
          <button
            onClick={() => navigate('/admitting/new-patient')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <UserPlus size={16} className="mr-2" />
            Add Patient
          </button>
        </div>
        
        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <PatientSearchInput 
            onSearch={handleSearch} 
            initialValue={searchTerm} 
          />
          <ViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>
        
        {/* Error display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Patients Container - conditional classes based on view mode */}
        <div 
          className={`min-h-[calc(100vh-300px)] ${
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" 
              : "flex flex-col space-y-3"
          }`}
        >
          {loading ? (
            renderSkeletons()
          ) : patients.length === 0 ? (
            <div className="col-span-full">
              <EmptyState searchTerm={searchTerm} />
            </div>
          ) : (
            renderPatients()
          )}
        </div>
        
        {/* Add a fixed-height container for pagination */}
        <div className="h-16 mt-4">
          {!loading && patients?.length > 0 && (
            <Pagination 
              currentPage={pagination.current_page}
              totalPages={pagination.last_page}
              onPageChange={(page) => fetchPatients(page)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientList;