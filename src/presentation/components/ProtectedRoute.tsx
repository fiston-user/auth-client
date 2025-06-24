import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../application/hooks/useAuth';
import { LocalStorageService } from '../../infrastructure/storage/LocalStorage';
import { ROUTES } from '../../shared/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireEmailVerification = true 
}) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has valid tokens
  const hasTokens = LocalStorageService.isAuthenticated();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !hasTokens) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If we require email verification and user exists but email not verified
  if (requireEmailVerification && user && !user.emailVerified) {
    // Don't redirect if already on verification page
    if (location.pathname !== ROUTES.VERIFY_EMAIL) {
      return <Navigate to={ROUTES.VERIFY_EMAIL} replace />;
    }
  }

  // If we're authenticated but don't have user data yet, show loading
  if (isAuthenticated && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
};