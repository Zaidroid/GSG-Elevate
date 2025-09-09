import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Settings, 
  Bell, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Mail,
  MessageSquare
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: string;
    conditions: any[];
  };
  actions: {
    type: string;
    config: any;
  }[];
  isActive: boolean;
  lastRun?: string;
  executionCount: number;
}

export default function AutomationEngine() {
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: workflowRules, isLoading } = useQuery<WorkflowRule[]>({
    queryKey: ["/api/workflow/rules"],
  });

  const { data: automationStats } = useQuery<any>({
    queryKey: ["/api/workflow/stats"],
  });

  const toggleRuleMutation = useMutation({
    mutationFn: ({ ruleId, isActive }: { ruleId: string; isActive: boolean }) =>
      apiRequest(`/api/workflow/rules/${ruleId}/toggle`, "POST", { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow/rules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow/stats"] });
    }
  });

  const executeRuleMutation = useMutation({
    mutationFn: (ruleId: string) =>
      apiRequest(`/api/workflow/rules/${ruleId}/execute`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflow/rules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workflow/stats"] });
    }
  });

  const handleToggleRule = (ruleId: string, isActive: boolean) => {
    toggleRuleMutation.mutate({ ruleId, isActive });
  };

  const handleExecuteRule = (ruleId: string) => {
    executeRuleMutation.mutate(ruleId);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
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
          <h1 className="text-3xl font-bold tracking-tight">Workflow Automation</h1>
          <p className="text-muted-foreground">
            Intelligent automation rules and triggers for streamlined operations
          </p>
        </div>
        <Button data-testid="button-create-rule">
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Automation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-stat-active-rules">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-rules">
              {automationStats?.activeRules || 12}
            </div>
            <p className="text-xs text-muted-foreground">
              +2 new this month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-executions">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-executions-today">
              {automationStats?.executionsToday || 87}
            </div>
            <p className="text-xs text-muted-foreground">
              +15% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-time-saved">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-time-saved">
              {automationStats?.timeSaved || '24h'}
            </div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-stat-success-rate">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-success-rate">
              {automationStats?.successRate || '96.5'}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2.1% improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Rules */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList data-testid="tabs-automation">
          <TabsTrigger value="rules" data-testid="tab-rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="triggers" data-testid="tab-triggers">Trigger Library</TabsTrigger>
          <TabsTrigger value="actions" data-testid="tab-actions">Action Library</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {(workflowRules || [
              {
                id: '1',
                name: 'Legal Document Review Alert',
                description: 'Automatically notify legal team when new contracts are uploaded',
                trigger: { type: 'document_uploaded', conditions: [] },
                actions: [{ type: 'send_notification', config: {} }],
                isActive: true,
                lastRun: '2024-01-15T10:30:00Z',
                executionCount: 45
              },
              {
                id: '2',
                name: 'Compliance Deadline Reminder',
                description: 'Send reminders 7 days before compliance deadlines',
                trigger: { type: 'schedule', conditions: [] },
                actions: [{ type: 'send_email', config: {} }],
                isActive: true,
                lastRun: '2024-01-15T08:00:00Z',
                executionCount: 23
              },
              {
                id: '3',
                name: 'Market Entry Progress Update',
                description: 'Weekly progress reports to stakeholders',
                trigger: { type: 'schedule', conditions: [] },
                actions: [{ type: 'generate_report', config: {} }],
                isActive: false,
                lastRun: '2024-01-10T16:00:00Z',
                executionCount: 8
              },
              {
                id: '4',
                name: 'Risk Assessment Trigger',
                description: 'Trigger risk assessment when legal issues are identified',
                trigger: { type: 'legal_issue_detected', conditions: [] },
                actions: [{ type: 'create_task', config: {} }],
                isActive: true,
                lastRun: '2024-01-14T14:20:00Z',
                executionCount: 12
              }
            ]).map((rule) => (
              <Card key={rule.id} className={`transition-all ${selectedRule === rule.id ? 'ring-2 ring-primary' : ''}`} data-testid={`card-rule-${rule.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <div>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <CardDescription>{rule.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {rule.executionCount} runs
                      </Badge>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                        data-testid={`switch-rule-${rule.id}`}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Zap className="w-4 h-4 mr-1" />
                        Trigger
                      </h4>
                      <Badge variant="secondary">{rule.trigger.type.replace('_', ' ')}</Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Settings className="w-4 h-4 mr-1" />
                        Actions
                      </h4>
                      <div className="space-y-1">
                        {rule.actions.map((action, index) => (
                          <Badge key={index} variant="outline">
                            {action.type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Last Run
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {rule.lastRun ? new Date(rule.lastRun).toLocaleString() : 'Never'}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExecuteRule(rule.id)}
                          data-testid={`button-execute-${rule.id}`}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Run Now
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedRule(rule.id)}
                          data-testid={`button-edit-${rule.id}`}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: 'Document Events', icon: FileText, triggers: ['Document uploaded', 'Document modified', 'Document reviewed'] },
              { type: 'Task Events', icon: CheckCircle, triggers: ['Task created', 'Task completed', 'Task overdue'] },
              { type: 'User Events', icon: Users, triggers: ['User assigned', 'User login', 'User status change'] },
              { type: 'Schedule Events', icon: Calendar, triggers: ['Daily schedule', 'Weekly schedule', 'Custom schedule'] },
              { type: 'Compliance Events', icon: AlertCircle, triggers: ['Deadline approaching', 'Compliance breach', 'Audit required'] },
              { type: 'Communication', icon: MessageSquare, triggers: ['Email received', 'Message sent', 'Notification triggered'] }
            ].map((category, index) => (
              <Card key={index} data-testid={`card-trigger-category-${index}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <category.icon className="w-5 h-5" />
                    <span>{category.type}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {category.triggers.map((trigger, triggerIndex) => (
                    <div key={triggerIndex} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{trigger}</span>
                      <Button variant="ghost" size="sm" data-testid={`button-add-trigger-${index}-${triggerIndex}`}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: 'Notifications', icon: Bell, actions: ['Send email', 'Push notification', 'SMS alert'] },
              { type: 'Task Management', icon: CheckCircle, actions: ['Create task', 'Update status', 'Assign user'] },
              { type: 'Document Operations', icon: FileText, actions: ['Generate report', 'Create document', 'Update metadata'] },
              { type: 'Communication', icon: Mail, actions: ['Send email', 'Create message', 'Schedule meeting'] },
              { type: 'Data Operations', icon: Settings, actions: ['Update database', 'Sync data', 'Export data'] },
              { type: 'External Systems', icon: Zap, actions: ['API call', 'Webhook trigger', 'Integration sync'] }
            ].map((category, index) => (
              <Card key={index} data-testid={`card-action-category-${index}`}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <category.icon className="w-5 h-5" />
                    <span>{category.type}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {category.actions.map((action, actionIndex) => (
                    <div key={actionIndex} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{action}</span>
                      <Button variant="ghost" size="sm" data-testid={`button-add-action-${index}-${actionIndex}`}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card data-testid="card-execution-history">
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>Last 50 automation rule executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rule: 'Legal Document Review Alert', status: 'success', time: '5 minutes ago', details: 'Notified 3 team members' },
                  { rule: 'Compliance Deadline Reminder', status: 'success', time: '1 hour ago', details: 'Sent 12 reminder emails' },
                  { rule: 'Risk Assessment Trigger', status: 'error', time: '2 hours ago', details: 'Failed to create task - user not found' },
                  { rule: 'Market Entry Progress Update', status: 'success', time: '3 hours ago', details: 'Generated weekly report' },
                  { rule: 'Legal Document Review Alert', status: 'success', time: '4 hours ago', details: 'Notified 2 team members' }
                ].map((execution, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded" data-testid={`execution-${index}`}>
                    <div className="flex items-center space-x-3">
                      {execution.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium">{execution.rule}</p>
                        <p className="text-sm text-muted-foreground">{execution.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={execution.status === 'success' ? 'default' : 'destructive'}>
                        {execution.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{execution.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}