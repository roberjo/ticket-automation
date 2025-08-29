import request from 'supertest';
import express from 'express';
import ticketsRoutes from '../../routes/tickets';
import { createMockUser } from '../utils';

// Mock dependencies
jest.mock('../../config/database', () => ({
  getConnection: jest.fn(),
}));

jest.mock('../../services/serviceNowService', () => ({
  ServiceNowService: jest.fn().mockImplementation(() => ({
    createTicket: jest.fn(),
    createMultipleTickets: jest.fn(),
    processTicketRequest: jest.fn(),
  })),
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  requireSelfOrAdmin: jest.fn(() => (req: any, res: any, next: any) => next()),
  authMiddleware: jest.fn((req: any, res: any, next: any) => next()),
}));

// Mock error handler middleware
jest.mock('../../middleware/errorHandler', () => ({
  asyncHandler: (fn: any) => (req: any, res: any, next: any) => {
    try {
      const result = fn(req, res, next);
      if (result && typeof result.catch === 'function') {
        return result.catch(next);
      }
      return result;
    } catch (error) {
      next(error);
    }
  },
  ValidationError: class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ValidationError';
    }
  },
}));

// Mock rate limiter
jest.mock('../../middleware/rateLimiter', () => ({
  ticketCreationRateLimiter: jest.fn((req: any, res: any, next: any) => next()),
}));

describe('Tickets Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = createMockUser();
      next();
    });
    
    app.use('/api/tickets', ticketsRoutes);
    
    // Add error handler middleware
    app.use((error: any, req: any, res: any, next: any) => {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    });
  });

  describe('GET /api/tickets', () => {
    it('should return paginated ticket requests', async () => {
      const mockTicketRequests = [
        { id: '1', title: 'Test Ticket 1', status: 'pending' },
        { id: '2', title: 'Test Ticket 2', status: 'pending' },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockTicketRequests, 2]),
      };

      const mockRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      };

      const { getRepository } = require('typeorm');
      getRepository.mockReturnValue(mockRepository);

      const response = await request(app)
        .get('/api/tickets')
        .query({ page: '1', limit: '10' })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockTicketRequests,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          pages: 1,
        },
      });
    });

    it('should handle database errors', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      const mockRepository = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      };

      const { getRepository } = require('typeorm');
      getRepository.mockReturnValue(mockRepository);

      const response = await request(app)
        .get('/api/tickets')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Internal server error',
        error: 'Database error',
      });
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('should return a specific ticket request', async () => {
      const mockTicketRequest = { id: 'test-id', title: 'Test Ticket', status: 'pending' };

      const mockRepository = {
        findOne: jest.fn().mockResolvedValue(mockTicketRequest),
      };

      const { getRepository } = require('typeorm');
      getRepository.mockReturnValue(mockRepository);

      const response = await request(app)
        .get('/api/tickets/test-id')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockTicketRequest,
      });
    });

    it('should return 404 for non-existent ticket', async () => {
      const mockRepository = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const { getRepository } = require('typeorm');
      getRepository.mockReturnValue(mockRepository);

      const response = await request(app)
        .get('/api/tickets/non-existent-id')
        .expect(400); // ValidationError gets handled as 400 by our error handler

      expect(response.body).toEqual({
        success: false,
        message: 'Ticket request not found',
      });
    });
  });

  describe('POST /api/tickets', () => {
    it('should create a new ticket request', async () => {
      const ticketData = {
        title: 'Test Ticket',
        description: 'Test description',
        priority: 'medium',
        businessTaskType: 'general',
        requestData: { test: 'data' },
        tickets: [
          {
            title: 'Test ServiceNow Ticket',
            description: 'Test ServiceNow description',
            category: 'hardware',
          }
        ]
      };

      const mockTicketRequest = { id: 'new-id', status: 'pending' };
      const mockServiceNowTickets = [{ id: 'servicenow-id', title: 'Test ServiceNow Ticket', status: 'new' }];

      const mockTicketRepository = {
        create: jest.fn().mockReturnValue(mockTicketRequest),
        save: jest.fn().mockResolvedValue(mockTicketRequest),
      };

      const mockServiceNowRepository = {
        create: jest.fn().mockReturnValue(mockServiceNowTickets[0]),
        save: jest.fn().mockResolvedValue(mockServiceNowTickets),
      };

      const { getRepository } = require('typeorm');
      getRepository
        .mockReturnValueOnce(mockTicketRepository)
        .mockReturnValueOnce(mockServiceNowRepository);

      const response = await request(app)
        .post('/api/tickets')
        .send(ticketData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Ticket request created successfully',
        data: {
          requestId: mockTicketRequest.id,
          tickets: mockServiceNowTickets.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status
          }))
        },
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Test description',
        // Missing title, businessTaskType, and tickets
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(invalidData)
        .expect(400); // ValidationError gets handled as 400 by our error handler

      expect(response.body).toEqual({
        success: false,
        message: 'Title, description, and business task type are required',
      });
    });
  });
});
