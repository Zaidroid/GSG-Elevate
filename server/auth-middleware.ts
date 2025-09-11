import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import type { User } from '@shared/schema';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Middleware to check if user is authenticated
 */
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await storage.getUser(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const requireRole = (roles: string | string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: requiredRoles,
        current: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is system admin
 */
export const requireAdmin = requireRole('system_admin');

/**
 * Middleware to check if user can manage users
 */
export const requireUserManagement = requireRole(['system_admin', 'program_officer']);

/**
 * Middleware to check if user can access legal support features
 */
export const requireLegalAccess = requireRole(['system_admin', 'program_officer', 'legal_advisor']);

/**
 * Middleware to check if user can access company data
 */
export const requireCompanyAccess = requireRole(['system_admin', 'program_officer', 'legal_advisor', 'company_poc']);

/**
 * Middleware to check if user can modify company data (not just view)
 */
export const requireCompanyModify = requireRole(['system_admin', 'program_officer']);

/**
 * Check if user can access specific company data
 */
export const checkCompanyAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const companyId = req.params.id || req.body.companyId;
    
    // System admins and program officers can access all companies
    if (['system_admin', 'program_officer', 'legal_advisor'].includes(req.user.role)) {
      return next();
    }

    // Company POCs can only access their own company
    if (req.user.role === 'company_poc') {
      if (!req.user.companyId || req.user.companyId !== companyId) {
        return res.status(403).json({ message: 'Can only access your own company data' });
      }
    }

    next();
  } catch (error) {
    console.error('Company access check error:', error);
    res.status(500).json({ message: 'Access check failed' });
  }
};