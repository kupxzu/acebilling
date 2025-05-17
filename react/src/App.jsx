import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Components
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Admitting Components
import AdmittingDashboard from './components/admitting/AdmittingDashboard';
import PatientAdmission from './components/admitting/PatientAdmission';
import PatientList from './components/admitting/PatientList';
import EditPatient from './components/admitting/EditPatient';
import ViewPatient from './components/admitting/ViewPatient';

// Billing Components
import BillingDashboard from './components/billing/BillingDashboard';
import StatementOfAccount from './components/billing/StatementOfAccount';
import ProgressBill from './components/billing/ProgressBill';
import PatientBills from './components/billing/PatientBills';

// Other Components
import PatientPortal from './components/portal/PatientPortal';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRoute from './components/AuthRoute';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import CreateAdmin from './components/admin/CreateAdmin';

// Route configurations
const authRoutes = [
  {
    path: '/',
    element: <AuthRoute><Login /></AuthRoute>,
  },
  {
    path: '/forgot-password',
    element: <AuthRoute><ForgotPassword /></AuthRoute>,
  },
  {
    path: '/reset-password/:token',
    element: <AuthRoute><ResetPassword /></AuthRoute>,
  }
];

const admittingRoutes = [
  {
    path: '/admitting',
    element: <ProtectedRoute allowedRole="admitting"><AdmittingDashboard /></ProtectedRoute>,
  },
  {
    path: '/admitting/new-patient',
    element: <ProtectedRoute allowedRole="admitting"><PatientAdmission /></ProtectedRoute>,
  },
  {
    path: '/admitting/patients',
    element: <ProtectedRoute allowedRole="admitting"><PatientList /></ProtectedRoute>,
  },
  {
    path: '/admitting/patients/:id',
    element: <ProtectedRoute allowedRole="admitting"><EditPatient /></ProtectedRoute>,
  },
  {
    path: '/admitting/patients/:id/view',
    element: <ProtectedRoute allowedRole="admitting"><ViewPatient /></ProtectedRoute>,
  }
];

const billingRoutes = [
  {
    path: '/billing',
    element: <ProtectedRoute allowedRole="billing"><BillingDashboard /></ProtectedRoute>,
  },
  {
    path: '/billing/soa/:id',
    element: <ProtectedRoute allowedRole="billing"><StatementOfAccount /></ProtectedRoute>,
  },
  {
    path: '/billing/progress/:id',
    element: <ProtectedRoute allowedRole="billing"><ProgressBill /></ProtectedRoute>,
  },
  {
    path: '/billing/patients',
    element: <ProtectedRoute allowedRole="billing"><PatientBills /></ProtectedRoute>,
  }
];

const adminRoutes = [
  {
    path: '/admin',
    element: <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>,
  },
  {
    path: '/admin/create-admin',
    element: <ProtectedRoute allowedRole="admin"><CreateAdmin /></ProtectedRoute>,
  }
];

// Change from createBrowserRouter to createHashRouter
const router = createHashRouter([
  ...authRoutes,
  ...admittingRoutes,
  ...billingRoutes,
  ...adminRoutes,
  {
    path: '/p/:hash',
    element: <PatientPortal />
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

function App() {
  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;