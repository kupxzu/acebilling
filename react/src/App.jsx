import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import BillingDashboard from './components/billing/BillingDashboard';
import AdmittingDashboard from './components/admitting/AdmittingDashboard';
import PatientAdmission from './components/admitting/PatientAdmission';
import ProtectedRoute from './components/ProtectedRoute';

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
      </Routes>
    </Router>
  );
}

export default App;
