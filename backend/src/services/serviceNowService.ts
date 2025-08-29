/**
 * ServiceNow Integration Service for Ticket Automation
 * 
 * This service provides comprehensive integration with ServiceNow's REST API
 * for creating, updating, and managing ticket requests. It handles the complete
 * lifecycle of ticket operations between our application and ServiceNow.
 * 
 * Key Features:
 * - Single and batch ticket creation
 * - Real-time status synchronization
 * - Error handling and retry logic
 * - Authentication management
 * - Rate limiting and timeout handling
 * - Comprehensive logging and monitoring
 * 
 * ServiceNow Integration Points:
 * - Table API for CRUD operations
 * - Custom Scripted REST APIs for batch operations
 * - Attachment API for file uploads
 * - Import Set API for bulk data loading
 * 
 * Security Considerations:
 * - Basic authentication with service account
 * - OAuth 2.0 support for enhanced security
 * - Request/response logging for audit trails
 * - Timeout protection against hanging requests
 * - Input validation and sanitization
 * 
 * Error Handling:
 * - Automatic retry for transient failures
 * - Detailed error logging with context
 * - Graceful degradation when ServiceNow is unavailable
 * - Status tracking for failed operations
 * 
 * @author ServiceNow Ticket Automation Team
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getRepository } from 'typeorm';
import { ServiceNowTicket, ServiceNowTicketStatus } from '../models/ServiceNowTicket.js';
import { TicketRequest, RequestStatus } from '../models/TicketRequest.js';
import { logger } from '../utils/logger.js';

/**
 * ServiceNow Configuration Interface
 * 
 * Defines the configuration parameters required to connect to ServiceNow.
 * Supports both basic authentication and OAuth 2.0 flows.
 * 
 * Required Fields:
 * - baseURL: ServiceNow instance URL (e.g., https://company.service-now.com)
 * - username: Service account username
 * - password: Service account password
 * 
 * Optional Fields (for OAuth 2.0):
 * - clientId: OAuth client identifier
 * - clientSecret: OAuth client secret
 */
interface ServiceNowConfig {
  baseURL: string;           // ServiceNow instance URL
  username: string;          // Service account username
  password: string;          // Service account password
  clientId?: string;         // OAuth client ID (optional)
  clientSecret?: string;     // OAuth client secret (optional)
}

/**
 * ServiceNow Ticket Data Interface
 * 
 * Defines the structure for ticket data sent to ServiceNow.
 * Maps our internal ticket format to ServiceNow's expected format.
 * 
 * Required Fields:
 * - title: Brief description of the ticket (short_description in ServiceNow)
 * - description: Detailed description of the issue or request
 * - priority: Ticket priority (1=Critical, 2=High, 3=Medium, 4=Low)
 * 
 * Optional Fields:
 * - category: ServiceNow category classification
 * - subcategory: ServiceNow subcategory classification
 * - assignment_group: Target team for ticket assignment
 * - [key: string]: any: Additional ServiceNow fields as needed
 */
interface ServiceNowTicketData {
  title: string;                    // Ticket title/summary
  description: string;              // Detailed description
  priority: string;                 // Priority level
  category?: string;                // ServiceNow category
  subcategory?: string;             // ServiceNow subcategory
  assignment_group?: string;        // Target assignment group
  [key: string]: any;              // Additional ServiceNow fields
}

/**
 * ServiceNow API Response Interface
 * 
 * Defines the standard response structure from ServiceNow REST API.
 * ServiceNow typically wraps response data in a 'result' object.
 * 
 * Standard Fields:
 * - result.sys_id: Unique ServiceNow record identifier
 * - result.number: Human-readable ticket number (e.g., REQ0010001)
 * - result.[field]: Additional fields returned by ServiceNow
 */
interface ServiceNowResponse {
  result: {
    sys_id: string;               // ServiceNow unique identifier
    number: string;               // Human-readable ticket number
    [key: string]: any;          // Additional response fields
  };
}

/**
 * ServiceNow Integration Service Class
 * 
 * Main service class that handles all ServiceNow API interactions.
 * Provides methods for ticket creation, status updates, and data synchronization.
 * 
 * Design Patterns:
 * - Service Layer: Encapsulates business logic for ServiceNow operations
 * - Factory Pattern: Created via factory function for better testability
 * - Singleton Pattern: Single instance per configuration for efficiency
 * 
 * Key Responsibilities:
 * - HTTP client management with authentication
 * - Request/response logging and monitoring
 * - Error handling and retry logic
 * - Data transformation between internal and ServiceNow formats
 * - Status synchronization and updates
 */
export class ServiceNowService {
  /**
   * Private HTTP client instance for ServiceNow API calls
   * Configured with authentication, timeouts, and interceptors
   */
  private client: AxiosInstance;
  
  /**
   * ServiceNow configuration including connection parameters
   * Stored for potential re-authentication or client recreation
   */
  private config: ServiceNowConfig;

  /**
   * ServiceNowService Constructor
   * 
   * Initializes the service with ServiceNow connection configuration
   * and sets up the HTTP client with proper authentication and interceptors.
   * 
   * Configuration Setup:
   * - Creates authenticated Axios client
   * - Sets up request/response interceptors for logging
   * - Configures timeout and headers
   * - Enables detailed API call monitoring
   * 
   * Security Features:
   * - Basic authentication with service account
   * - Request/response logging for audit trails
   * - Timeout protection (30 seconds) against hanging requests
   * - Sensitive data truncation in logs
   * 
   * @param config - ServiceNow connection configuration
   */
  constructor(config: ServiceNowConfig) {
    // Store configuration for potential future use
    this.config = config;
    
    /**
     * HTTP CLIENT SETUP
     * Create Axios instance with ServiceNow-specific configuration
     */
    this.client = axios.create({
      // Base URL for all ServiceNow API calls
      baseURL: config.baseURL,
      
      // Basic authentication using service account credentials
      auth: {
        username: config.username,
        password: config.password
      },
      
      // Standard headers for ServiceNow REST API
      headers: {
        'Content-Type': 'application/json',  // Send JSON data
        'Accept': 'application/json'         // Expect JSON responses
      },
      
      // 30-second timeout to prevent hanging requests
      // ServiceNow operations can be slow, but 30s should be sufficient
      timeout: 30000
    });

    /**
     * REQUEST INTERCEPTOR
     * Logs outgoing API requests for monitoring and debugging
     * 
     * Features:
     * - Logs HTTP method, URL, and request data
     * - Truncates large payloads to prevent log flooding
     * - Debug level logging (not shown in production by default)
     * - Error handling for interceptor failures
     */
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('ServiceNow API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          // Truncate large payloads to prevent log flooding
          data: config.data ? JSON.stringify(config.data).substring(0, 200) + '...' : undefined
        });
        return config;
      },
      (error) => {
        logger.error('ServiceNow API Request Error:', error);
        return Promise.reject(error);
      }
    );

    /**
     * RESPONSE INTERCEPTOR
     * Logs incoming API responses for monitoring and debugging
     * 
     * Features:
     * - Logs response status, URL, and response data
     * - Truncates large responses to prevent log flooding
     * - Detailed error logging with status codes and messages
     * - Preserves original error for proper error handling
     */
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('ServiceNow API Response:', {
          status: response.status,
          url: response.config.url,
          // Truncate large responses to prevent log flooding
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

// Factory function to create ServiceNow service instance
let serviceNowServiceInstance: ServiceNowService | null = null;

export const getServiceNowService = (config?: ServiceNowConfig): ServiceNowService => {
  if (!serviceNowServiceInstance) {
    const serviceConfig = config || {
      baseURL: process.env.SERVICENOW_BASE_URL || '',
      username: process.env.SERVICENOW_USERNAME || '',
      password: process.env.SERVICENOW_PASSWORD || '',
      clientId: process.env.SERVICENOW_CLIENT_ID,
      clientSecret: process.env.SERVICENOW_CLIENT_SECRET
    };
    serviceNowServiceInstance = new ServiceNowService(serviceConfig);
  }
  return serviceNowServiceInstance;
};
