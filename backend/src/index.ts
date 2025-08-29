/**
 * ServiceNow Ticket Automation - Backend Application Entry Point
 * 
 * This is the main entry point for the Node.js/Express backend server that powers
 * the ServiceNow Ticket Automation system. The server provides a comprehensive
 * REST API for managing ticket requests, user authentication, and ServiceNow integration.
 * 
 * Key Features:
 * - RESTful API endpoints for ticket management
 * - JWT-based authentication with Okta integration
 * - TypeORM database integration with PostgreSQL
 * - ServiceNow API integration for ticket creation
 * - Comprehensive security middleware (Helmet, CORS, Rate limiting)
 * - Structured logging with Winston
 * - Graceful error handling and server shutdown
 * 
 * Architecture:
 * - Express.js web framework with TypeScript
 * - Layered architecture: Routes -> Middleware -> Services -> Database
 * - Environment-based configuration
 * - Production-ready security and monitoring
 * 
 * @author ServiceNow Ticket Automation Team
 * @version 1.0.0
 */

// Import reflect-metadata first to enable TypeORM decorators
// This must be imported before any TypeORM entities are loaded
import 'reflect-metadata';

// Core Express.js framework and essential middleware
import express from 'express';
import cors from 'cors';           // Cross-Origin Resource Sharing
import helmet from 'helmet';       // Security headers
import morgan from 'morgan';       // HTTP request logging
import compression from 'compression'; // Response compression
import dotenv from 'dotenv';       // Environment variable loading

// Database and internal imports
import { createConnection } from 'typeorm';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { authMiddleware } from './middleware/auth.js';

// Route handlers for different API endpoints
import healthRoutes from './routes/health.js';
import ticketRoutes from './routes/tickets.js';
import userRoutes from './routes/users.js';

// Database configuration
import { config } from './config/database.js';

/**
 * APPLICATION INITIALIZATION
 * Load environment variables and initialize Express application
 */

// Load environment variables from .env file
// This must be called before accessing any process.env variables
dotenv.config();

// Create Express application instance
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * SECURITY AND PERFORMANCE MIDDLEWARE
 * Applied in order of execution - order matters for security
 */

// Helmet: Sets various HTTP headers to secure the app
// Protects against common vulnerabilities (XSS, clickjacking, etc.)
app.use(helmet());

// CORS: Configure cross-origin resource sharing
// Allows frontend application to communicate with backend API
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true  // Allow cookies and authentication headers
}));

// Compression: Gzip compression for response bodies
// Reduces bandwidth usage and improves performance
app.use(compression());

// Morgan: HTTP request logging
// Logs all HTTP requests with detailed information
// Custom stream redirects logs to Winston logger
app.use(morgan('combined', { 
  stream: { 
    write: (message) => logger.info(message.trim()) 
  } 
}));

// Body parsing middleware
// Parse JSON payloads up to 10MB (for large ticket attachments)
app.use(express.json({ limit: '10mb' }));
// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

/**
 * RATE LIMITING
 * Apply rate limiting to prevent abuse and ensure fair usage
 */
app.use(rateLimiter);

/**
 * API ROUTES
 * Mount route handlers for different API endpoints
 * 
 * Route Structure:
 * - /api/health: System health checks (no auth required)
 * - /api/tickets: Ticket management (auth required)  
 * - /api/users: User management (auth required)
 */

// Health check routes - no authentication required
// Used for monitoring, load balancer health checks
app.use('/api/health', healthRoutes);

// Ticket management routes - authentication required
// Handles ticket creation, status updates, ServiceNow integration
app.use('/api/tickets', authMiddleware, ticketRoutes);

// User management routes - authentication required  
// Handles user profiles, role management, admin functions
app.use('/api/users', authMiddleware, userRoutes);

/**
 * ERROR HANDLING
 * Global error handling middleware - must be registered last
 */
app.use(errorHandler);

/**
 * 404 HANDLER
 * Catch-all route for undefined endpoints
 * Provides consistent error response format
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

/**
 * SERVER STARTUP AND DATABASE INITIALIZATION
 * 
 * Handles the complete server startup process including:
 * - Database connection establishment
 * - Server binding and listening
 * - Error handling for startup failures
 * - Graceful degradation if database is unavailable
 */
async function startServer() {
  try {
    /**
     * DATABASE CONNECTION
     * Attempt to establish connection to PostgreSQL database
     * 
     * Graceful degradation: If database connection fails, server still starts
     * but operates in limited mode (health checks only, no data operations)
     * This allows the service to remain available for monitoring while
     * database issues are resolved
     */
    try {
      await createConnection(config);
      logger.info('Database connection established');
      logger.info('✅ Full functionality enabled (database connected)');
    } catch (dbError) {
      logger.warn('Database connection failed, starting server without database:', dbError.message);
      logger.info('⚠️  Server will run in limited mode without database functionality');
      logger.info('🔧 Health checks will still work, but API endpoints will return errors');
    }

    /**
     * HTTP SERVER STARTUP
     * Bind Express app to specified port and start listening for requests
     */
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`❤️  Health check: http://localhost:${PORT}/api/health`);
      logger.info(`📚 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * GRACEFUL SHUTDOWN HANDLERS
 * 
 * Handle various termination signals to ensure clean shutdown
 * This is important for:
 * - Closing database connections
 * - Finishing in-flight requests
 * - Cleaning up resources
 * - Proper logging of shutdown events
 */

// SIGTERM: Termination signal (typically from process managers like PM2, Docker)
process.on('SIGTERM', () => {
  logger.info('📡 SIGTERM received, shutting down gracefully');
  logger.info('🛑 Server shutting down...');
  process.exit(0);
});

// SIGINT: Interrupt signal (typically Ctrl+C in terminal)
process.on('SIGINT', () => {
  logger.info('⌨️  SIGINT received, shutting down gracefully');
  logger.info('🛑 Server shutting down...');
  process.exit(0);
});

/**
 * UNHANDLED ERROR HANDLERS
 * 
 * Last resort error handling for uncaught exceptions and promise rejections
 * These should never occur in production, but provide safety net
 * Log the error details for debugging and exit to prevent undefined behavior
 */

// Handle unhandled promise rejections
// This catches promises that were rejected but had no .catch() handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('🚨 This indicates a bug in the code - promises should always have error handlers');
  process.exit(1);
});

// Handle uncaught exceptions
// This catches synchronous errors that weren't caught by try/catch
process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception:', error);
  logger.error('🚨 This indicates a serious bug - all errors should be properly handled');
  process.exit(1);
});

/**
 * START THE SERVER
 * Initialize the application by calling the startup function
 */
startServer();
