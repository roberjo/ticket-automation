import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User, UserRole } from '../models/User.js';
import { logger } from '../utils/logger.js';
import { AuthenticationError, AuthorizationError } from './errorHandler.js';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

interface JwtPayload {
  sub: string; // Okta user ID
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  groups?: string[];
  iss: string; // Issuer
  aud: string; // Audience
  exp: number; // Expiration time
  iat: number; // Issued at
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No valid authorization header provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.OKTA_JWT_SECRET || 'fallback-secret') as JwtPayload;
    
    // Validate token issuer (Okta)
    if (decoded.iss !== process.env.OKTA_ISSUER) {
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
