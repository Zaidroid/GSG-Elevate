import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomBytes } from "crypto";
import { storage } from "./storage";
import { 
  insertCompanySchema, insertLegalNeedSchema, insertTaskSchema, 
  insertActivitySchema, insertDocumentSchema, insertUserSchema 
} from "@shared/schema";
import { z } from "zod";
import { aiService } from "./ai-service";
import { googleService } from "./google-service";
import { 
  requireAuth, requireAdmin, requireUserManagement, requireLegalAccess,
  requireCompanyAccess, requireCompanyModify, checkCompanyAccess,
  type AuthenticatedRequest 
} from "./auth-middleware";
// Auth helper functions
function generateGoogleOAuthUrl(
  clientId: string,
  redirectUri: string,
  state: string,
  scopes: string[] = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ]
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

function generateSecureState(): string {
  return randomBytes(32).toString('hex');
}

async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<any> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.status}`);
  }
  
  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.get("/api/auth/google-url", async (req, res) => {
    try {
      const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;
      const state = generateSecureState();
      
      // Store state in session for validation
      (req as any).session.oauthState = state;
      
      const url = generateGoogleOAuthUrl(
        process.env.GOOGLE_CLIENT_ID!,
        redirectUri,
        state
      );
      res.json({ url });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate OAuth URL" });
    }
  });

  app.post("/api/auth/google-callback", async (req, res) => {
    try {
      const { code, state } = req.body;
      if (!code) {
        return res.status(400).json({ message: "Authorization code required" });
      }
      
      // Validate state parameter for CSRF protection
      if (!state || state !== (req as any).session.oauthState) {
        return res.status(400).json({ message: "Invalid state parameter" });
      }
      
      // Clear the state from session after validation
      delete (req as any).session.oauthState;

      const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;
      
      // Exchange code for tokens
      const tokenData = await exchangeCodeForTokens(
        code,
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        redirectUri
      );

      // Get user info from Google
      const userResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`
      );
      const googleUser = await userResponse.json();

      // Check if user exists
      let user = await storage.getUserByEmail(googleUser.email);
      
      if (!user) {
        // Create new user with default role
        const userData = {
          email: googleUser.email,
          name: googleUser.name,
          role: 'program_officer' as const,
          profilePictureUrl: googleUser.picture,
          googleTokens: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiryDate: new Date(Date.now() + tokenData.expires_in * 1000),
            scope: tokenData.scope?.split(' ') || []
          },
          lastLoginAt: new Date(),
          isActive: true
        };
        user = await storage.createUser(userData);
      } else {
        // Update existing user's tokens and last login
        await storage.updateUser(user.id, {
          googleTokens: {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiryDate: new Date(Date.now() + tokenData.expires_in * 1000),
            scope: tokenData.scope?.split(' ') || []
          },
          lastLoginAt: new Date()
        });
      }

      // Set session
      (req as any).session.userId = user.id;
      
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      console.error('Auth callback error:', error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role 
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user info" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  // Google integration routes
  app.post("/api/google/initialize", requireAuth, requireAdmin, async (req, res) => {
    try {
      const structure = await googleService.initializeDriveStructure();
      const spreadsheetId = await googleService.createTrackingSpreadsheet();
      
      res.json({
        message: "Google integration initialized successfully",
        driveStructure: structure,
        spreadsheetId: spreadsheetId
      });
    } catch (error) {
      console.error('Google initialization error:', error);
      res.status(500).json({ message: "Failed to initialize Google integration" });
    }
  });

  app.post("/api/google/sync", requireAuth, requireUserManagement, async (req, res) => {
    try {
      const { spreadsheetId } = req.body;
      if (!spreadsheetId) {
        return res.status(400).json({ message: "Spreadsheet ID required" });
      }
      
      await googleService.performFullSync(spreadsheetId);
      res.json({ message: "Data synchronized successfully" });
    } catch (error) {
      console.error('Google sync error:', error);
      res.status(500).json({ message: "Failed to sync data" });
    }
  });

  app.post("/api/companies/:id/create-folder", requireAuth, requireCompanyModify, async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      const { parentFolderId } = req.body;
      if (!parentFolderId) {
        return res.status(400).json({ message: "Parent folder ID required" });
      }
      
      const folderId = await googleService.createCompanyFolder(company.name, parentFolderId);
      
      // Update company with folder ID
      await storage.updateCompany(company.id, {
        googleDriveFolderId: folderId
      });
      
      res.json({ 
        message: "Company folder created successfully",
        folderId: folderId
      });
    } catch (error) {
      console.error('Company folder creation error:', error);
      res.status(500).json({ message: "Failed to create company folder" });
    }
  });

  // Health check routes (public)
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  app.get("/api/health/db", async (req, res) => {
    try {
      await storage.getUsers();
      res.json({ status: "healthy", service: "database" });
    } catch (error) {
      res.status(500).json({ status: "unhealthy", service: "database", error: error.message });
    }
  });

  // Users routes
  app.get("/api/users", requireAuth, requireUserManagement, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", requireAuth, requireUserManagement, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Companies routes
  app.get("/api/companies", requireAuth, requireCompanyAccess, async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", requireAuth, requireCompanyAccess, checkCompanyAccess, async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", requireAuth, requireCompanyModify, async (req, res) => {
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      
      // Create activity log
      await storage.createActivity({
        type: 'company_created',
        action: `Company "${company.name}" was created`,
        userId: companyData.createdBy!,
        companyId: company.id,
        entityType: 'company',
        entityId: company.id,
      });
      
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.patch("/api/companies/:id", requireAuth, requireCompanyModify, checkCompanyAccess, async (req, res) => {
    try {
      const updateData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(req.params.id, updateData);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", requireAuth, requireCompanyModify, async (req, res) => {
    try {
      const success = await storage.deleteCompany(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete company" });
    }
  });

  // Legal Needs routes
  app.get("/api/legal-needs", requireAuth, requireLegalAccess, async (req, res) => {
    try {
      const companyId = req.query.companyId as string;
      let legalNeeds;
      
      if (companyId) {
        legalNeeds = await storage.getLegalNeedsByCompany(companyId);
      } else {
        legalNeeds = await storage.getLegalNeeds();
      }
      
      res.json(legalNeeds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch legal needs" });
    }
  });

  app.post("/api/legal-needs", requireAuth, requireLegalAccess, async (req, res) => {
    try {
      const legalNeedData = insertLegalNeedSchema.parse(req.body);
      const legalNeed = await storage.createLegalNeed(legalNeedData);
      
      // Create activity log
      await storage.createActivity({
        type: 'legal_need_created',
        action: `Legal need "${legalNeed.title}" was created`,
        userId: legalNeedData.createdBy!,
        companyId: legalNeed.companyId,
        entityType: 'legal_need',
        entityId: legalNeed.id,
      });
      
      res.status(201).json(legalNeed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid legal need data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create legal need" });
    }
  });

  app.patch("/api/legal-needs/:id", requireAuth, requireLegalAccess, async (req, res) => {
    try {
      const updateData = insertLegalNeedSchema.partial().parse(req.body);
      const legalNeed = await storage.updateLegalNeed(req.params.id, updateData);
      if (!legalNeed) {
        return res.status(404).json({ message: "Legal need not found" });
      }
      res.json(legalNeed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid legal need data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update legal need" });
    }
  });

  // Tasks routes
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const { companyId, assigneeId } = req.query;
      let tasks;
      
      if (companyId) {
        tasks = await storage.getTasksByCompany(companyId as string);
      } else if (assigneeId) {
        tasks = await storage.getTasksByAssignee(assigneeId as string);
      } else {
        tasks = await storage.getTasks();
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      
      // Create activity log
      await storage.createActivity({
        type: 'task_created',
        action: `Task "${task.title}" was created`,
        userId: taskData.assignedBy!,
        companyId: task.companyId,
        entityType: 'task',
        entityId: task.id,
      });
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res) => {
    try {
      const updateData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, updateData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Activities routes
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const { companyId, limit } = req.query;
      let activities;
      
      if (companyId) {
        activities = await storage.getActivitiesByCompany(companyId as string);
      } else {
        activities = await storage.getRecentActivities(limit ? parseInt(limit as string) : undefined);
      }
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Documents routes
  app.get("/api/documents", requireAuth, requireCompanyAccess, async (req, res) => {
    try {
      const companyId = req.query.companyId as string;
      let documents;
      
      if (companyId) {
        documents = await storage.getDocumentsByCompany(companyId);
      } else {
        documents = await storage.getDocuments();
      }
      
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", requireAuth, requireCompanyAccess, async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      
      // Create activity log
      await storage.createActivity({
        type: 'document_uploaded',
        action: `Document "${document.name}" was uploaded`,
        userId: documentData.uploadedBy!,
        companyId: document.companyId,
        entityType: 'document',
        entityId: document.id,
      });
      
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid document data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Dashboard metrics
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Advanced Analytics endpoints
  app.get("/api/analytics/market-penetration", requireAuth, requireUserManagement, async (req, res) => {
    try {
      const analytics = await storage.getMarketPenetrationAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market analytics" });
    }
  });

  app.get("/api/analytics/progress-tracking", requireAuth, requireUserManagement, async (req, res) => {
    try {
      const analytics = await storage.getProgressTrackingAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress analytics" });
    }
  });

  app.get("/api/analytics/revenue-impact", requireAuth, requireUserManagement, async (req, res) => {
    try {
      const analytics = await storage.getRevenueImpactAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenue analytics" });
    }
  });

  app.get("/api/analytics/performance-metrics", requireAuth, requireUserManagement, async (req, res) => {
    try {
      const analytics = await storage.getPerformanceMetrics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performance metrics" });
    }
  });

  app.get("/api/analytics/compliance-status", requireAuth, requireLegalAccess, async (req, res) => {
    try {
      const analytics = await storage.getComplianceAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch compliance analytics" });
    }
  });

  app.post("/api/analytics/export/:type", requireAuth, requireUserManagement, async (req, res) => {
    try {
      const { type } = req.params;
      const reportData = await storage.generateAnalyticsReport(type);
      
      // In a real implementation, you would generate a PDF here
      // For now, we'll return JSON data
      res.json({ 
        message: `${type} report generated successfully`,
        data: reportData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // AI Analysis endpoints
  app.post("/api/ai/analyze-document/:id", requireAuth, requireLegalAccess, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // In a real implementation, you would extract text from the document
      // For demo purposes, we'll use a sample text
      const documentContent = `
        This is a sample legal document for analysis.
        
        AGREEMENT
        
        This Agreement is entered into between Company A and Company B for the provision of services.
        
        TERMS AND CONDITIONS:
        1. Service Provision: Company B will provide consulting services to Company A.
        2. Payment Terms: Payment is due within 30 days of invoice.
        3. Liability: Neither party shall be liable for indirect damages.
        4. Termination: Either party may terminate with 30 days notice.
        5. Governing Law: This agreement is governed by the laws of [Jurisdiction].
        
        CONFIDENTIALITY:
        Both parties agree to maintain confidentiality of all shared information.
        
        INTELLECTUAL PROPERTY:
        Each party retains ownership of their respective intellectual property.
      `;

      const analysis = await aiService.analyzeDocument({
        documentContent,
        documentType: document.type || 'contract'
      });

      // Store the analysis result
      await storage.storeDocumentAnalysis(id, analysis);

      res.json(analysis);
    } catch (error) {
      console.error('AI analysis error:', error);
      res.status(500).json({ message: "Failed to analyze document" });
    }
  });

  app.get("/api/documents/:id/analysis", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getDocumentAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ message: "No analysis found for this document" });
      }
      
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document analysis" });
    }
  });

  app.post("/api/ai/compliance-check", requireAuth, requireLegalAccess, async (req, res) => {
    try {
      const { documentContent, regulations } = req.body;
      
      if (!documentContent) {
        return res.status(400).json({ message: "Document content is required" });
      }

      const complianceResult = await aiService.checkCompliance(
        documentContent, 
        regulations || ['GDPR', 'Consumer Protection', 'Contract Law']
      );

      res.json(complianceResult);
    } catch (error) {
      res.status(500).json({ message: "Failed to check compliance" });
    }
  });

  app.post("/api/ai/extract-info", requireAuth, requireLegalAccess, async (req, res) => {
    try {
      const { documentContent } = req.body;
      
      if (!documentContent) {
        return res.status(400).json({ message: "Document content is required" });
      }

      const extractedInfo = await aiService.extractKeyInformation(documentContent);
      res.json(extractedInfo);
    } catch (error) {
      res.status(500).json({ message: "Failed to extract information" });
    }
  });

  // Workflow Automation endpoints
  app.get("/api/workflow/rules", requireAuth, async (req, res) => {
    try {
      const rules = await storage.getWorkflowRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow rules" });
    }
  });

  app.get("/api/workflow/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getWorkflowStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow stats" });
    }
  });

  app.post("/api/workflow/rules/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      const result = await storage.toggleWorkflowRule(id, isActive);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle workflow rule" });
    }
  });

  app.post("/api/workflow/rules/:id/execute", requireAuth, requireUserManagement, async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await storage.executeWorkflowRule(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to execute workflow rule" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
