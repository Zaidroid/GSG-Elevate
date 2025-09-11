CREATE TYPE "public"."legal_category" AS ENUM('company_registration', 'contract_management', 'ip_protection', 'hr_frameworks', 'digital_policies', 'regulatory_compliance');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('system_admin', 'program_officer', 'legal_advisor', 'company_poc');--> statement-breakpoint
CREATE TYPE "public"."sector" AS ENUM('technology', 'healthcare', 'renewable_energy', 'fintech', 'manufacturing', 'other');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'in_progress', 'review', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"user_id" varchar NOT NULL,
	"company_id" varchar,
	"entity_type" text,
	"entity_id" varchar,
	"changes" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"sector" "sector" NOT NULL,
	"description" text,
	"team_size" text,
	"founded_year" integer,
	"website" text,
	"primary_contact_name" text NOT NULL,
	"primary_contact_email" text NOT NULL,
	"primary_contact_phone" text,
	"primary_contact_position" text,
	"current_markets" jsonb DEFAULT '[]',
	"target_markets" jsonb DEFAULT '[]',
	"registrations" jsonb DEFAULT '{}',
	"google_drive_folder_id" text,
	"google_sheet_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_drive_file_id" text NOT NULL,
	"drive_url" text,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"mime_type" text,
	"size" integer,
	"company_id" varchar NOT NULL,
	"legal_need_id" varchar,
	"status" text DEFAULT 'draft',
	"version" text DEFAULT '1.0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"uploaded_by" varchar
);
--> statement-breakpoint
CREATE TABLE "legal_needs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" varchar NOT NULL,
	"category" "legal_category" NOT NULL,
	"subcategory" text,
	"title" text NOT NULL,
	"description" text,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"urgency" "priority" DEFAULT 'medium' NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"progress" integer DEFAULT 0,
	"assigned_to" varchar,
	"assigned_at" timestamp,
	"expected_completion_date" timestamp,
	"actual_completion_date" timestamp,
	"related_documents" jsonb DEFAULT '[]',
	"status_updates" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" varchar
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"company_id" varchar NOT NULL,
	"legal_need_id" varchar,
	"assigned_to" varchar,
	"assigned_by" varchar,
	"assigned_at" timestamp,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp,
	"estimated_hours" integer,
	"actual_hours" integer,
	"started_at" timestamp,
	"completed_at" timestamp,
	"progress" integer DEFAULT 0,
	"notes" text,
	"related_documents" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "role" NOT NULL,
	"profile_picture_url" text,
	"phone" text,
	"company_id" varchar,
	"google_tokens" jsonb,
	"preferences" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_legal_need_id_legal_needs_id_fk" FOREIGN KEY ("legal_need_id") REFERENCES "public"."legal_needs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_needs" ADD CONSTRAINT "legal_needs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_needs" ADD CONSTRAINT "legal_needs_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_needs" ADD CONSTRAINT "legal_needs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_legal_need_id_legal_needs_id_fk" FOREIGN KEY ("legal_need_id") REFERENCES "public"."legal_needs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;