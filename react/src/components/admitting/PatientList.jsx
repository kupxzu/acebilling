import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Avatar from '../common/Avatar';
import { toast } from 'react-toastify';

const PatientCard = ({ loading, patient }) => {
    const navigate = useNavigate();
    const [portalData, setPortalData] = useState({
        portalUrl: '',
        isLoading: false
    });
    const [showModal, setShowModal] = useState(false);

    const fetchPortalAccess = async (patientId) => {
        setPortalData(prev => ({ ...prev, isLoading: true }));
        setShowModal(true);
        
        try {
            const response = await axiosClient.get(`/patients/${patientId}/portal-access`);
            
            if (response.data.status) {
                setPortalData({
                    portalUrl: response.data.portalUrl,
                    isLoading: false
                });
            } else {
                throw new Error(response.data.message || 'Failed to fetch portal access');
            }
        } catch (error) {
            console.error('Error fetching portal access:', error);
            toast.error('Failed to fetch portal access');
            setPortalData(prev => ({ ...prev, isLoading: false }));
        }
    };

    const generatePortalAccess = async (patientId) => {
        setPortalData(prev => ({ ...prev, isLoading: true }));
        
        try {
            const response = await axiosClient.post(`/patients/${patientId}/generate-portal-access`);
            
            if (response.data.status) {
                setPortalData({
                    portalUrl: response.data.portalUrl,
                    isLoading: false
                });
                toast.success('Portal access generated successfully');
            } else {
                throw new Error(response.data.message || 'Failed to generate portal access');
            }
        } catch (error) {
            console.error('Error generating portal access:', error);
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

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div>
                                <Skeleton width={150} height={24} />
                                <Skeleton width={100} height={20} className="mt-1" />
                            </div>
                        </div>
                        <Skeleton width={60} height={24} className="rounded-full" />
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center">
                            <Skeleton circle width={20} height={20} className="mr-2" />
                            <Skeleton width={180} height={20} />
                        </div>
                        <div className="flex items-center">
                            <Skeleton circle width={20} height={20} className="mr-2" />
                            <Skeleton width={140} height={20} />
                        </div>
                        <div className="flex items-center">
                            <Skeleton circle width={20} height={20} className="mr-2" />
                            <Skeleton width={160} height={20} />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Skeleton width={100} height={20} />
                    </div>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'discharged':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                        {patient && (
                            <Avatar
                                name={patient.name}
                                size={40}
                                className="flex-shrink-0"
                            />
                        )}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {patient.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Room {patient.room_number}
                            </p>
                        </div>
                    </div>
                    <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            getStatusColor(patient.admissions?.[0]?.status)
                        }`}
                    >
                        {patient.admissions?.[0]?.status || 'Unknown'}
                    </span>
                </div>
                
                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {patient.attending_physician}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {patient.ward_type}
                    </div>
                    {patient.admissions?.[0]?.admission_date && (
                        <div className="flex items-center text-sm text-gray-500">
                            <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(patient.admissions[0].admission_date).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => navigate(`/admitting/patients/${patient.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => navigate(`/admitting/patients/${patient.id}/view`)}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                        View Details
                    </button>
                    {/* <button
                        onClick={() => fetchPortalAccess(patient.id)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                        {portalData.isLoading && showModal ? (
                            <div className="flex items-center">
                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Loading...
                            </div>
                        ) : 'Portal Access'}
                    </button> */}
                </div>

                {/* Portal Access Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Patient Portal Access</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {portalData.isLoading ? (
                                <div className="space-y-4 py-4 text-center">
                                    <svg className="animate-spin h-8 w-8 mx-auto text-indigo-600" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <p className="text-gray-600">Loading portal access...</p>
                                </div>
                            ) : portalData.portalUrl ? (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600">
                                        Share this link with the patient to access their portal:
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={portalData.portalUrl}
                                            readOnly
                                            className="text-sm bg-gray-50 p-3 rounded border flex-1 overflow-x-auto"
                                        />
                                        <button
                                            onClick={copyPortalLink}
                                            className="p-2 text-gray-600 hover:text-gray-900 border rounded hover:bg-gray-50"
                                            title="Copy link"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex space-x-3">
                                        
                                            href={portalData.portalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        <a>
                                            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            Preview Portal
                                        </a>
                                        <button
                                            onClick={() => generatePortalAccess(patient.id)}
                                            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Regenerate
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        This link will allow the patient to view their billing information and progress.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 text-center">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 mb-4">No portal access configured yet</p>
                                    <button
                                        onClick={() => generatePortalAccess(patient.id)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Generate Portal Access
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const PaginationSkeleton = () => (
    <div className="mt-6 flex justify-center space-x-2">
        <div className="flex items-center space-x-2">
            <Skeleton width={80} height={32} className="rounded" />
            <Skeleton width={40} height={32} className="rounded" count={3} inline />
            <Skeleton width={80} height={32} className="rounded" />
        </div>
    </div>
);

const PatientList = () => {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 9,
        total: 0
    });

    const fetchPatients = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/patients?page=${page}`);
            const { data, current_page, last_page, per_page, total } = response.data.data;
            setPatients(data);
            setPagination({ current_page, last_page, per_page, total });
        } catch (err) {
            setError('Failed to fetch patients');
            console.error('Error fetching patients:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= pagination.last_page; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => fetchPatients(i)}
                    className={`px-3 py-1 rounded ${
                        pagination.current_page === i
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    {loading ? (
                        <>
                            <Skeleton width={200} height={32} />
                            <Skeleton width={150} height={40} className="rounded-md" />
                        </>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
                            <button
                                onClick={() => navigate('/admitting/new-patient')}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                                Add New Patient
                            </button>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading
                        ? [...Array(9)].map((_, index) => (
                              <PatientCard key={index} loading={true} />
                          ))
                        : patients.map((patient) => (
                              <PatientCard key={patient.id} loading={false} patient={patient} />
                          ))}
                </div>

                {!loading ? (
                    pagination.last_page > 1 && (
                        <div className="mt-6 flex justify-center space-x-2">
                            <button
                                onClick={() => fetchPatients(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {renderPagination()}
                            <button
                                onClick={() => fetchPatients(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )
                ) : (
                    <PaginationSkeleton />
                )}
            </div>
        </div>
    );
};

export default PatientList;