import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Select from 'react-select';
import { toast } from 'react-toastify';

const ProgressBill = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [billAmount, setBillAmount] = useState('');
  const [patientDetails, setPatientDetails] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  // Fetch active patients for the dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axiosClient.get('/billing/active-patients');
        const formattedPatients = response.data.map(patient => ({
          value: patient.id,
          label: patient.name
        }));
        setPatients(formattedPatients);
      } catch (error) {
        toast.error('Failed to fetch patients');
      }
    };
    fetchPatients();
  }, []);

  // Handle patient selection
  const handlePatientSelect = async (option) => {
    setSelectedPatient(option);
    setLoading(true);
    try {
      const response = await axiosClient.get(`/patients/${option.value}/details`);
      setPatientDetails(response.data);
      // Reset PDF and amount when new patient is selected
      setPdfUrl(null);
      setBillAmount('');
    } catch (error) {
      toast.error('Failed to fetch patient details');
    } finally {
      setLoading(false);
    }
  };

  // Handle bill amount change
  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setBillAmount(value);
  };

  // Generate and preview PDF
  const generatePreview = async () => {
    if (!billAmount || !selectedPatient) {
      toast.error('Please select a patient and enter bill amount');
      return;
    }

    try {
      const response = await axiosClient.get(`/billing/progress/${selectedPatient.value}/download`, {
        params: { amount: billAmount },
        responseType: 'blob'
      });

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
    } catch (error) {
      toast.error('Failed to generate preview');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Progress Bill</h1>
          </div>

          {/* Patient Selection and Details Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Patient
              </label>
              <Select
                options={patients}
                value={selectedPatient}
                onChange={handlePatientSelect}
                isLoading={loading}
                className="w-full"
                placeholder="Search and select patient..."
              />
            </div>

            {patientDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Patient Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Patient Name:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {patientDetails.name}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Room:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {patientDetails.room_number}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Attending Physician:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {patientDetails.attending_physician}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Admission Date:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {new Date(patientDetails.admission_date).toLocaleDateString()}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Ward Type:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {patientDetails.ward_type}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Remarks:</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {patientDetails.remarks || 'N/A'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Bill Amount Input */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Bill Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">₱</span>
                      </div>
                      <input
                        type="text"
                        value={billAmount}
                        onChange={handleAmountChange}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <button
                    onClick={generatePreview}
                    className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Generate Preview
                  </button>
                </div>

                {/* PDF Preview Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    PDF Preview
                  </h3>
                  {pdfUrl ? (
                    <div className="h-[600px] overflow-auto">
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="Progress Bill Preview"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
                      <p className="text-gray-500">
                        Preview will appear here after generation
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBill;