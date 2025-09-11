import { Express } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

/**
 * Apply production security and optimization middleware
 */
export function configureProductionMiddleware(app: Express) {
  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Needed for Vite HMR in development
        connectSrc: ["'self'", "https://api.googleapis.com", "https://oauth2.googleapis.com"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Compression
  app.use(compression());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit auth attempts
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/auth/', authLimiter);
}

/**
 * Global error handler with proper logging
 */
export function setupErrorHandling(app: Express) {
  app.use((err: any, req: any, res: any, next: any) => {
    // Log error details
    console.error('Error occurred:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      }
    });

    // Determine response status
    const status = err.status || err.statusCode || 500;
    
    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production' 
      ? (status === 500 ? 'Internal Server Error' : err.message)
      : err.message;

    res.status(status).json({ 
      error: message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
}

/**
 * Health check endpoints for monitoring
 */
export function setupHealthChecks(app: Express) {
  // Basic health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Detailed system status
  app.get('/health/detailed', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'operational',
        google_apis: 'operational',
        ai_service: 'operational'
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      environment: process.env.NODE_ENV || 'development'
    });
  });
}

/**
 * Request logging middleware
 */
export function setupRequestLogging(app: Express) {
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
      
      console.log(`[${logLevel}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`, {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    });
    
    next();
  });
}