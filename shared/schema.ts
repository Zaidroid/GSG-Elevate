import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['system_admin', 'program_officer', 'legal_advisor', 'company_poc']);
export const sectorEnum = pgEnum('sector', ['technology', 'healthcare', 'renewable_energy', 'fintech', 'manufacturing', 'other']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high', 'critical']);
export const statusEnum = pgEnum('status', ['pending', 'in_progress', 'review', 'completed', 'cancelled']);
export const legalCategoryEnum = pgEnum('legal_category', [
  'company_registration',
  'contract_management', 
  'ip_protection',
  'hr_frameworks',
  'digital_policies',
  'regulatory_compliance'
]);
export const timeCategoryEnum = pgEnum('time_category', [
  'legal_support',
  'research', 
  'documentation',
  'meetings',
  'administration',
  'other'
]);
export const projectStatusEnum = pgEnum('project_status', [
  'active',
  'completed', 
  'paused',
  'cancelled'
]);
export const timeEntryStatusEnum = pgEnum('time_entry_status', [
  'draft',
  'submitted',
  'approved',
  'rejected'
]);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull(),
  profilePictureUrl: text("profile_picture_url"),
  phone: text("phone"),
  companyId: varchar("company_id"), // For company POCs
  googleTokens: jsonb("google_tokens"), // Store Google OAuth tokens
  preferences: jsonb("preferences").default('{}'),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sector: sectorEnum("sector").notNull(),
  description: text("description"),
  teamSize: text("team_size"),
  foundedYear: integer("founded_year"),
  website: text("website"),
  
  // Contact Information
  primaryContactName: text("primary_contact_name").notNull(),
  primaryContactEmail: text("primary_contact_email").notNull(),
  primaryContactPhone: text("primary_contact_phone"),
  primaryContactPosition: text("primary_contact_position"),
  
  // Market Information
  currentMarkets: jsonb("current_markets").default('[]'), // Array of countries
  targetMarkets: jsonb("target_markets").default('[]'), // Array of countries
  
  // Registration Status per country
  registrations: jsonb("registrations").default('{}'),
  
  // Google Integration
  googleDriveFolderId: text("google_drive_folder_id"),
  googleSheetId: text("google_sheet_id"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Legal Needs table
export const legalNeeds = pgTable("legal_needs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  
  // Categorization
  category: legalCategoryEnum("category").notNull(),
  subcategory: text("subcategory"),
  
  // Details
  title: text("title").notNull(),
  description: text("description"),
  priority: priorityEnum("priority").notNull().default('medium'),
  urgency: priorityEnum("urgency").notNull().default('medium'),
  
  // Status & Progress
  status: statusEnum("status").notNull().default('pending'),
  progress: integer("progress").default(0), // 0-100
  
  // Assignment
  assignedTo: varchar("assigned_to").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  
  // Timeline
  expectedCompletionDate: timestamp("expected_completion_date"),
  actualCompletionDate: timestamp("actual_completion_date"),
  
  // Documents & Communication
  relatedDocuments: jsonb("related_documents").default('[]'), // Array of Google Drive file IDs
  statusUpdates: jsonb("status_updates").default('[]'),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Task Details
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'legal_support', 'document_review', 'consultation', etc.
  
  // Relationships
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  legalNeedId: varchar("legal_need_id").references(() => legalNeeds.id, { onDelete: 'cascade' }),
  
  // Assignment
  assignedTo: varchar("assigned_to").references(() => users.id),
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  
  // Status & Priority
  status: statusEnum("status").notNull().default('pending'),
  priority: priorityEnum("priority").notNull().default('medium'),
  
  // Timeline
  dueDate: timestamp("due_date"),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  // Progress
  progress: integer("progress").default(0), // 0-100
  notes: text("notes"),
  
  // Documents
  relatedDocuments: jsonb("related_documents").default('[]'),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table (for audit/activity feed)
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Activity Details
  type: text("type").notNull(), // 'company_created', 'task_assigned', 'document_uploaded', etc.
  action: text("action").notNull(), // Human readable action
  description: text("description"),
  
  // Relationships
  userId: varchar("user_id").notNull().references(() => users.id),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: 'cascade' }),
  entityType: text("entity_type"), // 'task', 'legal_need', 'document'
  entityId: varchar("entity_id"),
  
  // Changes tracking
  changes: jsonb("changes"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Google Drive Integration
  googleDriveFileId: text("google_drive_file_id").notNull(),
  driveUrl: text("drive_url"),
  
  // Document Info
  name: text("name").notNull(),
  type: text("type").notNull(), // 'contract', 'agreement', 'policy', etc.
  mimeType: text("mime_type"),
  size: integer("size"), // bytes
  
  // Relationships
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  legalNeedId: varchar("legal_need_id").references(() => legalNeeds.id, { onDelete: 'set null' }),
  
  // Status & Workflow
  status: text("status").default('draft'), // 'draft', 'review', 'approved', 'signed'
  version: text("version").default('1.0'),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
});

// Projects table (for hours tracking)
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Project Details
  name: text("name").notNull(),
  clientName: text("client_name"),
  description: text("description"),
  
  // Relationships
  companyId: varchar("company_id").references(() => companies.id, { onDelete: 'cascade' }),
  
  // Budget & Rates
  hourlyRate: integer("hourly_rate"), // Rate in cents to avoid floating point issues
  budgetHours: integer("budget_hours"),
  totalHours: integer("total_hours").default(0), // Total hours logged so far (in minutes)
  
  // Status & Timeline
  status: projectStatusEnum("status").notNull().default('active'),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  
  // Google Integration
  googleSheetId: text("google_sheet_id"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: varchar("created_by").references(() => users.id),
});

// Time Entries table
export const timeEntries = pgTable("time_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Relationships
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  companyId: varchar("company_id").references(() => companies.id, { onDelete: 'cascade' }),
  
  // Time Details
  taskDescription: text("task_description").notNull(),
  hours: integer("hours").notNull(), // Hours in minutes to avoid floating point issues
  date: timestamp("date").notNull(),
  
  // Categorization
  category: timeCategoryEnum("category").notNull().default('legal_support'),
  
  // Additional Info
  notes: text("notes"),
  billableRate: integer("billable_rate"), // Rate in cents, can override project rate
  
  // Status & Approval
  status: timeEntryStatusEnum("status").notNull().default('submitted'),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  createdCompanies: many(companies),
  assignedLegalNeeds: many(legalNeeds),
  assignedTasks: many(tasks),
  activities: many(activities),
  uploadedDocuments: many(documents),
  timeEntries: many(timeEntries),
  createdProjects: many(projects),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  creator: one(users, {
    fields: [companies.createdBy],
    references: [users.id],
  }),
  users: many(users),
  legalNeeds: many(legalNeeds),
  tasks: many(tasks),
  activities: many(activities),
  documents: many(documents),
  projects: many(projects),
}));

export const legalNeedsRelations = relations(legalNeeds, ({ one, many }) => ({
  company: one(companies, {
    fields: [legalNeeds.companyId],
    references: [companies.id],
  }),
  assignee: one(users, {
    fields: [legalNeeds.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [legalNeeds.createdBy],
    references: [users.id],
  }),
  tasks: many(tasks),
  documents: many(documents),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  company: one(companies, {
    fields: [tasks.companyId],
    references: [companies.id],
  }),
  legalNeed: one(legalNeeds, {
    fields: [tasks.legalNeedId],
    references: [legalNeeds.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
  assigner: one(users, {
    fields: [tasks.assignedBy],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [activities.companyId],
    references: [companies.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  company: one(companies, {
    fields: [documents.companyId],
    references: [companies.id],
  }),
  legalNeed: one(legalNeeds, {
    fields: [documents.legalNeedId],
    references: [legalNeeds.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, {
    fields: [projects.companyId],
    references: [companies.id],
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  timeEntries: many(timeEntries),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [timeEntries.projectId],
    references: [projects.id],
  }),
  company: one(companies, {
    fields: [timeEntries.companyId],
    references: [companies.id],
  }),
  approver: one(users, {
    fields: [timeEntries.approvedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLegalNeedSchema = createInsertSchema(legalNeeds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type LegalNeed = typeof legalNeeds.$inferSelect;
export type InsertLegalNeed = z.infer<typeof insertLegalNeedSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
