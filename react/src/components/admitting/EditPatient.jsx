import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const FormFieldSkeleton = () => (
    <div>
        <Skeleton width={120} height={20} className="mb-1" />
        <Skeleton height={38} />
    </div>
);

const EditPatient = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        room_number: '',
        ward_type: '',
        attending_physician: '',
        remarks: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [qrCode, setQrCode] = useState('');

    useEffect(() => {
        const loadData = async () => {
            await fetchPatient();
            await fetchQrCode();
        };
        loadData();
    }, [id]);

    const fetchPatient = async () => {
        try {
            const response = await axiosClient.get(`/patients/${id}`);
            const patient = response.data.data;
            setFormData({
                name: patient.name,
                room_number: patient.room_number,
                ward_type: patient.ward_type,
                attending_physician: patient.attending_physician,
                remarks: patient.remarks || ''
            });
        } catch (err) {
            setError('Failed to fetch patient details');
            console.error('Error fetching patient:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchQrCode = async () => {
        try {
            const response = await axiosClient.post(`/patients/${id}/generate-qr`);
            setQrCode(response.data.qrCodeUrl);
        } catch (err) {
            console.error('Error generating QR code:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            await axiosClient.put(`/patients/${id}`, formData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/admitting/patients');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update patient');
        } finally {
            setSaving(false);
        }
    };

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
                            <h2 className="text-2xl font-bold text-gray-800">Edit Patient</h2>
                            <button
                                onClick={() => navigate('/admitting/patients')}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Back to List
                            </button>
                        </>
                    )}
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                        <p className="text-green-700">Patient updated successfully!</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm rounded-lg p-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormFieldSkeleton />
                            <FormFieldSkeleton />
                            <FormFieldSkeleton />
                            <FormFieldSkeleton />
                            <FormFieldSkeleton />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                                <input
                                    type="text"
                                    value={formData.room_number}
                                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Ward Type</label>
                                <select
                                    value={formData.ward_type}
                                    onChange={(e) => setFormData({ ...formData, ward_type: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="ward">Ward</option>
                                    <option value="semi-private">Semi-Private</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Attending Physician</label>
                                <input
                                    type="text"
                                    value={formData.attending_physician}
                                    onChange={(e) => setFormData({ ...formData, attending_physician: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                <textarea
                                    value={formData.remarks}
                                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        {loading ? (
                            <>
                                <Skeleton width={100} height={40} className="rounded-md" />
                                <Skeleton width={100} height={40} className="rounded-md" />
                            </>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admitting/patients')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        )}
                    </div>
                </form>

                {qrCode && (
                    <div className="mt-6 bg-white shadow-sm rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient QR Code</h3>
                        <div className="flex flex-col items-center">
                            <img 
                                src={qrCode} 
                                alt="Patient QR Code"
                                className="w-48 h-48 object-contain mb-4" 
                            />
                            <a
                                href={qrCode}
                                download="patient-qr-code.png"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Download QR Code
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditPatient;