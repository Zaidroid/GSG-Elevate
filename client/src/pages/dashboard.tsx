import { useQuery } from "@tanstack/react-query";
import MetricsCards from "@/components/dashboard/metrics-cards";
import RecentActivities from "@/components/dashboard/recent-activities";
import QuickActions from "@/components/dashboard/quick-actions";
import CompaniesOverview from "@/components/dashboard/companies-overview";
import LegalTasksStatus from "@/components/dashboard/legal-tasks-status";
import MarketAnalytics from "@/components/dashboard/market-analytics";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<{
    activeCompanies: number;
    legalTasks: number;
    totalDocuments: number;
    averageProgress: number;
  }>({
    queryKey: ["/api/dashboard/metrics"],
  });

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of market access activities and legal support progress</p>
      </div>

      {/* Key Metrics Cards */}
      <MetricsCards metrics={metrics} isLoading={metricsLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivities />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Companies and Legal Tasks Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CompaniesOverview />
        <LegalTasksStatus />
      </div>

      {/* Market Access Analytics */}
      <MarketAnalytics />
    </div>
  );
}
