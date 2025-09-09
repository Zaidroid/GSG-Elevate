import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCompanySchema, insertLegalNeedSchema, insertTaskSchema, 
  insertActivitySchema, insertDocumentSchema, insertUserSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
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

  app.post("/api/users", async (req, res) => {
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
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
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

  app.post("/api/companies", async (req, res) => {
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

  app.patch("/api/companies/:id", async (req, res) => {
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

  app.delete("/api/companies/:id", async (req, res) => {
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
  app.get("/api/legal-needs", async (req, res) => {
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

  app.post("/api/legal-needs", async (req, res) => {
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

  app.patch("/api/legal-needs/:id", async (req, res) => {
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
  app.get("/api/tasks", async (req, res) => {
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

  app.post("/api/tasks", async (req, res) => {
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

  app.patch("/api/tasks/:id", async (req, res) => {
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
  app.get("/api/activities", async (req, res) => {
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
  app.get("/api/documents", async (req, res) => {
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

  app.post("/api/documents", async (req, res) => {
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
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
