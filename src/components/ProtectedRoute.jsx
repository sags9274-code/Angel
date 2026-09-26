import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div className="page__loading">Loading...</div>; // Could be a nicer loader
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but role isn't allowed, maybe redirect to unauthorized or home
  // If allowedRoles is not provided, any logged in user can access
  if (allowedRoles && !allowedRoles.includes(role)) {
    // For now, redirect to home if they don't have the right role
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
