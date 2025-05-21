import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast } from 'react-toastify';

const ViewPatient = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPatient = async () => {
        try {
            const response = await axiosClient.get(`/patients/${id}`);
            if (response.data.status) {
                setPatient(response.data.data);
            } else {
                throw new Error(response.data.message || 'Failed to fetch patient');
            }
        } catch (err) {
            setError('Failed to fetch patient details');
            toast.error('Failed to fetch patient details');
            console.error('Error fetching patient:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchPatient();
        }
    }, [id]);

    // Helper function to safely format the ward type
    const formatWardType = (wardType) => {
        if (!wardType) return 'N/A';
        return wardType.charAt(0).toUpperCase() + wardType.slice(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <Navbar />
            <div className="max-w-5xl mx-auto p-6">
                {loading ? (
                    <div className="animate-pulse space-y-8">
                        <div className="flex justify-between items-center">
                            <Skeleton width={300} height={38} />
                            <Skeleton width={200} height={46} className="rounded-md" />
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <Skeleton height={28} width={240} className="mb-6" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Skeleton height={24} count={5} className="space-y-2" />
                                <Skeleton height={24} count={5} className="space-y-2" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                    {patient?.first_name || ''} {patient?.last_name || ''}
                                </h1>
                                <p className="text-indigo-600 font-medium">
                                    Room {patient?.room_number || 'N/A'} 
                                    {patient?.ward_type ? ` • ${formatWardType(patient.ward_type)} Ward` : ''}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/admitting/patients/${id}`)}
                                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Edit Patient
                                </button>
                                <button
                                    onClick={() => navigate('/admitting/patients')}
                                    className="border border-gray-300 bg-white text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm hover:shadow flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Back to List
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md animate-fade-in">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {patient && (
                            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100">Patient Information</h2>
                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <InfoItem label="First Name" value={patient.first_name || 'N/A'} />
                                    <InfoItem label="Last Name" value={patient.last_name || 'N/A'} />
                                    <InfoItem label="Middle Name" value={patient.middle_name || 'N/A'} />
                                    <InfoItem label="Name Initial" value={patient.name_initial || 'N/A'} />
                                    <InfoItem 
                                        label="Date of Birth" 
                                        value={patient.date_of_birth ? 
                                            new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'N/A'
                                        }
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                            </svg>
                                        }
                                    />
                                    <InfoItem 
                                        label="Room Number" 
                                        value={patient.room_number || 'N/A'}
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                            </svg>
                                        }
                                    />
                                    <InfoItem 
                                        label="Ward Type" 
                                        value={patient.ward_type ? formatWardType(patient.ward_type) : 'N/A'}
                                        highlightColor={patient.ward_type ? getWardColor(patient.ward_type) : null}
                                    />
                                    <InfoItem 
                                        label="Attending Physician" 
                                        value={patient.attending_physician || 'N/A'}
                                        icon={
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        }
                                    />
                                    <div className="md:col-span-2 mt-4">
                                        <dt className="text-sm font-medium text-gray-500 mb-1">Remarks</dt>
                                        <dd className="mt-2 text-gray-900 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            {patient.remarks || 'No remarks provided for this patient.'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Helper component for displaying patient information items
const InfoItem = ({ label, value, icon, highlightColor }) => {
    return (
        <div className="group">
            <dt className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2">
                {icon}
                {label}
            </dt>
            <dd className={`mt-1 text-lg text-gray-900 font-medium group-hover:text-indigo-600 transition-colors ${
                highlightColor ? `px-3 py-1 rounded-full inline-block ${highlightColor}` : ''
            }`}>
                {value}
            </dd>
        </div>
    );
};

// Helper function to get appropriate color for ward type
const getWardColor = (wardType) => {
    if (!wardType) return 'bg-gray-100 text-gray-800';
    
    const wardColors = {
        'private': 'bg-green-100 text-green-800',
        'semi-private': 'bg-blue-100 text-blue-800',
        'general': 'bg-yellow-100 text-yellow-800',
        'emergency': 'bg-red-100 text-red-800',
        'icu': 'bg-purple-100 text-purple-800',
    };
    
    return wardColors[wardType.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

export default ViewPatient;