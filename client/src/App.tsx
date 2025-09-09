import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout/layout";
import Dashboard from "@/pages/dashboard";
import Companies from "@/pages/companies";
import LegalSupport from "@/pages/legal-support";
import Documents from "@/pages/documents";
import Tasks from "@/pages/tasks";
import Analytics from "@/pages/analytics";
import Automation from "@/pages/automation";
import Settings from "@/pages/settings";
import UserManagement from "@/pages/user-management";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/companies" component={Companies} />
        <Route path="/legal-support" component={LegalSupport} />
        <Route path="/documents" component={Documents} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/automation" component={Automation} />
        <Route path="/settings" component={Settings} />
        <Route path="/users" component={UserManagement} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
