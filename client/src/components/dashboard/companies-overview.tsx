import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { Link } from "wouter";
import type { Company } from "@shared/schema";

export default function CompaniesOverview() {
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const getStatusForCompany = (company: Company) => {
    // Determine status based on target markets and registrations
    if (Array.isArray(company.targetMarkets) && company.targetMarkets.length > 0) {
      return "Active";
    }
    return "Planning";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Planning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
    return colors[status] || colors.Planning;
  };

  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getCompanyColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500", 
      "bg-purple-500",
      "bg-orange-500",
      "bg-red-500",
      "bg-indigo-500"
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-md animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted-foreground/20 rounded-lg"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted-foreground/20 rounded w-32"></div>
                    <div className="h-3 bg-muted-foreground/20 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-muted-foreground/20 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topCompanies = companies.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Active Companies</CardTitle>
          <Link href="/companies">
            <Button variant="ghost" size="sm" data-testid="button-view-all-companies">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No companies added yet</p>
              <Link href="/companies">
                <Button variant="outline" size="sm" className="mt-2" data-testid="button-add-companies">
                  Add Companies
                </Button>
              </Link>
            </div>
          ) : (
            topCompanies.map((company, index) => (
              <div 
                key={company.id} 
                className="flex items-center justify-between p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                data-testid={`company-overview-${company.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${getCompanyColor(index)} rounded-lg flex items-center justify-center`}>
                    <span className="text-white text-sm font-bold" data-testid={`company-initials-${company.id}`}>
                      {getCompanyInitials(company.name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground" data-testid={`company-name-${company.id}`}>
                      {company.name}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`company-info-${company.id}`}>
                      {company.sector?.replace('_', ' ')} • {
                        Array.isArray(company.targetMarkets) && company.targetMarkets.length > 0
                          ? company.targetMarkets.join(", ")
                          : "No target markets"
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(getStatusForCompany(company))}
                    data-testid={`company-status-${company.id}`}
                  >
                    {getStatusForCompany(company)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
