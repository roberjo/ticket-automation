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

// Mock TypeORM getRepository
jest.mock('typeorm', () => ({
  getRepository: jest.fn(),
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
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockTicketRequests),
        getCount: jest.fn().mockResolvedValue(2),
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
        message: 'Ticket requests retrieved successfully',
        data: {
          tickets: mockTicketRequests,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            pages: 1,
          },
        },
      });
    });

    it('should handle database errors', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Database error')),
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
        message: 'Failed to retrieve ticket requests',
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
        message: 'Ticket request retrieved successfully',
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
        .expect(404);

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
      };

      const mockTicketRequest = { id: 'new-id', ...ticketData, status: 'pending' };

      const mockRepository = {
        save: jest.fn().mockResolvedValue(mockTicketRequest),
      };

      const mockServiceNowService = {
        processTicketRequest: jest.fn().mockResolvedValue({
          success: true,
          ticketId: 'test-sys-id',
          ticketNumber: 'REQ0010001',
        }),
      };

      require('../../services/serviceNowService').ServiceNowService.mockImplementation(() => mockServiceNowService);
      const { getRepository } = require('typeorm');
      getRepository.mockReturnValue(mockRepository);

      const response = await request(app)
        .post('/api/tickets')
        .send(ticketData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Ticket request created successfully',
        data: {
          ticketRequest: mockTicketRequest,
          serviceNowTicket: {
            ticketId: 'test-sys-id',
            ticketNumber: 'REQ0010001',
          },
        },
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        description: 'Test description',
        // Missing title
      };

      const response = await request(app)
        .post('/api/tickets')
        .send(invalidData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'title',
            message: expect.any(String),
          }),
        ]),
      });
    });
  });
});
