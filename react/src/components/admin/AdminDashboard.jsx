import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient, { auth } from '../../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../common/Layout';

const UserForm = ({ onSubmit, initialData = null, isEditing = false }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name ?? '',
        email: initialData?.email ?? '',
        password: '',
        role: initialData?.role ?? 'admitting'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                email: initialData.email,
                password: '',
                role: initialData.role
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        if (!isEditing) {
            setFormData({ name: '', email: '', password: '', role: 'admitting' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500 transition-all"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500 transition-all"
                        required
                    />
                </div>
                {!isEditing && (
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500 transition-all"
                            required={!isEditing}
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500 transition-all"
                    >
                        <option value="admitting">Admitting</option>
                        <option value="billing">Billing</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                >
                    {isEditing ? 'Update User' : 'Create User'}
                </button>
            </div>
        </form>
    );
};

const StatCard = ({ title, value, color }) => {
    const bgColor = `bg-${color}-50`;
    const textColor = `text-${color}-700`;
    const iconColor = `text-${color}-500`;
    
    return (
        <div className={`bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center`}>
            <div className={`rounded-full p-3 ${bgColor} mr-4`}>
                <svg className={`w-7 h-7 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <div>
                <div className="text-sm font-medium text-gray-500">
                    {title}
                </div>
                <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
            </div>
        </div>
    );
};

const RoleBadge = ({ role }) => {
    const colors = {
        billing: 'bg-green-100 text-green-800',
        admitting: 'bg-blue-100 text-blue-800',
        admin: 'bg-purple-100 text-purple-800' // Add admin styling
    };
    
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colors[role]}`}>
            {role}
        </span>
    );
};

const ActionButton = ({ children, onClick, type = 'default' }) => {
    const colors = {
        default: 'text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200',
        edit: 'text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100',
        delete: 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100'
    };
    
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${colors[type]}`}
        >
            {children}
        </button>
    );
};

const LoadingSkeleton = () => (
    <tr>
        <td colSpan="4" className="px-6 py-8 text-center">
            <div className="animate-pulse space-y-3 flex flex-col items-center">
                <div className="h-4 w-52 bg-gray-200 rounded"></div>
                <div className="h-4 w-40 bg-gray-200 rounded"></div>
            </div>
        </td>
    </tr>
);

const AdminCreateModal = ({ isOpen, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full transform transition-all ease-in-out duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Create Admin User</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-red-500 focus:border-red-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            Create Admin
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total: 0,
        per_page: 10
    });
    const [stats, setStats] = useState({
        total: 0,
        admitting: 0,
        billing: 0
    });
    const [showAdmins, setShowAdmins] = useState(false);
    const [showAdminModal, setShowAdminModal] = useState(false);

    useEffect(() => {
        fetchUsers(1);
    }, []);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/users?page=${page}`);
            
            if (response.data.status) {
                // Filter users based on showAdmins state
                const filteredUsers = response.data.data.data.filter(user => 
                    showAdmins ? user.role === 'admin' : user.role !== 'admin'
                );
                setUsers(filteredUsers);
                
                // Update pagination with filtered count
                setPagination({
                    current_page: response.data.data.current_page,
                    total: filteredUsers.length,
                    per_page: response.data.data.per_page
                });
                
                // Calculate stats for non-admin users only
                const userStats = response.data.data.data
                    .filter(user => user.role !== 'admin')
                    .reduce((acc, user) => {
                        acc[user.role] = (acc[user.role] || 0) + 1;
                        acc.total += 1;
                        return acc;
                    }, { total: 0, admitting: 0, billing: 0 });
                
                setStats(userStats);
            } else {
                toast.error(response.data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (formData) => {
        try {
            const response = await axiosClient.put(`/users/${selectedUser.id}`, formData);
            
            if (response.data.status) {
                toast.success('User updated successfully');
                setSelectedUser(null);
                fetchUsers();
            } else {
                toast.error(response.data.message || 'Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleCreateUser = async (formData) => {
        try {
            const response = await axiosClient.post('/users/register', formData);
            
            if (response.data.status) {
                toast.success('User created successfully');
                fetchUsers();
            } else {
                toast.error(response.data.message || 'Failed to create user');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleCreateAdmin = async (formData) => {
        try {
            const response = await axiosClient.post('/users/register', {
                ...formData,
                role: 'admin'
            });
            
            if (response.data.status) {
                toast.success('Admin user created successfully');
                fetchUsers();
            } else {
                toast.error(response.data.message || 'Failed to create admin user');
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            toast.error(error.response?.data?.message || 'Failed to create admin user');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        try {
            const response = await axiosClient.delete(`/users/${userId}`);
            
            if (response.data.status) {
                toast.success('User deleted successfully');
                fetchUsers();
            } else {
                toast.error(response.data.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleLogout = async () => {
        try {
            await auth.logout();
            navigate('/', { replace: true });
        } catch (error) {
            toast.error('Failed to logout');
        }
    };

    return (
        <Layout
            onLogout={handleLogout}
            showAdmins={showAdmins}
            onToggleAdmins={() => {
                setShowAdmins(!showAdmins);
                fetchUsers(1);
            }}
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard title="Total Users" value={stats.total} color="blue" />
                <StatCard title="Admitting Users" value={stats.admitting} color="blue" />
                <StatCard title="Billing Users" value={stats.billing} color="green" />
            </div>

            {/* Create/Edit User Form */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                    {selectedUser ? (
                        <>
                            <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit User: {selectedUser.name}
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            Create New User
                        </>
                    )}
                </h2>
                {selectedUser && (
                    <div className="mb-4">
                        <button 
                            onClick={() => setSelectedUser(null)} 
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Cancel editing
                        </button>
                    </div>
                )}
                <UserForm 
                    onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
                    initialData={selectedUser || null}
                    isEditing={!!selectedUser}
                />
            </div>

            {/* Users List with Pagination */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                    <p className="text-sm text-gray-500">View, edit and delete system users</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <LoadingSkeleton />
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No users found. Create one to get started.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.role !== 'admin' && (
                                                <div className="flex space-x-2">
                                                    <ActionButton 
                                                        type="edit" 
                                                        onClick={() => setSelectedUser(user)}
                                                    >
                                                        Edit
                                                    </ActionButton>
                                                    <ActionButton 
                                                        type="delete" 
                                                        onClick={() => handleDelete(user.id)}
                                                    >
                                                        Delete
                                                    </ActionButton>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {users.length > 0 && (
                    <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => fetchUsers(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => fetchUsers(pagination.current_page + 1)}
                                disabled={pagination.current_page === Math.ceil(pagination.total / pagination.per_page)}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span>
                                    {' '}to{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-medium">{pagination.total}</span>
                                    {' '}results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => fetchUsers(pagination.current_page - 1)}
                                        disabled={pagination.current_page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    
                                    {/* Page number buttons - only show a few for brevity */}
                                    {Array.from({ length: Math.min(3, Math.ceil(pagination.total / pagination.per_page)) }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => fetchUsers(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                                pagination.current_page === i + 1
                                                    ? 'z-10 bg-red-50 border-red-500 text-red-600'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    
                                    {Math.ceil(pagination.total / pagination.per_page) > 3 && (
                                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                            ...
                                        </span>
                                    )}
                                    
                                    <button
                                        onClick={() => fetchUsers(pagination.current_page + 1)}
                                        disabled={pagination.current_page === Math.ceil(pagination.total / pagination.per_page)}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AdminCreateModal
                isOpen={showAdminModal}
                onClose={() => setShowAdminModal(false)}
                onConfirm={handleCreateAdmin}
            />
        </Layout>
    );
};

export default AdminDashboard;