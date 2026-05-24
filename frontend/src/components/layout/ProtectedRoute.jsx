import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles) {
    if (allowedRoles.includes('MANAGEMENT')) {
      if (user.role === 'profesor') return <Navigate to="/profesor" />;
    } else if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
  }

  return <Outlet />;
};
