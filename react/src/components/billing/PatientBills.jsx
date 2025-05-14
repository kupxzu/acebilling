import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-loading-skeleton/dist/skeleton.css';
import { format } from 'date-fns';

// Helper function to format dates
const formatDate = (dateString) => {
    try {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        // Check if the date is valid before formatting
        return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM dd, yyyy');
    } catch (e) {
         console.error("Error formatting date:", e);
        return 'N/A';
    }
};

const PatientBills = () => {
    const navigate = useNavigate();
    // Loading state for the initial patient dropdown fetch
    const [loadingPatients, setLoadingPatients] = useState(true);
    // Loading state for fetching detailed patient information
    const [loadingDetails, setLoadingDetails] = useState(false);
    // State for general error messages
    const [error, setError] = useState(null);

    // State to hold the list of patients for the dropdown (basic info)
    const [patients, setPatients] = useState([]);
    // State to hold the currently selected patient object from react-select { value: id, label: name }
    const [selectedPatient, setSelectedPatient] = useState(null);

    // State for the bill amount input
    const [billAmount, setBillAmount] = useState('');

    // State to hold the full detailed patient object fetched after selection
    // This object is expected to have flattened admission details (room_number, status, etc.)
    const [patientDetails, setPatientDetails] = useState(null);

    // State to hold the URL of the generated PDF preview
    const [pdfUrl, setPdfUrl] = useState(null);
    // State to control the visibility of the PDF preview modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State to hold the list of recent transactions
    const [recentTransactions, setRecentTransactions] = useState([]);


    // Effect to fetch the initial list of active patients for the dropdown
    useEffect(() => {
        const fetchActivePatients = async () => {
            setLoadingPatients(true);
            try {
                // API endpoint to get a list of active patients.
                // Assuming this returns an array of objects like { id, name, ... }
                const response = await axiosClient.get('/billing/active-patients');
                setPatients(response.data.data);
                setError(null); // Clear any previous errors on successful fetch
            } catch (err) {
                console.error('Error fetching active patients for dropdown:', err);
                setError('Failed to load active patients.');
                setPatients([]); // Clear patients list on error
            } finally {
                setLoadingPatients(false);
            }
        };
        fetchActivePatients();
    }, []); // Empty dependency array means this effect runs only once on component mount

    // Effect to fetch the full details of the selected patient
    useEffect(() => {
        const fetchPatientDetails = async () => {
            // Only fetch details if a patient has been selected from the dropdown
            if (selectedPatient) {
                setLoadingDetails(true); // Indicate that details are loading
                // Clear previous patient details and related states while loading new ones
                setPatientDetails(null);
                setPdfUrl(null); // Clear PDF URL
                setIsModalOpen(false); // Close modal
                setBillAmount('');
                // Clear recent transactions when selecting a new patient
                setRecentTransactions([]);

                try {
                    // API endpoint to get detailed information for a specific patient.
                    // Based on console output, this returns { status: true, data: { ...flattened_details... } }
                    const response = await axiosClient.get(`/patients/${selectedPatient.value}/details`);

                    // Log the response data structure to verify it matches expectations
                    console.log('Fetched patient details:', response.data);

                    // Assuming the detailed patient object is in response.data.data
                    if (response.data && response.data.status && response.data.data) {
                         setPatientDetails(response.data.data);
                         setError(null); // Clear previous errors on successful fetch
                    } else {
                         // Handle cases where API response indicates failure or missing data.data
                         const message = response.data.message || 'Failed to load patient details: No data received.';
                         toast.error(message);
                         setError(message);
                         setPatientDetails(null); // Clear details on error
                    }

                } catch (err) {
                    console.error('Error fetching patient details:', err);
                    // Handle API errors (e.g., 404 if patient not found, 500 server error)
                    const errorMessage = err.response?.data?.message || 'Failed to fetch patient details due to an API error.';
                    toast.error(errorMessage);
                    setError(errorMessage);
                    setPatientDetails(null); // Clear details on error
                } finally {
                    setLoadingDetails(false); // Loading is complete
                }
            } else {
                // If no patient is selected (e.g., dropdown is cleared), clear the details and related states
                setPatientDetails(null);
                // Clear recent transactions when selection is cleared
                setRecentTransactions([]);
                setPdfUrl(null);
                setIsModalOpen(false); // Close modal
                setBillAmount('');
                 setError(null); // Clear error when selection is cleared
            }
        };

        fetchPatientDetails();
        // This effect runs whenever the 'selectedPatient' state changes
    }, [selectedPatient]);

     // Effect to fetch recent transactions for the selected patient
    useEffect(() => {
        const fetchTransactions = async () => {
            // Only fetch transactions if patientDetails is loaded and has a valid ID
            if (patientDetails && patientDetails.id) {
                 try {
                    // API endpoint to get transactions for a specific patient
                    const response = await axiosClient.get(`/billing/transactions/${patientDetails.id}`);
                     // Assuming response.data.data is the array of transactions
                    if(response.data && response.data.status && response.data.data) {
                        setRecentTransactions(response.data.data);
                         setError(null); // Clear previous errors on successful fetch
                    } else {
                        setRecentTransactions([]); // Clear transactions if response is not successful
                    }
                } catch (error) {
                    console.error('Failed to fetch transactions:', error);
                    // We might not want a toast for this unless critical, but log it
                    setRecentTransactions([]); // Clear transactions on error
                }
            } else {
                // If no patient details are loaded, clear the transactions list
                setRecentTransactions([]);
            }
        };

        // Only run this effect if patientDetails is available
        if (patientDetails) {
           fetchTransactions();
        } else {
            // Clear transactions immediately if patientDetails becomes null
            setRecentTransactions([]);
        }

    }, [patientDetails]); // This effect depends on patientDetails


    // Handler for when a patient is selected from the dropdown
    const handlePatientSelect = (option) => {
        // 'option' is the object from react-select: { value: patientId, label: patientName }
        setSelectedPatient(option);
        // The detailed patient info will be fetched by the second useEffect which
        // is triggered by the change in 'selectedPatient'.
    };

    // Handler for changes in the bill amount input
    const handleAmountChange = (e) => {
        // Allow only digits and a single decimal point
        const value = e.target.value.replace(/[^0-9.]/g, '');
        // Prevent entering more than one decimal point
        const parts = value.split('.');
        if (parts.length > 2) {
             return; // Do not update state if more than one decimal point is entered
        }
        setBillAmount(value);
    };

    // Handler to generate the PDF preview
    const generatePreview = async () => {
        // Validate input: ensure patientDetails is loaded, has an ID, has status 'active',
        // and essential fields for the bill are present. Also check if billAmount is valid.
        if (!billAmount || !patientDetails || !patientDetails.id || patientDetails.status !== 'active' ||
            !patientDetails.name || !patientDetails.room_number || !patientDetails.ward_type || !patientDetails.attending_physician) {
            toast.error('Please select a patient with complete active admission details and enter a valid bill amount.');
            return;
        }

        // Parse the amount and validate it's a positive number
        const amount = parseFloat(billAmount);
        if (isNaN(amount) || amount < 0) {
             toast.error('Please enter a valid numeric amount.');
             return;
        }

        try {
             // Call the backend endpoint to generate the PDF.
             // Use patientDetails.id as the patient ID.
            const response = await axiosClient.get(
                `/billing/progress/${patientDetails.id}/download`, {
                    params: { amount: amount }, // Pass the parsed amount as a query parameter
                    responseType: 'blob', // Instruct axios to expect binary data (the PDF file)
                    headers: {
                        'Accept': 'application/pdf' // Tell the server we prefer PDF
                    }
                }
            );

            // Check the Content-Type header to confirm the response is a PDF
            if (response.headers['content-type'] && response.headers['content-type'].includes('application/pdf')) {
                // Create a Blob from the response data and create an object URL for the iframe
                const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(pdfBlob);
                setPdfUrl(pdfUrl); // Set the URL to display the PDF in the iframe
                setIsModalOpen(true); // Open the modal
                 setError(null); // Clear any previous errors on successful PDF generation
            } else {
                 // Handle cases where the response is not a PDF (e.g., an error page, JSON error)
                const reader = new FileReader();
                reader.onload = async () => { // Use async because .text() is async
                    try {
                        // Attempt to read the response data as text to see if it's a JSON error message
                         const errorText = await new Blob([response.data]).text();
                        const errorResponse = JSON.parse(errorText);
                        const message = errorResponse.message || 'Failed to generate preview. Received unexpected data.';
                        toast.error(message);
                        setError(message);
                        setPdfUrl(null); // Clear PDF preview on error
                        setIsModalOpen(false); // Ensure modal is closed on error
                    } catch (parseError) {
                        // If parsing fails, it's likely not JSON, just some other non-PDF response
                        const message = 'Failed to generate preview. Received unexpected response format.';
                        toast.error(message);
                        setError(message);
                        setPdfUrl(null); // Clear PDF preview on error
                        setIsModalOpen(false); // Ensure modal is closed on error
                        console.error('Failed to parse unexpected response:', parseError);
                    }
                };
                 // Ensure there is data to read before attempting to read as text
                 if (response.data) {
                    reader.readAsText(response.data);
                 } else {
                     const message = 'Failed to generate preview. Received empty response.';
                     toast.error(message);
                     setError(message);
                     setPdfUrl(null);
                     setIsModalOpen(false); // Ensure modal is closed
                 }
            }
        } catch (error) {
            console.error('PDF Generation Error:', error);
            // Handle network errors or API errors (status codes like 404, 500)
            const errorMessage = error.response?.data?.message || 'Failed to generate preview. An error occurred.';
            toast.error(errorMessage);
            setError(errorMessage);
            setPdfUrl(null); // Clear PDF preview on error
            setIsModalOpen(false); // Ensure modal is closed on error
        }
    };

    // Handler to save the progress bill
    const handleSave = async () => {
         // Validate input: ensure patientDetails is loaded, has an ID, has status 'active',
         // and essential fields for the bill are present. Also check if billAmount is valid.
        if (!billAmount || !patientDetails || !patientDetails.id || patientDetails.status !== 'active' ||
             !patientDetails.name || !patientDetails.room_number || !patientDetails.ward_type || !patientDetails.attending_physician) {
            toast.error('Please select a patient with complete active admission details and enter a valid bill amount.');
            return;
        }

        // Parse the amount and validate it's a valid positive number
        const amount = parseFloat(billAmount);
        if (isNaN(amount) || amount < 0) {
             toast.error('Please enter a valid numeric amount.');
             return;
        }

        try {
             // Call the backend endpoint to save the progress bill.
             // Use patientDetails.id as the patient_id.
            const response = await axiosClient.post('/billing/progress/save', {
                patient_id: patientDetails.id,
                amount: amount // Use the parsed amount
            });

             // Assuming the API returns status: true on success
            if (response.data && response.data.status) {
                toast.success(response.data.message || 'Progress bill saved successfully');
                // *** MODIFIED RESET BEHAVIOR to stay on the patient view ***
                // Only clear the bill amount input field
                setBillAmount('');
                // Clear the PDF preview as it's now outdated and close the modal
                setPdfUrl(null);
                setIsModalOpen(false);
                // Refresh the recent transactions for the *current* patient
                // This ensures the newly saved bill appears in the list.
                const transactionsResponse = await axiosClient.get(`/billing/transactions/${patientDetails.id}`);
                 if(transactionsResponse.data && transactionsResponse.data.status && transactionsResponse.data.data) {
                    setRecentTransactions(transactionsResponse.data.data);
                 } else {
                    setRecentTransactions([]); // Clear transactions if fetching fails
                    console.error('Failed to refresh transactions after save.');
                 }
                // *** END MODIFIED RESET BEHAVIOR ***

                 setError(null); // Clear any previous errors on successful save

            } else {
                // Handle cases where the API response indicates failure (status: false)
                 const message = response.data.message || 'Failed to save progress bill.';
                 toast.error(message);
                 setError(message);
            }

        } catch (error) {
            console.error('Failed to save progress bill:', error);
            // Handle network errors or API errors (e.g., 422 validation errors, 500 server error)
             const errorMessage = error.response?.data?.message || 'Failed to save progress bill. An error occurred.';
             toast.error(errorMessage);
             setError(errorMessage);
        }
    };

    // Handler to download the generated PDF
    const handleDownload = () => {
        // Ensure there is a PDF URL and patient details are loaded for the filename
        if (pdfUrl && patientDetails) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            // Use the patient's ID for the downloaded filename, with a fallback
            link.download = `progress-bill-${patientDetails.id || 'patient'}.pdf`;
            // Programmatically click the link to trigger the download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Inform the user if there's no PDF to download
            toast.info('Generate the preview first before downloading.');
        }
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        // Optionally clear the pdfUrl when closing the modal if you don't need to keep it
        // setPdfUrl(null); // Keep the PDF URL so download button works after closing modal
    };

    // Clean up the PDF object URL when the component unmounts or pdfUrl changes
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]); // This effect runs when pdfUrl changes or component unmounts

    // Custom styles for react-select to match the enhanced design
    const customSelectStyles = {
        control: (provided, state) => ({
            ...provided,
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
            backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#f3f4f6' : 'white',
            '&:hover': {
                backgroundColor: '#f3f4f6'
            }
        })
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-black text-3xl font-bold">
                        Progress Bill 
                    </h1>
                    <p className="text-gray-600 mt-2">Generate and manage progress bills for active patients</p>
                </div>

                {/* Display main error message if any */}
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
                        <div className="relative">
                            <Select
                                id="patient-select"
                                options={patients.map(p => ({ value: p.id, label: p.name }))}
                                value={selectedPatient}
                                onChange={handlePatientSelect}
                                isLoading={loadingPatients}
                                className="w-full"
                                classNamePrefix="react-select"
                                placeholder="Search and select patient..."
                                isClearable
                                isDisabled={loadingPatients || loadingDetails}
                                styles={customSelectStyles}
                            />
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">

                            </div>
                        </div>
                    </div>

                    {/* Display patient details and bill form only if patientDetails is loaded */}
                    {patientDetails ? (
                         loadingDetails ? (
                             // Show skeleton loader while patient details are loading
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
                                 <div className="space-y-6">
                                     <Skeleton height={24} width={200} />
                                     <Skeleton height={20} count={5} />
                                     <Skeleton height={24} width={150} className="mt-6"/>
                                     <Skeleton height={40} />
                                     <div className="flex space-x-4">
                                         <Skeleton height={40} className="flex-1"/>
                                         <Skeleton height={40} className="flex-1"/>
                                     </div>
                                 </div>
                                 <div className="space-y-6">
                                     <Skeleton height={24} width={200} />
                                     <Skeleton height={40} count={3} />
                                 </div>
                             </div>
                         ) : (
                        // Display patient details and form after loading
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Patient Information
                                </h3>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-inner">
                                    <dl className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <dt className="text-sm font-medium text-gray-600">Patient Name</dt>
                                            <dd className="text-sm font-semibold text-gray-900">
                                                {patientDetails.name || 'N/A'}
                                            </dd>
                                        </div>
                                        {patientDetails.status === 'active' ? (
                                            <>
                                                <div className="flex justify-between items-center">
                                                    <dt className="text-sm font-medium text-gray-600">Room</dt>
                                                    <dd className="text-sm font-semibold text-gray-900">
                                                        {patientDetails.room_number || 'N/A'}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <dt className="text-sm font-medium text-gray-600">Ward Type</dt>
                                                    <dd className="text-sm font-semibold text-gray-900 capitalize">
                                                        {patientDetails.ward_type || 'N/A'}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <dt className="text-sm font-medium text-gray-600">Attending Physician</dt>
                                                    <dd className="text-sm font-semibold text-gray-900">
                                                        {patientDetails.attending_physician || 'N/A'}
                                                    </dd>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <dt className="text-sm font-medium text-gray-600">Admission Date</dt>
                                                    <dd className="text-sm font-semibold text-gray-900">
                                                        {formatDate(patientDetails.admission_date)}
                                                    </dd>
                                                </div>
                                            </>
                                         ) : (
                                            <div className="text-sm text-gray-600 italic col-span-2 bg-yellow-50 p-3 rounded-lg">
                                                No active admission found for this patient (Status: {patientDetails.status || 'N/A'}).
                                            </div>
                                         )}
                                    </dl>
                                </div>

                                {/* Bill amount input and buttons, only shown if patientDetails loaded AND status is active */}
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
                                                     <span className="text-gray-500 sm:text-sm font-medium" id="amount-currency">
                                                        PHP
                                                     </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 mt-6">
                                            <button
                                                onClick={generatePreview}
                                                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                disabled={!billAmount || loadingDetails || patientDetails.status !== 'active'}
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Preview
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                disabled={!billAmount || loadingDetails || patientDetails.status !== 'active'}
                                            >
                                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                </svg>
                                                Save
                                            </button>
                                            {pdfUrl && (
                                                <button
                                                    onClick={handleDownload}
                                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
                                                >
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                     PDF
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Display recent transactions section in the second column */}
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
                                                    <li key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-lg ${index % 3 === 0 ? 'bg-indigo-100' : index % 3 === 1 ? 'bg-green-100' : 'bg-blue-100'}`}>
                                                                    <svg className={`h-5 w-5 ${index % 3 === 0 ? 'text-indigo-600' : index % 3 === 1 ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
                                                                    ₱{parseFloat(transaction.amount).toLocaleString('en-US')}
                                                                </div>
                                                                <div className="text-xs text-gray-500">PHP</div>
                                                            </div>
                                                        </div>
                                                    </li>
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
                         )
                    ) : (
                        // Message when no patient is selected and not loading
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

            {/* PDF Preview Modal */}
            {isModalOpen && pdfUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity duration-300" onClick={closeModal}>
                    <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                            <h3 className="text-xl font-semibold flex items-center gap-2">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Progress Bill Preview
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-white hover:text-gray-200 transition-colors duration-200"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body - PDF Iframe */}
                        <div className="p-4 h-[calc(90vh-160px)] bg-gray-50"> {/* Adjusted height to account for header and footer */}
                            <div className="h-full rounded-lg overflow-hidden shadow-inner">
                                <iframe
                                    src={pdfUrl}
                                    className="w-full h-full border-0"
                                    title="Progress Bill PDF Preview"
                                    style={{ minHeight: '100%' }}
                                >
                                    Your browser does not support iframes.
                                </iframe>
                            </div>
                        </div>

                        {/* Modal Footer with Download Button */}
                        <div className="flex justify-end p-4 border-t bg-white">
                            <button
                                onClick={handleDownload}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientBills;