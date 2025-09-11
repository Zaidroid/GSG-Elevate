import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (redirectTo?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check authentication status
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const user = authData?.user || null;
  const isAuthenticated = !!user && !error;

  // Set initialized flag after first load
  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout'),
    onSuccess: () => {
      // Redirect to login page
      setLocation('/login');
      // Reload to clear all state
      window.location.reload();
    },
    onError: () => {
      // Even if logout fails, redirect to login
      setLocation('/login');
      window.location.reload();
    }
  });

  const login = (redirectTo?: string) => {
    // Store redirect path in sessionStorage
    if (redirectTo) {
      sessionStorage.setItem('auth_redirect', redirectTo);
    }
    setLocation('/login');
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading: isLoading || !isInitialized,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}