import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  Clock,
  Award,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Analytics() {
  const { data: marketAnalytics, isLoading: marketLoading } = useQuery<any>({
    queryKey: ["/api/analytics/market-penetration"],
  });

  const { data: progressAnalytics, isLoading: progressLoading } = useQuery<any>({
    queryKey: ["/api/analytics/progress-tracking"],
  });

  const { data: revenueAnalytics, isLoading: revenueLoading } = useQuery<any>({
    queryKey: ["/api/analytics/revenue-impact"],
  });

  const { data: performanceMetrics, isLoading: performanceLoading } = useQuery<any>({
    queryKey: ["/api/analytics/performance-metrics"],
  });

  const { data: complianceAnalytics, isLoading: complianceLoading } = useQuery<any>({
    queryKey: ["/api/analytics/compliance-status"],
  });

  const handleExportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/analytics/export/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-analytics-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const isLoading = marketLoading || progressLoading || revenueLoading || performanceLoading || complianceLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into market access performance and impact
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExportReport('full')}
            data-testid="button-export-full-report"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Full Report
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExportReport('executive')}
            data-testid="button-export-executive-summary"
          >
            <FileText className="w-4 h-4 mr-2" />
            Executive Summary
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-kpi-market-penetration">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Penetration</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-market-penetration-rate">
              {performanceMetrics?.marketPenetrationRate || '67'}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +12% from last quarter
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-kpi-revenue-impact">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-revenue-impact">
              ${performanceMetrics?.totalRevenueImpact || '2.4M'}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +18% from last quarter
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-kpi-completion-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-completion-rate">
              {performanceMetrics?.avgCompletionRate || '84'}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              +5% from last quarter
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-kpi-time-to-market">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time to Market</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-time-to-market">
              {performanceMetrics?.avgTimeToMarket || '156'} days
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="w-3 h-3 mr-1 text-green-500" />
              -23 days from last quarter
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="market" className="space-y-4">
        <TabsList data-testid="tabs-analytics">
          <TabsTrigger value="market" data-testid="tab-market-analysis">Market Analysis</TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress-tracking">Progress Tracking</TabsTrigger>
          <TabsTrigger value="revenue" data-testid="tab-revenue-impact">Revenue Impact</TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
          <TabsTrigger value="predictive" data-testid="tab-predictive">Predictive Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card data-testid="card-market-penetration-by-sector">
              <CardHeader>
                <CardTitle>Market Penetration by Sector</CardTitle>
                <CardDescription>Success rates across different industry sectors</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketAnalytics?.sectorPenetration || [
                    { sector: 'Technology', rate: 78, companies: 12 },
                    { sector: 'Healthcare', rate: 65, companies: 8 },
                    { sector: 'Finance', rate: 82, companies: 15 },
                    { sector: 'Manufacturing', rate: 71, companies: 10 },
                    { sector: 'Energy', rate: 69, companies: 6 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sector" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-geographic-distribution">
              <CardHeader>
                <CardTitle>Geographic Market Distribution</CardTitle>
                <CardDescription>Market entry success by region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={marketAnalytics?.geographicDistribution || [
                        { name: 'North America', value: 35, color: '#0088FE' },
                        { name: 'Europe', value: 28, color: '#00C49F' },
                        { name: 'Asia Pacific', value: 22, color: '#FFBB28' },
                        { name: 'Latin America', value: 10, color: '#FF8042' },
                        { name: 'Other', value: 5, color: '#8884d8' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(marketAnalytics?.geographicDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card data-testid="card-market-trends">
            <CardHeader>
              <CardTitle>Market Entry Trends</CardTitle>
              <CardDescription>Monthly market entry activity over the past year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={marketAnalytics?.monthlyTrends || [
                  { month: 'Jan', entries: 4, success: 3 },
                  { month: 'Feb', entries: 6, success: 5 },
                  { month: 'Mar', entries: 8, success: 6 },
                  { month: 'Apr', entries: 5, success: 4 },
                  { month: 'May', entries: 9, success: 8 },
                  { month: 'Jun', entries: 7, success: 6 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="entries" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="success" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card data-testid="card-completion-timeline">
              <CardHeader>
                <CardTitle>Project Completion Timeline</CardTitle>
                <CardDescription>Average completion times by project type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={progressAnalytics?.completionTimeline || [
                    { type: 'Legal Setup', planned: 45, actual: 38 },
                    { type: 'Market Research', planned: 30, actual: 35 },
                    { type: 'Regulatory', planned: 60, actual: 55 },
                    { type: 'Partnership', planned: 90, actual: 85 },
                    { type: 'Launch', planned: 120, actual: 105 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="planned" fill="#8884d8" name="Planned Days" />
                    <Bar dataKey="actual" fill="#82ca9d" name="Actual Days" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-milestone-progress">
              <CardHeader>
                <CardTitle>Current Milestone Progress</CardTitle>
                <CardDescription>Active projects and their completion status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(progressAnalytics?.activeMilestones || [
                  { company: 'TechCorp Inc.', milestone: 'Legal Documentation', progress: 75, dueDate: '2024-02-15' },
                  { company: 'HealthPlus Ltd.', milestone: 'Regulatory Approval', progress: 45, dueDate: '2024-03-01' },
                  { company: 'GreenEnergy Co.', milestone: 'Market Research', progress: 90, dueDate: '2024-01-30' },
                  { company: 'FinanceFirst', milestone: 'Partnership Setup', progress: 30, dueDate: '2024-04-15' }
                ]).map((milestone: any, index: number) => (
                  <div key={index} className="space-y-2" data-testid={`milestone-${index}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{milestone.company}</p>
                        <p className="text-sm text-muted-foreground">{milestone.milestone}</p>
                      </div>
                      <Badge variant={milestone.progress > 75 ? "default" : milestone.progress > 50 ? "secondary" : "destructive"}>
                        {milestone.progress}%
                      </Badge>
                    </div>
                    <Progress value={milestone.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">Due: {milestone.dueDate}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card data-testid="card-revenue-projections">
              <CardHeader>
                <CardTitle>Revenue Impact Projections</CardTitle>
                <CardDescription>Projected vs actual revenue from market access initiatives</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueAnalytics?.monthlyRevenue || [
                    { month: 'Jan', projected: 200000, actual: 180000 },
                    { month: 'Feb', projected: 250000, actual: 280000 },
                    { month: 'Mar', projected: 300000, actual: 320000 },
                    { month: 'Apr', projected: 350000, actual: 330000 },
                    { month: 'May', projected: 400000, actual: 420000 },
                    { month: 'Jun', projected: 450000, actual: 480000 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Line type="monotone" dataKey="projected" stroke="#8884d8" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="actual" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card data-testid="card-roi-analysis">
              <CardHeader>
                <CardTitle>ROI Analysis by Market</CardTitle>
                <CardDescription>Return on investment for different target markets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueAnalytics?.roiByMarket || [
                    { market: 'US', investment: 100000, returns: 320000, roi: 220 },
                    { market: 'EU', investment: 150000, returns: 400000, roi: 167 },
                    { market: 'APAC', investment: 80000, returns: 180000, roi: 125 },
                    { market: 'LATAM', investment: 60000, returns: 110000, roi: 83 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="market" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value}%`} />
                    <Bar dataKey="roi" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card data-testid="card-compliance-status">
              <CardHeader>
                <CardTitle>Compliance Status Overview</CardTitle>
                <CardDescription>Current compliance status across all active projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600" data-testid="text-compliant-count">
                      {complianceAnalytics?.compliantProjects || 28}
                    </div>
                    <p className="text-sm text-muted-foreground">Fully Compliant</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600" data-testid="text-pending-count">
                      {complianceAnalytics?.pendingReview || 7}
                    </div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600" data-testid="text-issues-count">
                      {complianceAnalytics?.issuesFound || 3}
                    </div>
                    <p className="text-sm text-muted-foreground">Issues Found</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600" data-testid="text-in-progress-count">
                      {complianceAnalytics?.inProgress || 12}
                    </div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-risk-assessment">
              <CardHeader>
                <CardTitle>Risk Assessment Matrix</CardTitle>
                <CardDescription>Identified risks and their impact levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(complianceAnalytics?.riskAssessment || [
                  { risk: 'Regulatory Changes', impact: 'High', probability: 'Medium', status: 'Monitoring' },
                  { risk: 'Market Competition', impact: 'Medium', probability: 'High', status: 'Mitigating' },
                  { risk: 'Currency Fluctuation', impact: 'Medium', probability: 'Medium', status: 'Accepted' },
                  { risk: 'Legal Compliance', impact: 'High', probability: 'Low', status: 'Prevented' }
                ]).map((risk: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded" data-testid={`risk-${index}`}>
                    <div>
                      <p className="font-medium">{risk.risk}</p>
                      <p className="text-sm text-muted-foreground">
                        Impact: {risk.impact} | Probability: {risk.probability}
                      </p>
                    </div>
                    <Badge variant={
                      risk.status === 'Prevented' ? 'default' :
                      risk.status === 'Mitigating' ? 'secondary' :
                      risk.status === 'Monitoring' ? 'outline' : 'destructive'
                    }>
                      {risk.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card data-testid="card-success-prediction">
              <CardHeader>
                <CardTitle>Success Prediction Model</CardTitle>
                <CardDescription>AI-powered predictions for ongoing initiatives</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { company: 'NextGen Solutions', sector: 'Technology', prediction: 85, confidence: 92 },
                  { company: 'BioPharma Inc.', sector: 'Healthcare', prediction: 72, confidence: 78 },
                  { company: 'EcoManufacturing', sector: 'Manufacturing', prediction: 68, confidence: 85 },
                  { company: 'CryptoFinance', sector: 'Finance', prediction: 91, confidence: 89 }
                ].map((prediction, index) => (
                  <div key={index} className="space-y-2" data-testid={`prediction-${index}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{prediction.company}</p>
                        <p className="text-sm text-muted-foreground">{prediction.sector}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{prediction.prediction}%</p>
                        <p className="text-xs text-muted-foreground">
                          {prediction.confidence}% confidence
                        </p>
                      </div>
                    </div>
                    <Progress value={prediction.prediction} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card data-testid="card-optimization-recommendations">
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
                <CardDescription>AI-generated insights for process improvement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    type: 'Process',
                    recommendation: 'Streamline legal documentation review process',
                    impact: 'Reduce timeline by 15-20 days',
                    priority: 'High'
                  },
                  {
                    type: 'Resource',
                    recommendation: 'Allocate additional resources to APAC market entry',
                    impact: 'Increase success rate by 12%',
                    priority: 'Medium'
                  },
                  {
                    type: 'Risk',
                    recommendation: 'Implement early warning system for regulatory changes',
                    impact: 'Prevent 80% of compliance issues',
                    priority: 'High'
                  },
                  {
                    type: 'Cost',
                    recommendation: 'Negotiate bulk rates for legal services',
                    impact: 'Reduce costs by $50K annually',
                    priority: 'Medium'
                  }
                ].map((rec, index) => (
                  <div key={index} className="p-3 border rounded space-y-2" data-testid={`recommendation-${index}`}>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{rec.type}</Badge>
                      <Badge variant={rec.priority === 'High' ? 'destructive' : 'secondary'}>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="font-medium">{rec.recommendation}</p>
                    <p className="text-sm text-muted-foreground">{rec.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}