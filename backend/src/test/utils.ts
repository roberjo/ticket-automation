import { Request, Response } from 'express';
import { User, TicketRequest, ServiceNowTicket } from '../models';

// Test data factories
export const createMockUser = (overrides: Partial<User> = {}): Partial<User> => ({
  id: 'test-user-id',
  oktaId: 'test-okta-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'User',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockTicketRequest = (overrides: Partial<TicketRequest> = {}): Partial<TicketRequest> => ({
  id: 'test-request-id',
  userId: 'test-user-id',
  title: 'Test Ticket Request',
  description: 'Test description',
  status: 'pending',
  priority: 'medium',
  businessTaskType: 'general',
  requestData: { test: 'data' },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockServiceNowTicket = (overrides: Partial<ServiceNowTicket> = {}): Partial<ServiceNowTicket> => ({
  id: 'test-ticket-id',
  ticketRequestId: 'test-request-id',
  serviceNowId: 'test-sys-id-123',
  serviceNowNumber: 'REQ0010001',
  title: 'Test ServiceNow Ticket',
  description: 'Test description',
  status: 'open',
  priority: 'medium',
  category: 'general',
  subcategory: 'request',
  assignmentGroup: 'IT Support',
  assignedTo: 'test-user',
  ticketData: { test: 'data' },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Mock Express request and response
export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  headers: {},
  body: {},
  params: {},
  query: {},
  user: undefined, // Don't set user by default for auth tests
  ...overrides,
} as Partial<Request>);

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

// Mock repository functions
export const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getCount: jest.fn(),
  })),
});

// Mock ServiceNow API responses
export const mockServiceNowResponses = {
  createTicket: {
    result: {
      sys_id: 'test-sys-id-123',
      number: 'REQ0010001',
      short_description: 'Test Ticket',
      state: '1',
    },
  },
  getTicketStatus: {
    result: {
      sys_id: 'test-sys-id-123',
      number: 'REQ0010001',
      state: '2',
      short_description: 'Test Ticket',
    },
  },
  createMultipleTickets: {
    result: [
      {
        sys_id: 'test-sys-id-1',
        number: 'REQ0010001',
        short_description: 'Test Ticket 1',
        state: '1',
      },
      {
        sys_id: 'test-sys-id-2',
        number: 'REQ0010002',
        short_description: 'Test Ticket 2',
        state: '1',
      },
    ],
  },
  error: {
    error: {
      message: 'ServiceNow API Error',
      detail: 'Test error detail',
    },
  },
};

// Test scenarios
export const testScenarios = {
  // Authentication scenarios
  auth: {
    validUser: {
      user: createMockUser({ role: 'User' }),
      token: 'valid-jwt-token',
    },
    adminUser: {
      user: createMockUser({ role: 'Admin' }),
      token: 'admin-jwt-token',
    },
    managerUser: {
      user: createMockUser({ role: 'Manager' }),
      token: 'manager-jwt-token',
    },
    invalidToken: {
      user: null,
      token: 'invalid-jwt-token',
    },
  },

  // Ticket request scenarios
  ticketRequests: {
    validRequest: createMockTicketRequest(),
    pendingRequest: createMockTicketRequest({ status: 'pending' }),
    processingRequest: createMockTicketRequest({ status: 'processing' }),
    completedRequest: createMockTicketRequest({ status: 'completed' }),
    failedRequest: createMockTicketRequest({ status: 'failed' }),
    highPriorityRequest: createMockTicketRequest({ priority: 'high' }),
    lowPriorityRequest: createMockTicketRequest({ priority: 'low' }),
  },

  // ServiceNow ticket scenarios
  serviceNowTickets: {
    openTicket: createMockServiceNowTicket({ status: 'open' }),
    inProgressTicket: createMockServiceNowTicket({ status: 'in_progress' }),
    resolvedTicket: createMockServiceNowTicket({ status: 'resolved' }),
    closedTicket: createMockServiceNowTicket({ status: 'closed' }),
  },
};

// Helper functions for testing
export const testHelpers = {
  // Wait for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock console methods
  mockConsole: () => {
    const originalConsole = { ...console };
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.info = jest.fn();
    
    return {
      restore: () => {
        console.log = originalConsole.log;
        console.error = originalConsole.error;
        console.warn = originalConsole.warn;
        console.info = originalConsole.info;
      },
    };
  },

  // Create test database connection
  createTestDatabaseConnection: () => ({
    initialize: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
    getRepository: jest.fn(),
    query: jest.fn(),
    transaction: jest.fn(),
  }),

  // Validate response structure
  validateResponseStructure: (response: any, expectedStructure: any) => {
    for (const key in expectedStructure) {
      expect(response).toHaveProperty(key);
      if (typeof expectedStructure[key] === 'object' && expectedStructure[key] !== null) {
        testHelpers.validateResponseStructure(response[key], expectedStructure[key]);
      }
    }
  },

  // Create pagination parameters
  createPaginationParams: (page = 1, limit = 10) => ({
    page: page.toString(),
    limit: limit.toString(),
  }),

  // Create filter parameters
  createFilterParams: (filters: Record<string, string> = {}) => ({
    ...filters,
  }),
};
