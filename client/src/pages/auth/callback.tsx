import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthCallbackPage() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Get state from URL params for CSRF protection
        const state = urlParams.get('state');

        // Exchange code for tokens
        const response = await fetch('/api/auth/google-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Authentication failed');
        }

        const { user } = await response.json();
        
        setStatus('success');
        toast({
          title: "Welcome!",
          description: `Successfully signed in as ${user.name}`,
        });

        // Check for redirect path from auth context
        const redirectPath = sessionStorage.getItem('auth_redirect');
        sessionStorage.removeItem('auth_redirect');
        
        // Redirect to original path or dashboard after a short delay
        setTimeout(() => {
          navigate(redirectPath || '/');
        }, 2000);

      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
        toast({
          title: "Authentication Failed",
          description: error instanceof Error ? error.message : 'Please try signing in again.',
          variant: "destructive",
        });
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          {status === 'processing' && (
            <>
              <div className="flex justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <CardDescription>
                Processing your authentication...
              </CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <CardDescription>
                Successfully authenticated! Redirecting to dashboard...
              </CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardDescription>
                Authentication failed: {errorMessage}
              </CardDescription>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
                data-testid="button-retry-login"
              >
                Try Again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}