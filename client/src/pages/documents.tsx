import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Upload, ExternalLink, Calendar } from "lucide-react";
import DocumentUpload from "@/components/forms/document-upload";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Document } from "@shared/schema";

export default function Documents() {
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.type.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800",
      review: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      signed: "bg-blue-100 text-blue-800",
    };
    return colors[status] || colors.draft;
  };

  const getFileTypeIcon = (mimeType: string | null) => {
    if (!mimeType) return FileText;
    
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('image')) return FileText;
    if (mimeType.includes('word') || mimeType.includes('document')) return FileText;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileText;
    
    return FileText;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Documents</h1>
          <p className="text-muted-foreground">Manage documents with Google Drive integration</p>
        </div>
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogTrigger asChild>
            <Button data-testid="button-upload-document">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DocumentUpload onSuccess={() => setShowUpload(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search-documents"
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => {
          const FileIcon = getFileTypeIcon(document.mimeType);
          
          return (
            <Card key={document.id} className="hover:shadow-lg transition-shadow" data-testid={`card-document-${document.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate" data-testid={`text-document-name-${document.id}`}>
                        {document.name}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {document.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {document.driveUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(document.driveUrl!, '_blank')}
                      data-testid={`button-open-drive-${document.id}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="secondary" className={getStatusColor(document.status || 'draft')}>
                      {document.status || 'draft'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Size:</span>
                    <span className="font-medium" data-testid={`text-file-size-${document.id}`}>
                      {formatFileSize(document.size)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <span className="font-medium" data-testid={`text-version-${document.id}`}>
                      {document.version || '1.0'}
                    </span>
                  </div>
                  
                  {document.createdAt && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span data-testid={`text-created-date-${document.id}`}>
                        {new Date(document.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-4">
            {search ? "Try adjusting your search criteria" : "Get started by uploading your first document"}
          </p>
          {!search && (
            <Button data-testid="button-upload-first-document">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
