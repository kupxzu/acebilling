import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axiosClient, { auth } from '../../utils/axios'; // Assuming auth and axiosClient are correctly set up
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../common/Layout'; // Assuming this Layout component exists

// --- Reusable UI Components (Assumed to be styled as per previous enhancements) ---

const UserForm = ({ onSubmit, initialData = null, isEditing = false }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'admitting'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                password: '', // Password not pre-filled
                role: initialData.role || 'admitting'
            });
        } else {
            setFormData({ name: '', email: '', password: '', role: 'admitting' });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // The onSubmit prop is expected to be an async function that handles the API call
            // and any related success/error toasts and state updates in the parent.
            await onSubmit(formData); 
            // Reset form only if creating a new user (isEditing is false) AND submission was successful.
            // Success is now implicitly handled by the parent via handleFormSubmitSuccess.
            if (!isEditing) { 
                setFormData({ name: '', email: '', password: '', role: 'admitting' });
            }
        } catch (error) {
            // This catch is a fallback; primary error handling should be in parent's onSubmit handlers
            console.error("UserForm submission error (should be handled by parent):", error);
            toast.error("An unexpected error occurred in the form.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const inputBaseClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-300/80 shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-150 ease-in-out placeholder-gray-400";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={inputBaseClasses} placeholder="Enter full name" required />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={inputBaseClasses} placeholder="Enter email address" required />
                </div>
                {!isEditing && (
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className={inputBaseClasses} placeholder="Min. 8 characters" required={!isEditing} minLength="8"/>
                    </div>
                )}
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                    <select 
                        id="role" 
                        name="role" 
                        value={formData.role} 
                        onChange={handleChange} 
                        className={`${inputBaseClasses} appearance-none`}
                        disabled={isEditing && initialData?.role === 'admin'} // Prevent changing admin role via this form if editing an admin
                    >
                        <option value="admitting">Admitting</option>
                        <option value="billing">Billing</option>
                        {/* Show Admin option only if editing an existing admin, otherwise it's handled by AdminCreateModal */}
                        {isEditing && initialData?.role === 'admin' && <option value="admin">Admin</option>}
                    </select>
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (isEditing ? 'Update User' : 'Create User')}
                </button>
            </div>
        </form>
    );
};

const StatCard = ({ title, value, IconComponent, colorScheme = "indigo" }) => {
    const colorMap = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', icon: 'text-indigo-500' },
        blue: { bg: 'bg-sky-50', text: 'text-sky-700', icon: 'text-sky-500' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
    };
    const colors = colorMap[colorScheme] || colorMap.indigo;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200/60 flex items-center space-x-4 hover:shadow-indigo-100 transition-shadow duration-300 ease-in-out">
            <div className={`flex-shrink-0 rounded-full p-3.5 ${colors.bg}`}>
                <IconComponent className={`w-7 h-7 ${colors.icon}`} />
            </div>
            <div className="min-w-0">
                <div className="text-sm font-medium text-gray-500 truncate">{title}</div>
                <div className={`text-3xl font-bold ${colors.text} truncate`}>{value}</div>
            </div>
        </div>
    );
};

const UsersIcon = (props) => <svg {...props} strokeWidth={1.5} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
const AdmittingIcon = (props) => <svg {...props} strokeWidth={1.5} fill="none" stroke="currentColor" viewBox="0 0 24 24" ><path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-.95.595.056 1.012.546 1.012 1.126M10.343 3.94c-.538-.085-1.074-.156-1.628-.207C6.509 3.442 4.5 5.442 4.5 7.942v8.616c0 2.5 2.009 4.5 4.5 4.5h2.667M10.343 3.94c.563.054 1.141.097 1.74.127 2.04.113 3.853 1.89 3.853 3.97v8.56c0 1.008-.393 1.956-1.093 2.656M16.807 4.934a2.808 2.808 0 114.563 3.055 2.808 2.808 0 01-4.563-3.055zM14.023 16.487L10.5 20.01 7.72 17.23m6.303-3.783l3.527-3.527L14.023 16.487zm0 0L20.01 10.5M16.807 4.934L20.01 1.727" /></svg>;
const BillingIcon = (props) => <svg {...props} strokeWidth={1.5} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 012.25 4.5h.75A.75.75 0 013.75 5.25v.75m0 0h.75A.75.75 0 004.5 6v.75m0 0v.75A.75.75 0 013.75 8.25h-.75A.75.75 0 012.25 7.5V6.75M3 9.75h.75A.75.75 0 014.5 10.5v.75m0 0v.75a.75.75 0 01-.75.75h-.75A.75.75 0 012.25 12v-.75m0 0V9.75M9 15q.324 0 .618-.021M9 15V6.75m0 8.25v.75A1.5 1.5 0 017.5 18v0A1.5 1.5 0 019 16.5m0-9.75a48.452 48.452 0 0110.5 0m-10.5 0V3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v3.375m0 9.75V18a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25V6.75m0 9.75h3.75a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25h-1.5A2.25 2.25 0 0013.5 6.75v9.75Z" /></svg>;

const RoleBadge = ({ role }) => {
    const baseClasses = "px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full capitalize tracking-wide";
    const colors = {
        billing: `${baseClasses} bg-emerald-100 text-emerald-800 border border-emerald-200`,
        admitting: `${baseClasses} bg-sky-100 text-sky-800 border border-sky-200`,
        admin: `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`
    };
    return <span className={colors[role?.toLowerCase()] || `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`}>{role || 'Unknown'}</span>;
};

const ActionButton = ({ children, onClick, type = 'default', Icon, disabled = false }) => {
    const base = "px-3.5 py-1.5 rounded-lg font-medium text-xs transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md";
    const colors = {
        default: `${base} text-gray-700 hover:text-black bg-gray-100 hover:bg-gray-200 focus-visible:ring-gray-400`,
        edit: `${base} text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 focus-visible:ring-indigo-500`,
        delete: `${base} text-red-700 hover:text-red-900 bg-red-100 hover:bg-red-200 focus-visible:ring-red-500`
    };
    return (
        <button onClick={onClick} disabled={disabled} className={colors[type]}>
            {Icon && <Icon className="w-4 h-4" />} 
            <span>{children}</span>
        </button>
    );
};

const EditIcon = (props) => <svg {...props} strokeWidth={2} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const DeleteIcon = (props) => <svg {...props} strokeWidth={2} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.22.094M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AddIcon = (props) => <svg {...props} strokeWidth={2} fill="none" stroke="currentColor" viewBox="0 0 24 24" ><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const BackIcon = (props) => <svg {...props} strokeWidth={2} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>;

const LoadingSkeleton = ({ rows = 5, cols = 4 }) => (
    <>
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={`skel-row-${rowIndex}`} className="animate-pulse">
                {Array.from({ length: cols }).map((_, colIndex) => (
                    <td key={`skel-col-${colIndex}`} className="px-6 py-4 whitespace-nowrap">
                        <div className={`h-5 rounded-md bg-gray-200/80 ${colIndex === 0 ? 'w-3/4' : colIndex === 1 ? 'w-5/6' : 'w-1/2'}`}></div>
                    </td>
                ))}
            </tr>
        ))}
    </>
);

const AdminCreateModal = ({ isOpen, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const inputBaseClasses = "w-full px-4 py-2.5 rounded-lg border border-gray-300/80 shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-150 ease-in-out placeholder-gray-400";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(isSubmitting) return;
        setIsSubmitting(true);
        // onConfirm is expected to be async and handle API calls
        await onConfirm(formData); 
        // The parent (onConfirm) is responsible for closing the modal and resetting if successful
        // No need to call onClose() here if onConfirm handles it
        setIsSubmitting(false);
    };

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', email: '', password: '', role: 'admin' });
        }
    }, [isOpen]);

    if (!isOpen) return null;
    // Add CSS for modal animations (fadeIn, slideUp) to your global CSS file if not already there
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out animate-fade-in" role="dialog" aria-modal="true">
            <div className="bg-white rounded-xl shadow-2xl p-7 max-w-lg w-full transform transition-all ease-out duration-300 animate-slide-up">
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200/80">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <AddIcon className="w-6 h-6 mr-2 text-purple-600"/> Create New Admin
                    </h3>
                    <button onClick={onClose} aria-label="Close modal" className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="admin-name" className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                        <input id="admin-name" type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputBaseClasses} placeholder="Admin's full name"/>
                    </div>
                    <div>
                        <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                        <input id="admin-email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputBaseClasses} placeholder="Admin's email address"/>
                    </div>
                    <div>
                        <label htmlFor="admin-password"className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <input id="admin-password" type="password" required minLength="8" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={inputBaseClasses} placeholder="Set a strong password (min. 8)"/>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200/80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 disabled:opacity-60 flex items-center justify-center min-w-[150px]">
                           {isSubmitting ? (<><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Processing...</>) : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PaginationControls = ({ pagination, onPageChange, activeTab }) => {
    if (!pagination || pagination.total <= 0 || pagination.last_page <= 1) {
        return null;
    }

    const handlePageClick = (page) => {
        if (page >= 1 && page <= pagination.last_page && page !== pagination.current_page) {
            onPageChange(page, activeTab);
        }
    };
    
    let pageNumbers = [];
    const MAX_PAGES_SHOWN = 5;
    if (pagination.last_page <= MAX_PAGES_SHOWN) {
        pageNumbers = Array.from({ length: pagination.last_page }, (_, i) => i + 1);
    } else {
        let startPage = Math.max(1, pagination.current_page - Math.floor(MAX_PAGES_SHOWN / 2));
        let endPage = Math.min(pagination.last_page, startPage + MAX_PAGES_SHOWN - 1);
        if (endPage - startPage + 1 < MAX_PAGES_SHOWN) {
            startPage = Math.max(1, endPage - MAX_PAGES_SHOWN + 1);
        }
        if (startPage > 1) {
            pageNumbers.push(1);
            if (startPage > 2) pageNumbers.push('...');
        }
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }
        if (endPage < pagination.last_page) {
            if (endPage < pagination.last_page - 1) pageNumbers.push('...');
            pageNumbers.push(pagination.last_page);
        }
    }


    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200/80 sm:px-6 mt-auto">
            <div className="flex-1 flex justify-between sm:hidden">
                <button onClick={() => handlePageClick(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300/80 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <button onClick={() => handlePageClick(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300/80 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Showing <span className="font-semibold">{pagination.total > 0 ? ((pagination.current_page - 1) * pagination.per_page) + 1 : 0}</span>
                        {' '}to <span className="font-semibold">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span>
                        {' '}of <span className="font-semibold">{pagination.total}</span> results
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button onClick={() => handlePageClick(pagination.current_page - 1)} disabled={pagination.current_page === 1} className="relative inline-flex items-center px-2.5 py-2 rounded-l-md border border-gray-300/80 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"><span className="sr-only">Previous</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
                        {pageNumbers.map((page, index) => (
                           page === '...' 
                           ? <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300/80 bg-white text-sm font-medium text-gray-700">...</span>
                           : <button key={page} onClick={() => handlePageClick(page)} aria-current={pagination.current_page === page ? 'page' : undefined} className={`relative inline-flex items-center px-4 py-2 border border-gray-300/80 bg-white text-sm font-medium hover:bg-gray-100 ${pagination.current_page === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'text-gray-700'}`}>{page}</button>
                        ))}
                        <button onClick={() => handlePageClick(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page} className="relative inline-flex items-center px-2.5 py-2 rounded-r-md border border-gray-300/80 bg-white text-sm font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"><span className="sr-only">Next</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
                    </nav>
                </div>
            </div>
        </div>
    );
};


const AdminDashboard = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [pagination, setPagination] = useState({ current_page: 1, total: 0, per_page: 8, last_page: 1 });
    const [stats, setStats] = useState({ totalStaff: 0, admitting: 0, billing: 0, admins: 0 });
    const [activeTab, setActiveTab] = useState('users'); // 'users' or 'admins'
    const [showAdminModal, setShowAdminModal] = useState(false);

    const fetchUsers = useCallback(async (page = 1, currentTab = activeTab) => {
        setIsLoading(true);
        if (page === 1) setSelectedUser(null); // Clear selection only when explicitly going to page 1 or changing tabs

        try {
            // *** API INTEGRATION ASSUMPTION ***
            // Ideally, the API handles filtering by role:
            // e.g., /users?page=${page}&per_page=${pagination.per_page}&role=${currentTab === 'admins' ? 'admin' : 'staff'}
            // Or /users/admins?page=... and /users/staff?page=...
            // For now, we use /users and filter client-side as per original structure.
            const response = await axiosClient.get(`/users?page=${page}&per_page=${pagination.per_page}`);

            if (response && response.fromCancel) {
                console.log('Fetch users request was canceled.');
                // Potentially keep existing users or set to empty. For now, keep them to avoid UI flicker.
                // setUsers([]); 
                setPagination(prev => ({ ...prev, current_page: page, total: 0, last_page: 1 }));
                // setStats({ totalStaff: 0, admitting: 0, billing: 0, admins: 0 }); // Don't reset stats on cancel
                setIsLoading(false);
                return;
            }

            if (response?.data?.status) {
                const apiData = response.data.data; // This should be the object containing pagination and user list
                const usersFromApi = apiData?.data; // The array of user objects

                if (!Array.isArray(usersFromApi)) {
                    console.error('API Error: Expected an array of users but received:', usersFromApi);
                    toast.error('Received invalid user data from the server.');
                    setUsers([]);
                    setPagination(prev => ({ ...prev, current_page: page, total: 0, last_page: 1 }));
                    setIsLoading(false);
                    return;
                }
                
                // Client-side filtering based on tab
                const filteredForDisplay = usersFromApi.filter(user =>
                    currentTab === 'admins' ? user.role === 'admin' : user.role !== 'admin'
                );
                setUsers(filteredForDisplay);

                // Update pagination based on API response for the fetched set (could be all users or pre-filtered by API)
                // If API doesn't filter by role, `apiData.total` is for ALL users.
                // The displayed table pagination should ideally reflect the total for the *current tab's filter*.
                // This is a common challenge with client-side filtering of paginated data.
                // For simplicity, if API gives total, we use it, but it might not match filteredUsers total across all pages.
                setPagination({
                    current_page: apiData.current_page || 1,
                    total: apiData.total || usersFromApi.length, // Use API total, or if not available, total on current page
                    per_page: apiData.per_page || pagination.per_page,
                    last_page: apiData.last_page || Math.ceil(usersFromApi.length / (apiData.per_page || pagination.per_page)),
                });
                
                // Calculate stats based on ALL users returned by the API for accuracy
                // This assumes the /users endpoint provides all user types for stats.
                // Or, a separate /stats endpoint would be better.
                const allUsersForStats = usersFromApi; // Or, if API returns all users regardless of page, use that.
                                                    // For now, stats reflect current page's users from API.
                const calculatedStats = allUsersForStats.reduce((acc, user) => {
                    if (user.role === 'admin') {
                        acc.admins = (acc.admins || 0) + 1;
                    } else {
                        acc.staff = (acc.staff || 0) + 1;
                        if (user.role === 'admitting') acc.admitting = (acc.admitting || 0) + 1;
                        if (user.role === 'billing') acc.billing = (acc.billing || 0) + 1;
                    }
                    return acc;
                }, { staff: 0, admitting: 0, billing: 0, admins: 0 });
                setStats({totalStaff: calculatedStats.staff, admitting: calculatedStats.admitting, billing: calculatedStats.billing, admins: calculatedStats.admins });

            } else if (response?.data && !response.data.status) {
                toast.error(response.data.message || 'Failed to fetch users: Server indicated an issue.');
                setUsers([]);
                setPagination(prev => ({ ...prev, current_page: page, total: 0, last_page: 1 }));
            } else if (!response) { // Should be rare if interceptors work
                toast.error('No response from server.');
                setUsers([]);
            }
        } catch (error) {
            if (!(axiosClient.isCancel && axiosClient.isCancel(error))) { // Check for actual errors, not cancellations handled by interceptor
                console.error('Critical error fetching users:', error);
                toast.error(error.response?.data?.message || 'An unexpected error occurred.');
                setUsers([]); // Clear users on critical error
            }
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, pagination.per_page]); // Dependencies for useCallback

    useEffect(() => {
        fetchUsers(1, activeTab); // Fetch on initial load and when activeTab changes
    }, [activeTab, fetchUsers]); // fetchUsers is now a dependency


    const handleFormSubmitSuccess = useCallback(() => {
        // Re-fetch the current page of the currently active tab
        fetchUsers(pagination.current_page, activeTab);
        setSelectedUser(null);
        setShowAdminModal(false); // Ensure modal closes
    }, [fetchUsers, pagination.current_page, activeTab]);


    const handleUpdateUser = useCallback(async (formDataToSubmit) => {
        if (!selectedUser?.id) return;
        try {
            const response = await axiosClient.put(`/users/${selectedUser.id}`, formDataToSubmit);
            if (response.data.status) {
                toast.success('User updated successfully!');
                handleFormSubmitSuccess();
            } else {
                toast.error(response.data.message || 'Failed to update user.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating user.');
            console.error('Error updating user:', error);
        }
    }, [selectedUser, handleFormSubmitSuccess]);

    const handleCreateUser = useCallback(async (formDataToSubmit) => {
        try {
            const response = await axiosClient.post('/users/register', formDataToSubmit);
            if (response.data.status) {
                toast.success('Staff user created successfully!');
                handleFormSubmitSuccess();
            } else {
                toast.error(response.data.message || 'Failed to create staff user.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating staff user.');
            console.error('Error creating staff user:', error);
        }
    }, [handleFormSubmitSuccess]);
    
    const handleCreateAdminConfirm = useCallback(async (formDataFromModal) => {
        try {
            // Ensure role is 'admin' even if modal form changes it (though it's fixed in modal state)
            const response = await axiosClient.post('/users/register', { ...formDataFromModal, role: 'admin' });
            if (response.data.status) {
                toast.success('Admin user created successfully!');
                handleFormSubmitSuccess(); // This will close modal and refetch
            } else {
                toast.error(response.data.message || 'Failed to create admin user.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating admin user.');
            console.error('Error creating admin user:', error);
        }
    }, [handleFormSubmitSuccess]);

    const handleDeleteUser = useCallback(async (userId) => {
        if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
        try {
            const response = await axiosClient.delete(`/users/${userId}`);
            if (response.data.status) {
                toast.success('User deleted successfully.');
                // After delete, fetch page 1 of the current tab, as current page might become empty
                fetchUsers(1, activeTab); 
            } else {
                toast.error(response.data.message || 'Failed to delete user.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting user.');
            console.error('Error deleting user:', error);
        }
    }, [fetchUsers, activeTab]);

    const handleLogout = useCallback(async () => {
        try {
            if (auth?.logout && typeof auth.logout === 'function') {
                await auth.logout();
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            navigate('/', { replace: true });
        } catch (error) {
            toast.error('Logout failed. Please try again.');
        }
    }, [navigate]);
    
    const TabButton = ({label, tabName, Icon}) => (
        <button
            onClick={() => {
                setActiveTab(tabName);
                // fetchUsers will be called by useEffect watching activeTab
            }}
            className={`flex items-center space-x-2.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500
                ${activeTab === tabName 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 bg-white border border-gray-200/80'}`}
        >
           {Icon && <Icon className={`w-5 h-5 ${activeTab === tabName ? 'text-white/90' : 'text-gray-500'}`} />} <span>{label}</span>
        </button>
    );

    return (
        <Layout onLogout={handleLogout}>
            <div className="p-4 md:p-6 lg:p-8 space-y-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">Admin Dashboard</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                    <StatCard title="Total Users" value={stats.totalStaff} IconComponent={UsersIcon} colorScheme="indigo" />
                    <StatCard title="Admitting" value={stats.admitting} IconComponent={AdmittingIcon} colorScheme="blue" />
                    <StatCard title="Billing" value={stats.billing} IconComponent={BillingIcon} colorScheme="green" />
                    <StatCard title="Administrators" value={stats.admins} IconComponent={UsersIcon} colorScheme="purple" />
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 pb-5 border-b border-gray-200/80">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center mb-3 sm:mb-0">
                            {selectedUser ? (
                                <>
                                    <EditIcon className="w-5 h-5 mr-2.5 text-indigo-600" /> Edit Staff: <span className="ml-1.5 font-bold text-indigo-700">{selectedUser.name}</span>
                                </>
                            ) : (
                                <>
                                    <AddIcon className="w-5 h-5 mr-2.5 text-indigo-600" /> Create New Staff
                                </>
                            )}
                        </h2>
                        {selectedUser && (
                             <button onClick={() => setSelectedUser(null)} className="text-sm text-gray-600 hover:text-indigo-600 flex items-center transition-colors py-1.5 px-3 rounded-lg hover:bg-indigo-50 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500">
                                <BackIcon className="w-4 h-4 mr-1.5" /> Cancel Edit
                            </button>
                        )}
                    </div>
                    <UserForm
                        onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
                        initialData={selectedUser}
                        isEditing={!!selectedUser}
                    />
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-800">User Account Management</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage staff and administrator accounts for the system.</p>
                        </div>
                        <div className="flex space-x-2 self-start sm:self-center">
                           <TabButton label="Staff Users" tabName="users" Icon={UsersIcon}/>
                           <TabButton label="Admin Users" tabName="admins" Icon={UsersIcon}/>
                        </div>
                    </div>
                    
                    {activeTab === 'admins' && (
                        <div className="px-6 py-4 bg-purple-50 border-b border-purple-200/70 flex justify-start">
                            <button 
                                onClick={() => setShowAdminModal(true)}
                                className="flex items-center space-x-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 transition-colors shadow-md hover:shadow-lg"
                            >
                                <AddIcon className="w-5 h-5" />
                                <span>Create New Admin</span>
                            </button>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200/80">
                            <thead className="bg-gray-50/80">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[150px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200/70">
                                {isLoading ? (
                                    <LoadingSkeleton rows={pagination.per_page} cols={4} />
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center text-gray-500 text-lg">
                                            <div className="flex flex-col items-center">
                                                <UsersIcon className="w-12 h-12 text-gray-300 mb-3"/>
                                                No {activeTab === 'admins' ? 'admin' : 'staff'} users found.
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50/70 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">ID: {user.id}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <RoleBadge role={user.role} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {/* Prevent actions on admins from the general staff editing form, direct to admin management if needed */}
                                                {user.role !== 'admin' ? (
                                                    <div className="flex space-x-2.5">
                                                        <ActionButton type="edit" Icon={EditIcon} onClick={() => {setSelectedUser(user); /* Optionally switch tab if needed, but form handles different roles */}}>Edit</ActionButton>
                                                        <ActionButton type="delete" Icon={DeleteIcon} onClick={() => handleDeleteUser(user.id)}>Delete</ActionButton>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic px-3.5 py-1.5">Admins cannot be edited. :p</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <PaginationControls pagination={pagination} onPageChange={fetchUsers} activeTab={activeTab} />
                </div>

                <AdminCreateModal
                    isOpen={showAdminModal}
                    onClose={() => setShowAdminModal(false)}
                    onConfirm={handleCreateAdminConfirm}
                />
            </div>
        </Layout>
    );
};

export default AdminDashboard;