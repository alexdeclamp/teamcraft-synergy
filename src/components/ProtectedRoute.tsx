
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Set authorization state once auth checking is complete
    if (!isLoading) {
      setIsAuthorized(!!session);
    }
  }, [session, isLoading]);

  // Show loading state while auth is being checked
  if (isLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth page if not authorized, passing current location as state
  if (!isAuthorized) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  // Render children if authorized
  return <>{children}</>;
};

export default ProtectedRoute;
