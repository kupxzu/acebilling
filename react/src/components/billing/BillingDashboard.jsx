import React, { useState, useEffect } from 'react';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const BillingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAmount: 0,
    wardDistribution: {
      private: 0,
      semiPrivate: 0,
      ward: 0
    }
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/billing/dashboard-stats');
      if (response.data && response.data.status) {
        const data = response.data.data;
        setStats({
          totalAmount: data.totalAmount || 0,
          wardDistribution: data.wardDistribution || {
            private: 0,
            semiPrivate: 0,
            ward: 0
          }
        });
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const wardChartData = {
    labels: ['Private', 'Semi-Private', 'Ward'],
    datasets: [{
      data: [
        stats.wardDistribution.private,
        stats.wardDistribution.semiPrivate,
        stats.wardDistribution.ward
      ],
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
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
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Ward Distribution Dashboard</h1>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Amount Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Total Amount</h2>
              {loading ? (
                <Skeleton height={40} />
              ) : (
                <p className="text-3xl font-bold text-indigo-600">
                  {formatCurrency(stats.totalAmount)}
                </p>
              )}
            </div>

            {/* Ward Distribution Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ward Distribution</h2>
              {loading ? (
                <Skeleton height={200} />
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <Pie 
                    data={wardChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* Ward Statistics Grid */}
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ward Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Private Ward */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-600 mb-2">Private Ward</h3>
                  <p className="text-2xl font-bold text-blue-700">
                    {loading ? <Skeleton width={60} /> : stats.wardDistribution.private}
                  </p>
                  <p className="text-sm text-blue-500 mt-1">Occupied Rooms</p>
                </div>

                {/* Semi-Private Ward */}
                <div className="bg-teal-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-teal-600 mb-2">Semi-Private Ward</h3>
                  <p className="text-2xl font-bold text-teal-700">
                    {loading ? <Skeleton width={60} /> : stats.wardDistribution.semiPrivate}
                  </p>
                  <p className="text-sm text-teal-500 mt-1">Occupied Rooms</p>
                </div>

                {/* General Ward */}
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-orange-600 mb-2">General Ward</h3>
                  <p className="text-2xl font-bold text-orange-700">
                    {loading ? <Skeleton width={60} /> : stats.wardDistribution.ward}
                  </p>
                  <p className="text-sm text-orange-500 mt-1">Occupied Rooms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;
