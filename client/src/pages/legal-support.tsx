import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Plus, Search, Scale, Clock, User, AlertCircle } from "lucide-react";
import LegalTaskForm from "@/components/forms/legal-task-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { LegalNeed } from "@shared/schema";

export default function LegalSupport() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: legalNeeds = [], isLoading } = useQuery<LegalNeed[]>({
    queryKey: ["/api/legal-needs"],
  });

  const filteredLegalNeeds = legalNeeds.filter(need =>
    need.title.toLowerCase().includes(search.toLowerCase()) ||
    need.category.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      review: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      company_registration: Scale,
      contract_management: Scale,
      ip_protection: Scale,
      hr_frameworks: User,
      digital_policies: AlertCircle,
      regulatory_compliance: Scale,
    };
    const Icon = icons[category] || Scale;
    return <Icon className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Legal Support</h1>
          <p className="text-muted-foreground">Track legal needs and workflow management</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-legal-need">
              <Plus className="w-4 h-4 mr-2" />
              Add Legal Need
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <LegalTaskForm onSuccess={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search legal needs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search-legal-needs"
        />
      </div>

      {/* Legal Needs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLegalNeeds.map((need) => (
          <Card key={need.id} className="hover:shadow-lg transition-shadow" data-testid={`card-legal-need-${need.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                    {getCategoryIcon(need.category)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg" data-testid={`text-legal-title-${need.id}`}>
                      {need.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {need.category.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge variant="secondary" className={getPriorityColor(need.priority)}>
                    {need.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-legal-description-${need.id}`}>
                  {need.description || "No description available"}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium" data-testid={`text-progress-${need.id}`}>{need.progress || 0}%</span>
                  </div>
                  <Progress value={need.progress || 0} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className={getStatusColor(need.status)}>
                    {need.status.replace('_', ' ')}
                  </Badge>
                  {need.expectedCompletionDate && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      <span data-testid={`text-due-date-${need.id}`}>
                        {new Date(need.expectedCompletionDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLegalNeeds.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No legal needs found</h3>
          <p className="text-muted-foreground mb-4">
            {search ? "Try adjusting your search criteria" : "Get started by adding your first legal need"}
          </p>
          {!search && (
            <Button onClick={() => setShowForm(true)} data-testid="button-add-first-legal-need">
              <Plus className="w-4 h-4 mr-2" />
              Add Legal Need
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
