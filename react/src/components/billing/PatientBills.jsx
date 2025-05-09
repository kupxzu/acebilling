import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const PatientBills = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [patients, setPatients] = useState([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    const fetchPatients = async (page = 1) => {
        try {
            const response = await axiosClient.get(`/billing/patients?page=${page}`);
            setPatients(response.data.data);
            setPagination({
                current_page: response.data.meta.current_page,
                last_page: response.data.meta.last_page,
                total: response.data.meta.total
            });
        } catch (err) {
            setError('Failed to fetch patients');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

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
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Patient Bills</h1>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="bg-white shadow overflow-hidden rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Patient Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Room
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Bill
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                [...Array(5)].map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan="5" className="px-6 py-4">
                                            <Skeleton height={20} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {patient.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {patient.room_number}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatCurrency(patient.total_bill || 0)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${patient.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'}`}
                                            >
                                                {patient.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                to={`/billing/soa/${patient.id}`}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                View SOA
                                            </Link>
                                            <Link
                                                to={`/billing/progress/${patient.id}`}
                                                className="text-green-600 hover:text-green-900"
                                            >
                                                Progress Bill
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && pagination.last_page > 1 && (
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
                )}
            </div>
        </div>
    );
};

export default PatientBills;