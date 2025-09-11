import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Handshake, 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Globe,
  Plus,
  Search,
  Filter,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageSquare,
  Star
} from "lucide-react";

// Mock data
const mockPartnerships = [
  {
    id: "1",
    name: "Legal Partners International",
    type: "legal_services",
    status: "active",
    region: "Europe",
    contactPerson: "Sarah Johnson",
    email: "sarah@legalpartners.com",
    phone: "+44 20 7123 4567",
    location: "London, UK",
    specialties: ["Corporate Law", "Regulatory Compliance", "IP Law"],
    activeProjects: 8,
    completedProjects: 23,
    rating: 4.8,
    monthlyValue: 45000,
    logo: null,
    established: "2019-03-15",
    description: "Leading legal services firm specializing in European market entry and regulatory compliance."
  },
  {
    id: "2",
    name: "Asia Market Research Co.",
    type: "research",
    status: "active",
    region: "Asia Pacific",
    contactPerson: "Li Wei",
    email: "li.wei@asiamarket.com",
    phone: "+65 6123 4567",
    location: "Singapore",
    specialties: ["Market Analysis", "Consumer Research", "Regulatory Intel"],
    activeProjects: 5,
    completedProjects: 17,
    rating: 4.6,
    monthlyValue: 28000,
    logo: null,
    established: "2020-08-22",
    description: "Comprehensive market research and business intelligence services across APAC markets."
  },
  {
    id: "3",
    name: "North American Consultants",
    type: "consulting",
    status: "pending",
    region: "North America",
    contactPerson: "Michael Rodriguez",
    email: "m.rodriguez@naconsult.com",
    phone: "+1 555 123 4567",
    location: "Toronto, Canada",
    specialties: ["Business Strategy", "Market Entry", "Partnership Development"],
    activeProjects: 0,
    completedProjects: 0,
    rating: 0,
    monthlyValue: 0,
    logo: null,
    established: "2024-01-10",
    description: "Strategic consulting firm focused on cross-border business development and market expansion."
  },
  {
    id: "4",
    name: "European Compliance Group",
    type: "compliance",
    status: "inactive",
    region: "Europe",
    contactPerson: "Anna Mueller",
    email: "anna@ecg-compliance.eu",
    phone: "+49 30 1234 567",
    location: "Berlin, Germany",
    specialties: ["GDPR Compliance", "Financial Regulation", "Environmental Law"],
    activeProjects: 0,
    completedProjects: 31,
    rating: 4.9,
    monthlyValue: 0,
    logo: null,
    established: "2018-11-03",
    description: "Specialized compliance advisory services for European regulatory requirements."
  }
];

const partnershipTypes = [
  { value: "legal_services", label: "Legal Services", color: "bg-blue-500" },
  { value: "research", label: "Market Research", color: "bg-green-500" },
  { value: "consulting", label: "Strategic Consulting", color: "bg-purple-500" },
  { value: "compliance", label: "Compliance", color: "bg-orange-500" },
  { value: "technology", label: "Technology", color: "bg-cyan-500" },
  { value: "logistics", label: "Logistics", color: "bg-pink-500" }
];

export default function Partnerships() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Mock queries
  const { data: partnershipsData, isLoading } = useQuery<any>({
    queryKey: ["/api/partnerships/overview"],
  });

  const { data: partnerships } = useQuery<any>({
    queryKey: ["/api/partnerships/list"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500">Active</Badge>;
      case "pending": return <Badge className="bg-yellow-500">Pending</Badge>;
      case "inactive": return <Badge variant="secondary">Inactive</Badge>;
      case "terminated": return <Badge variant="destructive">Terminated</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    const typeInfo = partnershipTypes.find(t => t.value === type);
    return typeInfo?.color || "bg-gray-500";
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
          <h1 className="text-3xl font-bold tracking-tight">Partnership Management</h1>
          <p className="text-muted-foreground">
            Manage strategic partnerships and service provider relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-partners">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <div className="text-xs text-muted-foreground">Across all regions</div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-partnerships">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Partnerships</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">18</div>
            <div className="text-xs text-muted-foreground">75% active rate</div>
          </CardContent>
        </Card>

        <Card data-testid="card-monthly-value">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$127K</div>
            <div className="text-xs text-muted-foreground">+12% from last month</div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-projects">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <div className="text-xs text-muted-foreground">Ongoing collaborations</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search partners..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Partner Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {partnershipTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockPartnerships.map((partner) => (
              <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className={`${getTypeColor(partner.type)} text-white font-bold`}>
                          {getInitials(partner.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {partnershipTypes.find(t => t.value === partner.type)?.label}
                          </Badge>
                          {getStatusBadge(partner.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {partner.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{partner.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{partner.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{partner.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold">{partner.activeProjects}</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{partner.completedProjects}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    {partner.rating > 0 && (
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-bold">{partner.rating}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Monthly: </span>
                      <span className="font-semibold">
                        ${partner.monthlyValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Partnership Directory</CardTitle>
              <CardDescription>Complete list of all partnership relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPartnerships.map((partner) => (
                  <div key={partner.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={`${getTypeColor(partner.type)} text-white font-bold`}>
                          {getInitials(partner.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{partner.name}</h4>
                          {getStatusBadge(partner.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{partnershipTypes.find(t => t.value === partner.type)?.label}</span>
                          <span>{partner.region}</span>
                          <span>{partner.contactPerson}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <div className="font-medium">${partner.monthlyValue.toLocaleString()}/mo</div>
                        <div className="text-muted-foreground">{partner.activeProjects} active projects</div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Partnership Distribution</CardTitle>
                <CardDescription>Partners by type and region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {partnershipTypes.map((type) => {
                    const count = mockPartnerships.filter(p => p.type === type.value).length;
                    const percentage = (count / mockPartnerships.length) * 100;
                    return (
                      <div key={type.value} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{type.label}</span>
                          <span>{count} partners</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Coverage</CardTitle>
                <CardDescription>Geographic distribution of partnerships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Europe", "North America", "Asia Pacific", "Latin America", "Africa", "Middle East"].map((region) => {
                    const count = mockPartnerships.filter(p => 
                      p.region.includes(region) || (region === "Europe" && p.region === "Europe")
                    ).length;
                    const percentage = Math.max((count / 6) * 100, 10); // Fake data for demo
                    return (
                      <div key={region} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {region}
                          </span>
                          <span>{count} partners</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key partnership performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <div className="text-sm text-muted-foreground">On-time Delivery</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-blue-600">4.7</div>
                    <div className="text-sm text-muted-foreground">Avg. Rating</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-purple-600">$1.2M</div>
                    <div className="text-sm text-muted-foreground">Annual Value</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded">
                    <div className="text-2xl font-bold text-orange-600">87%</div>
                    <div className="text-sm text-muted-foreground">Retention Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest partnership updates and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "2024-01-15", activity: "New partnership with North American Consultants", type: "new" },
                    { date: "2024-01-12", activity: "Legal Partners International completed GDPR project", type: "completion" },
                    { date: "2024-01-10", activity: "Asia Market Research Co. contract renewed", type: "renewal" },
                    { date: "2024-01-08", activity: "European Compliance Group marked inactive", type: "status" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <p className="text-sm">{item.activity}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
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