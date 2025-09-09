// Common types and interfaces for the Market Access Management System

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'system_admin' | 'program_officer' | 'legal_advisor' | 'company_poc';
  profilePictureUrl?: string;
  phone?: string;
  companyId?: string;
  googleTokens?: GoogleTokens;
  preferences: UserPreferences;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken: string;
  expiryDate: string;
  scope: string[];
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    inApp: boolean;
    reminders: boolean;
  };
  language: 'en' | 'ar';
  timezone: string;
}

export interface DashboardMetrics {
  activeCompanies: number;
  legalTasks: number;
  totalDocuments: number;
  averageProgress: number;
}

export interface MarketRegistration {
  status: 'not_started' | 'in_progress' | 'completed' | 'rejected';
  startDate?: string;
  completedDate?: string;
  notes?: string;
  documents?: string[];
}

export interface StatusUpdate {
  id: string;
  message: string;
  status: string;
  updatedBy: string;
  updatedAt: string;
  isPublic: boolean;
}

export interface ActivityChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface TaskChecklist {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

export interface TaskComment {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  isInternal: boolean;
}

export interface TaskReminder {
  type: 'deadline' | 'follow_up' | 'custom';
  scheduledFor: string;
  sent: boolean;
  message?: string;
}

export interface DocumentVersionHistory {
  version: string;
  googleDriveRevisionId: string;
  modifiedAt: string;
  modifiedBy: string;
  changes: string;
}

export interface ApprovalWorkflowStep {
  stepId: string;
  approverUserId: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  comments?: string;
}

export interface ApprovalWorkflow {
  steps: ApprovalWorkflowStep[];
  currentStep: number;
}

export interface DigitalSignature {
  userId: string;
  signedAt: string;
  ipAddress: string;
}

export interface NotificationAction {
  label: string;
  url: string;
  primary: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CompanyFormData {
  name: string;
  sector: string;
  description?: string;
  teamSize?: string;
  foundedYear?: number;
  website?: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone?: string;
  primaryContactPosition?: string;
  currentMarkets: string[];
  targetMarkets: string[];
}

export interface LegalNeedFormData {
  companyId: string;
  category: string;
  subcategory?: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  expectedCompletionDate?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  type: string;
  companyId: string;
  legalNeedId?: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  estimatedHours?: number;
}

// Filter and search types
export interface CompanyFilters {
  search?: string;
  sector?: string;
  teamSize?: string;
  targetMarkets?: string[];
  status?: string;
}

export interface LegalNeedFilters {
  search?: string;
  category?: string;
  priority?: string;
  status?: string;
  companyId?: string;
  assignedTo?: string;
}

export interface TaskFilters {
  search?: string;
  type?: string;
  priority?: string;
  status?: string;
  companyId?: string;
  assignedTo?: string;
  dueDate?: string;
}

// Google API types
export interface GoogleDriveIntegration {
  folderId: string;
  folderUrl: string;
  lastSyncAt?: string;
  syncStatus: 'synced' | 'syncing' | 'error';
}

export interface GoogleSheetsIntegration {
  spreadsheetId: string;
  spreadsheetUrl: string;
  lastSyncAt?: string;
  syncStatus: 'synced' | 'syncing' | 'error';
}

// Utility types
export type EntityType = 'company' | 'legal_need' | 'task' | 'document' | 'activity';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
export type UserRole = 'system_admin' | 'program_officer' | 'legal_advisor' | 'company_poc';
export type Sector = 'technology' | 'healthcare' | 'renewable_energy' | 'fintech' | 'manufacturing' | 'other';
export type LegalCategory = 
  | 'company_registration'
  | 'contract_management'
  | 'ip_protection'
  | 'hr_frameworks'
  | 'digital_policies'
  | 'regulatory_compliance';

// Country/Market types
export type SupportedCountry = 'Jordan' | 'Oman' | 'UAE' | 'KSA' | 'USA' | 'Palestine';

export interface CountryInfo {
  code: string;
  name: string;
  registrationRequirements: string[];
  averageProcessingTime: number; // days
}

// System configuration types
export interface SystemSettings {
  googleDrive: {
    rootFolderId: string;
    templateFolderId: string;
    maxFileSize: number;
    allowedFileTypes: string[];
  };
  googleSheets: {
    masterSheetId: string;
    templateSheetId: string;
    syncInterval: number;
    batchSize: number;
  };
  notifications: {
    reminderIntervals: number[];
    escalationRules: {
      overdueDays: number;
      escalateTo: string[];
    }[];
  };
  limits: {
    maxTasksPerCompany: number;
    maxDocumentsPerCompany: number;
    sessionTimeout: number;
  };
}

// Analytics and reporting types
export interface AnalyticsData {
  marketsEntered: number;
  revenueGrowth: number;
  avgProcessingTime: number;
  totalTargetMarkets: number;
  companiesWithTargets: number;
  completionRates: {
    overall: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  };
  trends: {
    companiesAdded: { month: string; count: number }[];
    tasksCompleted: { month: string; count: number }[];
    documentsProcessed: { month: string; count: number }[];
  };
}

export interface ReportParams {
  startDate: string;
  endDate: string;
  companyIds?: string[];
  categories?: string[];
  includeCharts?: boolean;
  format: 'pdf' | 'excel' | 'csv';
}
