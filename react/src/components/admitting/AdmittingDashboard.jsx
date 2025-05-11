import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import axiosClient from '../../utils/axios';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Invalid date
    return date;
  } catch {
    return '';
  }
};

const AdmittingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeAdmissions: 0,
    dischargedPatients: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [chartData, setChartData] = useState({
    admissions: {
      labels: [],
      datasets: [{
        label: 'Daily Admissions',
        data: [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    wardDistribution: {
      labels: ['Private', 'Semi-Private', 'Ward'],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }]
    },
    patientTrend: {
      week: {
        labels: [],
        datasets: [{
          label: 'Weekly Patients',
          data: [],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      month: {
        labels: [],
        datasets: [{
          label: 'Monthly Patients',
          data: [],
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      year: {
        labels: [],
        datasets: [{
          label: 'Yearly Patients',
          data: [],
          borderColor: 'rgb(244, 63, 94)',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          tension: 0.3,
          fill: true
        }]
      }
    }
  });
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Based on your backend controller, the correct endpoint is /stats
      const response = await axiosClient.get('/dashboard/stats');
      
      if (response.data.status) {
        const { data } = response.data;
        processData(data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Process data function to handle API response
  const processData = (data) => {
    // Set stats data
    setStats({
      totalPatients: data.totalPatients || 0,
      activeAdmissions: data.activeAdmissions || 0,
      dischargedPatients: data.dischargedPatients || 0
    });

    // Process chart data
    setChartData(prevState => ({
      ...prevState,
      admissions: {
        labels: data.admissionTrend?.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        ) || [],
        datasets: [{
          label: 'Daily Admissions',
          data: data.admissionTrend?.map(item => item.count) || [],
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      wardDistribution: {
        labels: ['Private', 'Semi-Private', 'Ward'],
        datasets: [{
          data: [
            data.wardDistribution?.private || 0,
            data.wardDistribution?.semiPrivate || 0,
            data.wardDistribution?.ward || 0
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(139, 92, 246, 0.8)'
          ]
        }]
      },
      patientTrend: {
        week: {
          labels: data.patientTrend?.weekly?.map(item => {
            const date = formatDate(item.date);
            return date ? date.toLocaleDateString('en-US', { weekday: 'short' }) : '';
          }) || [],
          datasets: [{
            label: 'Weekly Patients',
            data: data.patientTrend?.weekly?.map(item => item.count) || [],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        month: {
          labels: data.patientTrend?.monthly?.map(item => {
            const date = formatDate(item.date);
            return date ? date.toLocaleDateString('en-US', { 
              month: 'short',
              day: 'numeric'
            }) : '';
          }) || [],
          datasets: [{
            label: 'Monthly Patients',
            data: data.patientTrend?.monthly?.map(item => item.count) || [],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        year: {
          labels: data.patientTrend?.yearly?.map(item => {
            const date = formatDate(item.date);
            return date ? date.toLocaleDateString('en-US', { 
              month: 'short'
            }) : '';
          }) || [],
          datasets: [{
            label: 'Yearly Patients',
            data: data.patientTrend?.yearly?.map(item => item.count) || [],
            borderColor: 'rgb(244, 63, 94)',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            tension: 0.3,
            fill: true
          }]
        }
      }
    }));

    // Set recent patients data
    setRecentPatients(data.recentPatients || []);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Admitting Dashboard</h1>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
              <button 
                className="ml-4 text-sm underline" 
                onClick={fetchDashboardData}
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {loading ? (
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <Skeleton height={50} />
                  </div>
                </div>
              ))
            ) : (
              <>
                <StatsCard
                  title="Total Patients"
                  value={stats.totalPatients}
                  icon="users"
                />
                <StatsCard
                  title="Active Admissions"
                  value={stats.activeAdmissions}
                  icon="bed"
                />
                <StatsCard
                  title="Discharged"
                  value={stats.dischargedPatients}
                  icon="check"
                />
              </>
            )}
          </div>

          {/* Charts Section */}
          <div className="mt-6 grid grid-cols-1 gap-6">
            {/* Admissions Trend */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Admissions Trend</h2>
                {loading ? (
                  <Skeleton height={300} />
                ) : (
                  <div className="h-[300px]">
                    <Line 
                      data={chartData.admissions} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          }
                        },
                        scales: {
                          y: { 
                            beginAtZero: true,
                            ticks: {
                              precision: 0
                            }
                          }
                        }
                      }} 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Second row of charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ward Distribution */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Ward Distribution</h2>
                  {loading ? (
                    <Skeleton height={300} />
                  ) : (
                    <div className="h-[300px]">
                      <Doughnut 
                        data={chartData.wardDistribution} 
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
              </div>

              {/* Patient Trend */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Patient Trend</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setTimeRange('week')}
                        className={`px-3 py-1 rounded-md text-sm ${
                          timeRange === 'week'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Week
                      </button>
                      <button
                        onClick={() => setTimeRange('month')}
                        className={`px-3 py-1 rounded-md text-sm ${
                          timeRange === 'month'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => setTimeRange('year')}
                        className={`px-3 py-1 rounded-md text-sm ${
                          timeRange === 'year'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Year
                      </button>
                    </div>
                  </div>
                  {loading ? (
                    <Skeleton height={300} />
                  ) : (
                    <div className="h-[300px]">
                      <Line 
                        data={chartData.patientTrend[timeRange]} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top'
                            }
                          },
                          scales: {
                            y: { 
                              beginAtZero: true,
                              ticks: {
                                precision: 0
                              }
                            }
                          }
                        }} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Patients */}
          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Admissions</h2>
                <Link
                  to="/admitting/patients"
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  View all patients →
                </Link>
              </div>
              {loading ? (
                [...Array(3)].map((_, index) => (
                  <div key={index} className="mb-4">
                    <Skeleton height={60} />
                  </div>
                ))
              ) : recentPatients.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="py-4">
                      <Link
                        to={`/admitting/patients/${patient.id}/view`}
                        className="block hover:bg-gray-50 -mx-4 px-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{patient.name}</h3>
                            <p className="text-sm text-gray-500">Room {patient.room_number}</p>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-4">
                              {patient.admission_date ? new Date(patient.admission_date).toLocaleDateString() : 'N/A'}
                            </span>
                            <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent admissions found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon === 'users' && (
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
          {icon === 'bed' && (
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          )}
          {icon === 'check' && (
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

export default AdmittingDashboard;