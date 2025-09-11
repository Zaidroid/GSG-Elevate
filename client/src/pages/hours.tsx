import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { 
  Clock, 
  Plus, 
  Download, 
  Calendar as CalendarIcon,
  Timer,
  TrendingUp,
  Users,
  DollarSign,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Square,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Form schemas
const timeEntrySchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  taskDescription: z.string().min(1, "Task description is required"),
  hours: z.number().min(0.1, "Minimum 0.1 hours").max(24, "Maximum 24 hours per entry"),
  date: z.date(),
  category: z.enum(["legal_support", "research", "documentation", "meetings", "administration", "other"]),
  notes: z.string().optional(),
});

type TimeEntryFormData = z.infer<typeof timeEntrySchema>;

// Real data from API - no mock fallbacks

export default function HoursTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("tracker");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentProject, setCurrentProject] = useState("");
  const [currentTask, setCurrentTask] = useState("");
  const { toast } = useToast();

  // Fetch data using React Query
  const { data: timeEntries, isLoading: entriesLoading, error: entriesError } = useQuery<any>({
    queryKey: ["/api/hours", "entries"],
  });

  const { data: projects, isLoading: projectsLoading, error: projectsError } = useQuery<any>({
    queryKey: ["/api/hours", "projects"],
  });

  const { data: weeklySummary, isLoading: summaryLoading, error: summaryError } = useQuery<any>({
    queryKey: ["/api/hours", "weekly-summary"],
  });

  // Form setup
  const form = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      date: new Date(),
      category: "legal_support",
    },
  });

  // Mutations
  const addEntryMutation = useMutation({
    mutationFn: (data: TimeEntryFormData) => apiRequest("/api/hours/entries", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hours", "entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hours", "weekly-summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hours", "projects"] });
      toast({ title: "Time entry added successfully" });
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to add time entry", variant: "destructive" });
    },
  });

  const syncToSheetsMethod = useMutation({
    mutationFn: () => apiRequest("/api/hours/sync-sheets", "POST"),
    onSuccess: () => {
      toast({ title: "Successfully synced to Google Sheets" });
    },
    onError: () => {
      toast({ title: "Failed to sync to Google Sheets", variant: "destructive" });
    },
  });

  // Timer functions
  const startTimer = () => {
    if (!currentProject || !currentTask) {
      toast({ title: "Select project and task first", variant: "destructive" });
      return;
    }
    setTimerRunning(true);
    // In a real app, you'd start an interval here
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    if (timerSeconds > 0) {
      const hours = timerSeconds / 3600;
      form.setValue("hours", Math.round(hours * 100) / 100);
      form.setValue("taskDescription", currentTask);
      form.setValue("projectId", currentProject);
      setTimerSeconds(0);
      toast({ title: "Timer stopped - time added to form" });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const onSubmit = (data: TimeEntryFormData) => {
    addEntryMutation.mutate(data);
  };

  const handleExportReport = async (type: string) => {
    try {
      const response = await fetch(`/api/hours/export/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hours-${type}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const isLoading = entriesLoading || projectsLoading || summaryLoading;
  const hasError = entriesError || projectsError || summaryError;

  if (hasError) {
    return (
      <div className="p-6">
        <Card className="text-center py-8" data-testid="card-error-state">
          <CardContent>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load hours tracking data. Please try again.
            </p>
            <Button 
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["/api/hours"] });
              }}
              data-testid="button-retry-load"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compensation Hours Tracker</h1>
          <p className="text-muted-foreground">
            Track time, manage projects, and sync with Google Sheets
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => syncToSheetsMethod.mutate()}
            disabled={syncToSheetsMethod.isPending}
            data-testid="button-sync-sheets"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Sync to Sheets
          </Button>
          <Button 
            variant="outline"
            onClick={() => handleExportReport('timesheet')}
            data-testid="button-export-timesheet"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-total-hours">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-hours">
              {weeklySummary?.totalHours ?? 0}h
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              This week
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-billable-hours">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-billable-hours">
              {weeklySummary?.billableHours ?? 0}h
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>86% of total time</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-projects">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-active-projects">
              {weeklySummary?.projects ?? 0}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Across all clients</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-weekly-goal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-weekly-progress">
              {Math.round(((weeklySummary?.totalHours ?? 0) / 40) * 100)}%
            </div>
            <Progress 
              value={((weeklySummary?.totalHours ?? 0) / 40) * 100} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList data-testid="tabs-hours-tracker">
          <TabsTrigger value="tracker" data-testid="tab-time-tracker">Time Tracker</TabsTrigger>
          <TabsTrigger value="entries" data-testid="tab-time-entries">Time Entries</TabsTrigger>
          <TabsTrigger value="projects" data-testid="tab-project-budgets">Project Budgets</TabsTrigger>
          <TabsTrigger value="reports" data-testid="tab-reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timer Section */}
            <Card data-testid="card-timer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Live Timer
                </CardTitle>
                <CardDescription>Track time in real-time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold" data-testid="text-timer-display">
                    {formatTime(timerSeconds)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label>Project</Label>
                    <Select value={currentProject} onValueChange={setCurrentProject}>
                      <SelectTrigger data-testid="select-timer-project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {(projects || []).map((project: any) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Task Description</Label>
                    <Input 
                      value={currentTask}
                      onChange={(e) => setCurrentTask(e.target.value)}
                      placeholder="What are you working on?"
                      data-testid="input-timer-task"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  {!timerRunning ? (
                    <Button onClick={startTimer} data-testid="button-timer-start">
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={pauseTimer} data-testid="button-timer-pause">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button variant="destructive" onClick={stopTimer} data-testid="button-timer-stop">
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry Form */}
            <Card data-testid="card-manual-entry">
              <CardHeader>
                <CardTitle>Manual Time Entry</CardTitle>
                <CardDescription>Add time entries manually</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="projectId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-entry-project">
                                <SelectValue placeholder="Select project" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {(projects || []).map((project: any) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
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
                      name="taskDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Describe the task" data-testid="input-entry-task" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hours</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.1" 
                                {...field} 
                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                placeholder="0.0"
                                data-testid="input-entry-hours"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className="w-full pl-3 text-left font-normal"
                                    data-testid="button-entry-date"
                                  >
                                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-entry-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="legal_support">Legal Support</SelectItem>
                              <SelectItem value="research">Research</SelectItem>
                              <SelectItem value="documentation">Documentation</SelectItem>
                              <SelectItem value="meetings">Meetings</SelectItem>
                              <SelectItem value="administration">Administration</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Additional notes..."
                              className="min-h-[80px]"
                              data-testid="textarea-entry-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={addEntryMutation.isPending}
                      data-testid="button-add-entry"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Time Entry
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          <Card data-testid="card-time-entries">
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
              <CardDescription>View and manage your time entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(timeEntries || []).length > 0 ? (timeEntries || []).map((entry: any, index: number) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`entry-${index}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{entry.projectName}</h4>
                        <Badge variant={entry.status === 'approved' ? 'default' : 'secondary'}>
                          {entry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.task}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{entry.date}</span>
                        <span>{entry.category.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{entry.hours}h</div>
                      {entry.status === 'approved' ? (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-500 ml-auto" />
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No Time Entries</h3>
                    <p>Add your first time entry using the tracker above.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(projects || []).map((project: any) => (
              <Card key={project.id} data-testid={`project-${project.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>Budget tracking and utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Budget Usage</span>
                      <span className="text-sm text-muted-foreground">
                        {project.spent}h / {project.budget}h
                      </span>
                    </div>
                    <Progress value={(project.spent / project.budget) * 100} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Remaining: {project.budget - project.spent}h</span>
                      <span className={`font-medium ${(project.spent / project.budget) > 0.8 ? 'text-red-500' : 'text-green-500'}`}>
                        {Math.round(((project.spent / project.budget) * 100))}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card data-testid="card-reports">
            <CardHeader>
              <CardTitle>Time Reports & Analytics</CardTitle>
              <CardDescription>Export detailed time reports and analytics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={() => handleExportReport('weekly')} data-testid="button-export-weekly">
                  <Download className="w-4 h-4 mr-2" />
                  Weekly Timesheet
                </Button>
                <Button variant="outline" onClick={() => handleExportReport('monthly')} data-testid="button-export-monthly">
                  <Download className="w-4 h-4 mr-2" />
                  Monthly Summary
                </Button>
                <Button variant="outline" onClick={() => handleExportReport('project')} data-testid="button-export-project">
                  <Download className="w-4 h-4 mr-2" />
                  Project Report
                </Button>
                <Button variant="outline" onClick={() => handleExportReport('detailed')} data-testid="button-export-detailed">
                  <Download className="w-4 h-4 mr-2" />
                  Detailed Report
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Google Sheets Integration</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Automatically sync your time entries to Google Sheets for advanced reporting and payroll processing.
                </p>
                <Button onClick={() => syncToSheetsMethod.mutate()} disabled={syncToSheetsMethod.isPending}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {syncToSheetsMethod.isPending ? 'Syncing...' : 'Sync to Google Sheets'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}