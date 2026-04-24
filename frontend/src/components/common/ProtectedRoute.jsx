import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleHome = {
  STUDENT: '/student/dashboard',
  STAKEHOLDER: '/stakeholder/dashboard',
  ADMIN: '/admin/dashboard',
};

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading...</span>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={roleHome[user.role] || '/login'} replace />;
  }

  return children;
}
