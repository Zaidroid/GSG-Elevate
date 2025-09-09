import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCompanySchema } from "@shared/schema";

const companyFormSchema = insertCompanySchema.extend({
  targetMarkets: z.array(z.string()).min(1, "Select at least one target market"),
  currentMarkets: z.string().min(1, "Current markets are required"),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

const sectorOptions = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "renewable_energy", label: "Renewable Energy" },
  { value: "fintech", label: "FinTech" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" },
];

const teamSizeOptions = [
  { value: "1-5", label: "1-5 employees" },
  { value: "6-10", label: "6-10 employees" },
  { value: "11-25", label: "11-25 employees" },
  { value: "26-50", label: "26-50 employees" },
  { value: "51+", label: "51+ employees" },
];

const marketOptions = [
  { value: "Jordan", label: "Jordan" },
  { value: "Oman", label: "Oman" },
  { value: "UAE", label: "UAE" },
  { value: "KSA", label: "KSA" },
  { value: "USA", label: "USA" },
];

interface CompanyFormProps {
  onSuccess?: () => void;
}

export default function CompanyForm({ onSuccess }: CompanyFormProps) {
  const [targetMarkets, setTargetMarkets] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      sector: "technology",
      description: "",
      teamSize: "",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactPhone: "",
      primaryContactPosition: "",
      currentMarkets: "",
      targetMarkets: [],
      createdBy: "system-user", // In a real app, this would come from auth
    },
  });

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const response = await apiRequest("POST", "/api/companies", {
        ...data,
        currentMarkets: data.currentMarkets.split(",").map(m => m.trim()),
        targetMarkets: targetMarkets,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create company. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    createCompanyMutation.mutate({
      ...data,
      targetMarkets: targetMarkets,
    });
  };

  const handleTargetMarketChange = (market: string, checked: boolean) => {
    if (checked) {
      setTargetMarkets(prev => [...prev, market]);
    } else {
      setTargetMarkets(prev => prev.filter(m => m !== market));
    }
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Add New Company</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} data-testid="input-company-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-sector">
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sectorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Describe the company's business activities"
                    {...field}
                    data-testid="textarea-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="teamSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Size</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-team-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamSizeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currentMarkets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Markets</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Jordan, UAE"
                      {...field}
                      data-testid="input-current-markets"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Primary Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} data-testid="input-contact-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="primaryContactPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Job title" {...field} data-testid="input-contact-position" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryContactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@company.com" {...field} data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="primaryContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} data-testid="input-contact-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Target Markets */}
          <div>
            <FormLabel>Target Markets</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
              {marketOptions.map((market) => (
                <div key={market.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={market.value}
                    checked={targetMarkets.includes(market.value)}
                    onCheckedChange={(checked) => handleTargetMarketChange(market.value, checked as boolean)}
                    data-testid={`checkbox-market-${market.value.toLowerCase()}`}
                  />
                  <label htmlFor={market.value} className="text-sm text-foreground">
                    {market.label}
                  </label>
                </div>
              ))}
            </div>
            {targetMarkets.length === 0 && (
              <p className="text-sm text-destructive mt-1">Select at least one target market</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-6 border-t border-border">
            <Button 
              type="button" 
              variant="outline"
              onClick={onSuccess}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCompanyMutation.isPending}
              data-testid="button-submit-company"
            >
              {createCompanyMutation.isPending ? "Creating..." : "Create Company"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
