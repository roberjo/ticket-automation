import { Request, Response, NextFunction } from 'express';
import { authMiddleware, requireRole, requireAdmin, requireManager, optionalAuth, requireSelfOrAdmin } from '../../middleware/auth';
import { createMockUser, createMockRequest, createMockResponse } from '../utils';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

// Mock database connection and repositories
jest.mock('../../config/database', () => ({
  getConnection: jest.fn(),
}));

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    mockNext = jest.fn();
  });

  describe('authMiddleware', () => {
    it('should authenticate valid JWT token and set user', async () => {
      const mockUser = createMockUser();
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        sub: mockUser.oktaId,
        email: mockUser.email,
        name: `${mockUser.firstName} ${mockUser.lastName}`,
        role: mockUser.role,
      };

      // Mock JWT verification
      jwt.verify.mockReturnValue(mockPayload);

      // Mock database connection and repository
      const mockConnection = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockUser),
          save: jest.fn().mockResolvedValue(mockUser),
        }),
      };

      const { getConnection } = require('../../config/database');
      getConnection.mockResolvedValue(mockConnection);

      // Set up request with authorization header
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String), expect.any(Object));
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should create new user if user does not exist', async () => {
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        sub: 'new-okta-id',
        email: 'new@example.com',
        name: 'New User',
        role: 'User',
      };

      jwt.verify.mockReturnValue(mockPayload);

      const mockConnection = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(null), // User not found
          save: jest.fn().mockResolvedValue({
            id: 'new-user-id',
            oktaId: mockPayload.sub,
            email: mockPayload.email,
            firstName: 'New',
            lastName: 'User',
            role: mockPayload.role,
            isActive: true,
          }),
        }),
      };

      const { getConnection } = require('../../config/database');
      getConnection.mockResolvedValue(mockConnection);

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockConnection.getRepository().save).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 if no authorization header', async () => {
      mockRequest.headers = {};

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'No authorization token provided',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if invalid token format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidToken',
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token format',
      });
    });

    it('should return 401 if JWT verification fails', async () => {
      const mockToken = 'invalid-jwt-token';
      
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token',
      });
    });

    it('should handle database errors gracefully', async () => {
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        sub: 'test-okta-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'User',
      };

      jwt.verify.mockReturnValue(mockPayload);

      const mockConnection = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      };

      const { getConnection } = require('../../config/database');
      getConnection.mockResolvedValue(mockConnection);

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication failed',
      });
    });
  });

  describe('requireRole', () => {
    it('should allow access for user with required role', () => {
      const mockUser = createMockUser({ role: 'Admin' });
      mockRequest.user = mockUser;

      const middleware = requireRole('Admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for user without required role', () => {
      const mockUser = createMockUser({ role: 'User' });
      mockRequest.user = mockUser;

      const middleware = requireRole('Admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions',
      });
    });

    it('should return 401 if no user is authenticated', () => {
      mockRequest.user = undefined;

      const middleware = requireRole('Admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin user', () => {
      const mockUser = createMockUser({ role: 'Admin' });
      mockRequest.user = mockUser;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for non-admin user', () => {
      const mockUser = createMockUser({ role: 'User' });
      mockRequest.user = mockUser;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Admin access required',
      });
    });
  });

  describe('requireManager', () => {
    it('should allow access for manager user', () => {
      const mockUser = createMockUser({ role: 'Manager' });
      mockRequest.user = mockUser;

      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for admin user', () => {
      const mockUser = createMockUser({ role: 'Admin' });
      mockRequest.user = mockUser;

      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for regular user', () => {
      const mockUser = createMockUser({ role: 'User' });
      mockRequest.user = mockUser;

      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Manager access required',
      });
    });
  });

  describe('optionalAuth', () => {
    it('should set user if valid token provided', async () => {
      const mockUser = createMockUser();
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        sub: mockUser.oktaId,
        email: mockUser.email,
        name: `${mockUser.firstName} ${mockUser.lastName}`,
        role: mockUser.role,
      };

      jwt.verify.mockReturnValue(mockPayload);

      const mockConnection = {
        getRepository: jest.fn().mockReturnValue({
          findOne: jest.fn().mockResolvedValue(mockUser),
        }),
      };

      const { getConnection } = require('../../config/database');
      getConnection.mockResolvedValue(mockConnection);

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user if no token provided', async () => {
      mockRequest.headers = {};

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user if invalid token provided', async () => {
      const mockToken = 'invalid-jwt-token';
      
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireSelfOrAdmin', () => {
    it('should allow access for admin user', () => {
      const mockUser = createMockUser({ role: 'Admin' });
      mockRequest.user = mockUser;
      mockRequest.params = { userId: 'different-user-id' };

      requireSelfOrAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for user accessing their own data', () => {
      const mockUser = createMockUser({ id: 'test-user-id', role: 'User' });
      mockRequest.user = mockUser;
      mockRequest.params = { userId: 'test-user-id' };

      requireSelfOrAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for user accessing other user data', () => {
      const mockUser = createMockUser({ id: 'test-user-id', role: 'User' });
      mockRequest.user = mockUser;
      mockRequest.params = { userId: 'different-user-id' };

      requireSelfOrAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied',
      });
    });

    it('should return 401 if no user is authenticated', () => {
      mockRequest.user = undefined;
      mockRequest.params = { userId: 'test-user-id' };

      requireSelfOrAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication required',
      });
    });
  });
});
