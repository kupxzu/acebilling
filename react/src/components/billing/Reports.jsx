import { useState, useEffect } from 'react';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const defaultChartData = {
    revenue: {
        labels: [],
        datasets: [{
            label: 'Daily Revenue',
            data: [],
            borderColor: '#4F46E5',
            tension: 0.1
        }]
    },
    categories: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        }]
    },
    payment_status: {
        labels: [],
        datasets: [{
            label: 'Amount',
            data: [],
            backgroundColor: '#4F46E5'
        }]
    }
};

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('week');
    const [reportData, setReportData] = useState(defaultChartData);

    useEffect(() => {
        fetchReportData();
    }, [dateRange]);

    const fetchReportData = async () => {
        try {
            const response = await axiosClient.get(`/billing/reports?range=${dateRange}`);
            if (response.data.status && response.data.data) {
                setReportData({
                    revenue: response.data.data.revenue || defaultChartData.revenue,
                    categories: response.data.data.categories || defaultChartData.categories,
                    payment_status: response.data.data.payment_status || defaultChartData.payment_status
                });
            }
        } catch (err) {
            setError('Failed to fetch report data');
            console.error('Error:', err);
            setReportData(defaultChartData);
        } finally {
            setLoading(false);
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Billing Reports</h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setDateRange('week')}
                            className={`px-4 py-2 rounded-md ${
                                dateRange === 'week' 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white text-gray-700'
                            }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setDateRange('month')}
                            className={`px-4 py-2 rounded-md ${
                                dateRange === 'month' 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white text-gray-700'
                            }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setDateRange('year')}
                            className={`px-4 py-2 rounded-md ${
                                dateRange === 'year' 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-white text-gray-700'
                            }`}
                        >
                            Year
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6">
                    {/* Revenue Trend */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium mb-4">Revenue Trend</h2>
                        {loading ? (
                            <Skeleton height={300} />
                        ) : error ? (
                            <div className="text-red-600 h-[300px] flex items-center justify-center">
                                {error}
                            </div>
                        ) : (
                            <div className="h-[300px]">
                                <Line 
                                    data={reportData.revenue} 
                                    options={chartOptions}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Distribution */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium mb-4">Charges by Category</h2>
                            {loading ? (
                                <Skeleton height={300} />
                            ) : error ? (
                                <div className="text-red-600 h-[300px] flex items-center justify-center">
                                    {error}
                                </div>
                            ) : (
                                <div className="h-[300px]">
                                    <Doughnut 
                                        data={reportData.categories} 
                                        options={chartOptions}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Payment Status */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-lg font-medium mb-4">Payment Status</h2>
                            {loading ? (
                                <Skeleton height={300} />
                            ) : error ? (
                                <div className="text-red-600 h-[300px] flex items-center justify-center">
                                    {error}
                                </div>
                            ) : (
                                <div className="h-[300px]">
                                    <Bar 
                                        data={reportData.payment_status} 
                                        options={chartOptions}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;