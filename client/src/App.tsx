import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { RouteGuard } from "@/components/auth/route-guard";
import Layout from "@/components/layout/layout";
import Dashboard from "@/pages/dashboard";
import Companies from "@/pages/companies";
import LegalSupport from "@/pages/legal-support";
import Documents from "@/pages/documents";
import Tasks from "@/pages/tasks";
import Analytics from "@/pages/analytics";
import Automation from "@/pages/automation";
import Hours from "@/pages/hours";
import Compliance from "@/pages/compliance";
import Partnerships from "@/pages/partnerships";
import Research from "@/pages/research";
import Settings from "@/pages/settings";
import UserManagement from "@/pages/user-management";
import LoginPage from "@/pages/auth/login";
import AuthCallbackPage from "@/pages/auth/callback";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes - no authentication required */}
      <Route path="/login">
        <RouteGuard requireAuth={false}>
          <LoginPage />
        </RouteGuard>
      </Route>
      <Route path="/auth/callback">
        <RouteGuard requireAuth={false}>
          <AuthCallbackPage />
        </RouteGuard>
      </Route>
      
      {/* Protected routes - authentication required */}
      <Route path="/">
        <RouteGuard>
          <Layout>
            <Dashboard />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/companies">
        <RouteGuard>
          <Layout>
            <Companies />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/legal-support">
        <RouteGuard>
          <Layout>
            <LegalSupport />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/documents">
        <RouteGuard>
          <Layout>
            <Documents />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/tasks">
        <RouteGuard>
          <Layout>
            <Tasks />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/analytics">
        <RouteGuard>
          <Layout>
            <Analytics />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/automation">
        <RouteGuard>
          <Layout>
            <Automation />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/hours">
        <RouteGuard>
          <Layout>
            <Hours />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/compliance">
        <RouteGuard>
          <Layout>
            <Compliance />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/partnerships">
        <RouteGuard>
          <Layout>
            <Partnerships />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/research">
        <RouteGuard>
          <Layout>
            <Research />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/settings">
        <RouteGuard>
          <Layout>
            <Settings />
          </Layout>
        </RouteGuard>
      </Route>
      <Route path="/users">
        <RouteGuard>
          <Layout>
            <UserManagement />
          </Layout>
        </RouteGuard>
      </Route>
      
      {/* 404 route */}
      <Route>
        <RouteGuard>
          <Layout>
            <NotFound />
          </Layout>
        </RouteGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="market-access-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
