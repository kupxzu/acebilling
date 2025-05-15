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
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
                <div className="animate-pulse">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div>
                                <Skeleton width={150} height={24} />
                                <Skeleton width={100} height={20} className="mt-1" />
                            </div>
                        </div>
                        <Skeleton width={60} height={24} className="rounded-full" />
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center">
                            <Skeleton circle width={20} height={20} className="mr-3" />
                            <Skeleton width={180} height={20} />    
                        </div>
                        <div className="flex items-center">
                            <Skeleton circle width={20} height={20} className="mr-3" />
                            <Skeleton width={140} height={20} />
                        </div>
                        <div className="flex items-center">
                            <Skeleton circle width={20} height={20} className="mr-3" />
                            <Skeleton width={160} height={20} />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <Skeleton width={100} height={36} className="rounded-md" />
                    </div>
                </div>
            </div>
        );
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-gradient-to-r from-green-50 to-green-100 text-green-800 border-green-200';
            case 'discharged':
                return 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return (
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'discharged':
                return (
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414 0l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 12H14a1 1 0 000-2H8.414l1.293-1.293a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 overflow-hidden group">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Avatar
                                firstName={patient?.first_name || ''}
                                lastName={patient?.last_name || ''}
                                size={48}
                                className="flex-shrink-0 ring-2 ring-white shadow-md"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {`${patient.first_name} ${patient.middle_name ? patient.middle_name + ' ' : ''}${patient.last_name}`}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                                <path d="m4.75 1-.884.884a1.25 1.25 0 1 0 1.768 0L4.75 1ZM11.25 1l-.884.884a1.25 1.25 0 1 0 1.768 0L11.25 1ZM8.884 1.884 8 1l-.884.884a1.25 1.25 0 1 0 1.768 0ZM4 7a2 2 0 0 0-2 2v1.034c.347 0 .694-.056 1.028-.167l.47-.157a4.75 4.75 0 0 1 3.004 0l.47.157a3.25 3.25 0 0 0 2.056 0l.47-.157a4.75 4.75 0 0 1 3.004 0l.47.157c.334.111.681.167 1.028.167V9a2 2 0 0 0-2-2V5.75a.75.75 0 0 0-1.5 0V7H8.75V5.75a.75.75 0 0 0-1.5 0V7H5.5V5.75a.75.75 0 0 0-1.5 0V7ZM14 11.534a4.749 4.749 0 0 1-1.502-.244l-.47-.157a3.25 3.25 0 0 0-2.056 0l-.47.157a4.75 4.75 0 0 1-3.004 0l-.47-.157a3.25 3.25 0 0 0-2.056 0l-.47.157A4.748 4.748 0 0 1 2 11.534V13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.466Z" />
                                </svg> 
                                {patient.date_of_birth && new Date(patient.date_of_birth).toLocaleDateString()}
                             </p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border flex items-center ${getStatusColor(patient.admissions?.[0]?.status)}`}>
                        {getStatusIcon(patient.admissions?.[0]?.status)}
                        {patient.admissions?.[0]?.status || 'Unknown'}
                    </span>
                </div>

                <div className="mt-6 space-y-3">
                    <div className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center mr-3">
                            <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <span className="font-medium">Dr. {patient.attending_physician}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center mr-3">
                            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <span className="font-medium">Room {patient.room_number}</span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-gray-500">{patient.ward_type}</span>
                    </div>
                    {patient.admissions?.[0]?.diagnosis && (
                        <div className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors">
                            <div className="w-8 h-8 bg-red-50 rounded-full flex items-center justify-center mr-3">
                                <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <span className="font-medium truncate">{patient.admissions[0].diagnosis}</span>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admitting/patients/${patient.id}/view`);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admitting/patients/${patient.id}`);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center transition-all duration-200"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </button>
                </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
    );
};

const EmptyState = () => (
    <div className="col-span-3 bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
        <p className="text-gray-500 mb-6">Try adjusting your search criteria or add a new patient.</p>
        <button
            onClick={() => navigate('/admitting/new-patient')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Patient
        </button>
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
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchPatients = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/patients?page=${page}&search=${debouncedSearchTerm}`);
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

    useEffect(() => {
        fetchPatients(1);
    }, [debouncedSearchTerm]);

    const renderPagination = () => {
        const pages = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, pagination.current_page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(pagination.last_page, startPage + maxPagesToShow - 1);

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            pages.push(
                <button
                    key="1"
                    onClick={() => fetchPatients(1)}
                    className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(
                    <span key="ellipsis1" className="px-2 py-1 text-gray-400">
                        ...
                    </span>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => fetchPatients(i)}
                    className={`px-3 py-1 rounded-md transition-all duration-200 ${
                        pagination.current_page === i
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    {i}
                </button>
            );
        }

        if (endPage < pagination.last_page) {
            if (endPage < pagination.last_page - 1) {
                pages.push(
                    <span key="ellipsis2" className="px-2 py-1 text-gray-400">
                        ...
                    </span>
                );
            }
            pages.push(
                <button
                    key={pagination.last_page}
                    onClick={() => fetchPatients(pagination.last_page)}
                    className="px-3 py-1 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    {pagination.last_page}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col space-y-6 mb-8">
                    <div className="flex justify-between items-center">
                        {loading ? (
                            <>
                                <Skeleton width={200} height={36} />
                                <Skeleton width={150} height={44} className="rounded-md" />
                            </>
                        ) : (
                            <>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">All Patients</h1>
                                    <p className="text-gray-600 mt-1">Manage and view all patient records</p>
                                </div>
                                <button
                                    onClick={() => navigate('/admitting/new-patient')}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
                                >
                                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Add New Patient
                                </button>
                            </>
                        )}
                    </div>

                    <div className="relative max-w-full">
                        <input
                            type="text"
                            placeholder="Search patients by name, room number, or physician..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 shadow-sm"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg 
                                className="h-5 w-5 text-gray-400" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm animate-fade-in">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading
                        ? [...Array(9)].map((_, index) => (
                              <PatientCard key={index} loading={true} />
                          ))
                        : patients.length > 0
                        ? patients.map((patient) => (
                              <PatientCard key={patient.id} loading={false} patient={patient} />
                          ))
                        : !loading && <EmptyState />}
                </div>

                {!loading && pagination.last_page > 1 && (
                    <div className="mt-8 flex justify-center items-center space-x-2">
                        <button
                            onClick={() => fetchPatients(Math.max(1, pagination.current_page - 1))}
                            disabled={pagination.current_page === 1}
                            className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className="flex items-center space-x-1">
                            {renderPagination()}
                        </div>
                        <button
                            onClick={() => fetchPatients(Math.min(pagination.last_page, pagination.current_page + 1))}
                            disabled={pagination.current_page === pagination.last_page}
                            className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientList;