# Market Access Management System

## Overview

A comprehensive web application designed to streamline and manage market access initiatives for partner companies. The system provides centralized management of company profiles, legal support processes, document management, and task tracking. It serves multiple user roles including Program Officers, Legal Advisors, Company Points of Contact, and System Administrators, enabling efficient coordination of market entry activities and legal compliance support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state and caching
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints following resource-based conventions
- **Middleware**: Custom logging, JSON parsing, and error handling
- **Development**: Hot reloading with Vite middleware integration

### Data Layer
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Schema**: Strongly typed schema definitions with Zod validation
- **Migrations**: Drizzle Kit for database migrations and schema management

### Core Data Models
- **Users**: Role-based system (system_admin, program_officer, legal_advisor, company_poc)
- **Companies**: Complete company profiles with sector classification and market tracking
- **Legal Needs**: Legal support requests with categorization and priority levels
- **Tasks**: General task management with assignees and status tracking
- **Activities**: Activity logging for audit trails and notifications
- **Documents**: File metadata management with Google Drive integration support

### Authentication & Authorization
- **Google OAuth**: Token storage for Google API integration
- **Role-based Access**: Multi-tier permission system based on user roles
- **Session Management**: PostgreSQL session storage with connect-pg-simple

### API Architecture
- **RESTful Design**: Resource-based endpoints with standard HTTP methods
- **Error Handling**: Centralized error middleware with structured responses
- **Request Logging**: Automatic API request/response logging with performance metrics
- **Data Validation**: Zod schemas for request/response validation

## External Dependencies

### Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect

### Google Services Integration
- **Google Drive API**: Document storage and management
- **Google Sheets API**: Data import/export functionality
- **Google OAuth 2.0**: Authentication and API access tokens

### UI/UX Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Icon library for consistent visual elements
- **React Hook Form**: Form state management and validation

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESBuild**: Production bundling
- **PostCSS**: CSS processing with Autoprefixer

### Utility Libraries
- **TanStack Query**: Server state management and caching
- **Zod**: Schema validation and type inference
- **date-fns**: Date manipulation utilities
- **clsx & class-variance-authority**: Dynamic class name management