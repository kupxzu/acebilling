import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import BillingDashboard from './components/billing/BillingDashboard';
import AdmittingDashboard from './components/admitting/AdmittingDashboard';
import PatientAdmission from './components/admitting/PatientAdmission';
import ProtectedRoute from './components/ProtectedRoute';
import PatientList from './components/admitting/PatientList';
import EditPatient from './components/admitting/EditPatient';
import ViewPatient from './components/admitting/ViewPatient';
import StatementOfAccount from './components/billing/StatementOfAccount';
import ProgressBill from './components/billing/ProgressBill';
import PatientBills from './components/billing/PatientBills';
import Charges from './components/billing/Charges';
import Reports from './components/billing/Reports';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PatientPortal from './components/portal/PatientPortal';


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
      <RouterProvider
        router={createBrowserRouter([
          {
            path: '/',
            element: <Login />,
          },
          {
            path: '/billing',
            element: (
              <ProtectedRoute allowedRole="billing">
                <BillingDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: '/admitting',
            element: (
              <ProtectedRoute allowedRole="admitting">
                <AdmittingDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: '/admitting/new-patient',
            element: (
              <ProtectedRoute allowedRole="admitting">
                <PatientAdmission />
              </ProtectedRoute>
            ),
          },
          {
            path: '/admitting/patients',
            element: (
              <ProtectedRoute allowedRole="admitting">
                <PatientList />
              </ProtectedRoute>
            ),
          },
          {
            path: '/admitting/patients/:id',
            element: (
              <ProtectedRoute allowedRole="admitting">
                <EditPatient />
              </ProtectedRoute>
            ),
          },
          {
            path: '/admitting/patients/:id/view',
            element: (
              <ProtectedRoute allowedRole="admitting">
                <ViewPatient />
              </ProtectedRoute>
            ),
          },
          {
            path: '/billing/soa/:id',
            element: (
              <ProtectedRoute allowedRole="billing">
                <StatementOfAccount />
              </ProtectedRoute>
            ),
          },
          {
            path: '/billing/progress/:id',
            element: (
              <ProtectedRoute allowedRole="billing">
                <ProgressBill />
              </ProtectedRoute>
            ),
          },
          {
            path: '/billing/patients',
            element: (
              <ProtectedRoute allowedRole="billing">
                <PatientBills />
              </ProtectedRoute>
            ),
          },
          {
            path: '/billing/charges',
            element: (
              <ProtectedRoute allowedRole="billing">
                <Charges />
              </ProtectedRoute>
            ),
          },
          {
            path: '/billing/reports',
            element: (
              <ProtectedRoute allowedRole="billing">
                <Reports />
              </ProtectedRoute>
            ),
          },
          {
            path: '/p/:hash',
            element: <PatientPortal />
          },
        ])}
      />
    </>
  );
}

export default App;
