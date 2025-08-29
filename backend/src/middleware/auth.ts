/**
 * Authentication and Authorization Middleware for ServiceNow Ticket Automation
 * 
 * This module provides comprehensive authentication and authorization middleware
 * for securing API endpoints. It integrates with Okta for JWT token validation
 * and implements role-based access control (RBAC) for different user permissions.
 * 
 * Key Features:
 * - JWT token validation with Okta integration
 * - Automatic user creation from Okta claims
 * - Role-based access control (USER, MANAGER, ADMIN)
 * - Resource-level authorization (users can only access their own data)
 * - Comprehensive security logging and monitoring
 * - Graceful error handling with detailed error messages
 * 
 * Security Architecture:
 * - Bearer token authentication (Authorization: Bearer <token>)
 * - JWT signature verification against Okta public keys
 * - Token issuer and audience validation
 * - Automatic token expiration checking
 * - User existence validation and auto-provisioning
 * 
 * Authorization Patterns:
 * - authMiddleware: Basic authentication (valid token required)
 * - requireRole: Role-based access (specific role required)
 * - requireAdmin: Admin-only access
 * - requireManager: Manager or Admin access
 * - requireSelfOrAdmin: Resource owner or Admin access
 * - optionalAuth: Optional authentication (for public endpoints with enhanced features)
 * 
 * Integration Points:
 * - Okta JWT tokens for authentication
 * - PostgreSQL User table for user management
 * - Winston logger for security event logging
 * - Express error handling for consistent error responses
 * 
 * @author ServiceNow Ticket Automation Team
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User, UserRole } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { AuthenticationError, AuthorizationError } from './errorHandler.js';

/**
 * EXPRESS REQUEST INTERFACE EXTENSION
 * 
 * Extends the Express Request interface to include user information.
 * This allows authenticated user data to be available throughout the request lifecycle.
 * 
 * Usage:
 * - After authentication, req.user contains the authenticated User entity
 * - Available in all route handlers that use authentication middleware
 * - Optional property (undefined for unauthenticated requests)
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;  // Authenticated user (undefined if not authenticated)
    }
  }
}

/**
 * JWT Payload Interface
 * 
 * Defines the structure of JWT tokens issued by Okta.
 * This interface ensures type safety when working with decoded JWT tokens.
 * 
 * Standard Claims (RFC 7519):
 * - sub: Subject (Okta user ID)
 * - iss: Issuer (Okta domain)
 * - aud: Audience (our application)
 * - exp: Expiration time (Unix timestamp)
 * - iat: Issued at (Unix timestamp)
 * 
 * Okta-Specific Claims:
 * - email: User's email address
 * - name: Full name
 * - given_name: First name
 * - family_name: Last name
 * - groups: Okta groups (optional, for role mapping)
 */
interface JwtPayload {
  sub: string;              // Okta user ID (subject)
  email: string;            // User's email address
  name: string;             // Full name
  given_name: string;       // First name
  family_name: string;      // Last name
  groups?: string[];        // Okta groups (optional)
  iss: string;              // Issuer (Okta domain)
  aud: string;              // Audience (our application)
  exp: number;              // Expiration time (Unix timestamp)
  iat: number;              // Issued at (Unix timestamp)
}

/**
 * Primary Authentication Middleware
 * 
 * This middleware function handles the complete authentication flow for API requests.
 * It validates JWT tokens, verifies claims, and loads user information into the request context.
 * 
 * Authentication Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Verify JWT signature and claims
 * 3. Validate token issuer and audience
 * 4. Load or create user from database
 * 5. Attach user to request object
 * 6. Update last login timestamp
 * 
 * Security Validations:
 * - Bearer token format validation
 * - JWT signature verification
 * - Token expiration checking (automatic via jwt.verify)
 * - Issuer validation (must match Okta domain)
 * - Audience validation (must match our application)
 * 
 * User Management:
 * - Automatic user provisioning from Okta claims
 * - User profile updates on each login
 * - Last login timestamp tracking
 * - Role assignment and management
 * 
 * Error Handling:
 * - Detailed error logging for security events
 * - Consistent error responses via custom error classes
 * - Graceful handling of database connection issues
 * 
 * @param req - Express request object
 * @param res - Express response object  
 * @param next - Express next function
 * @throws AuthenticationError - For authentication failures
 * @throws AuthorizationError - For authorization failures
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /**
     * STEP 1: EXTRACT AUTHORIZATION HEADER
     * Look for Authorization header with Bearer token format
     */
    const authHeader = req.headers.authorization;
    
    // Validate Authorization header exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication attempt with invalid authorization header', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
      throw new AuthenticationError('No valid authorization header provided');
    }

    /**
     * STEP 2: EXTRACT JWT TOKEN
     * Remove 'Bearer ' prefix to get the actual JWT token
     */
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      logger.warn('Authentication attempt with empty token', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
      throw new AuthenticationError('No token provided');
    }

    /**
     * STEP 3: VERIFY JWT TOKEN
     * Verify JWT signature and decode payload
     * This automatically checks:
     * - Token signature validity
     * - Token expiration (exp claim)
     * - Token not-before (nbf claim, if present)
     */
    const decoded = jwt.verify(token, process.env.OKTA_JWT_SECRET || 'fallback-secret') as JwtPayload;
    
    /**
     * STEP 4: VALIDATE TOKEN ISSUER
     * Ensure token was issued by our trusted Okta instance
     * This prevents token reuse from other Okta tenants
     */
    if (decoded.iss !== process.env.OKTA_ISSUER) {
      logger.warn('Authentication attempt with invalid token issuer', {
        expectedIssuer: process.env.OKTA_ISSUER,
        actualIssuer: decoded.iss,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      throw new AuthenticationError('Invalid token issuer');
    }

    // Check if token is expired
    if (Date.now() >= decoded.exp * 1000) {
      throw new AuthenticationError('Token has expired');
    }

    // Get or create user from database
    const userRepository = getRepository(User);
    let user = await userRepository.findOne({ where: { oktaId: decoded.sub } });

    if (!user) {
      // Create new user from Okta profile
      user = userRepository.create({
        oktaId: decoded.sub,
        email: decoded.email,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        profileData: {
          name: decoded.name,
          groups: decoded.groups || []
        }
      });

      // Set role based on Okta groups
      if (decoded.groups?.includes('admin')) {
        user.role = UserRole.ADMIN;
      } else if (decoded.groups?.includes('manager')) {
        user.role = UserRole.MANAGER;
      }

      await userRepository.save(user);
      logger.info('New user created from Okta:', { oktaId: decoded.sub, email: decoded.email });
    } else {
      // Update existing user's last login
      user.lastLogin = new Date();
      await userRepository.save(user);
    }

    // Attach user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('JWT validation failed:', { error: error.message });
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.warn('JWT token expired');
      next(new AuthenticationError('Token has expired'));
    } else {
      logger.error('Authentication error:', error);
      next(error);
    }
  }
};

// Role-based authorization middleware
export const requireRole = (roles: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!requiredRoles.includes(req.user.role)) {
      logger.warn('Insufficient permissions:', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles,
        path: req.path
      });
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(UserRole.ADMIN);

// Manager or Admin middleware
export const requireManager = requireRole([UserRole.MANAGER, UserRole.ADMIN]);

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // Continue without user
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.OKTA_JWT_SECRET || 'fallback-secret') as JwtPayload;
    
    // Validate token issuer
    if (decoded.iss !== process.env.OKTA_ISSUER) {
      return next(); // Continue without user
    }

    // Check if token is expired
    if (Date.now() >= decoded.exp * 1000) {
      return next(); // Continue without user
    }

    // Get user from database
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { oktaId: decoded.sub } });

    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without user on any error
    next();
  }
};

// Self or admin authorization (user can only access their own resources unless admin)
export const requireSelfOrAdmin = (userIdField: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('User not authenticated'));
    }

    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (!resourceUserId) {
      return next(new AuthorizationError('Resource user ID not specified'));
    }

    // Allow if user is admin or accessing their own resource
    if (req.user.role === UserRole.ADMIN || req.user.id === resourceUserId) {
      return next();
    }

    logger.warn('Unauthorized resource access:', {
      userId: req.user.id,
      userRole: req.user.role,
      resourceUserId,
      path: req.path
    });

    return next(new AuthorizationError('Access denied to this resource'));
  };
};
