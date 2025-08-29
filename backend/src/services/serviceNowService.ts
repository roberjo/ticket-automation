import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getRepository } from 'typeorm';
import { ServiceNowTicket, ServiceNowTicketStatus } from '../models/ServiceNowTicket.js';
import { TicketRequest, RequestStatus } from '../models/TicketRequest.js';
import { logger } from '../utils/logger.js';

interface ServiceNowConfig {
  baseURL: string;
  username: string;
  password: string;
  clientId?: string;
  clientSecret?: string;
}

interface ServiceNowTicketData {
  title: string;
  description: string;
  priority: string;
  category?: string;
  subcategory?: string;
  assignment_group?: string;
  [key: string]: any;
}

interface ServiceNowResponse {
  result: {
    sys_id: string;
    number: string;
    [key: string]: any;
  };
}

export class ServiceNowService {
  private client: AxiosInstance;
  private config: ServiceNowConfig;

  constructor(config: ServiceNowConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      auth: {
        username: config.username,
        password: config.password
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('ServiceNow API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data ? JSON.stringify(config.data).substring(0, 200) + '...' : undefined
        });
        return config;
      },
      (error) => {
        logger.error('ServiceNow API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('ServiceNow API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data ? JSON.stringify(response.data).substring(0, 200) + '...' : undefined
        });
        return response;
      },
      (error) => {
        logger.error('ServiceNow API Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a single ServiceNow ticket
   */
  async createTicket(ticketData: ServiceNowTicketData): Promise<ServiceNowResponse> {
    try {
      const response: AxiosResponse<ServiceNowResponse> = await this.client.post('/api/now/table/sc_req_item', {
        short_description: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        category: ticketData.category,
        subcategory: ticketData.subcategory,
        assignment_group: ticketData.assignment_group,
        ...ticketData
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create ServiceNow ticket:', {
        error: error.message,
        ticketData: ticketData.title
      });
      throw new Error(`ServiceNow ticket creation failed: ${error.message}`);
    }
  }

  /**
   * Create multiple ServiceNow tickets using the custom Scripted REST API
   */
  async createMultipleTickets(tickets: ServiceNowTicketData[]): Promise<ServiceNowResponse[]> {
    try {
      const response: AxiosResponse<ServiceNowResponse[]> = await this.client.post('/api/x_ticket_automation/multiple_ticket_creation', {
        tickets: tickets
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create multiple ServiceNow tickets:', {
        error: error.message,
        ticketCount: tickets.length
      });
      throw new Error(`ServiceNow multiple ticket creation failed: ${error.message}`);
    }
  }

  /**
   * Get ticket status from ServiceNow
   */
  async getTicketStatus(sysId: string): Promise<ServiceNowResponse> {
    try {
      const response: AxiosResponse<ServiceNowResponse> = await this.client.get(`/api/now/table/sc_req_item/${sysId}`, {
        params: {
          sysparm_fields: 'sys_id,number,short_description,state,priority,assignment_group,assigned_to,opened_at,closed_at'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to get ServiceNow ticket status:', {
        error: error.message,
        sysId
      });
      throw new Error(`ServiceNow ticket status retrieval failed: ${error.message}`);
    }
  }

  /**
   * Update ticket status in ServiceNow
   */
  async updateTicketStatus(sysId: string, status: string, additionalData?: Record<string, any>): Promise<ServiceNowResponse> {
    try {
      const response: AxiosResponse<ServiceNowResponse> = await this.client.patch(`/api/now/table/sc_req_item/${sysId}`, {
        state: status,
        ...additionalData
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to update ServiceNow ticket status:', {
        error: error.message,
        sysId,
        status
      });
      throw new Error(`ServiceNow ticket status update failed: ${error.message}`);
    }
  }

  /**
   * Process ticket requests and create ServiceNow tickets
   */
  async processTicketRequest(ticketRequest: TicketRequest): Promise<void> {
    const serviceNowRepository = getRepository(ServiceNowTicket);
    const ticketRepository = getRepository(TicketRequest);

    try {
      // Update request status to processing
      ticketRequest.status = RequestStatus.PROCESSING;
      ticketRequest.processingStarted = new Date();
      await ticketRepository.save(ticketRequest);

      // Get ServiceNow tickets for this request
      const serviceNowTickets = await serviceNowRepository.find({
        where: { ticketRequestId: ticketRequest.id }
      });

      if (serviceNowTickets.length === 0) {
        throw new Error('No ServiceNow tickets found for processing');
      }

      // Prepare ticket data for ServiceNow
      const ticketsData = serviceNowTickets.map(ticket => ({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        category: ticket.category,
        subcategory: ticket.subcategory,
        assignment_group: ticket.assignmentGroup,
        ...ticket.ticketData
      }));

      // Create tickets in ServiceNow
      const serviceNowResponses = await this.createMultipleTickets(ticketsData);

      // Update local tickets with ServiceNow data
      for (let i = 0; i < serviceNowTickets.length; i++) {
        const ticket = serviceNowTickets[i];
        const response = serviceNowResponses[i];

        if (response && response.result) {
          ticket.serviceNowId = response.result.sys_id;
          ticket.serviceNowNumber = response.result.number;
          ticket.status = ServiceNowTicketStatus.NEW;
          ticket.createdInServiceNow = new Date();
          ticket.lastSync = new Date();
          ticket.syncStatus = 'success';
        } else {
          ticket.syncStatus = 'failed';
          ticket.syncError = 'No response from ServiceNow';
        }

        await serviceNowRepository.save(ticket);
      }

      // Update request status to completed
      ticketRequest.status = RequestStatus.COMPLETED;
      ticketRequest.processingCompleted = new Date();
      ticketRequest.actualCompletion = new Date();
      await ticketRepository.save(ticketRequest);

      logger.info('Ticket request processed successfully:', {
        requestId: ticketRequest.id,
        ticketCount: serviceNowTickets.length
      });

    } catch (error) {
      // Update request status to failed
      ticketRequest.status = RequestStatus.FAILED;
      ticketRequest.failureReason = error.message;
      ticketRequest.processingCompleted = new Date();
      await ticketRepository.save(ticketRequest);

      logger.error('Ticket request processing failed:', {
        requestId: ticketRequest.id,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Sync ticket statuses from ServiceNow
   */
  async syncTicketStatuses(tickets: ServiceNowTicket[]): Promise<void> {
    const serviceNowRepository = getRepository(ServiceNowTicket);

    for (const ticket of tickets) {
      try {
        if (!ticket.serviceNowId) {
          logger.warn('Cannot sync ticket without ServiceNow ID:', { ticketId: ticket.id });
          continue;
        }

        const response = await this.getTicketStatus(ticket.serviceNowId);
        
        if (response && response.result) {
          // Map ServiceNow state to our status
          const newStatus = this.mapServiceNowStateToStatus(response.result.state);
          
          if (newStatus !== ticket.status) {
            ticket.status = newStatus;
            ticket.updatedInServiceNow = new Date();
            
            if (newStatus === ServiceNowTicketStatus.CLOSED || newStatus === ServiceNowTicketStatus.RESOLVED) {
              ticket.closedInServiceNow = new Date();
            }
          }

          ticket.lastSync = new Date();
          ticket.syncStatus = 'success';
          ticket.syncError = null;

          await serviceNowRepository.save(ticket);

          logger.debug('Ticket status synced:', {
            ticketId: ticket.id,
            serviceNowId: ticket.serviceNowId,
            oldStatus: ticket.status,
            newStatus: newStatus
          });
        }
      } catch (error) {
        ticket.syncStatus = 'failed';
        ticket.syncError = error.message;
        ticket.lastSync = new Date();
        await serviceNowRepository.save(ticket);

        logger.error('Failed to sync ticket status:', {
          ticketId: ticket.id,
          serviceNowId: ticket.serviceNowId,
          error: error.message
        });
      }
    }
  }

  /**
   * Map ServiceNow state to our status enum
   */
  private mapServiceNowStateToStatus(state: string): ServiceNowTicketStatus {
    const stateMap: Record<string, ServiceNowTicketStatus> = {
      '1': ServiceNowTicketStatus.NEW, // New
      '2': ServiceNowTicketStatus.IN_PROGRESS, // In Progress
      '3': ServiceNowTicketStatus.ON_HOLD, // On Hold
      '4': ServiceNowTicketStatus.RESOLVED, // Resolved
      '5': ServiceNowTicketStatus.CLOSED, // Closed
      '6': ServiceNowTicketStatus.CANCELLED, // Cancelled
      'new': ServiceNowTicketStatus.NEW,
      'in_progress': ServiceNowTicketStatus.IN_PROGRESS,
      'on_hold': ServiceNowTicketStatus.ON_HOLD,
      'resolved': ServiceNowTicketStatus.RESOLVED,
      'closed': ServiceNowTicketStatus.CLOSED,
      'cancelled': ServiceNowTicketStatus.CANCELLED
    };

    return stateMap[state.toLowerCase()] || ServiceNowTicketStatus.NEW;
  }

  /**
   * Test ServiceNow connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('/api/now/table/sc_req_item', {
        params: { sysparm_limit: 1 }
      });
      return true;
    } catch (error) {
      logger.error('ServiceNow connection test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const serviceNowService = new ServiceNowService({
  baseURL: process.env.SERVICENOW_BASE_URL || '',
  username: process.env.SERVICENOW_USERNAME || '',
  password: process.env.SERVICENOW_PASSWORD || '',
  clientId: process.env.SERVICENOW_CLIENT_ID,
  clientSecret: process.env.SERVICENOW_CLIENT_SECRET
});
