import { Request, Response, NextFunction } from 'express';
import { authMiddleware, requireRole, requireAdmin, requireManager, optionalAuth, requireSelfOrAdmin } from '../../middleware/auth';
import { createMockUser, createMockRequest, createMockResponse } from '../utils';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

// Mock TypeORM getRepository
jest.mock('typeorm', () => ({
  getRepository: jest.fn(),
}));

// Mock database connection and repositories
jest.mock('../../config/database', () => ({
  getConnection: jest.fn(),
}));

// Mock environment variables for JWT
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.OKTA_JWT_SECRET = 'test-okta-jwt-secret';
process.env.OKTA_ISSUER = 'https://test.okta.com/oauth2/default';
process.env.OKTA_AUDIENCE = 'api://default';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockUserRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset request user property
    mockRequest = createMockRequest();
    mockRequest.user = undefined;
    mockResponse = createMockResponse();
    mockNext = jest.fn();

    // Create mock user repository
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    // Mock TypeORM getRepository
    const { getRepository } = require('typeorm');
    getRepository.mockReturnValue(mockUserRepository);
  });

  describe('authMiddleware', () => {
    it('should authenticate valid JWT token and set user', async () => {
      const mockUser = createMockUser();
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        sub: mockUser.oktaId,
        email: mockUser.email,
        name: `${mockUser.firstName} ${mockUser.lastName}`,
        given_name: mockUser.firstName,
        family_name: mockUser.lastName,
        role: mockUser.role,
        iss: process.env.OKTA_ISSUER,
        aud: process.env.OKTA_AUDIENCE,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      // Mock JWT verification
      jwt.verify.mockReturnValue(mockPayload);

      // Mock repository to return existing user
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Set up request with authorization header
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.OKTA_JWT_SECRET);
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should create new user if user does not exist', async () => {
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        sub: 'new-okta-id',
        email: 'new@example.com',
        name: 'New User',
        given_name: 'New',
        family_name: 'User',
        role: 'User',
        iss: process.env.OKTA_ISSUER,
        aud: process.env.OKTA_AUDIENCE,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      jwt.verify.mockReturnValue(mockPayload);

      const newUser = {
        id: 'new-user-id',
        oktaId: mockPayload.sub,
        email: mockPayload.email,
        firstName: mockPayload.given_name,
        lastName: mockPayload.family_name,
        role: 'User',
        isActive: true,
      };

      // Mock repository to return null (user not found) and then create new user
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next with error if no authorization header', async () => {
      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No valid authorization header provided'
      }));
    });

    it('should call next with error if invalid token format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidToken',
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'No valid authorization header provided'
      }));
    });

    it('should call next with error if JWT verification fails', async () => {
      const mockToken = 'invalid-jwt-token';
      
      jwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
      });

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid token'
      }));
    });

    it('should handle database errors gracefully', async () => {
      const mockToken = 'valid-jwt-token';
      const mockPayload = {
        sub: 'test-okta-id',
        email: 'test@example.com',
        name: 'Test User',
        given_name: 'Test',
        family_name: 'User',
        role: 'User',
        iss: process.env.OKTA_ISSUER,
        aud: process.env.OKTA_AUDIENCE,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      jwt.verify.mockReturnValue(mockPayload);

      // Mock repository to throw error
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('requireRole', () => {
    it('should allow access for user with required role', () => {
      const mockUser = createMockUser({ role: 'Admin' });
      mockRequest.user = mockUser as any;

      const middleware = requireRole('Admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for user without required role', () => {
      const mockUser = createMockUser({ role: 'User' });
      mockRequest.user = mockUser as any;

      const middleware = requireRole('Admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Insufficient permissions'
      }));
    });

    it('should call next with error if no user is authenticated', () => {
      const middleware = requireRole('Admin');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not authenticated'
      }));
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin user', () => {
      const mockUser = createMockUser({ role: 'Admin' });
      mockRequest.user = mockUser as any;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for non-admin user', () => {
      const mockUser = createMockUser({ role: 'User' });
      mockRequest.user = mockUser as any;

      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Insufficient permissions'
      }));
    });
  });

  describe('requireManager', () => {
    it('should allow access for manager user', () => {
      const mockUser = createMockUser({ role: 'Manager' });
      mockRequest.user = mockUser as any;

      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for admin user', () => {
      const mockUser = createMockUser({ role: 'Admin' });
      mockRequest.user = mockUser as any;

      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for regular user', () => {
      const mockUser = createMockUser({ role: 'User' });
      mockRequest.user = mockUser as any;

      requireManager(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Insufficient permissions'
      }));
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
        given_name: mockUser.firstName,
        family_name: mockUser.lastName,
        role: mockUser.role,
        iss: process.env.OKTA_ISSUER,
        aud: process.env.OKTA_AUDIENCE,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      jwt.verify.mockReturnValue(mockPayload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user if no token provided', async () => {
      await optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user if token is invalid', async () => {
      const mockToken = 'invalid-jwt-token';
      
      jwt.verify.mockImplementation(() => {
        throw new jwt.JsonWebTokenError('Invalid token');
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
      mockRequest.user = mockUser as any;
      mockRequest.params = { userId: 'other-user-id' };

      requireSelfOrAdmin('userId')(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for user accessing their own data', () => {
      const mockUser = createMockUser({ id: 'test-user-id' });
      mockRequest.user = mockUser as any;
      mockRequest.params = { userId: 'test-user-id' };

      requireSelfOrAdmin('userId')(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for user accessing other user data', () => {
      const mockUser = createMockUser({ id: 'test-user-id', role: 'User' });
      mockRequest.user = mockUser as any;
      mockRequest.params = { userId: 'other-user-id' };

      requireSelfOrAdmin('userId')(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Access denied to this resource'
      }));
    });

    it('should call next with error if no user is authenticated', () => {
      mockRequest.params = { userId: 'test-user-id' };

      requireSelfOrAdmin('userId')(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not authenticated'
      }));
    });
  });
});
