import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';

const ProgressBill = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billData, setBillData] = useState({
    patient: null,
    charges: [],
    total: 0
  });
  const [newCharge, setNewCharge] = useState({
    description: '',
    amount: '',
    category: 'room'
  });

  useEffect(() => {
    fetchProgressBill();
  }, [id]);

  const fetchProgressBill = async () => {
    try {
      const response = await axiosClient.get(`/billing/progress/${id}`);
      setBillData(response.data.data);
    } catch (err) {
      setError('Failed to fetch progress bill');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const handleAddCharge = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.post(`/billing/charges/${id}`, newCharge);
      setBillData(prev => ({
        ...prev,
        charges: [...prev.charges, response.data.data],
        total: prev.total + parseFloat(newCharge.amount)
      }));
      setNewCharge({ description: '', amount: '', category: 'room' });
    } catch (err) {
      setError('Failed to add charge');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add New Charge Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Add New Charge</h3>
          <form onSubmit={handleAddCharge} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={newCharge.category}
                onChange={e => setNewCharge({...newCharge, category: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="room">Room</option>
                <option value="medicine">Medicine</option>
                <option value="laboratory">Laboratory</option>
                <option value="professional_fee">Professional Fee</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={newCharge.description}
                onChange={e => setNewCharge({...newCharge, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₱</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={newCharge.amount}
                  onChange={e => setNewCharge({...newCharge, amount: e.target.value})}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Charge
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton height={40} />
              <Skeleton count={5} />
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Progress Bill</h2>
                <p className="text-gray-600">
                  Patient: {billData.patient?.name}
                </p>
                <p className="text-gray-600">
                  Admission Date: {new Date(billData.patient?.admission_date).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billData.charges.map((charge, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(charge.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {charge.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(charge.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-right font-bold">
                        Total:
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        {formatCurrency(billData.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBill;