import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles) {
    if (allowedRoles.includes('MANAGEMENT')) {
      if (user.role === 'profesor') return <Navigate to="/profesor" />;
    } else if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
  }

  return <Outlet />;
};
