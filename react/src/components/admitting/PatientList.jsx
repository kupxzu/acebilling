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
                        <Avatar
                            firstName={patient?.first_name || ''}
                            lastName={patient?.last_name || ''}
                            size={40}
                            className="flex-shrink-0"
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {`${patient.first_name} ${patient.middle_name ? patient.middle_name + ' ' : ''}${patient.last_name}`}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {patient.date_of_birth && new Date(patient.date_of_birth).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.admissions?.[0]?.status)}`}>
                        {patient.admissions?.[0]?.status || 'Unknown'}
                    </span>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Dr. {patient.attending_physician}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Room {patient.room_number} ({patient.ward_type})
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={() => navigate(`/admitting/patients/${patient.id}/view`)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center"
                    >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                    </button>
                    <button
                        onClick={() => navigate(`/admitting/patients/${patient.id}`)}
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center"
                    >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                </div>
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
            if (response.data.status) {
                setPatients(response.data.data.data);
                const { data, ...paginationData } = response.data.data;
                setPagination(paginationData);
            } else {
                throw new Error(response.data.message || 'Failed to fetch patients');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError('Failed to fetch patients: ' + errorMessage);
            toast.error('Failed to fetch patients');
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