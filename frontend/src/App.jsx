import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import './styles/global.css';

import Landing from './pages/auth/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentEvents from './pages/student/StudentEvents';
import MyGigs from './pages/student/MyGigs';
import StudentWallet from './pages/student/StudentWallet';

import StakeholderDashboard from './pages/stakeholder/StakeholderDashboard';
import StakeholderEvents from './pages/stakeholder/StakeholderEvents';
import CreateEvent from './pages/stakeholder/CreateEvent';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAttendance from './pages/admin/AdminAttendance';
import AdminUsers from './pages/admin/AdminUsers';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1a1a2e', color: '#f0f0ff', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', fontSize: '14px' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRole="STUDENT"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/events" element={<ProtectedRoute allowedRole="STUDENT"><StudentEvents /></ProtectedRoute>} />
          <Route path="/student/my-gigs" element={<ProtectedRoute allowedRole="STUDENT"><MyGigs /></ProtectedRoute>} />
          <Route path="/student/wallet" element={<ProtectedRoute allowedRole="STUDENT"><StudentWallet /></ProtectedRoute>} />
          <Route path="/stakeholder/dashboard" element={<ProtectedRoute allowedRole="STAKEHOLDER"><StakeholderDashboard /></ProtectedRoute>} />
          <Route path="/stakeholder/events" element={<ProtectedRoute allowedRole="STAKEHOLDER"><StakeholderEvents /></ProtectedRoute>} />
          <Route path="/stakeholder/create-event" element={<ProtectedRoute allowedRole="STAKEHOLDER"><CreateEvent /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute allowedRole="ADMIN"><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/attendance" element={<ProtectedRoute allowedRole="ADMIN"><AdminAttendance /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRole="ADMIN"><AdminUsers /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
