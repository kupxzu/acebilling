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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/billing"
          element={
            <ProtectedRoute allowedRole="billing">
              <BillingDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admitting"
          element={
            <ProtectedRoute allowedRole="admitting">
              <AdmittingDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admitting/new-patient"
          element={
            <ProtectedRoute allowedRole="admitting">
              <PatientAdmission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admitting/patients"
          element={
            <ProtectedRoute allowedRole="admitting">
              <PatientList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admitting/patients/:id"
          element={
            <ProtectedRoute allowedRole="admitting">
              <EditPatient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admitting/patients/:id/view"
          element={
            <ProtectedRoute allowedRole="admitting">
              <ViewPatient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/soa/:id"
          element={
            <ProtectedRoute allowedRole="billing">
              <StatementOfAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/progress/:id"
          element={
            <ProtectedRoute allowedRole="billing">
              <ProgressBill />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/patients"
          element={
            <ProtectedRoute allowedRole="billing">
              <PatientBills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/charges"
          element={
            <ProtectedRoute allowedRole="billing">
              <Charges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/reports"
          element={
            <ProtectedRoute allowedRole="billing">
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
