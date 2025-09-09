import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, TrendingUp, Zap, ExternalLink } from "lucide-react";
import type { Company } from "@shared/schema";

export default function MarketAnalytics() {
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const calculateMarketMetrics = () => {
    if (companies.length === 0) {
      return {
        marketsEntered: 0,
        revenueGrowth: 0,
        avgProcessingTime: 0,
        totalTargetMarkets: 0,
        companiesWithTargets: 0
      };
    }

    // Calculate markets entered (unique current markets across all companies)
    const allCurrentMarkets = companies
      .flatMap(company => Array.isArray(company.currentMarkets) ? company.currentMarkets : [])
      .filter(Boolean);
    const uniqueCurrentMarkets = new Set(allCurrentMarkets);

    // Calculate target markets
    const allTargetMarkets = companies
      .flatMap(company => Array.isArray(company.targetMarkets) ? company.targetMarkets : [])
      .filter(Boolean);
    const uniqueTargetMarkets = new Set(allTargetMarkets);

    const companiesWithTargets = companies.filter(company => 
      Array.isArray(company.targetMarkets) && company.targetMarkets.length > 0
    ).length;

    // Mock revenue growth calculation based on number of active companies
    const revenueGrowth = Math.min(companies.length * 15, 200);

    // Mock average processing time based on total companies (inverse relationship)
    const avgProcessingTime = Math.max(30 - companies.length * 2, 10);

    return {
      marketsEntered: uniqueCurrentMarkets.size,
      revenueGrowth,
      avgProcessingTime,
      totalTargetMarkets: uniqueTargetMarkets.size,
      companiesWithTargets
    };
  };

  const metrics = calculateMarketMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Access Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-3"></div>
                <div className="h-8 bg-muted rounded w-16 mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Market Access Analytics</CardTitle>
          <div className="flex items-center space-x-2">
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Google Sheets Integration</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center" data-testid="market-analytics-markets-entered">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="markets-entered-value">
              {metrics.marketsEntered}
            </p>
            <p className="text-sm text-muted-foreground">Markets Entered</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalTargetMarkets} target markets identified
            </p>
          </div>
          
          <div className="text-center" data-testid="market-analytics-revenue-growth">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="revenue-growth-value">
              +{metrics.revenueGrowth}%
            </p>
            <p className="text-sm text-muted-foreground">Growth Potential</p>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.companiesWithTargets} companies expanding
            </p>
          </div>
          
          <div className="text-center" data-testid="market-analytics-processing-time">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-foreground" data-testid="processing-time-value">
              {metrics.avgProcessingTime}
            </p>
            <p className="text-sm text-muted-foreground">Avg Processing Days</p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {companies.length} companies
            </p>
          </div>
        </div>

        {companies.length === 0 && (
          <div className="text-center py-8 border-t border-border mt-6">
            <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No market data available</p>
            <p className="text-sm text-muted-foreground">Add companies to see market analytics</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
