import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Scale, Clock } from "lucide-react";
import { Link } from "wouter";
import type { LegalNeed, Company } from "@shared/schema";

interface LegalNeedWithCompany extends LegalNeed {
  company?: Company;
}

export default function LegalTasksStatus() {
  const { data: legalNeeds = [], isLoading: legalNeedsLoading } = useQuery<LegalNeed[]>({
    queryKey: ["/api/legal-needs"],
  });

  const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const isLoading = legalNeedsLoading || companiesLoading;

  // Combine legal needs with company information
  const legalNeedsWithCompanies: LegalNeedWithCompany[] = legalNeeds.map(need => ({
    ...need,
    company: companies.find(company => company.id === need.companyId)
  }));

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Legal Tasks Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between mb-2">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                  <div className="ml-4 text-right space-y-2">
                    <div className="h-4 bg-muted rounded w-12"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeLegalNeeds = legalNeedsWithCompanies
    .filter(need => need.status === 'in_progress' || need.status === 'pending')
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Legal Tasks Status</CardTitle>
          <Link href="/legal-support">
            <Button variant="ghost" size="sm" data-testid="button-view-all-legal-tasks">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeLegalNeeds.length === 0 ? (
            <div className="text-center py-8">
              <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active legal tasks</p>
              <Link href="/legal-support">
                <Button variant="outline" size="sm" className="mt-2" data-testid="button-add-legal-tasks">
                  Add Legal Tasks
                </Button>
              </Link>
            </div>
          ) : (
            activeLegalNeeds.map((need) => (
              <div key={need.id} className="space-y-2" data-testid={`legal-task-${need.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground" data-testid={`legal-task-title-${need.id}`}>
                      {need.title}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`legal-task-company-${need.id}`}>
                      {need.company?.name || 'Unknown Company'}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <span className="text-sm font-medium text-foreground" data-testid={`legal-task-progress-${need.id}`}>
                      {need.progress || 0}%
                    </span>
                    {need.expectedCompletionDate && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        <span data-testid={`legal-task-due-${need.id}`}>
                          {(() => {
                            const daysUntilDue = getDaysUntilDue(need.expectedCompletionDate.toString());
                            if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
                            if (daysUntilDue === 0) return 'Due today';
                            if (daysUntilDue === 1) return 'Due tomorrow';
                            return `Due: ${daysUntilDue} days`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${getProgressColor(need.progress || 0)}`}
                    style={{ width: `${need.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
