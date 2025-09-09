import { Card, CardContent } from "@/components/ui/card";
import { Building2, Scale, FileText, TrendingUp } from "lucide-react";

interface MetricsData {
  activeCompanies: number;
  legalTasks: number;
  totalDocuments: number;
  averageProgress: number;
}

interface MetricsCardsProps {
  metrics?: MetricsData;
  isLoading: boolean;
}

export default function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
              </div>
              <div className="mt-4">
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Companies</p>
              <p className="text-2xl font-bold text-foreground" data-testid="metric-active-companies">
                {metrics?.activeCompanies || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs text-blue-600 font-medium">+12%</span>
            <span className="text-xs text-muted-foreground ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Legal Tasks</p>
              <p className="text-2xl font-bold text-foreground" data-testid="metric-legal-tasks">
                {metrics?.legalTasks || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs text-green-600 font-medium">85%</span>
            <span className="text-xs text-muted-foreground ml-1">completion rate</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Documents</p>
              <p className="text-2xl font-bold text-foreground" data-testid="metric-documents">
                {metrics?.totalDocuments || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs text-orange-600 font-medium">Google Drive</span>
            <span className="text-xs text-muted-foreground ml-1">integrated</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
              <p className="text-2xl font-bold text-foreground" data-testid="metric-average-progress">
                {metrics?.averageProgress || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs text-purple-600 font-medium">Overall</span>
            <span className="text-xs text-muted-foreground ml-1">task progress</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
