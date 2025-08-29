import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_NAME = 'ticket_automation_test';
process.env.OKTA_ISSUER = 'https://test.okta.com/oauth2/default';
process.env.OKTA_AUDIENCE = 'api://default';
process.env.SERVICENOW_INSTANCE = 'test-instance.service-now.com';

// Global test timeout
jest.setTimeout(30000);

// Mock TypeORM DataSource
jest.mock('../config/database', () => ({
  getConnection: jest.fn(),
  config: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'test_user',
    password: 'test_password',
    database: 'ticket_automation_test',
    entities: [],
    synchronize: true,
    logging: false,
  },
}));

// Mock Winston logger
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Global test utilities
global.testUtils = {
  // Mock database connection
  mockDatabase: () => {
    const mockConnection = {
      initialize: jest.fn().mockResolvedValue(true),
      destroy: jest.fn().mockResolvedValue(true),
      getRepository: jest.fn(),
      query: jest.fn(),
    };
    
    const { getConnection } = require('../config/database');
    getConnection.mockResolvedValue(mockConnection);
    
    return mockConnection;
  },

  // Mock ServiceNow API responses
  mockServiceNowAPI: () => {
    const mockResponses = {
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
    };

    return mockResponses;
  },

  // Create test user data
  createTestUser: (overrides = {}) => ({
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
  }),

  // Create test ticket request data
  createTestTicketRequest: (overrides = {}) => ({
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
  }),

  // Create test ServiceNow ticket data
  createTestServiceNowTicket: (overrides = {}) => ({
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
  }),

  // Mock JWT token
  createMockJWT: (payload = {}) => {
    const defaultPayload = {
      sub: 'test-okta-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'User',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      ...payload,
    };

    // Create a simple mock JWT (not a real JWT, just for testing)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payloadB64 = Buffer.from(JSON.stringify(defaultPayload)).toString('base64');
    const signature = 'mock-signature';
    
    return `${header}.${payloadB64}.${signature}`;
  },

  // Clean up mocks
  cleanupMocks: () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  },
};

// Extend global types
declare global {
  var testUtils: {
    mockDatabase: () => any;
    mockServiceNowAPI: () => any;
    createTestUser: (overrides?: any) => any;
    createTestTicketRequest: (overrides?: any) => any;
    createTestServiceNowTicket: (overrides?: any) => any;
    createMockJWT: (payload?: any) => string;
    cleanupMocks: () => void;
  };
}
