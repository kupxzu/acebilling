import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios'; // Ensure this is your configured axios instance
import Navbar from '../Navbar'; // Assuming this path is correct
import Select from 'react-select';
import { toast } from 'react-toastify';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { format as formatDateFn } from 'date-fns'; // Renamed to avoid conflict

// Utility function to format dates and times safely
const formatDateTime = (dateString) => { // Renamed to be more specific
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A'; // Invalid date
        // Format: Month Day, Year, Hour:Minute AM/PM (e.g., May 15, 2024, 03:45 PM)
        return formatDateFn(date, 'MMM dd, yyyy, hh:mm a');
    } catch (error) {
        console.error("Error formatting date-time:", dateString, error);
        return 'N/A';
    }
};

// Utility function to format only dates (if needed elsewhere, or keep formatDateTime as the primary)
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return formatDateFn(date, 'MMM dd, yyyy');
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'N/A';
    }
};


// Utility function to format currency
const formatCurrency = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
        return 'N/A';
    }
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(numericAmount);
};

// PatientInfoCard component
const PatientInfoCard = ({ patient, loading }) => {
    if (loading) return <LoadingPatientCard />;
    if (!patient) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-3 rounded-full">
                        <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{patient.name || 'N/A'}</h3>
                        <p className="text-sm text-gray-500">Patient ID: {patient.id || 'N/A'}</p>
                        <p className="text-sm text-gray-500">Date of Birth: {formatDate(patient.date_of_birth)}</p> {/* Uses formatDate for DOB */}
                    </div>
                </div>
                <StatusBadge status={patient.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
                <InfoField label="Room Number" value={patient.room_number} />
                <InfoField label="Ward Type" value={patient.ward_type} capitalize />
                <InfoField label="Admission Date" value={formatDate(patient.admission_date)} /> {/* Uses formatDate */}
                <InfoField label="Length of Stay" value={patient.lengthOfStay} />
            </div>

            <div className="mt-4 pt-4 border-t">
                <InfoField label="Attending Physician" value={patient.attending_physician} />
            </div>
        </div>
    );
};

// Loading skeleton for PatientInfoCard (no changes)
const LoadingPatientCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton circle height={48} width={48} />
                    <div>
                        <Skeleton height={20} width={150} />
                        <Skeleton height={16} width={100} />
                         <Skeleton height={16} width={120} />
                    </div>
                </div>
                <Skeleton height={24} width={60} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i}>
                        <Skeleton height={16} width={80} />
                        <Skeleton height={20} width={120} />
                    </div>
                ))}
            </div>
             <div className="mt-4 pt-4 border-t">
                 <Skeleton height={16} width={100} />
                 <Skeleton height={20} width={180} />
            </div>
        </div>
    </div>
);


// Status badge component (no changes)
const StatusBadge = ({ status }) => {
    const statusClasses = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        discharged: 'bg-blue-100 text-blue-800',
        pending: 'bg-yellow-100 text-yellow-800'
    };
    const normalizedStatus = status ? status.toLowerCase() : 'inactive';

    return (
        <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusClasses[normalizedStatus] || statusClasses.inactive}`}>
            {normalizedStatus.replace('_', ' ')}
        </div>
    );
};

// Info field component (no changes)
const InfoField = ({ label, value, capitalize = false }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`font-medium ${capitalize ? 'capitalize' : ''} ${!value || value === 'N/A' ? 'text-gray-400' : 'text-gray-800'}`}>
            {value || 'N/A'}
        </p>
    </div>
);


// Transaction item component - UPDATED to use formatDateTime
const TransactionItem = ({ transaction, index }) => {
    const getColorClasses = (colorIndex) => {
        const colorMap = {
            0: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
            1: { bg: 'bg-green-50', text: 'text-green-600' },
            2: { bg: 'bg-blue-50', text: 'text-blue-600' }
        };
        return colorMap[colorIndex % 3] || colorMap[0];
    };
    const colors = getColorClasses(index);

    return (
        <li className="px-4 py-3 hover:bg-gray-50 transition-colors duration-200 sm:px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <svg className={`h-5 w-5 ${colors.text}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.description || 'No Description'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formatDateTime(transaction.created_at)} {/* USE formatDateTime HERE */}
                        </p>
                    </div>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.amount)}
                    </div>
                </div>
            </div>
        </li>
    );
};

// PDF preview component (no changes)
const PdfPreview = ({ file }) => {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        let fileUrl = '';
        if (file) {
            fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
        } else {
            setPreviewUrl(null);
        }
        return () => {
            if (fileUrl) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [file]);

    if (!previewUrl) return null;

    return (
        <div className="mt-6">
            <div className="border rounded-lg overflow-hidden shadow">
                <div className="bg-gray-100 px-4 py-2 border-b">
                    <h3 className="text-sm font-medium text-gray-700">Preview: {file.name}</h3>
                </div>
                <iframe
                    src={previewUrl}
                    className="w-full h-[500px] lg:h-[700px]"
                    title="PDF Preview"
                />
            </div>
        </div>
    );
};

// PdfUploadForm component (no functional changes needed for this request)
const PdfUploadForm = ({ admissionId, onUploadSuccess, billAmount }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.warn('Please select a PDF file to upload.');
            return;
        }

        const numericBillAmount = parseFloat(billAmount);
        if (isNaN(numericBillAmount) || numericBillAmount <= 0) {
            toast.error('Please enter a valid positive bill amount.');
            return;
        }

        if (!admissionId) {
            toast.error('Admission ID is missing. Cannot upload bill. Please re-select the patient.');
            return;
        }

        const formData = new FormData();
        formData.append('pdf_file', file);
        formData.append('admission_id', admissionId);
        formData.append('description', `Bill: ${file.name}`);
        formData.append('amount', numericBillAmount);

        setUploading(true);
        try {
            const response = await axiosClient.post('/billing/upload-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if ((response.status === 200 || response.status === 201) && response.data && response.data.status === true) {
                toast.success(response.data.message || 'Bill and PDF uploaded successfully!');
                setFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
            } else {
                const serverMessage = response.data?.message || `Upload failed with status: ${response.status}.`;
                toast.error(serverMessage);
                console.error('Upload logical error:', response.data || response);
            }
        } catch (error) {
            console.error('Upload error object:', error);
            let errorMessage = 'Failed to upload bill and PDF. Please try again.';
            if (error.response) {
                console.error('Server Response Data:', error.response.data);
                errorMessage = error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText || 'Server error'}`;
                if (error.response.status === 500) errorMessage = 'Internal Server Error. Please check server logs or contact support.';
            } else if (error.request) {
                errorMessage = 'Upload failed: No response from the server. Check network and server status.';
            } else {
                errorMessage = `Upload error: ${error.message}`;
            }
            toast.error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type === 'application/pdf') {
                if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                    toast.error('File is too large. Maximum size is 10MB.');
                    e.target.value = null; setFile(null);
                } else { setFile(selectedFile); }
            } else {
                toast.error('Please select a valid PDF file.');
                e.target.value = null; setFile(null);
            }
        } else { setFile(null); }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="pdf-upload-input" className="block text-sm font-medium text-gray-700">Upload PDF Bill</label>
                    <input ref={fileInputRef} id="pdf-upload-input" type="file" accept=".pdf" onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <button type="submit" disabled={uploading || !file || !admissionId || parseFloat(billAmount) <= 0}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                    {uploading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                        </>
                    ) : 'Upload PDF & Create Bill'}
                </button>
            </form>
            {file && <PdfPreview file={file} />}
        </div>
    );
};

// Main PatientBills component (structure and other logic remains largely the same)
const PatientBills = () => {
    const navigate = useNavigate();

    const [state, setState] = useState({
        loadingPatients: true,
        loadingDetails: false,
        error: null,
        patients: [],
        selectedPatient: null,
        patientDetails: null,
        billAmount: '',
        recentTransactions: []
    });

    const intervalRef = useRef(null);

    const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

    const customSelectStyles = {
        control: (provided, selectState) => ({
            ...provided, minHeight: '42px', padding: '2px', borderRadius: '0.75rem',
            borderColor: selectState.isFocused ? '#6366f1' : '#d1d5db',
            boxShadow: selectState.isFocused ? '0 0 0 1px #6366f1' : 'none',
            '&:hover': { borderColor: selectState.isFocused ? '#6366f1' : '#9ca3af' }
        }),
        menu: (provided) => ({ ...provided, borderRadius: '0.75rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', zIndex: 20 }),
        option: (provided, selectState) => ({
            ...provided, padding: '10px 12px',
            backgroundColor: selectState.isSelected ? '#6366f1' : selectState.isFocused ? '#eef2ff' : 'white',
            color: selectState.isSelected ? 'white' : '#374151',
            '&:hover': { backgroundColor: selectState.isSelected ? '#4f46e5' : '#eef2ff' },
            cursor: 'pointer'
        }),
        singleValue: (provided) => ({ ...provided, fontSize: '0.875rem', color: '#1f2937' }),
        placeholder: (provided) => ({ ...provided, color: '#6b7280' }),
        input: (provided) => ({ ...provided, margin: '0px', padding: '0px' }),
    };

    const fetchActivePatients = useCallback(async () => {
        updateState({ loadingPatients: true, error: null });
        try {
            const response = await axiosClient.get('/billing/active-patients');
            if (response.data?.data) {
                const formattedPatients = response.data.data
                    .map(patient => {
                        if (!patient.patient_id || !patient.admission_id) {
                            console.warn("Patient data missing patient_id or admission_id:", patient);
                            return null;
                        }
                        const lastName = patient.last_name || '';
                        const firstName = patient.first_name || '';
                        const middleInitial = patient.middle_name ? ` ${patient.middle_name.charAt(0)}.` : '';
                        const fullName = `${lastName}, ${firstName}${middleInitial}`.trim() || `Patient ID: ${patient.patient_id}`;
                        return {
                            value: patient.patient_id,
                            label: fullName,
                            patientData: { 
                                ...patient, 
                                fullNameForDisplay: fullName,
                                admission_date: new Date(patient.admission_date || Date.now())
                            }
                        };
                    })
                    .filter(p => p !== null)
                    // Sort by admission date (most recent first)
                    .sort((a, b) => b.patientData.admission_date - a.patientData.admission_date);

                updateState({ patients: formattedPatients, loadingPatients: false });
            } else { 
                throw new Error('Invalid response format for active patients'); 
            }
        } catch (err) {
            console.error('Error fetching active patients:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load active patients.';
            updateState({ error: errorMessage, patients: [], loadingPatients: false });
            toast.error(errorMessage);
        }
    }, []);

    const fetchTransactions = useCallback(async (patientId) => {
        if (!patientId) {
            updateState({ recentTransactions: [] }); return;
        }
        try {
            const response = await axiosClient.get(`/billing/transactions/${patientId}`);
            if (response.data?.data) {
                updateState({ recentTransactions: response.data.data });
            } else { updateState({ recentTransactions: [] }); }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch billing history.');
            updateState({ recentTransactions: [] });
        }
    }, []);

    const handlePatientSelect = useCallback(async (selectedOption) => {
        if (!selectedOption) {
            updateState({ selectedPatient: null, patientDetails: null, recentTransactions: [], billAmount: '', error: null });
            return;
        }

        updateState({
            selectedPatient: selectedOption, loadingDetails: true, error: null,
            patientDetails: null, recentTransactions: []
        });

        try {
            const detailsResponse = await axiosClient.get(`/patients/${selectedOption.value}/details`); // selectedOption.value is patient_id

            if (detailsResponse.data?.data) {
                const serverDetails = detailsResponse.data.data;
                const clientPatientData = selectedOption.patientData;

                let lengthOfStay = 'N/A';
                const admissionDateString = clientPatientData.admission_date || serverDetails.admission_date;
                if (admissionDateString) {
                    try {
                        const admissionDate = new Date(admissionDateString);
                        const today = new Date();
                        if (!isNaN(admissionDate.getTime()) && admissionDate <= today) {
                            const diffTime = Math.abs(today.getTime() - admissionDate.getTime());
                            const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                            lengthOfStay = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                        }
                    } catch (e) { console.error("Error calculating length of stay", e); }
                }

                const patientDisplayName = clientPatientData.fullNameForDisplay || `${serverDetails.last_name}, ${serverDetails.first_name}`;

                const formattedDetails = {
                    ...serverDetails,
                    id: selectedOption.value, // patient_id
                    active_admission_id: clientPatientData.admission_id, // from active-patients list data
                    name: patientDisplayName,
                    lengthOfStay,
                    admission_date: admissionDateString,
                    room_number: clientPatientData.room_number || serverDetails.room_number,
                    ward_type: clientPatientData.ward_type || serverDetails.ward_type,
                    attending_physician: clientPatientData.attending_physician || serverDetails.attending_physician,
                    status: clientPatientData.status || serverDetails.status, // admission status
                    date_of_birth: clientPatientData.date_of_birth || serverDetails.date_of_birth,
                };

                updateState({ patientDetails: formattedDetails, loadingDetails: false });
                await fetchTransactions(selectedOption.value); // Fetch transactions using patient_id
            } else { throw new Error(detailsResponse.data?.message || 'Failed to load patient details: Invalid data structure.'); }
        } catch (err) {
            console.error('Error fetching patient details:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch patient details.';
            toast.error(errorMessage);
            updateState({ error: errorMessage, patientDetails: null, loadingDetails: false });
        }
    }, [fetchTransactions]);

    const handleAmountChange = useCallback((e) => {
        let value = e.target.value;
        value = value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        if (parts.length > 2) { value = parts[0] + '.' + parts.slice(1).join(''); }
        if (parts[1] && parts[1].length > 2) { value = parts[0] + '.' + parts[1].substring(0, 2); }
        updateState({ billAmount: value });
    }, []);

    useEffect(() => {
        fetchActivePatients();
    }, [fetchActivePatients]);

    useEffect(() => {
        const pollData = async () => {
            try {
                const response = await axiosClient.get('/billing/active-patients');
                if (response.data?.data) {
                    const formattedPatients = response.data.data
                        .map(patient => {
                            if (!patient.patient_id || !patient.admission_id) return null;
                            const lastName = patient.last_name || '';
                            const firstName = patient.first_name || '';
                            const middleInitial = patient.middle_name ? ` ${patient.middle_name.charAt(0)}.` : '';
                            const fullName = `${lastName}, ${firstName}${middleInitial}`.trim() || `Patient ID: ${patient.patient_id}`;
                            return {
                                value: patient.patient_id,
                                label: fullName,
                                patientData: { ...patient, fullNameForDisplay: fullName }
                            };
                        })
                        .filter(p => p !== null);

                    updateState({ patients: formattedPatients });

                    // If there's a selected patient, update their transactions
                    if (state.selectedPatient?.value) {
                        const transactionsRes = await axiosClient.get(`/billing/transactions/${state.selectedPatient.value}`);
                        if (transactionsRes.data?.data) {
                            updateState({ recentTransactions: transactionsRes.data.data });
                        }
                    }
                }
            } catch (error) {
                console.error('Polling error:', error);
                // Don't show error toasts during polling to avoid spam
            }
        };

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Initial poll
        pollData();

        // Set up new interval
        intervalRef.current = setInterval(pollData, 5000);

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [state.selectedPatient]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Clear interval when tab is not visible
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            } else {
                // Restart polling when tab becomes visible
                if (!intervalRef.current) {
                    intervalRef.current = setInterval(async () => {
                        const response = await axiosClient.get('/billing/active-patients');
                        if (response.data?.data) {
                            const formattedPatients = response.data.data
                                .map(patient => {
                                    if (!patient.patient_id || !patient.admission_id) return null;
                                    const lastName = patient.last_name || '';
                                    const firstName = patient.first_name || '';
                                    const middleInitial = patient.middle_name ? ` ${patient.middle_name.charAt(0)}.` : '';
                                    const fullName = `${lastName}, ${firstName}${middleInitial}`.trim() || `Patient ID: ${patient.patient_id}`;
                                    return {
                                        value: patient.patient_id,
                                        label: fullName,
                                        patientData: { ...patient, fullNameForDisplay: fullName }
                                    };
                                })
                                .filter(p => p !== null);

                            updateState({ patients: formattedPatients });
                        }
                    }, 5000);
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    const {
        loadingPatients, loadingDetails, error, patients,
        selectedPatient, patientDetails, billAmount, recentTransactions
    } = state;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <header className="mb-8">
                    <h1 className="text-gray-900 text-3xl font-bold tracking-tight">Progress Bill Management</h1>
                    <p className="text-gray-600 mt-1 text-sm">Generate and manage progress bills for active patients.</p>
                </header>

                {error && !loadingDetails && !loadingPatients && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow" role="alert">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.293-8.707a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586l-1.293-1.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-xl p-6 lg:p-8">
                    <div className="mb-6">
                        <label htmlFor="patient-select" className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Admitted Patient
                        </label>
                        <Select
                            id="patient-select" options={patients} value={selectedPatient} onChange={handlePatientSelect}
                            isLoading={loadingPatients} className="w-full react-select-container" classNamePrefix="react-select"
                            placeholder={loadingPatients ? "Loading patients..." : "Search by name or Patient ID..."}
                            isClearable isDisabled={loadingPatients || loadingDetails} styles={customSelectStyles}
                            formatOptionLabel={(option, { context }) => {
                                if (context === 'menu') {
                                    return (
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-medium">{option.label}</span>
                                                <span className="block text-xs text-gray-500 mt-0.5">
                                                    DOB: {formatDate(option.patientData?.date_of_birth)} | Patient ID: {option.value}
                                                </span>
                                                <span className="block text-xs text-gray-500 mt-0.5">
                                                    Admission ID: {option.patientData?.admission_id}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-indigo-600 font-medium">
                                                    Admitted: {formatDate(option.patientData?.admission_date)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }
                                return option.label;
                            }}
                            noOptionsMessage={({ inputValue }) => 
                                loadingPatients 
                                    ? "Loading..." 
                                    : (inputValue ? "No patients found" : "Type to search...")}
                            filterOption={(option, input) => {
                                if (!input && !loadingPatients) return true;
                                const searchStr = input.toLowerCase();
                                const labelMatch = option.label.toLowerCase().includes(searchStr);
                                const patientIdMatch = String(option.value).toLowerCase().includes(searchStr);
                                const admissionIdMatch = String(option.patientData?.admission_id).toLowerCase().includes(searchStr);
                                const admissionDateMatch = formatDate(option.patientData?.admission_date).toLowerCase().includes(searchStr);
                                return labelMatch || patientIdMatch || admissionIdMatch || admissionDateMatch;
                            }}
                        />
                    </div>

                    {loadingDetails && <LoadingPatientCard />}
                    {!loadingDetails && patientDetails && (
                        <div className="mb-8">
                            <PatientInfoCard patient={patientDetails} loading={false} />
                        </div>
                    )}

                    {patientDetails && !loadingDetails && patientDetails.status === 'active' && (
                        <div className="mt-8 pt-6 border-t border-gray-200">
                             <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Progress Bill</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 items-start">
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="bill-amount" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                            Total Bill Amount for this PDF
                                        </label>
                                        <div className="mt-1 relative rounded-lg shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm font-bold">₱</span>
                                            </div>
                                            <input type="text" inputMode="decimal" id="bill-amount" value={billAmount} onChange={handleAmountChange}
                                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 pr-12 py-2.5 text-base border-gray-300 rounded-lg transition-colors hover:border-gray-400"
                                                placeholder="0.00" aria-describedby="amount-currency" />
                                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm font-medium">PHP</span>
                                            </div>
                                        </div>
                                    </div>
                                    <PdfUploadForm
                                        admissionId={patientDetails.active_admission_id}
                                        billAmount={billAmount}
                                        onUploadSuccess={() => {
                                            if (patientDetails && patientDetails.id) fetchTransactions(patientDetails.id);
                                            updateState({ billAmount: '' });
                                        }}
                                    />
                                </div>

                                {patientDetails && patientDetails.id && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                            </svg>
                                            Billing History
                                            {recentTransactions.length > 5 && <span className="text-xs font-normal text-gray-500">(Scroll for more)</span>}
                                        </h3>
                                        <div className="bg-slate-50 shadow-inner overflow-hidden rounded-lg max-h-[400px] lg:max-h-[calc(100vh-450px)] min-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                            {recentTransactions.length > 0 ? (
                                                <ul className="divide-y divide-gray-200">
                                                    {recentTransactions.map((transaction, index) => (
                                                        <TransactionItem key={transaction.id || index} transaction={transaction} index={index} />
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="px-6 py-10 text-center flex flex-col items-center justify-center h-full">
                                                    <svg className="mx-auto h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625A1.125 1.125 0 004.5 3.375v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                    </svg>
                                                    <p className="mt-3 text-sm text-gray-500">No billing history found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {!loadingDetails && patientDetails && patientDetails.status !== 'active' && (
                        <div className="text-center py-12 mt-6 border-t border-gray-200">
                             <svg className="mx-auto h-12 w-12 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-4 text-lg text-gray-700 font-medium">Billing Inactive for This Admission</p>
                            <p className="mt-1 text-sm text-gray-500">This patient's current admission status is not 'active'. New bills cannot be added.</p>
                        </div>
                    )}

                    {!selectedPatient && !loadingPatients && !loadingDetails && (
                         <div className="text-center py-16">
                            <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 17.25v2.25M12 17.25v2.25M15 17.25v2.25M5.625 3.375c0-.621.504-1.125 1.125-1.125h9.5c.621 0 1.125.504 1.125 1.125v17.25c0 .621-.504 1.125-1.125 1.125h-9.5A1.125 1.125 0 015.625 20.625V3.375z" />
                            </svg>
                            <p className="mt-4 text-xl text-gray-600 font-medium">Select a Patient to Begin</p>
                            <p className="mt-2 text-sm text-gray-500">Choose a patient from the dropdown to view details and manage their progress bills.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientBills;