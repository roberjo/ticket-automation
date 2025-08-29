// Mock axios before importing the service
jest.mock('axios');
const axios = require('axios');

import { ServiceNowService, getServiceNowService } from '../../services/serviceNowService';
import { mockServiceNowResponses } from '../utils';

describe('ServiceNowService', () => {
  let serviceNowService: ServiceNowService;
  let mockAxios: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock axios instance with proper interceptors
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { 
          use: jest.fn((handler) => {
            // Store the request handler for testing
            mockAxios.requestHandler = handler;
          }),
          eject: jest.fn(),
        },
        response: { 
          use: jest.fn((handler) => {
            // Store the response handler for testing
            mockAxios.responseHandler = handler;
          }),
          eject: jest.fn(),
        },
      },
    };

    // Mock axios.create to return our mock instance
    axios.create.mockReturnValue(mockAxios);
    
    // Create service instance with test configuration
    serviceNowService = new ServiceNowService({
      baseURL: 'https://test-instance.service-now.com',
      username: 'test-user',
      password: 'test-password'
    });
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://test-instance.service-now.com',
        auth: {
          username: 'test-user',
          password: 'test-password'
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000
      });
    });

    it('should set up request and response interceptors', () => {
      expect(mockAxios.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('createTicket', () => {
    const ticketData = {
      title: 'Test Ticket',
      description: 'Test description',
      category: 'general',
      priority: 'medium',
    };

    it('should create a ticket successfully', async () => {
      mockAxios.post.mockResolvedValue({
        data: mockServiceNowResponses.createTicket,
        status: 201,
      });

      const result = await serviceNowService.createTicket(ticketData);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/now/table/sc_req_item', {
        short_description: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        category: ticketData.category,
        subcategory: ticketData.subcategory,
        assignment_group: ticketData.assignment_group,
        ...ticketData
      });
      expect(result).toEqual(mockServiceNowResponses.createTicket);
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        response: {
          data: { error: 'API Error' },
          status: 400,
        },
      };

      mockAxios.post.mockRejectedValue(errorResponse);

      await expect(serviceNowService.createTicket(ticketData)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      mockAxios.post.mockRejectedValue(networkError);

      await expect(serviceNowService.createTicket(ticketData)).rejects.toThrow('Network error');
    });
  });

  describe('getTicketStatus', () => {
    it('should get ticket status successfully', async () => {
      mockAxios.get.mockResolvedValue({
        data: mockServiceNowResponses.getTicketStatus,
        status: 200,
      });

      const result = await serviceNowService.getTicketStatus('test-sys-id');

      expect(mockAxios.get).toHaveBeenCalledWith('/api/now/table/sc_req_item/test-sys-id', {
        params: {
          sysparm_fields: 'sys_id,number,short_description,state,priority,assignment_group,assigned_to,opened_at,closed_at'
        }
      });
      expect(result).toEqual(mockServiceNowResponses.getTicketStatus);
    });

    it('should handle ticket not found', async () => {
      const notFoundError = {
        response: {
          data: { error: 'Record not found' },
          status: 404,
        },
      };

      mockAxios.get.mockRejectedValue(notFoundError);

      await expect(serviceNowService.getTicketStatus('invalid-id')).rejects.toThrow();
    });
  });

  describe('createMultipleTickets', () => {
    const ticketsData = [
      {
        title: 'Test Ticket 1',
        description: 'Test description 1',
        priority: 'high',
      },
      {
        title: 'Test Ticket 2',
        description: 'Test description 2',
        priority: 'medium',
      },
    ];

    it('should create multiple tickets successfully', async () => {
      mockAxios.post.mockResolvedValue({
        data: mockServiceNowResponses.createMultipleTickets,
        status: 201,
      });

      const result = await serviceNowService.createMultipleTickets(ticketsData);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/x_ticket_automation/multiple_ticket_creation', {
        tickets: ticketsData
      });
      expect(result).toEqual(mockServiceNowResponses.createMultipleTickets);
    });

    it('should handle partial failures', async () => {
      const partialError = {
        response: {
          data: { 
            error: 'Some tickets failed',
            failed_records: [1]
          },
          status: 207,
        },
      };

      mockAxios.post.mockRejectedValue(partialError);

      await expect(serviceNowService.createMultipleTickets(ticketsData)).rejects.toThrow();
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      mockAxios.get.mockResolvedValue({
        data: { result: [] },
        status: 200,
      });

      const result = await serviceNowService.testConnection();

      expect(result).toBe(true);
      expect(mockAxios.get).toHaveBeenCalledWith('/api/now/table/sc_req_item', {
        params: { sysparm_limit: 1 }
      });
    });

    it('should return false for failed connection', async () => {
      mockAxios.get.mockRejectedValue(new Error('Connection failed'));

      const result = await serviceNowService.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('getServiceNowService factory', () => {
    it('should create service instance with default config', () => {
      const service = getServiceNowService();
      expect(service).toBeInstanceOf(ServiceNowService);
    });

    it('should create service instance with custom config', () => {
      const customConfig = {
        baseURL: 'https://custom-instance.service-now.com',
        username: 'custom-user',
        password: 'custom-password'
      };
      
      const service = getServiceNowService(customConfig);
      expect(service).toBeInstanceOf(ServiceNowService);
    });
  });
});
