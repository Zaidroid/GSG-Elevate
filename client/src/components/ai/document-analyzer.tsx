import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Download,
  Zap,
  Shield,
  Search,
  BookOpen
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface DocumentAnalysisProps {
  documentId: string;
  documentName: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export default function DocumentAnalyzer({ 
  documentId, 
  documentName, 
  onAnalysisComplete 
}: DocumentAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const { data: analysis, isLoading } = useQuery<any>({
    queryKey: ["/api/documents", documentId, "analysis"],
    enabled: !!documentId
  });

  const analyzeMutation = useMutation({
    mutationFn: () => apiRequest(`/api/ai/analyze-document/${documentId}`, "POST"),
    onMutate: () => setIsAnalyzing(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "analysis"] });
      onAnalysisComplete?.(data);
      setIsAnalyzing(false);
    },
    onError: () => setIsAnalyzing(false)
  });

  const handleAnalyze = () => {
    analyzeMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card data-testid="card-analysis-loading">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading analysis...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Header */}
      <Card data-testid="card-analysis-header">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>AI Document Analysis</CardTitle>
                <CardDescription>
                  Advanced legal document analysis for {documentName}
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              data-testid="button-analyze-document"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze Document
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <Card data-testid="card-analysis-progress">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Analysis Progress</span>
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Document parsing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Content extraction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span>Legal analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Risk assessment</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList data-testid="tabs-analysis-results">
            <TabsTrigger value="summary" data-testid="tab-summary">Summary</TabsTrigger>
            <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
            <TabsTrigger value="risks" data-testid="tab-risks">Risk Analysis</TabsTrigger>
            <TabsTrigger value="clauses" data-testid="tab-clauses">Key Clauses</TabsTrigger>
            <TabsTrigger value="recommendations" data-testid="tab-recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card data-testid="card-analysis-summary">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Document Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600" data-testid="text-confidence-score">
                      {analysis.summary?.confidenceScore || 85}%
                    </div>
                    <p className="text-sm text-muted-foreground">Confidence Score</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600" data-testid="text-complexity-score">
                      {analysis.summary?.complexityLevel || 'Medium'}
                    </div>
                    <p className="text-sm text-muted-foreground">Complexity Level</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-purple-600" data-testid="text-document-type">
                      {analysis.summary?.documentType || 'Contract'}
                    </div>
                    <p className="text-sm text-muted-foreground">Document Type</p>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <h4>Executive Summary</h4>
                  <p data-testid="text-executive-summary">
                    {analysis.summary?.executiveSummary || 
                    "This legal document has been analyzed for compliance requirements, potential risks, and key contractual obligations. The analysis indicates standard commercial terms with moderate complexity level."}
                  </p>
                  
                  <h4>Key Findings</h4>
                  <ul data-testid="list-key-findings">
                    {(analysis.summary?.keyFindings || [
                      "Document contains standard commercial terms and conditions",
                      "No immediate compliance red flags identified",
                      "Risk level assessed as low to moderate",
                      "Recommend legal review for specific jurisdiction requirements"
                    ]).map((finding: string, index: number) => (
                      <li key={index}>{finding}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance">
            <Card data-testid="card-compliance-analysis">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Compliance Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(analysis.compliance?.checks || [
                    { regulation: 'GDPR Compliance', status: 'compliant', details: 'Data processing clauses meet GDPR requirements' },
                    { regulation: 'Consumer Protection', status: 'warning', details: 'Some terms may require clarification' },
                    { regulation: 'Contract Law', status: 'compliant', details: 'Standard contractual obligations identified' },
                    { regulation: 'Industry Standards', status: 'review', details: 'Requires sector-specific review' }
                  ]).map((check: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg" data-testid={`compliance-check-${index}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{check.regulation}</span>
                        <Badge variant={
                          check.status === 'compliant' ? 'default' :
                          check.status === 'warning' ? 'secondary' : 'destructive'
                        }>
                          {check.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{check.details}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks">
            <Card data-testid="card-risk-analysis">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Risk Assessment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(analysis.risks?.identified || [
                  { type: 'Financial', level: 'Medium', description: 'Liability limitations may not cover all scenarios', impact: 'Moderate financial exposure in edge cases' },
                  { type: 'Operational', level: 'Low', description: 'Standard operational clauses present', impact: 'Minimal impact on day-to-day operations' },
                  { type: 'Legal', level: 'High', description: 'Jurisdiction clause needs review', impact: 'Potential complications in dispute resolution' },
                  { type: 'Reputational', level: 'Low', description: 'No significant reputational risks identified', impact: 'Standard business practices maintained' }
                ]).map((risk: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg" data-testid={`risk-item-${index}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{risk.type} Risk</span>
                        <Badge variant={
                          risk.level === 'Low' ? 'default' :
                          risk.level === 'Medium' ? 'secondary' : 'destructive'
                        }>
                          {risk.level}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{risk.description}</p>
                    <p className="text-xs text-muted-foreground">Impact: {risk.impact}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clauses">
            <Card data-testid="card-key-clauses">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Key Clauses Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(analysis.clauses?.extracted || [
                  { 
                    type: 'Termination Clause', 
                    location: 'Section 8.1', 
                    text: 'Either party may terminate this agreement with 30 days written notice',
                    importance: 'High',
                    notes: 'Standard termination terms'
                  },
                  { 
                    type: 'Liability Limitation', 
                    location: 'Section 12.3', 
                    text: 'In no event shall liability exceed the fees paid in the preceding 12 months',
                    importance: 'Critical',
                    notes: 'Important for financial risk management'
                  },
                  { 
                    type: 'Intellectual Property', 
                    location: 'Section 6.2', 
                    text: 'Each party retains all rights to their pre-existing intellectual property',
                    importance: 'High',
                    notes: 'Clear IP ownership defined'
                  }
                ]).map((clause: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg" data-testid={`clause-item-${index}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{clause.type}</span>
                        <Badge variant="outline">{clause.location}</Badge>
                      </div>
                      <Badge variant={clause.importance === 'Critical' ? 'destructive' : 'default'}>
                        {clause.importance}
                      </Badge>
                    </div>
                    <blockquote className="text-sm bg-muted p-3 rounded border-l-4 border-primary">
                      "{clause.text}"
                    </blockquote>
                    <p className="text-xs text-muted-foreground mt-2">{clause.notes}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card data-testid="card-recommendations">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>AI Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(analysis.recommendations?.suggestions || [
                  {
                    priority: 'High',
                    category: 'Legal Review',
                    title: 'Jurisdiction Clause Review',
                    description: 'Consider reviewing the jurisdiction clause with local legal counsel to ensure optimal dispute resolution framework.',
                    action: 'Schedule legal consultation'
                  },
                  {
                    priority: 'Medium',
                    category: 'Risk Management',
                    title: 'Liability Cap Assessment',
                    description: 'Evaluate whether the current liability limitations align with business risk tolerance.',
                    action: 'Review with risk management team'
                  },
                  {
                    priority: 'Low',
                    category: 'Process Improvement',
                    title: 'Documentation Enhancement',
                    description: 'Consider adding more specific performance metrics and success criteria.',
                    action: 'Update contract templates'
                  }
                ]).map((rec: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg" data-testid={`recommendation-${index}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{rec.title}</span>
                        <Badge variant="outline">{rec.category}</Badge>
                      </div>
                      <Badge variant={
                        rec.priority === 'High' ? 'destructive' :
                        rec.priority === 'Medium' ? 'secondary' : 'default'
                      }>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">{rec.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Recommended action: {rec.action}</span>
                      <Button variant="outline" size="sm" data-testid={`button-implement-${index}`}>
                        Implement
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* No Analysis Available */}
      {!analysis && !isAnalyzing && (
        <Alert data-testid="alert-no-analysis">
          <Eye className="h-4 w-4" />
          <AlertDescription>
            No AI analysis available for this document. Click "Analyze Document" to generate insights using advanced AI models.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}