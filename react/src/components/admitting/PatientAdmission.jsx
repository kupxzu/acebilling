import { useState } from 'react';
import axiosClient from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify'; // Make sure you have this package installed
import { motion } from 'framer-motion'; // Add this import for animations

const FormFieldSkeleton = () => (
    <div>
        <Skeleton width={120} height={20} className="mb-1" />
        <Skeleton height={38} />
    </div>
);

const checkPatientExists = async (firstName, lastName, middleName, dateOfBirth) => {
    try {
        const response = await axiosClient.post('/patients/check-exists', {
            first_name: firstName,
            last_name: lastName,
            middle_name: middleName,
            date_of_birth: dateOfBirth
        });
        return response.data;
    } catch (error) {
        console.error('Error checking patient:', error);
        return { exists: false };
    }
};

const PatientAdmission = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        name_initial: '',
        date_of_birth: new Date().toISOString().split('T')[0],
        room_number: '',
        ward_type: 'ward',
        attending_physician: '',
        admission_date: new Date().toISOString().split('T')[0],
        remarks: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [portalData, setPortalData] = useState({
        qrCodeUrl: '',
        portalUrl: ''
    });
    const [validationErrors, setValidationErrors] = useState({});

    const validateForm = (data) => {
        const errors = {};
        if (!data.first_name) errors.first_name = 'First name is required';
        if (!data.last_name) errors.last_name = 'Last name is required';
        if (!data.date_of_birth) errors.date_of_birth = 'Date of birth is required';
        if (!data.room_number) errors.room_number = 'Room number is required';
        if (!data.attending_physician) errors.attending_physician = 'Attending physician is required';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validateForm(formData);
        if (Object.keys(validationErrors).length > 0) {
            Object.values(validationErrors).forEach(error => {
                toast.error(error);
            });
            setValidationErrors(validationErrors);
            return;
        }

        // Check if patient already exists
        const patientCheck = await checkPatientExists(
            formData.first_name,
            formData.last_name,
            formData.middle_name,
            formData.date_of_birth
        );

        if (patientCheck.exists) {
            toast.error('A patient with these details already exists');
            setValidationErrors({
                ...validationErrors,
                existingPatient: 'Patient already exists'
            });
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);
        setPortalData({ qrCodeUrl: '', portalUrl: '' });

        try {
            // Step 1: Admit the patient
            const response = await axiosClient.post('/patients/admit', formData);

            if (response.data.status && response.data.id) {
                const patientId = response.data.id;
                setSuccess(true);
                toast.success('Patient admitted successfully!');

                // Step 2: Generate portal access
                try {
                    const portalResponse = await axiosClient.post(`/patients/${patientId}/generate-portal-access`);

                    if (portalResponse.data.status) {
                        setPortalData({
                            qrCodeUrl: portalResponse.data.qrCodeUrl,
                            portalUrl: portalResponse.data.portalUrl
                        });
                    }
                } catch (portalErr) {
                    console.warn('Could not generate portal access:', portalErr);
                    // Continue anyway since the patient was created successfully
                }

                // Reset form
                setFormData({
                    first_name: '',
                    last_name: '',
                    middle_name: '',
                    name_initial: '',
                    date_of_birth: new Date().toISOString().split('T')[0],
                    room_number: '',
                    ward_type: 'ward',
                    attending_physician: '',
                    admission_date: new Date().toISOString().split('T')[0],
                    remarks: ''
                });
            } else {
                throw new Error(response.data.message || 'Failed to admit patient');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to admit patient');
            console.error('Admission error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto p-6"
            >
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    {loading ? (
                        <>
                            <Skeleton width={250} height={32} />
                            <Skeleton width={150} height={40} className="rounded-md" />
                        </>
                    ) : (
                        <>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">New Patient Admission</h2>
                                <p className="text-gray-600 mt-1">Enter patient details to begin admission process</p>
                            </div>
                            <button
                                onClick={() => navigate('/admitting/patients')}
                                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                                </svg>
                                View All Patients
                            </button>
                        </>
                    )}
                </div>

                {/* Alert Messages */}
                <div className="space-y-4 mb-6">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md"
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-md"
                        >
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700">Patient admitted successfully!</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Personal Information Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                    value={formData.first_name}
                                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                    value={formData.last_name}
                                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Middle Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                    value={formData.middle_name}
                                    onChange={e => setFormData({...formData, middle_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name Initial
                                </label>
                                <input
                                    type="text"
                                    maxLength={10}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                    value={formData.name_initial}
                                    onChange={e => setFormData({...formData, name_initial: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                    value={formData.date_of_birth}
                                    onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Admission Date
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                    value={formData.admission_date}
                                    onChange={e => setFormData({...formData, admission_date: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Admission Details Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Admission Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Room Number
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                    value={formData.room_number}
                                    onChange={e => setFormData({...formData, room_number: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ward Type
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                    value={formData.ward_type}
                                    onChange={e => setFormData({...formData, ward_type: e.target.value})}
                                >
                                    <option value="ward">Ward</option>
                                    <option value="semi-private">Semi-Private</option>
                                    <option value="private">Private</option>
                                    <option value="executive">Executive</option>
                                    <option value="suite">Suite</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Attending Physician
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                    value={formData.attending_physician}
                                    onChange={e => setFormData({...formData, attending_physician: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Remarks
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150"
                                    value={formData.remarks}
                                    onChange={e => setFormData({...formData, remarks: e.target.value})}
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4">
                        {loading ? (
                            <Skeleton width={200} height={42} className="rounded-md" />
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setFormData({
                                        first_name: '',
                                        last_name: '',
                                        middle_name: '',
                                        name_initial: '',
                                        date_of_birth: new Date().toISOString().split('T')[0],
                                        room_number: '',
                                        ward_type: 'ward',
                                        attending_physician: '',
                                        admission_date: new Date().toISOString().split('T')[0],
                                        remarks: ''
                                    })}
                                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150"
                                >
                                    Clear Form
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150"
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Admitting Patient...
                                        </span>
                                    ) : (
                                        'Admit Patient'
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </form>

                {/* Portal Access Card with enhanced styling */}
                {portalData.qrCodeUrl && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 bg-white rounded-xl shadow-sm p-8 border border-gray-100"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Portal Access</h3>
                        <div className="flex justify-center mb-4">
                            <img 
                                src={portalData.qrCodeUrl} 
                                alt="Patient QR Code" 
                                className="max-w-[200px] border rounded-lg shadow-sm"
                            />
                        </div>
                        
                        {portalData.portalUrl && (
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-2">Portal Link:</p>
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border max-w-md mx-auto">
                                    <input
                                        type="text"
                                        value={portalData.portalUrl}
                                        readOnly
                                        className="flex-1 text-sm bg-transparent border-none focus:ring-0 text-gray-600"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(portalData.portalUrl);
                                            toast.success('Portal link copied to clipboard!');
                                        }}
                                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                        title="Copy link"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a3 3 0 003-3v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex justify-center space-x-4">
                            <a 
                                href={portalData.qrCodeUrl}
                                download={`patient-qr-${Date.now()}.png`}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download QR Code
                            </a>
                            {portalData.portalUrl && (
                                <a 
                                    href={portalData.portalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    View Portal
                                </a>
                            )}
                            <button
                                onClick={() => setPortalData({ qrCodeUrl: '', portalUrl: '' })}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default PatientAdmission;