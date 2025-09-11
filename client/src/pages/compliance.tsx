import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Plus,
  Download,
  Calendar as CalendarIcon,
  Globe,
  Building,
  Gavel,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Mock data
const mockComplianceItems = [
  {
    id: "1",
    company: "TechCorp Inc.",
    market: "European Union",
    requirement: "GDPR Compliance",
    status: "compliant",
    dueDate: "2024-05-25",
    completion: 100,
    priority: "high",
    category: "data_protection"
  },
  {
    id: "2", 
    company: "HealthPlus Ltd.",
    market: "United States",
    requirement: "FDA Registration",
    status: "in_progress",
    dueDate: "2024-03-15",
    completion: 65,
    priority: "high",
    category: "regulatory"
  },
  {
    id: "3",
    company: "GreenEnergy Co.",
    market: "Canada",
    requirement: "Environmental Impact Assessment",
    status: "pending_review",
    dueDate: "2024-04-01",
    completion: 80,
    priority: "medium",
    category: "environmental"
  },
  {
    id: "4",
    company: "FinanceFirst",
    market: "United Kingdom",
    requirement: "FCA Authorization",
    status: "non_compliant",
    dueDate: "2024-02-10",
    completion: 25,
    priority: "critical",
    category: "financial"
  }
];

const complianceCategories = [
  { value: "regulatory", label: "Regulatory", icon: Gavel },
  { value: "data_protection", label: "Data Protection", icon: Shield },
  { value: "financial", label: "Financial", icon: Building },
  { value: "environmental", label: "Environmental", icon: Globe },
  { value: "safety", label: "Safety & Health", icon: AlertTriangle },
  { value: "tax", label: "Tax & Legal", icon: FileText }
];

export default function Compliance() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const { toast } = useToast();

  // Mock queries
  const { data: complianceData, isLoading } = useQuery<any>({
    queryKey: ["/api/compliance/overview"],
  });

  const { data: complianceItems } = useQuery<any>({
    queryKey: ["/api/compliance/items"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant": return "bg-green-500";
      case "in_progress": return "bg-blue-500";
      case "pending_review": return "bg-yellow-500";
      case "non_compliant": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant": return <Badge className="bg-green-500">Compliant</Badge>;
      case "in_progress": return <Badge className="bg-blue-500">In Progress</Badge>;
      case "pending_review": return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case "non_compliant": return <Badge className="bg-red-500">Non-Compliant</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500">High</Badge>;
      case "medium": return <Badge variant="secondary">Medium</Badge>;
      case "low": return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const handleExportCompliance = async (type: string) => {
    try {
      const response = await fetch(`/api/compliance/export/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-${type}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ title: "Report exported successfully" });
      }
    } catch (error) {
      toast({ title: "Export failed", variant: "destructive" });
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
          <h1 className="text-3xl font-bold tracking-tight">Compliance Management</h1>
          <p className="text-muted-foreground">
            Track regulatory compliance across all markets and requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportCompliance('summary')}>
            <Download className="w-4 h-4 mr-2" />
            Export Summary
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Requirement
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-requirements">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requirements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <div className="text-xs text-muted-foreground">Across all markets</div>
          </CardContent>
        </Card>

        <Card data-testid="card-compliant">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">89</div>
            <div className="text-xs text-muted-foreground">72% completion rate</div>
          </CardContent>
        </Card>

        <Card data-testid="card-in-progress">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">28</div>
            <div className="text-xs text-muted-foreground">23% of total</div>
          </CardContent>
        </Card>

        <Card data-testid="card-critical-issues">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">7</div>
            <div className="text-xs text-muted-foreground">Require immediate attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="by-company">By Company</TabsTrigger>
          <TabsTrigger value="by-market">By Market</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Critical Alerts */}
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700 dark:text-red-300">
              <strong>3 critical compliance issues</strong> require immediate attention. 
              FinanceFirst FCA Authorization is overdue by 15 days.
            </AlertDescription>
          </Alert>

          {/* Compliance Items List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Compliance Requirements</CardTitle>
                  <CardDescription>Track all regulatory requirements and their status</CardDescription>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {complianceCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockComplianceItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{item.requirement}</h4>
                        {getStatusBadge(item.status)}
                        {getPriorityBadge(item.priority)}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>Company: {item.company}</span>
                        <span>Market: {item.market}</span>
                        <span>Due: {format(new Date(item.dueDate), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={item.completion} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{item.completion}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-company" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {["TechCorp Inc.", "HealthPlus Ltd.", "GreenEnergy Co.", "FinanceFirst"].map((company) => (
              <Card key={company}>
                <CardHeader>
                  <CardTitle className="text-lg">{company}</CardTitle>
                  <CardDescription>Compliance status across all markets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Overall Compliance</span>
                      <span className="font-medium">
                        {company === "FinanceFirst" ? "45%" : "78%"}
                      </span>
                    </div>
                    <Progress value={company === "FinanceFirst" ? 45 : 78} className="h-2" />
                    <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {company === "FinanceFirst" ? "2" : "8"}
                        </div>
                        <div className="text-muted-foreground">Compliant</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-red-600">
                          {company === "FinanceFirst" ? "3" : "1"}
                        </div>
                        <div className="text-muted-foreground">Issues</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-market" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { market: "European Union", compliance: 92, requirements: 45, critical: 1 },
              { market: "United States", compliance: 76, requirements: 38, critical: 2 },
              { market: "Asia Pacific", compliance: 68, requirements: 32, critical: 4 },
              { market: "Canada", compliance: 84, requirements: 28, critical: 0 },
              { market: "United Kingdom", compliance: 55, requirements: 22, critical: 3 },
              { market: "Latin America", compliance: 71, requirements: 18, critical: 1 }
            ].map((market) => (
              <Card key={market.market}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {market.market}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Compliance Rate</span>
                      <span className="font-medium">{market.compliance}%</span>
                    </div>
                    <Progress value={market.compliance} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold">{market.requirements}</div>
                      <div className="text-muted-foreground">Requirements</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <div className={`font-semibold ${market.critical > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {market.critical}
                      </div>
                      <div className="text-muted-foreground">Critical</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Calendar</CardTitle>
                <CardDescription>Upcoming deadlines and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Requirements due in the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { company: "TechCorp Inc.", requirement: "ISO 27001 Renewal", dueDate: "2024-02-15", urgency: "high" },
                    { company: "HealthPlus Ltd.", requirement: "FDA Registration", dueDate: "2024-03-15", urgency: "high" },
                    { company: "GreenEnergy Co.", requirement: "Environmental Assessment", dueDate: "2024-04-01", urgency: "medium" }
                  ].map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{deadline.requirement}</div>
                        <div className="text-sm text-muted-foreground">{deadline.company}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{format(new Date(deadline.dueDate), 'MMM dd')}</div>
                        <Badge variant={deadline.urgency === 'high' ? 'destructive' : 'secondary'}>
                          {deadline.urgency}
                        </Badge>
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