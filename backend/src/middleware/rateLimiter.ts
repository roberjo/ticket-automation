import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger.js';
import { RateLimitError } from './errorHandler.js';

// Rate limiter configuration
const generalRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => {
    // Use IP address as key, or user ID if authenticated
    return (req as any).user?.id || req.ip;
  },
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 15, // Block for 15 minutes if limit exceeded
});

// Rate limiter for authentication endpoints (more restrictive)
const authRateLimiterInstance = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 5, // 5 attempts
  duration: 60, // Per minute
  blockDuration: 60 * 30, // Block for 30 minutes
});

// Rate limiter for ticket creation (prevent abuse)
const ticketCreationRateLimiterInstance = new RateLimiterMemory({
  keyGenerator: (req: Request) => (req as any).user?.id || req.ip,
  points: 10, // 10 ticket creations
  duration: 60 * 60, // Per hour
  blockDuration: 60 * 60, // Block for 1 hour
});

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await generalRateLimiter.consume(req);
    next();
  } catch (rejRes) {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      userId: (req as any).user?.id,
      path: req.path,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext
    });

    res.set('Retry-After', String(Math.round(rejRes.msBeforeNext / 1000)));
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000)
      }
    });
  }
};

export const authRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authRateLimiterInstance.consume(req);
    next();
  } catch (rejRes) {
    logger.warn('Auth rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext
    });

    res.set('Retry-After', String(Math.round(rejRes.msBeforeNext / 1000)));
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000)
      }
    });
  }
};

export const ticketCreationRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ticketCreationRateLimiterInstance.consume(req);
    next();
  } catch (rejRes) {
    logger.warn('Ticket creation rate limit exceeded:', {
      ip: req.ip,
      userId: (req as any).user?.id,
      path: req.path,
      remainingPoints: rejRes.remainingPoints,
      msBeforeNext: rejRes.msBeforeNext
    });

    res.set('Retry-After', String(Math.round(rejRes.msBeforeNext / 1000)));
    res.status(429).json({
      success: false,
      error: {
        code: 'TICKET_CREATION_RATE_LIMIT_EXCEEDED',
        message: 'Too many ticket creation requests, please try again later',
        retryAfter: Math.round(rejRes.msBeforeNext / 1000)
      }
    });
  }
};

// Reset rate limit for a specific key (useful for testing)
export const resetRateLimit = async (key: string, type: 'general' | 'auth' | 'ticket' = 'general') => {
  try {
    switch (type) {
      case 'auth':
        await authRateLimiterInstance.delete(key);
        break;
      case 'ticket':
        await ticketCreationRateLimiterInstance.delete(key);
        break;
      default:
        await generalRateLimiter.delete(key);
    }
    logger.info(`Rate limit reset for key: ${key}, type: ${type}`);
  } catch (error) {
    logger.error('Failed to reset rate limit:', error);
  }
};
