import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDocumentSchema, type InsertDocument } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onSuccess?: () => void;
}

type DocumentFormData = {
  name: string;
  description: string;
  type: string;
  status: string;
  companyId: string;
  url: string;
  mimeType: string;
  size: number;
};

export default function DocumentUpload({ onSuccess }: DocumentUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<DocumentFormData>({
    defaultValues: {
      name: "",
      description: "",
      type: "contract",
      status: "draft",
      companyId: "",
      url: "",
      mimeType: "",
      size: 0
    },
  });

  const createDocumentMutation = useMutation({
    mutationFn: (data: DocumentFormData) => {
      const docData: InsertDocument = {
        name: data.name,
        description: data.description || null,
        type: data.type,
        status: data.status,
        companyId: data.companyId,
        url: data.url,
        mimeType: data.mimeType || null,
        size: data.size || null
      };
      return apiRequest("/api/documents", "POST", docData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("name", file.name);
      form.setValue("mimeType", file.type);
      form.setValue("size", file.size);
      form.setValue("url", `uploads/${file.name}`); // Simulated URL
    }
  };

  const onSubmit = (data: DocumentFormData) => {
    createDocumentMutation.mutate(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Upload Document</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-document">
          {/* File Upload */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:text-primary/80">
                    Click to upload
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    data-testid="input-file-upload"
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB
                </p>
              </div>
              {selectedFile && (
                <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-green-600">
                  <FileText className="h-4 w-4" />
                  <span>{selectedFile.name}</span>
                </div>
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter document name" 
                    {...field} 
                    data-testid="input-document-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter document description" 
                    rows={3}
                    {...field} 
                    data-testid="textarea-document-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-document-type">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="legal_opinion">Legal Opinion</SelectItem>
                      <SelectItem value="compliance_report">Compliance Report</SelectItem>
                      <SelectItem value="market_analysis">Market Analysis</SelectItem>
                      <SelectItem value="presentation">Presentation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-document-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="signed">Signed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company ID (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter company ID if applicable" 
                    {...field} 
                    data-testid="input-document-company"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="submit" 
              disabled={createDocumentMutation.isPending || !selectedFile}
              data-testid="button-submit-document"
            >
              {createDocumentMutation.isPending ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}