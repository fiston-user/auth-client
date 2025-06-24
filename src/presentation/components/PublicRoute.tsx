import { Navigate } from 'react-router-dom';
import { useAuth } from '../../application/hooks/useAuth';
import { ROUTES } from '../../shared/constants';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect authenticated users to appropriate page
  if (isAuthenticated && user) {
    if (!user.emailVerified) {
      return <Navigate to={ROUTES.VERIFY_EMAIL} replace />;
    }
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};