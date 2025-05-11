import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../utils/axios';

const PatientPortal = () => {
    const { hash } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [data, setData] = useState({
        patient: null,
        progressBill: {
            charges: [],
            total: 0
        },
        soa: {
            charges: [],
            total: 0
        }
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                console.log("Fetching portal data for hash:", hash);
                const response = await axiosClient.get(`/portal/patient/${hash}`);
                console.log("Portal data response:", response.data);
                setData(response.data);
            } catch (err) {
                console.error("Portal data fetch error:", err);
                setError('Invalid or expired link');
            } finally {
                setLoading(false);
            }
        };
        
        if (hash) {
            fetchPatientData();
        }
    }, [hash]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Access Error</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Patient Info */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient Information</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-lg font-medium">{data.patient?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Room</p>
                            <p className="text-lg font-medium">{data.patient?.room_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ward Type</p>
                            <p className="text-lg font-medium capitalize">{data.patient?.ward_type}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Admission Date</p>
                            <p className="text-lg font-medium">
                                {data.patient?.admission_date ? new Date(data.patient.admission_date).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress Bill */}
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Current Progress Bill</h2>
                    {data.progressBill.charges.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.progressBill.charges.map((charge, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(charge.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                {charge.category}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {charge.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                {formatCurrency(charge.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-sm font-bold text-gray-900">
                                            Current Total
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                            {formatCurrency(data.progressBill.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No charges found</p>
                    )}
                </div>

                {/* Statement of Account */}
                <div className="bg-white shadow-sm rounded-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Statement of Account</h2>
                    {data.soa.charges.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                                            Bill Date
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.soa.charges.map((charge, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(charge.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {charge.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                                {formatCurrency(charge.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${charge.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                                    charge.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                    'bg-red-100 text-red-800'}`}>
                                                    {charge.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="2" className="px-6 py-4 text-sm font-bold text-gray-900">
                                            Total Balance
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                            {formatCurrency(data.soa.total)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No charges found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PatientPortal;