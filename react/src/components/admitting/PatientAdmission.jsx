import { useState } from 'react';
import axiosClient from '../../utils/axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify'; // Make sure you have this package installed

const FormFieldSkeleton = () => (
    <div>
        <Skeleton width={120} height={20} className="mb-1" />
        <Skeleton height={38} />
    </div>
);

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

const handleSubmit = async (e) => {
    e.preventDefault();
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
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    {loading ? (
                        <>
                            <Skeleton width={250} height={32} />
                            <Skeleton width={150} height={40} className="rounded-md" />
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-gray-800">New Patient Admission</h2>
                            <button
                                onClick={() => navigate('/admitting/patients')}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                View All Patients
                            </button>
                        </>
                    )}
                </div>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
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
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            <>
                                <FormFieldSkeleton />
                                <FormFieldSkeleton />
                                <FormFieldSkeleton />
                                <FormFieldSkeleton />
                                <FormFieldSkeleton />
                                <FormFieldSkeleton />
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.first_name}
                                        onChange={e => setFormData({...formData, first_name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                                        className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                                        className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.name_initial}
                                        onChange={e => setFormData({...formData, name_initial: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.date_of_birth}
                                        onChange={e => setFormData({...formData, date_of_birth: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Admission Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.admission_date}
                                        onChange={e => setFormData({...formData, admission_date: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Room Number
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.room_number}
                                        onChange={e => setFormData({...formData, room_number: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Ward Type
                                    </label>
                                    <select
                                        className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.ward_type}
                                        onChange={e => setFormData({...formData, ward_type: e.target.value})}
                                    >
                                        <option value="ward">Ward</option>
                                        <option value="semi-private">Semi-Private</option>
                                        <option value="private">Private</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Attending Physician
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.attending_physician}
                                        onChange={e => setFormData({...formData, attending_physician: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Remarks
                                    </label>
                                    <textarea
                                        className="w-full border rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        value={formData.remarks}
                                        onChange={e => setFormData({...formData, remarks: e.target.value})}
                                        rows="3"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3">
                        {loading ? (
                            <>
                                <Skeleton width={100} height={40} className="rounded-md" />
                                <Skeleton width={120} height={40} className="rounded-md" />
                            </>
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
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Clear Form
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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

                {/* Portal Access Card */}
                {portalData.qrCodeUrl && (
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-sm text-center">
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
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
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientAdmission;