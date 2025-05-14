import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; // Make sure this package is installed
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';

const ViewPatient = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [portalData, setPortalData] = useState({
        portalUrl: '',
        qrCode: '',
        isActive: false,
        isLoading: false
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPatient = async () => {
        try {
            const response = await axiosClient.get(`/patients/${id}/details`);
            setPatient(response.data.data);
            return response.data.data;
        } catch (err) {
            setError('Failed to fetch patient details');
            console.error('Error fetching patient:', err);
            throw err;
        }
    };

    const fetchPortalAccess = async () => {
        try {
            setPortalData(prev => ({ ...prev, isLoading: true }));
            const response = await axiosClient.get(`/patients/${id}/portal-access`);
            
            if (response.data.status) {
                setPortalData({
                    qrCode: response.data.qrCode,
                    portalUrl: response.data.portalUrl,
                    hash: response.data.hash,
                    isLoading: false,
                    isActive: true
                });
            } else {
                setPortalData(prev => ({
                    ...prev,
                    isLoading: false,
                    isActive: false
                }));
            }
        } catch (err) {
            console.error('Error fetching portal access:', err);
            setPortalData(prev => ({ 
                ...prev, 
                isLoading: false,
                isActive: false 
            }));
        }
    };

    const generatePortalAccess = async () => {
        setPortalData(prev => ({ ...prev, isLoading: true }));
        try {
            const response = await axiosClient.post(`/patients/${id}/generate-portal-access`);
            
            if (response.data.status) {
                setPortalData({
                    qrCode: response.data.qrCode,
                    portalUrl: response.data.portalUrl,
                    hash: response.data.hash,
                    isLoading: false,
                    isActive: true
                });
                toast.success('Portal access generated successfully');
            } else {
                throw new Error(response.data.message || 'Failed to generate portal access');
            }
        } catch (err) {
            console.error('Error generating portal access:', err);
            toast.error('Failed to generate portal access');
            setPortalData(prev => ({ ...prev, isLoading: false }));
        }
    };

    const copyPortalLink = () => {
        if (portalData.portalUrl) {
            navigator.clipboard.writeText(portalData.portalUrl);
            toast.success('Portal link copied to clipboard!');
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await fetchPatient();
                await fetchPortalAccess();
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            loadData();
        }
    }, [id]);

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
                            <h2 className="text-2xl font-bold text-gray-800">Patient Details</h2>
                            <div className="space-x-4">
                                <button
                                    onClick={() => navigate(`/admitting/patients/${id}`)}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => navigate('/admitting/patients')}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Back to List
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
                        <Skeleton height={24} width={200} />
                        <Skeleton height={20} count={4} />
                    </div>
                ) : patient && (
                    <div className="bg-white shadow-sm rounded-lg p-6">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                <dd className="mt-1 text-lg text-gray-900">{patient.name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Room Number</dt>
                                <dd className="mt-1 text-lg text-gray-900">{patient.room_number}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Ward Type</dt>
                                <dd className="mt-1 text-lg text-gray-900 capitalize">{patient.ward_type}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Attending Physician</dt>
                                <dd className="mt-1 text-lg text-gray-900">{patient.attending_physician}</dd>
                            </div>
                            <div className="md:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Remarks</dt>
                                <dd className="mt-1 text-lg text-gray-900">{patient.remarks || 'No remarks'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Admission Date</dt>
                                <dd className="mt-1 text-lg text-gray-900">
                                    {patient.admission_date ? new Date(patient.admission_date).toLocaleDateString() : 'N/A'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Status</dt>
                                <dd className="mt-1">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        patient.status === 'active' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {patient.status || 'Unknown'}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                )}

                {/* Patient Portal Section */}
                <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-gray-900">Patient Portal Access</h3>
                        {portalData.isActive && (
                            <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                Active
                            </span>
                        )}
                    </div>
                    
                    <div className="flex flex-col items-center space-y-6">
                        {portalData.isActive ? (
                            <>
                                <div className="flex flex-col items-center space-y-4">
                                    {portalData.portalUrl && (
                                        <div className="relative">
                                            <QRCodeCanvas 
                                                value={portalData.portalUrl}
                                                size={200}
                                                level="H"
                                                includeMargin={true}
                                                className="border-4 border-white shadow-lg rounded-lg"
                                                imageSettings={{
                                                    src: "/your-logo.png",
                                                    x: undefined,
                                                    y: undefined,
                                                    height: 60,
                                                    width: 60,
                                                    excavate: true,
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="text-sm text-gray-500">
                                        Scan QR code to access patient portal
                                    </div>
                                </div>

                                <div className="w-full max-w-md space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Portal Access Link
                                    </label>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                                        <input
                                            type="text"
                                            value={portalData.portalUrl}
                                            readOnly
                                            className="flex-1 text-sm bg-transparent border-none focus:ring-0 text-gray-600"
                                        />
                                        <button
                                            onClick={copyPortalLink}
                                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                                            title="Copy link"
                                            type="button"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Share this link with the patient to access their portal
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                     <a
                                        href={portalData.portalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                        Preview Portal
                                    </a>
                                    {/* <button
                                        onClick={generatePortalAccess}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                        disabled={portalData.isLoading}
                                        type="button"
                                    >
                                        {portalData.isLoading ? (
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        )}
                                        {portalData.isLoading ? 'Generating...' : 'Regenerate Access'}
                                    </button> */}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-gray-400 mb-4">
                                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 mb-4">No portal access configured</p>
                                <button
                                    onClick={generatePortalAccess}
                                    disabled={portalData.isLoading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    type="button"
                                >
                                    {portalData.isLoading ? (
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    ) : (
                                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    )}
                                    {portalData.isLoading ? 'Generating...' : 'Generate Portal Access'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewPatient;