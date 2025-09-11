import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function RouteGuard({ children, requireAuth = true }: RouteGuardProps) {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      // Store current path for redirect after login
      login(location);
    }
  }, [isAuthenticated, isLoading, requireAuth, location, login]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-32 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, don't render
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If authentication is not required but user is authenticated, redirect to dashboard
  if (!requireAuth && isAuthenticated && location === '/login') {
    return null; // Will be handled by useEffect in login page
  }

  return <>{children}</>;
}