import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Charges = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [charge, setCharge] = useState({
        description: '',
        amount: '',
        category: 'room'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('pending');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [perPage] = useState(10);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        fetchActivePatients();
    }, []);

    const fetchActivePatients = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/billing/active-patients', {
                params: {
                    page: pageNumber,
                    per_page: perPage,
                    search: searchTerm
                }
            });

            // Check if response has the expected structure
            if (!response.data || !response.data.data || !response.data.meta) {
                throw new Error('Invalid response format from server');
            }

            if (pageNumber === 1) {
                setPatients(response.data.data);
            } else {
                setPatients(prev => [...prev, ...response.data.data]);
            }

            // Check if meta data exists before accessing
            if (response.data.meta) {
                setTotalPages(response.data.meta.last_page || 1);
                setPage(response.data.meta.current_page || pageNumber);
            }

            setError('');
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to fetch patients. Please try again.');
            setTotalPages(1);
            setPatients([]);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            setPage(1);
            fetchActivePatients(1);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const loadMore = () => {
        if (page < totalPages && !isLoadingMore) {
            setIsLoadingMore(true);
            fetchActivePatients(page + 1);
        }
    };

    // Add new function to fetch patient charges
    const fetchPatientCharges = async (patientId) => {
        try {
            const response = await axiosClient.get(`/billing/patient-charges/${patientId}`);
            return response.data.data;
        } catch (err) {
            setError('Failed to fetch patient charges');
            return [];
        }
    };

    // Update the patient selection handler
    const handlePatientSelect = async (patient) => {
        try {
            setLoading(true);
            const charges = await fetchPatientCharges(patient.id);
            setSelectedPatient({
                ...patient,
                charges: charges
            });
        } catch (err) {
            setError('Failed to load patient charges');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axiosClient.post(`/billing/charges/${selectedPatient.id}`, charge);
            const updatedCharges = await fetchPatientCharges(selectedPatient.id);
            setSelectedPatient({
                ...selectedPatient,
                charges: updatedCharges
            });
            setSuccess('Charge added successfully');
            setCharge({ description: '', amount: '', category: 'room' });
        } catch (err) {
            setError('Failed to add charge');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (chargeId, newStatus) => {
        try {
            setLoading(true);
            setError('');
            
            const response = await axiosClient.patch(`/billing/charges/${chargeId}/status`, {
                status: newStatus
            });
    
            if (response.data.status) {
                // Refresh charges
                const updatedCharges = await fetchPatientCharges(selectedPatient.id);
                setSelectedPatient(prev => ({
                    ...prev,
                    charges: updatedCharges
                }));
                setSuccess('Status updated successfully');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message;
            setError(`Failed to update status: ${errorMessage}`);
            console.error('Status update error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.room_number?.toString().includes(searchTerm)
    );

    const renderChargesTable = () => {
        if (!selectedPatient?.charges?.length) return null;

        return (
            <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Charges</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {selectedPatient.charges.map((charge) => (
                                <tr key={charge.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(charge.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {charge.category.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {charge.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₱{parseFloat(charge.amount).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${charge.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                              charge.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                              'bg-yellow-100 text-yellow-800'}`}>
                                            {charge.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex space-x-2">
                                            <select
                                                value={charge.status}
                                                onChange={(e) => handleStatusChange(charge.id, e.target.value)}
                                                className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                disabled={loading}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Add Charges</h1>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                        <p className="text-green-700">{success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Patient List Section */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Patient
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name or room"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        <div 
                            className="overflow-y-auto max-h-[400px]"
                            onScroll={(e) => {
                                const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                if (scrollHeight - scrollTop <= clientHeight * 1.5) {
                                    loadMore();
                                }
                            }}
                        >
                            {loading && page === 1 ? (
                                <Skeleton count={5} height={40} className="mb-2" />
                            ) : (
                                <div className="space-y-2">
                                    {patients.map((patient) => (
                                        <button
                                            key={patient.id}
                                            onClick={() => handlePatientSelect(patient)}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                                selectedPatient?.id === patient.id
                                                    ? 'bg-indigo-50 border-indigo-500 border'
                                                    : 'hover:bg-gray-50 border border-gray-200'
                                            }`}
                                        >
                                            <div className="font-medium text-gray-900">
                                                {patient.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Room {patient.room_number}
                                            </div>
                                            {patient.admission_date && (
                                                <div className="text-xs text-gray-400">
                                                    Admitted: {new Date(patient.admission_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </button>
                                    ))}

                                    {isLoadingMore && (
                                        <div className="py-2">
                                            <Skeleton count={1} height={40} className="mb-2" />
                                        </div>
                                    )}

                                    {patients.length === 0 && (
                                        <div className="text-center py-4 text-gray-500">
                                            No patients found
                                        </div>
                                    )}

                                    {!loading && !isLoadingMore && page < totalPages && (
                                        <button
                                            onClick={loadMore}
                                            className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-500"
                                        >
                                            Load more...
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Charge Form Section */}
                    <div className="md:col-span-2 bg-white shadow rounded-lg p-6">
                        {selectedPatient ? (
                            <>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                        <h3 className="font-medium text-gray-900">Selected Patient</h3>
                                        <p className="text-gray-600">{selectedPatient.name}</p>
                                        <p className="text-sm text-gray-500">Room {selectedPatient.room_number}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Category
                                        </label>
                                        <select
                                            value={charge.category}
                                            onChange={(e) => setCharge({...charge, category: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="room">Room</option>
                                            <option value="medicine">Medicine</option>
                                            <option value="laboratory">Laboratory</option>
                                            <option value="professional_fee">Professional Fee</option>
                                            <option value="others">Others</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={charge.description}
                                            onChange={(e) => setCharge({...charge, description: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Amount
                                        </label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">₱</span>
                                            </div>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={charge.amount}
                                                onChange={(e) => setCharge({...charge, amount: e.target.value})}
                                                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            {loading ? 'Adding...' : 'Add Charge'}
                                        </button>
                                    </div>
                                </form>
                                {renderChargesTable()}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Please select a patient from the list
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Charges;