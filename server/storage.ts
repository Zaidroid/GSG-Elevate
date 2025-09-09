import { 
  users, companies, legalNeeds, tasks, activities, documents,
  type User, type InsertUser, type Company, type InsertCompany,
  type LegalNeed, type InsertLegalNeed, type Task, type InsertTask,
  type Activity, type InsertActivity, type Document, type InsertDocument
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(): Promise<User[]>;

  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;

  // Legal Needs
  getLegalNeed(id: string): Promise<LegalNeed | undefined>;
  getLegalNeedsByCompany(companyId: string): Promise<LegalNeed[]>;
  getLegalNeeds(): Promise<LegalNeed[]>;
  createLegalNeed(legalNeed: InsertLegalNeed): Promise<LegalNeed>;
  updateLegalNeed(id: string, legalNeed: Partial<InsertLegalNeed>): Promise<LegalNeed | undefined>;
  deleteLegalNeed(id: string): Promise<boolean>;

  // Tasks
  getTask(id: string): Promise<Task | undefined>;
  getTasksByCompany(companyId: string): Promise<Task[]>;
  getTasksByAssignee(userId: string): Promise<Task[]>;
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;

  // Activities
  getActivitiesByCompany(companyId: string): Promise<Activity[]>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Documents
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentsByCompany(companyId: string): Promise<Document[]>;
  getDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;

  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    activeCompanies: number;
    legalTasks: number;
    totalDocuments: number;
    averageProgress: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, insertUser: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...insertUser, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Companies
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: string, insertCompany: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db.update(companies)
      .set({ ...insertCompany, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Legal Needs
  async getLegalNeed(id: string): Promise<LegalNeed | undefined> {
    const [legalNeed] = await db.select().from(legalNeeds).where(eq(legalNeeds.id, id));
    return legalNeed || undefined;
  }

  async getLegalNeedsByCompany(companyId: string): Promise<LegalNeed[]> {
    return await db.select().from(legalNeeds)
      .where(eq(legalNeeds.companyId, companyId))
      .orderBy(desc(legalNeeds.createdAt));
  }

  async getLegalNeeds(): Promise<LegalNeed[]> {
    return await db.select().from(legalNeeds).orderBy(desc(legalNeeds.createdAt));
  }

  async createLegalNeed(insertLegalNeed: InsertLegalNeed): Promise<LegalNeed> {
    const [legalNeed] = await db.insert(legalNeeds).values(insertLegalNeed).returning();
    return legalNeed;
  }

  async updateLegalNeed(id: string, insertLegalNeed: Partial<InsertLegalNeed>): Promise<LegalNeed | undefined> {
    const [legalNeed] = await db.update(legalNeeds)
      .set({ ...insertLegalNeed, updatedAt: new Date() })
      .where(eq(legalNeeds.id, id))
      .returning();
    return legalNeed || undefined;
  }

  async deleteLegalNeed(id: string): Promise<boolean> {
    const result = await db.delete(legalNeeds).where(eq(legalNeeds.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Tasks
  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async getTasksByCompany(companyId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.companyId, companyId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasksByAssignee(userId: string): Promise<Task[]> {
    return await db.select().from(tasks)
      .where(eq(tasks.assignedTo, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: string, insertTask: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db.update(tasks)
      .set({ ...insertTask, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Activities
  async getActivitiesByCompany(companyId: string): Promise<Activity[]> {
    return await db.select().from(activities)
      .where(eq(activities.companyId, companyId))
      .orderBy(desc(activities.createdAt));
  }

  async getRecentActivities(limit = 10): Promise<Activity[]> {
    return await db.select().from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  // Documents
  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async getDocumentsByCompany(companyId: string): Promise<Document[]> {
    return await db.select().from(documents)
      .where(eq(documents.companyId, companyId))
      .orderBy(desc(documents.createdAt));
  }

  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }

  async updateDocument(id: string, insertDocument: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db.update(documents)
      .set({ ...insertDocument, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return document || undefined;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    activeCompanies: number;
    legalTasks: number;
    totalDocuments: number;
    averageProgress: number;
  }> {
    const [companiesCount] = await db.select({ count: count() }).from(companies);
    const [tasksCount] = await db.select({ count: count() }).from(tasks);
    const [docsCount] = await db.select({ count: count() }).from(documents);
    
    const [avgProgress] = await db.select({ 
      avg: sql<number>`AVG(${tasks.progress})` 
    }).from(tasks);

    return {
      activeCompanies: companiesCount.count,
      legalTasks: tasksCount.count,
      totalDocuments: docsCount.count,
      averageProgress: Math.round(avgProgress.avg || 0),
    };
  }

  // Advanced Analytics methods
  async getMarketPenetrationAnalytics(): Promise<any> {
    // Mock data for demo - in real implementation, this would query actual data
    return {
      sectorPenetration: [
        { sector: 'Technology', rate: 78, companies: 12 },
        { sector: 'Healthcare', rate: 65, companies: 8 },
        { sector: 'Finance', rate: 82, companies: 15 },
        { sector: 'Manufacturing', rate: 71, companies: 10 },
        { sector: 'Energy', rate: 69, companies: 6 }
      ],
      geographicDistribution: [
        { name: 'North America', value: 35 },
        { name: 'Europe', value: 28 },
        { name: 'Asia Pacific', value: 22 },
        { name: 'Latin America', value: 10 },
        { name: 'Other', value: 5 }
      ],
      monthlyTrends: [
        { month: 'Jan', entries: 4, success: 3 },
        { month: 'Feb', entries: 6, success: 5 },
        { month: 'Mar', entries: 8, success: 6 },
        { month: 'Apr', entries: 5, success: 4 },
        { month: 'May', entries: 9, success: 8 },
        { month: 'Jun', entries: 7, success: 6 }
      ]
    };
  }

  async getProgressTrackingAnalytics(): Promise<any> {
    return {
      completionTimeline: [
        { type: 'Legal Setup', planned: 45, actual: 38 },
        { type: 'Market Research', planned: 30, actual: 35 },
        { type: 'Regulatory', planned: 60, actual: 55 },
        { type: 'Partnership', planned: 90, actual: 85 },
        { type: 'Launch', planned: 120, actual: 105 }
      ],
      activeMilestones: [
        { company: 'TechCorp Inc.', milestone: 'Legal Documentation', progress: 75, dueDate: '2024-02-15' },
        { company: 'HealthPlus Ltd.', milestone: 'Regulatory Approval', progress: 45, dueDate: '2024-03-01' },
        { company: 'GreenEnergy Co.', milestone: 'Market Research', progress: 90, dueDate: '2024-01-30' },
        { company: 'FinanceFirst', milestone: 'Partnership Setup', progress: 30, dueDate: '2024-04-15' }
      ]
    };
  }

  async getRevenueImpactAnalytics(): Promise<any> {
    return {
      monthlyRevenue: [
        { month: 'Jan', projected: 200000, actual: 180000 },
        { month: 'Feb', projected: 250000, actual: 280000 },
        { month: 'Mar', projected: 300000, actual: 320000 },
        { month: 'Apr', projected: 350000, actual: 330000 },
        { month: 'May', projected: 400000, actual: 420000 },
        { month: 'Jun', projected: 450000, actual: 480000 }
      ],
      roiByMarket: [
        { market: 'US', investment: 100000, returns: 320000, roi: 220 },
        { market: 'EU', investment: 150000, returns: 400000, roi: 167 },
        { market: 'APAC', investment: 80000, returns: 180000, roi: 125 },
        { market: 'LATAM', investment: 60000, returns: 110000, roi: 83 }
      ]
    };
  }

  async getPerformanceMetrics(): Promise<any> {
    return {
      marketPenetrationRate: 67,
      totalRevenueImpact: '2.4M',
      avgCompletionRate: 84,
      avgTimeToMarket: 156
    };
  }

  async getComplianceAnalytics(): Promise<any> {
    return {
      compliantProjects: 28,
      pendingReview: 7,
      issuesFound: 3,
      inProgress: 12,
      riskAssessment: [
        { risk: 'Regulatory Changes', impact: 'High', probability: 'Medium', status: 'Monitoring' },
        { risk: 'Market Competition', impact: 'Medium', probability: 'High', status: 'Mitigating' },
        { risk: 'Currency Fluctuation', impact: 'Medium', probability: 'Medium', status: 'Accepted' },
        { risk: 'Legal Compliance', impact: 'High', probability: 'Low', status: 'Prevented' }
      ]
    };
  }

  async generateAnalyticsReport(type: string): Promise<any> {
    // Mock report generation
    return {
      type,
      generatedAt: new Date().toISOString(),
      summary: `${type} analytics report containing comprehensive market access insights`,
      dataPoints: Math.floor(Math.random() * 1000) + 500
    };
  }

  // AI Analysis storage methods
  async storeDocumentAnalysis(documentId: string, analysis: any): Promise<void> {
    // In a real implementation, this would store the analysis in the database
    // For demo purposes, we'll use in-memory storage
    if (!this.documentAnalyses) {
      this.documentAnalyses = new Map();
    }
    this.documentAnalyses.set(documentId, {
      ...analysis,
      analyzedAt: new Date().toISOString(),
      documentId
    });
  }

  async getDocumentAnalysis(documentId: string): Promise<any> {
    if (!this.documentAnalyses) {
      return null;
    }
    return this.documentAnalyses.get(documentId) || null;
  }

  private documentAnalyses?: Map<string, any>;
}

export const storage = new DatabaseStorage();
