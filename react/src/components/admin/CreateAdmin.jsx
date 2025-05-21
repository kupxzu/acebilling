import { useState, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient, { auth } from '../../utils/axios'; // Assuming auth is correctly exported
import Layout from '../common/Layout';

// --- Icon Components (Consider moving to a shared file if used across many components) ---
const AddUserIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>;
const BackArrowIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>;
const LoadingSpinnerIcon = (props) => <svg {...props} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>;
// --- End Icon Components ---

const CreateAdmin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin' // Default role for this form
    });
    
    // Consistent input styling with green theme for focus
    const inputBaseClasses = "w-full px-4 py-3 rounded-xl border border-slate-300/80 shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-150 ease-in-out placeholder-slate-400";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        
        try {
            const response = await axiosClient.post('/users/register', formData);
            if (response.data.status) {
                toast.success('Admin user created successfully!');
                navigate('/admin'); // Navigate to admin dashboard or user list
            } else {
                toast.error(response.data.message || 'Failed to create admin user. Please check the details.');
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            if (error.response?.data?.errors) {
                // Display multiple validation errors if API sends them
                Object.values(error.response.data.errors).forEach(errArray => {
                    errArray.forEach(errMsg => toast.error(errMsg));
                });
            } else {
                toast.error(error.response?.data?.message || 'An unexpected error occurred while creating the admin.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Logout handler to pass to Layout
    const handleLogout = useCallback(async () => {
        try {
            if (auth?.logout && typeof auth.logout === 'function') {
                await auth.logout();
            } else {
                // Fallback or if auth structure is different/not available
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                console.warn("auth.logout function not found, used fallback localStorage clear.");
            }
            navigate('/', { replace: true });
        } catch (error) {
            toast.error('Logout failed. Please try again.');
            console.error("Logout error:", error);
        }
    }, [navigate]);


    return (
        <Layout onLogout={handleLogout}> {/* Pass the logout handler to Layout */}
            <div className="max-w-2xl mx-auto py-8 md:py-12 px-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200/60 p-6 sm:p-8 md:p-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-5 border-b border-gray-200/80">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center mb-3 sm:mb-0">
                            <AddUserIcon className="w-7 h-7 mr-3 text-emerald-600" /> 
                            Create New Administrator
                            
                        </h2>
                        
                        <button
                            onClick={() => navigate('/admin')} // Assuming '/admin' is the dashboard route
                            className="flex items-center space-x-1.5 text-sm text-slate-600 hover:text-emerald-600 font-medium px-3.5 py-2 rounded-lg hover:bg-emerald-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                            <BackArrowIcon className="w-4 h-4" />
                            <span>Back to Dashboard</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className={inputBaseClasses}
                                placeholder="Enter admin's full name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className={inputBaseClasses}
                                placeholder="Enter admin's email address"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength="8"
                                value={formData.password}
                                onChange={handleChange}
                                className={inputBaseClasses}
                                placeholder="Enter a strong password (min. 8 characters)"
                            />
                        </div>
                        {/* Role is fixed to 'admin' and not shown in the form */}
                        {/* <input type="hidden" name="role" value={formData.role} /> */}

                        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[160px] shadow-md hover:shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinnerIcon className="animate-spin h-5 w-5 text-white" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <AddUserIcon className="w-5 h-5" />
                                        <span>Create Admin</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5"><hr /><i>@this is force create admin!</i></label>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default CreateAdmin;