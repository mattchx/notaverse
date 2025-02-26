import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to={`/login?from=${location.pathname}`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;