import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirectPath = sessionStorage.getItem('auth_redirect');
      sessionStorage.removeItem('auth_redirect');
      setLocation(redirectPath || '/');
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Generate Google OAuth URL and redirect
      const response = await fetch('/api/auth/google-url');
      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to get Google OAuth URL');
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Failed to initiate Google login. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-primary/20 rounded-lg mx-auto mb-4"></div>
          <div className="h-4 bg-primary/20 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Market Access Management</CardTitle>
          <CardDescription>
            Sign in to access the platform and manage your market entry initiatives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full"
            size="lg"
            data-testid="button-google-login"
          >
            <Chrome className="w-5 h-5 mr-2" />
            {isLoading ? "Connecting..." : "Continue with Google"}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our terms of service and privacy policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}