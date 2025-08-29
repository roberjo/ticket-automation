import { ServiceNowService } from '../../services/serviceNowService';
import { mockServiceNowResponses, createMockTicketRequest } from '../utils';

// Mock axios
jest.mock('axios');
const axios = require('axios');

describe('ServiceNowService', () => {
  let serviceNowService: ServiceNowService;
  let mockAxios: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create mock axios instance
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    };

    // Mock axios.create to return our mock instance
    axios.create.mockReturnValue(mockAxios);
    
    // Create service instance
    serviceNowService = new ServiceNowService();
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://test-instance.service-now.com',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    });

    it('should set up request and response interceptors', () => {
      expect(mockAxios.interceptors.request.use).toHaveBeenCalled();
      expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('createTicket', () => {
    const ticketData = {
      short_description: 'Test Ticket',
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

      expect(mockAxios.post).toHaveBeenCalledWith('/api/now/table/incident', ticketData);
      expect(result).toEqual(mockServiceNowResponses.createTicket.result);
    });

    it('should handle API errors', async () => {
      const errorResponse = {
        response: {
          data: mockServiceNowResponses.error,
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

  describe('createMultipleTickets', () => {
    const ticketRequests = [
      {
        short_description: 'Test Ticket 1',
        description: 'Test description 1',
        category: 'general',
        priority: 'medium',
      },
      {
        short_description: 'Test Ticket 2',
        description: 'Test description 2',
        category: 'hardware',
        priority: 'high',
      },
    ];

    it('should create multiple tickets successfully', async () => {
      mockAxios.post.mockResolvedValue({
        data: mockServiceNowResponses.createMultipleTickets,
        status: 201,
      });

      const result = await serviceNowService.createMultipleTickets(ticketRequests);

      expect(mockAxios.post).toHaveBeenCalledWith('/api/now/scripted_rest_api/multi_ticket_creation', {
        tickets: ticketRequests,
      });
      expect(result).toEqual(mockServiceNowResponses.createMultipleTickets.result);
    });

    it('should handle API errors for multiple tickets', async () => {
      const errorResponse = {
        response: {
          data: mockServiceNowResponses.error,
          status: 400,
        },
      };

      mockAxios.post.mockRejectedValue(errorResponse);

      await expect(serviceNowService.createMultipleTickets(ticketRequests)).rejects.toThrow();
    });
  });

  describe('getTicketStatus', () => {
    const ticketId = 'test-sys-id-123';

    it('should get ticket status successfully', async () => {
      mockAxios.get.mockResolvedValue({
        data: mockServiceNowResponses.getTicketStatus,
        status: 200,
      });

      const result = await serviceNowService.getTicketStatus(ticketId);

      expect(mockAxios.get).toHaveBeenCalledWith(`/api/now/table/incident/${ticketId}`);
      expect(result).toEqual(mockServiceNowResponses.getTicketStatus.result);
    });

    it('should handle ticket not found', async () => {
      const notFoundError = {
        response: {
          data: { error: { message: 'Record not found' } },
          status: 404,
        },
      };

      mockAxios.get.mockRejectedValue(notFoundError);

      await expect(serviceNowService.getTicketStatus(ticketId)).rejects.toThrow();
    });
  });

  describe('updateTicketStatus', () => {
    const ticketId = 'test-sys-id-123';
    const updateData = {
      state: '2',
      short_description: 'Updated ticket',
    };

    it('should update ticket status successfully', async () => {
      const updatedTicket = {
        ...mockServiceNowResponses.getTicketStatus.result,
        ...updateData,
      };

      mockAxios.put.mockResolvedValue({
        data: { result: updatedTicket },
        status: 200,
      });

      const result = await serviceNowService.updateTicketStatus(ticketId, updateData);

      expect(mockAxios.put).toHaveBeenCalledWith(`/api/now/table/incident/${ticketId}`, updateData);
      expect(result).toEqual(updatedTicket);
    });

    it('should handle update errors', async () => {
      const updateError = {
        response: {
          data: { error: { message: 'Update failed' } },
          status: 400,
        },
      };

      mockAxios.put.mockRejectedValue(updateError);

      await expect(serviceNowService.updateTicketStatus(ticketId, updateData)).rejects.toThrow();
    });
  });

  describe('processTicketRequest', () => {
    const ticketRequest = createMockTicketRequest();

    it('should process ticket request successfully', async () => {
      mockAxios.post.mockResolvedValue({
        data: mockServiceNowResponses.createTicket,
        status: 201,
      });

      const result = await serviceNowService.processTicketRequest(ticketRequest);

      expect(result).toEqual({
        success: true,
        ticketId: mockServiceNowResponses.createTicket.result.sys_id,
        ticketNumber: mockServiceNowResponses.createTicket.result.number,
        status: mockServiceNowResponses.createTicket.result.state,
      });
    });

    it('should handle processing errors', async () => {
      const processingError = {
        response: {
          data: { error: { message: 'Processing failed' } },
          status: 500,
        },
      };

      mockAxios.post.mockRejectedValue(processingError);

      const result = await serviceNowService.processTicketRequest(ticketRequest);

      expect(result).toEqual({
        success: false,
        error: 'Processing failed',
      });
    });
  });

  describe('syncTicketStatuses', () => {
    const tickets = [
      { serviceNowId: 'test-sys-id-1', serviceNowNumber: 'REQ0010001' },
      { serviceNowId: 'test-sys-id-2', serviceNowNumber: 'REQ0010002' },
    ];

    it('should sync ticket statuses successfully', async () => {
      mockAxios.get
        .mockResolvedValueOnce({
          data: { result: { ...mockServiceNowResponses.getTicketStatus.result, sys_id: 'test-sys-id-1' } },
          status: 200,
        })
        .mockResolvedValueOnce({
          data: { result: { ...mockServiceNowResponses.getTicketStatus.result, sys_id: 'test-sys-id-2' } },
          status: 200,
        });

      const result = await serviceNowService.syncTicketStatuses(tickets);

      expect(result).toHaveLength(2);
      expect(result[0].serviceNowId).toBe('test-sys-id-1');
      expect(result[1].serviceNowId).toBe('test-sys-id-2');
    });

    it('should handle sync errors gracefully', async () => {
      mockAxios.get
        .mockResolvedValueOnce({
          data: { result: { ...mockServiceNowResponses.getTicketStatus.result, sys_id: 'test-sys-id-1' } },
          status: 200,
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const result = await serviceNowService.syncTicketStatuses(tickets);

      expect(result).toHaveLength(1);
      expect(result[0].serviceNowId).toBe('test-sys-id-1');
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      mockAxios.get.mockResolvedValue({
        data: { result: { status: 'ok' } },
        status: 200,
      });

      const result = await serviceNowService.testConnection();

      expect(mockAxios.get).toHaveBeenCalledWith('/api/now/table/incident?sysparm_limit=1');
      expect(result).toBe(true);
    });

    it('should handle connection test failure', async () => {
      mockAxios.get.mockRejectedValue(new Error('Connection failed'));

      const result = await serviceNowService.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded');
      mockAxios.post.mockRejectedValue(timeoutError);

      await expect(serviceNowService.createTicket({})).rejects.toThrow('timeout of 30000ms exceeded');
    });

    it('should handle malformed responses', async () => {
      mockAxios.post.mockResolvedValue({
        data: null,
        status: 200,
      });

      await expect(serviceNowService.createTicket({})).rejects.toThrow();
    });
  });
});
