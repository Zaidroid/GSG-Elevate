import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, 
  Globe, 
  Search, 
  Plus,
  Download,
  Filter,
  Target,
  DollarSign,
  Users,
  Zap,
  FileText,
  Eye,
  BookOpen,
  Lightbulb,
  BarChart3,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";

// Mock data for market research
const marketOpportunities = [
  {
    id: "1",
    market: "Germany",
    industry: "FinTech",
    score: 92,
    marketSize: "$45B",
    growthRate: "12.3%",
    competition: "Medium",
    barriers: "Low",
    timeToEntry: "6-9 months",
    status: "recommended"
  },
  {
    id: "2",
    market: "Singapore",
    industry: "Healthcare Tech",
    score: 87,
    marketSize: "$12B",
    growthRate: "18.7%",
    competition: "High",
    barriers: "Medium",
    timeToEntry: "12-18 months",
    status: "analysis_pending"
  },
  {
    id: "3",
    market: "Brazil",
    industry: "E-commerce",
    score: 78,
    marketSize: "$89B",
    growthRate: "15.2%",
    competition: "High",
    barriers: "High",
    timeToEntry: "18-24 months",
    status: "under_review"
  }
];

const researchReports = [
  {
    id: "1",
    title: "European FinTech Market Analysis 2024",
    market: "Europe",
    industry: "Financial Technology",
    date: "2024-01-15",
    status: "completed",
    type: "market_analysis",
    pages: 45,
    keyInsights: ["Regulatory framework stabilizing", "Growing demand for neobanking", "ESG compliance driving innovation"]
  },
  {
    id: "2",
    title: "APAC Healthcare Technology Trends",
    market: "Asia Pacific",
    industry: "Healthcare",
    date: "2024-01-10",
    status: "in_progress",
    type: "trend_analysis",
    pages: 32,
    keyInsights: ["Telemedicine adoption accelerating", "AI diagnostics gaining traction", "Regulatory harmonization needed"]
  },
  {
    id: "3",
    title: "Latin American E-commerce Landscape",
    market: "Latin America", 
    industry: "E-commerce",
    date: "2024-01-05",
    status: "draft",
    type: "competitive_analysis",
    pages: 28,
    keyInsights: ["Mobile-first commerce dominating", "Cross-border challenges persist", "Local payment methods critical"]
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function MarketResearch() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock queries
  const { data: researchData, isLoading } = useQuery<any>({
    queryKey: ["/api/research/overview"],
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "recommended": return <Badge className="bg-green-500">Recommended</Badge>;
      case "analysis_pending": return <Badge className="bg-blue-500">Analysis Pending</Badge>;
      case "under_review": return <Badge className="bg-yellow-500">Under Review</Badge>;
      case "not_recommended": return <Badge variant="destructive">Not Recommended</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getReportStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress": return <Badge className="bg-blue-500">In Progress</Badge>;
      case "draft": return <Badge className="bg-yellow-500">Draft</Badge>;
      case "archived": return <Badge variant="secondary">Archived</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

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
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Market Research Intelligence</h1>
          <p className="text-muted-foreground">
            Analyze market opportunities and competitive landscapes globally
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Research
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-active-research">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Research</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <div className="text-xs text-muted-foreground">Projects ongoing</div>
          </CardContent>
        </Card>

        <Card data-testid="card-market-opportunities">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">34</div>
            <div className="text-xs text-muted-foreground">High-potential markets</div>
          </CardContent>
        </Card>

        <Card data-testid="card-total-addressable">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TAM Analyzed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.1T</div>
            <div className="text-xs text-muted-foreground">Total addressable market</div>
          </CardContent>
        </Card>

        <Card data-testid="card-reports-generated">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <div className="text-xs text-muted-foreground">This quarter</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Market Opportunities</TabsTrigger>
          <TabsTrigger value="reports">Research Reports</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Intel</TabsTrigger>
          <TabsTrigger value="trends">Global Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search markets and industries..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="americas">Americas</SelectItem>
                <SelectItem value="apac">Asia Pacific</SelectItem>
                <SelectItem value="mena">MENA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="fintech">FinTech</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Market Opportunities Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {marketOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {opportunity.market}
                      </CardTitle>
                      <CardDescription className="font-medium">{opportunity.industry}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(opportunity.score)}`}>
                        {opportunity.score}
                      </div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(opportunity.status)}
                    <span className="text-sm text-muted-foreground">{opportunity.timeToEntry}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Market Size</div>
                      <div className="font-semibold">{opportunity.marketSize}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Growth Rate</div>
                      <div className="font-semibold text-green-600">{opportunity.growthRate}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Competition</div>
                      <div className="font-semibold">{opportunity.competition}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Entry Barriers</div>
                      <div className="font-semibold">{opportunity.barriers}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Research Reports Library</CardTitle>
                  <CardDescription>Access comprehensive market analysis and industry reports</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {researchReports.map((report) => (
                  <div key={report.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{report.title}</h4>
                        {getReportStatusBadge(report.status)}
                        <Badge variant="outline" className="text-xs">
                          {report.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {report.market}
                        </span>
                        <span>{report.industry}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {report.date}
                        </span>
                        <span>{report.pages} pages</span>
                      </div>
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-1">Key Insights:</div>
                        <div className="flex flex-wrap gap-1">
                          {report.keyInsights.map((insight, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {insight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitive Landscape</CardTitle>
                <CardDescription>Market share analysis by region</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Market Leader', value: 35, color: '#0088FE' },
                        { name: 'Major Players', value: 45, color: '#00C49F' },
                        { name: 'Our Position', value: 8, color: '#FFBB28' },
                        { name: 'Others', value: 12, color: '#FF8042' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[0,1,2,3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitive Positioning</CardTitle>
                <CardDescription>Market position vs innovation index</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { company: "Competitor A", position: 92, innovation: 78, threat: "high" },
                    { company: "Competitor B", position: 85, innovation: 85, threat: "high" },
                    { company: "Competitor C", position: 67, innovation: 72, threat: "medium" },
                    { company: "Our Company", position: 45, innovation: 88, threat: "opportunity" }
                  ].map((competitor, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{competitor.company}</span>
                        <Badge variant={
                          competitor.threat === 'high' ? 'destructive' :
                          competitor.threat === 'medium' ? 'secondary' : 'default'
                        }>
                          {competitor.threat}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Market Position</span>
                            <span>{competitor.position}%</span>
                          </div>
                          <Progress value={competitor.position} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Innovation</span>
                            <span>{competitor.innovation}%</span>
                          </div>
                          <Progress value={competitor.innovation} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Market Trends</CardTitle>
                <CardDescription>Emerging trends across industries</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={[
                    { month: 'Jan', digital: 65, sustainability: 45, ai: 35 },
                    { month: 'Feb', digital: 68, sustainability: 48, ai: 42 },
                    { month: 'Mar', digital: 72, sustainability: 52, ai: 48 },
                    { month: 'Apr', digital: 75, sustainability: 55, ai: 55 },
                    { month: 'May', digital: 78, sustainability: 58, ai: 62 },
                    { month: 'Jun', digital: 82, sustainability: 62, ai: 68 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="digital" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="sustainability" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="ai" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Industry Disruption Index</CardTitle>
                <CardDescription>Risk and opportunity assessment by sector</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { industry: "Financial Services", disruption: 85, opportunity: 92, risk: 45 },
                    { industry: "Healthcare", disruption: 78, opportunity: 88, risk: 38 },
                    { industry: "Retail", disruption: 82, opportunity: 75, risk: 62 },
                    { industry: "Manufacturing", disruption: 65, opportunity: 68, risk: 55 },
                    { industry: "Education", disruption: 72, opportunity: 85, risk: 28 }
                  ].map((sector, index) => (
                    <div key={index} className="space-y-3 p-3 border rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{sector.industry}</span>
                        <Badge variant={sector.disruption > 80 ? "destructive" : sector.disruption > 60 ? "secondary" : "outline"}>
                          {sector.disruption}% disruption
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Opportunity</span>
                            <span className="text-green-600 font-medium">{sector.opportunity}%</span>
                          </div>
                          <Progress value={sector.opportunity} className="h-1 mt-1" />
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Risk</span>
                            <span className="text-red-600 font-medium">{sector.risk}%</span>
                          </div>
                          <Progress value={sector.risk} className="h-1 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Market Intelligence Alerts</CardTitle>
                <CardDescription>Real-time insights and emerging opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      type: "opportunity",
                      title: "New regulatory framework in EU opens FinTech market",
                      description: "European Banking Authority announces new open banking regulations",
                      time: "2 hours ago",
                      impact: "high"
                    },
                    {
                      type: "threat",
                      title: "Major competitor announces expansion into APAC",
                      description: "TechGiant Inc. securing $500M funding for Asian market entry",
                      time: "6 hours ago",
                      impact: "medium"
                    },
                    {
                      type: "trend",
                      title: "Sustainability reporting becoming mandatory",
                      description: "New ESG requirements affecting market entry strategies",
                      time: "1 day ago",
                      impact: "high"
                    },
                    {
                      type: "opportunity",
                      title: "Healthcare AI demand surging in emerging markets",
                      description: "Government digitization initiatives driving adoption",
                      time: "2 days ago",
                      impact: "high"
                    }
                  ].map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded hover:bg-accent/50">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'opportunity' ? 'bg-green-500' :
                        alert.type === 'threat' ? 'bg-red-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{alert.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={alert.impact === 'high' ? 'destructive' : 'secondary'}>
                              {alert.impact} impact
                            </Badge>
                            <span className="text-xs text-muted-foreground">{alert.time}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}