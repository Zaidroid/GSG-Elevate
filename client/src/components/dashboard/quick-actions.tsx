import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Plus, Scale, Upload, BarChart3 } from "lucide-react";
import CompanyForm from "@/components/forms/company-form";
import LegalTaskForm from "@/components/forms/legal-task-form";

export default function QuickActions() {
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showLegalTaskForm, setShowLegalTaskForm] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full justify-start"
            onClick={() => setShowCompanyForm(true)}
            data-testid="button-quick-add-company"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Company
          </Button>
          
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            onClick={() => setShowLegalTaskForm(true)}
            data-testid="button-quick-create-legal-task"
          >
            <Scale className="w-4 h-4 mr-2" />
            Create Legal Task
          </Button>
          
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            data-testid="button-quick-upload-document"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
          
          <Button 
            variant="secondary" 
            className="w-full justify-start"
            data-testid="button-quick-generate-report"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showCompanyForm} onOpenChange={setShowCompanyForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <CompanyForm onSuccess={() => setShowCompanyForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showLegalTaskForm} onOpenChange={setShowLegalTaskForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <LegalTaskForm onSuccess={() => setShowLegalTaskForm(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
