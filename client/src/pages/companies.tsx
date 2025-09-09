import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Building2, MapPin, Users, Globe } from "lucide-react";
import CompanyForm from "@/components/forms/company-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Company } from "@shared/schema";

export default function Companies() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.sector.toLowerCase().includes(search.toLowerCase())
  );

  const getSectorColor = (sector: string) => {
    const colors: Record<string, string> = {
      technology: "bg-blue-100 text-blue-800",
      healthcare: "bg-green-100 text-green-800",
      renewable_energy: "bg-emerald-100 text-emerald-800",
      fintech: "bg-purple-100 text-purple-800",
      manufacturing: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[sector] || colors.other;
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Companies</h1>
          <p className="text-muted-foreground">Manage company profiles and market access initiatives</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-company">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <CompanyForm onSuccess={() => setShowForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search-companies"
        />
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow" data-testid={`card-company-${company.id}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-company-name-${company.id}`}>
                      {company.name}
                    </CardTitle>
                    <Badge variant="secondary" className={getSectorColor(company.sector)}>
                      {company.sector.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-company-description-${company.id}`}>
                  {company.description || "No description available"}
                </p>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2" />
                  <span data-testid={`text-team-size-${company.id}`}>{company.teamSize || "Not specified"}</span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span data-testid={`text-current-markets-${company.id}`}>
                    {Array.isArray(company.currentMarkets) && company.currentMarkets.length > 0 
                      ? company.currentMarkets.join(", ") 
                      : "No current markets"}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Globe className="w-4 h-4 mr-2" />
                  <span data-testid={`text-target-markets-${company.id}`}>
                    {Array.isArray(company.targetMarkets) && company.targetMarkets.length > 0 
                      ? company.targetMarkets.join(", ") 
                      : "No target markets"}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Contact:</span>
                  <span className="font-medium" data-testid={`text-contact-name-${company.id}`}>
                    {company.primaryContactName}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No companies found</h3>
          <p className="text-muted-foreground mb-4">
            {search ? "Try adjusting your search criteria" : "Get started by adding your first company"}
          </p>
          {!search && (
            <Button onClick={() => setShowForm(true)} data-testid="button-add-first-company">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
