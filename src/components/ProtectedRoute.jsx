import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * ProtectedRoute — guards private routes.
 * Redirects unauthenticated users to /login.
 * Optionally enforces a required role.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/explore" replace />;
  }

  return children;
};

export default ProtectedRoute;
