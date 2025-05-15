import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Select from 'react-select';
import { toast } from 'react-toastify';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { format } from 'date-fns';

// Utility function to format dates safely
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'N/A';
        return format(date, 'MMM dd, yyyy');
    } catch (error) {
        console.error("Error formatting date:", error);
        return 'N/A';
    }
};

// Utility function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    }).format(amount);
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
                        <h3 className="text-lg font-semibold text-gray-900">{patient.full_name}</h3>
                        <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
                        <p className="text-sm text-gray-500">Date of Birth: {patient.date_of_birth}</p>
                    </div>
                </div>
                <StatusBadge status={patient.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
                <InfoField label="Room Number" value={patient.room_number} />
                <InfoField label="Ward Type" value={patient.ward_type} capitalize />
                <InfoField label="Admission Date" value={formatDate(patient.admission_date)} />
                <InfoField label="Length of Stay" value={patient.lengthOfStay} />
            </div>
            
            <div className="mt-4 pt-4 border-t">
                <InfoField label="Attending Physician" value={patient.attending_physician} />
            </div>
        </div>
    );
};

// Loading skeleton for PatientInfoCard
const LoadingPatientCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Skeleton circle height={48} width={48} />
                    <div>
                        <Skeleton height={20} width={150} />
                        <Skeleton height={16} width={100} />
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
        </div>
    </div>
);

// Status badge component
const StatusBadge = ({ status }) => {
    const statusClasses = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
        <div className={`px-3 py-1 rounded-full ${statusClasses[status] || statusClasses.inactive}`}>
            {status || 'N/A'}
        </div>
    );
};

// Info field component
const InfoField = ({ label, value, capitalize = false }) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`font-medium ${capitalize ? 'capitalize' : ''}`}>
            {value || 'N/A'}
        </p>
    </div>
);

// Transaction item component
const TransactionItem = ({ transaction, index }) => {
    // Fixed color classes to avoid dynamic class issues
    const getColorClasses = (colorIndex) => {
        const colorMap = {
            0: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
            1: { bg: 'bg-green-100', text: 'text-green-600' },
            2: { bg: 'bg-blue-100', text: 'text-blue-600' }
        };
        return colorMap[colorIndex] || colorMap[0];
    };
    
    const colors = getColorClasses(index % 3);
    
    return (
        <li className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <svg className={`h-5 w-5 ${colors.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formatDate(transaction.created_at)}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(parseFloat(transaction.amount))}
                    </div>
                </div>
            </div>
        </li>
    );
};

// Add the PDF preview component
const PdfPreview = ({ file }) => {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setPreviewUrl(fileUrl);
            return () => URL.revokeObjectURL(fileUrl);
        }
    }, [file]);

    if (!previewUrl) return null;

    return (
        <div className="mt-4">
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                    <h3 className="text-sm font-medium text-gray-700">Preview</h3>
                </div>
                <iframe
                    src={previewUrl}
                    className="w-full h-[900px]"
                    title="PDF Preview"
                />
            </div>
        </div>
    );
};

// Update the PdfUploadForm component
const PdfUploadForm = ({ patientId, onUploadSuccess, billAmount }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        
        // Validate bill amount
        if (!billAmount || isNaN(billAmount) || parseFloat(billAmount) <= 0) {
            toast.error('Please enter a valid bill amount');
            return;
        }

        const formData = new FormData();
        formData.append('pdf_file', file);
        formData.append('admission_id', patientId);
        formData.append('description', file.name);
        formData.append('amount', parseFloat(billAmount));

        setUploading(true);
        try {
            const response = await axiosClient.post('/billing/upload-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.status) {
                toast.success('Bill and PDF uploaded successfully');
                setFile(null);
                if (onUploadSuccess) onUploadSuccess();
            }
        } catch (error) {
            toast.error('Failed to upload bill and PDF');
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            toast.error('Please select a valid PDF file');
            e.target.value = null;
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Upload PDF</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            hover:file:bg-indigo-100"
                    />
                </div>
                <button
                    type="submit"
                    disabled={uploading || !file}
                    className="inline-flex items-center px-4 py-2 border border-transparent 
                        rounded-md shadow-sm text-sm font-medium text-white 
                        bg-indigo-600 hover:bg-indigo-700 focus:outline-none 
                        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                        disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                        </>
                    ) : (
                        'Upload PDF'
                    )}
                </button>
            </form>

            {/* Add the PDF preview component */}
            {file && <PdfPreview file={file} />}
        </div>
    );
};

// Main component
const PatientBills = () => {
    const navigate = useNavigate();
    
    // State management
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

    // Update state helper
    const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

    // Custom select styles
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '42px',
            padding: '2px',
            borderRadius: '0.75rem',
            borderColor: state.isFocused ? '#6366f1' : '#e5e7eb',
            boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
            '&:hover': {
                borderColor: '#6366f1'
            }
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }),
        option: (provided, state) => ({
            ...provided,
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f3f4f6' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            '&:hover': {
                backgroundColor: state.isSelected ? '#6366f1' : '#f3f4f6'
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            fontSize: '1rem',
            color: '#111827'
        })
    };

    // Fetch active patients
    const fetchActivePatients = useCallback(async () => {
        try {
            const response = await axiosClient.get('/billing/active-patients');
            
            if (response.data?.data) {
                const formattedPatients = response.data.data.map(patient => {
                    // Format the patient name consistently
                    const lastName = patient.last_name || '';
                    const firstName = patient.first_name || '';
                    const middleName = patient.middle_name || '';
                    const fullName = `${lastName}, ${firstName}${middleName ? ' ' + middleName : ''}`.trim();
                    
                    return {
                        value: patient.id,
                        label: fullName || `Patient ID: ${patient.id}`,
                        patientData: {
                            ...patient,
                            fullName,
                            dateOfBirth: patient.date_of_birth
                        }
                    };
                });
                
                updateState({ 
                    patients: formattedPatients, 
                    error: null,
                    loadingPatients: false 
                });
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching active patients:', err);
            updateState({ 
                error: 'Failed to load active patients.',
                patients: [],
                loadingPatients: false 
            });
        }
    }, []);

    // Fetch patient transactions
    const fetchTransactions = useCallback(async (patientId) => {
        if (!patientId) {
            updateState({ recentTransactions: [] });
            return;
        }

        try {
            const response = await axiosClient.get(`/billing/transactions/${patientId}`);
            
            if (response.data?.data) {
                updateState({ recentTransactions: response.data.data });
            } else {
                updateState({ recentTransactions: [] });
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            updateState({ recentTransactions: [] });
        }
    }, []);

    // Handle patient selection
    const handlePatientSelect = useCallback(async (option) => {
        updateState({ 
            selectedPatient: option,
            loadingDetails: true,
            error: null 
        });
        
        try {
            if (option) {
                const response = await axiosClient.get(`/patients/${option.value}/details`);
                
                if (response.data?.data) {
                    const details = response.data.data;
                    
                    // Calculate length of stay
                    let lengthOfStay = 'N/A';
                    if (details.admission_date) {
                        const admissionDate = new Date(details.admission_date);
                        const today = new Date();
                        const diffTime = Math.abs(today - admissionDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        lengthOfStay = `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                    }
                    
                    // Get the patient name - the API returns 'name' as a concatenated field
                    let patientName = details.name || '';
                    
                    // If name is not available, try to construct it from individual fields
                    if (!patientName && (details.first_name || details.last_name)) {
                        const lastName = details.last_name || '';
                        const firstName = details.first_name || '';
                        const middleName = details.middle_name || '';
                        
                        if (lastName && firstName) {
                            patientName = `${lastName}, ${firstName}${middleName ? ' ' + middleName : ''}`;
                        } else if (firstName) {
                            patientName = `${firstName}${middleName ? ' ' + middleName : ''}`;
                        } else if (lastName) {
                            patientName = lastName;
                        }
                    }
                    
                    // If still no name, use patient ID as fallback
                    if (!patientName) {
                        patientName = `Patient ID: ${details.id}`;
                    }
                    
                    const formattedDetails = {
                        ...details,
                        lengthOfStay,
                        name: patientName.trim(),
                        first_name: details.first_name,
                        last_name: details.last_name,
                        middle_name: details.middle_name
                    };
                    
                    updateState({ 
                        patientDetails: formattedDetails,
                        error: null,
                        loadingDetails: false 
                    });
                    
                    // Fetch transactions for the selected patient
                    await fetchTransactions(option.value);
                } else {
                    throw new Error(response.data?.message || 'Failed to load patient details');
                }
            } else {
                updateState({ 
                    patientDetails: null,
                    recentTransactions: [],
                    loadingDetails: false 
                });
            }
        } catch (err) {
            console.error('Error fetching patient details:', err);
            console.error('Response data:', err.response?.data);
            const errorMessage = err.response?.data?.message || 'Failed to fetch patient details';
            toast.error(errorMessage);
            updateState({ 
                error: errorMessage,
                patientDetails: null,
                loadingDetails: false 
            });
        }
    }, [fetchTransactions]);

    // Handle amount change
    const handleAmountChange = useCallback((e) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        const parts = value.split('.');
        
        if (parts.length <= 2) {
            updateState({ billAmount: value });
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchActivePatients();
    }, [fetchActivePatients]);

    const {
        loadingPatients,
        loadingDetails,
        error,
        patients,
        selectedPatient,
        patientDetails,
        billAmount,
        recentTransactions
    } = state;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-black text-3xl font-bold">Progress Bill</h1>
                    <p className="text-gray-600 mt-2">Generate and manage progress bills for active patients</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm" role="alert">
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

                <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 transition-all duration-300 hover:shadow-xl">
                    <div className="mb-8">
                        <label htmlFor="patient-select" className="block text-sm font-semibold text-gray-700 mb-3">
                            Select Patient
                        </label>
                        <Select
                            id="patient-select"
                            options={patients}
                            value={selectedPatient}
                            onChange={handlePatientSelect}
                            isLoading={loadingPatients}
                            className="w-full"
                            classNamePrefix="react-select"
                            placeholder="Search patient by name..."
                            isClearable
                            isDisabled={loadingPatients || loadingDetails}
                            styles={{
                                ...customSelectStyles,
                                option: (provided, state) => ({
                                    ...provided,
                                    padding: '8px 12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f3f4f6' : 'white',
                                    color: state.isSelected ? 'white' : '#374151',
                                    '&:hover': {
                                        backgroundColor: state.isSelected ? '#6366f1' : '#f3f4f6'
                                    }
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    fontSize: '1rem',
                                    color: '#111827'
                                })
                            }}
                            formatOptionLabel={option => (
                                <div className="flex flex-col">
                                    <span className="font-medium">{option.label}</span>
                                    {option.patientData?.dateOfBirth && (
                                        <span className="text-sm text-gray-500">
                                            DOB: {formatDate(option.patientData.dateOfBirth)}
                                        </span>
                                    )}
                                </div>
                            )}
                            noOptionsMessage={({ inputValue }) => 
                                inputValue ? "No patients found" : "Type to search patients"
                            }
                            filterOption={(option, input) => {
                                if (!input) return true;
                                const searchStr = input.toLowerCase();
                                const label = option.label.toLowerCase();
                                return label.includes(searchStr);
                            }}
                        />
                    </div>

                    {patientDetails && (
                        <div className="mb-8">
                            <PatientInfoCard patient={patientDetails} loading={loadingDetails} />
                        </div>
                    )}

                    {patientDetails && !loadingDetails ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                {patientDetails.status === 'active' && (
                                    <>
                                        <div className="mt-8">
                                            <label htmlFor="bill-amount" className="block text-sm font-semibold text-gray-700 mb-3">
                                                Total Bill Amount
                                            </label>
                                            <div className="mt-1 relative rounded-xl shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-lg font-bold">₱</span>
                                                </div>
                                                <input
                                                    type="text"
                                                    id="bill-amount"
                                                    value={billAmount}
                                                    onChange={handleAmountChange}
                                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-16 py-3 text-lg border-gray-300 rounded-xl transition-all duration-200 hover:border-gray-400"
                                                    placeholder="0.00"
                                                    aria-describedby="amount-currency"
                                                />
                                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm font-medium">PHP</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <PdfUploadForm 
                                                patientId={patientDetails.id}
                                                billAmount={billAmount} // Pass the bill amount
                                                onUploadSuccess={() => {
                                                    fetchTransactions(patientDetails.id);
                                                    updateState({ billAmount: '' }); // Reset the bill amount after successful upload
                                                }}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            {patientDetails && patientDetails.id && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                        <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        Recent Transactions
                                        {recentTransactions.length > 4 && (
                                            <span className="text-sm font-normal text-gray-500 ml-2">
                                                (Scroll to see more)
                                            </span>
                                        )}
                                    </h3>
                                    <div className="bg-white shadow-lg overflow-hidden rounded-xl max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                        {recentTransactions.length > 0 ? (
                                            <ul className="divide-y divide-gray-200">
                                                {recentTransactions.map((transaction, index) => (
                                                    <TransactionItem 
                                                        key={transaction.id} 
                                                        transaction={transaction} 
                                                        index={index} 
                                                    />
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="px-6 py-12 text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                                                </svg>
                                                <p className="mt-3 text-gray-500">No recent transactions for this patient.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        !loadingPatients && !loadingDetails && (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-4 text-xl text-gray-600 font-medium">Select a patient to begin</p>
                                <p className="mt-2 text-gray-500">Choose a patient from the dropdown to view details and generate a progress bill.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientBills;
