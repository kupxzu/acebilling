import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';

const StatementOfAccount = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soaData, setSoaData] = useState({
    patient: null,
    charges: [],
    charges_by_category: {},
    summary: {
      total: 0,
      paid: 0,
      balance: 0
    }
  });

  useEffect(() => {
    fetchSOAData();
  }, [id]);

  const fetchSOAData = async () => {
    try {
      const response = await axiosClient.get(`/billing/soa/${id}`);
      setSoaData(response.data.data || {
        patient: null,
        charges: [],
        charges_by_category: {},
        summary: { total: 0, paid: 0, balance: 0 }
      });
    } catch (err) {
      setError('Failed to fetch SOA data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadSOA = async () => {
    try {
      const response = await axiosClient.get(`/billing/soa/${id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SOA-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download SOA');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Statement of Account</h2>
                  <p className="text-gray-600">Patient: {soaData.patient?.name || 'N/A'}</p>
                  <p className="text-gray-600">
                    Admission Date: {soaData.patient?.admission_date 
                      ? new Date(soaData.patient.admission_date).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                  <p className="text-gray-600">Room: {soaData.patient?.room_number || 'N/A'}</p>
                </div>
                <button
                  onClick={downloadSOA}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Download PDF
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium mb-4">Charges Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {Object.entries(soaData.charges_by_category || {}).map(([category, amount]) => (
                    <div key={category} className="bg-gray-50 p-4 rounded-lg">
                      <dt className="text-sm font-medium text-gray-500 capitalize">
                        {category.replace('_', ' ')}
                      </dt>
                      <dd className="mt-1 text-lg font-semibold text-gray-900">
                        {formatCurrency(amount)}
                      </dd>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Detailed Charges</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
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
                      {soaData.charges.map((charge, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(charge.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {charge.category.replace('_', ' ')}
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
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right font-bold">
                          Total:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                          {formatCurrency(soaData.summary.total)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right font-bold">
                          Paid:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          {formatCurrency(soaData.summary.paid)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right font-bold">
                          Balance:
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                          {formatCurrency(soaData.summary.balance)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatementOfAccount;