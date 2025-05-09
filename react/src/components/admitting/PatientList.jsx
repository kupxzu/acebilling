import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PatientCard = ({ loading, patient }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="flex justify-between items-start">
                        <div>
                            <Skeleton width={150} height={24} />
                            <Skeleton width={100} height={20} className="mt-1" />
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
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {patient.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Room {patient.room_number}
                        </p>
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