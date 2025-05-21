import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../utils/axios';
import Navbar from '../Navbar';
import Skeleton from 'react-loading-skeleton';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  AlertCircle, 
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BillingDashboard = () => {
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    wardDistribution: {
      private: 0,
      semiPrivate: 0,
      ward: 0,
      executive: 0,
      suite: 0
    },
    incomeData: [],
    patientCount: {
      private: 0,
      semiPrivate: 0,
      ward: 0,
      executive: 0,
      suite: 0
    },
    previousPeriodIncome: 0,
    revenueByService: []
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [averageDaily, setAverageDaily] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  const [mostProfitableWard, setMostProfitableWard] = useState('');
  const [totalPatients, setTotalPatients] = useState(0);
  const [revenuePerPatient, setRevenuePerPatient] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
        setLoading(true);
        const response = await axiosClient.get(`/billing/dashboard-stats?range=${timeRange}`);
        
        // Validate response structure
        if (!response?.data?.data) {
            throw new Error('Invalid response format');
        }

        const data = response.data.data;

        // Validate required data structure
        const validateData = {
            summary: {
                totalAmount: data?.summary?.totalAmount ?? 0,
                averageDaily: data?.summary?.averageDaily ?? 0,
                totalPatients: data?.summary?.totalPatients ?? 0,
                revenuePerPatient: data?.summary?.revenuePerPatient ?? 0,
                mostProfitableWard: data?.summary?.mostProfitableWard ?? ''
            },
            wardDistribution: data?.wardDistribution ?? {},
            incomeData: Array.isArray(data?.incomeData) ? data.incomeData : [],
            patientCount: data?.patientCount ?? {},
            previousPeriodIncome: data?.previousPeriodIncome ?? 0
        };
        
        // Update all stats at once with validated data
        setStats({
            wardDistribution: validateData.wardDistribution,
            incomeData: validateData.incomeData,
            patientCount: validateData.patientCount,
            previousPeriodIncome: validateData.previousPeriodIncome
        });
        
        // Set derived values with validated data
        setTotalAmount(validateData.summary.totalAmount);
        setAverageDaily(validateData.summary.averageDaily);
        setTotalPatients(validateData.summary.totalPatients);
        setRevenuePerPatient(validateData.summary.revenuePerPatient);
        setMostProfitableWard(validateData.summary.mostProfitableWard);
        
        // Calculate growth rate with validated data
        const currentTotal = validateData.summary.totalAmount;
        const previousTotal = validateData.previousPeriodIncome;
        const growth = previousTotal > 0 
            ? ((currentTotal - previousTotal) / previousTotal * 100)
            : 0;
        setGrowthRate(growth);

    } catch (error) {
        console.error('Error fetching stats:', error);
        
        // More descriptive error message based on error type
        if (error.response?.status === 500) {
            toast.error('Server error. Please try again later.');
        } else if (error.message === 'Network Error') {
            toast.error('Network connection error. Please check your connection.');
        } else {
            toast.error('Failed to fetch statistics');
        }
        
        // Reset states with default values
        const defaultStats = {
            wardDistribution: {
                private: 0,
                semiPrivate: 0,
                ward: 0,
                executive: 0,
                suite: 0
            },
            incomeData: [],
            patientCount: {
                private: 0,
                semiPrivate: 0,
                ward: 0,
                executive: 0,
                suite: 0
            },
            previousPeriodIncome: 0
        };

        setStats(defaultStats);
        setTotalAmount(0);
        setAverageDaily(0);
        setGrowthRate(0);
        setMostProfitableWard('');
        setTotalPatients(0);
        setRevenuePerPatient(0);
    } finally {
        setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh for 'today' view
    let intervalId;
    if (timeRange === 'today') {
      intervalId = setInterval(fetchStats, 300000); // 5 minutes
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timeRange, fetchStats]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-PH').format(value);
  };

  const capitalize = (str) => {
    return str.replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const wardPatientData = {
    labels: ['Private', 'Semi-Private', 'General', 'Executive', 'Suite'],
    datasets: [{
      label: 'Patients by Ward Type',
      data: [
        stats.patientCount?.private || 0,
        stats.patientCount?.semiPrivate || 0,
        stats.patientCount?.ward || 0,
        stats.patientCount?.executive || 0,
        stats.patientCount?.suite || 0
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(20, 184, 166, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderWidth: 0
    }]
  };

  const incomeChartData = {
    labels: stats.incomeData?.map(item => item.date) || [],
    datasets: [{
      label: 'Income',
      data: stats.incomeData?.map(item => item.amount) || [],
      borderColor: 'rgb(99, 102, 241)',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Loading skeleton
  if (loading && !stats.incomeData?.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-between items-center">
              <Skeleton height={40} width={300} />
              <Skeleton height={40} width={240} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <Skeleton height={80} />
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <Skeleton height={300} />
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <Skeleton height={300} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
              <p className="text-gray-500 mt-1">Comprehensive billing and revenue insights</p>
            </div>
            
            <div className="flex gap-2 bg-white shadow rounded-lg p-1">
              {['today', 'week', 'month', 'year'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-transparent text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Revenue Card */}
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-indigo-600 hover:shadow-lg transition-shadow">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <div className="mt-3 flex items-center">
                {growthRate >= 0 ? (
                  <div className="text-green-500 flex items-center text-sm">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    {growthRate.toFixed(1)}%
                  </div>
                ) : (
                  <div className="text-red-500 flex items-center text-sm">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    {Math.abs(growthRate).toFixed(1)}%
                  </div>
                )}
                <span className="text-gray-500 text-sm ml-2">vs previous {timeRange}</span>
              </div>
            </div>

            {/* Average Daily Income */}
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-teal-600 hover:shadow-lg transition-shadow">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg. Daily Income</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(averageDaily)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-teal-600" />
                </div>
              </div>
              <div className="mt-3 text-gray-500 text-sm">
                Based on {stats.incomeData?.length || 0} days
              </div>
            </div>

            {/* Total Patients */}
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalPatients)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <div className="mt-3 text-gray-500 text-sm">
                Revenue per patient: {formatCurrency(revenuePerPatient)}
              </div>
            </div>

            {/* Top Performing Ward */}
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-600 hover:shadow-lg transition-shadow">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Top Ward</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{capitalize(mostProfitableWard)}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-3 text-gray-500 text-sm">
                Highest revenue generator
              </div>
            </div>
          </div>

          {/* Main Charts - Only keeping Income Trend and Patient Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Income Trend Chart */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Revenue Trend</h2>
                <div className="bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full px-3 py-1 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
                </div>
              </div>
              <div className="h-[300px]">
                <Line
                  data={incomeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        padding: 12,
                        titleFont: {
                          size: 14
                        },
                        bodyFont: {
                          size: 13
                        },
                        callbacks: {
                          label: (context) => formatCurrency(context.parsed.y)
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false
                        }
                      },
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(243, 244, 246, 1)'
                        },
                        ticks: {
                          callback: (value) => formatCurrency(value),
                          font: {
                            size: 11
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Patient Distribution */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Patient Distribution</h2>
                <div className="bg-purple-100 text-purple-800 text-xs font-medium rounded-full px-3 py-1 flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  By Ward Type
                </div>
              </div>
              <div className="h-[300px]">
                <Doughnut
                  data={wardPatientData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '50%',
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          padding: 15
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.9)',
                        padding: 12,
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} patients (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboard;