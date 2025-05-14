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
                                <dt className="text-sm font-medium text-gray-500">First Name</dt>
                                <dd className="mt-1 text-lg text-gray-900">{patient.first_name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                                <dd className="mt-1 text-lg text-gray-900">{patient.last_name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Middle Name</dt>
                                <dd className="mt-1 text-lg text-gray-900">{patient.middle_name || 'N/A'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Name Initial</dt>
                                <dd className="mt-1 text-lg text-gray-900">{patient.name_initial || 'N/A'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                                <dd className="mt-1 text-lg text-gray-900">
                                    {new Date(patient.date_of_birth).toLocaleDateString()}
                                </dd>
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
                        </dl>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewPatient;