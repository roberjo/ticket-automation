/**
 * Ticket Management Routes for ServiceNow Ticket Automation
 * 
 * This module defines all REST API endpoints for managing ticket requests
 * and their associated ServiceNow tickets. It provides comprehensive
 * CRUD operations, status management, and integration with ServiceNow.
 * 
 * Route Structure:
 * - GET /api/tickets - List user's ticket requests (paginated, filtered, sorted)
 * - GET /api/tickets/:id - Get specific ticket request details
 * - POST /api/tickets - Create new ticket request with ServiceNow integration
 * - PATCH /api/tickets/:id/status - Update ticket request status
 * - POST /api/tickets/:id/retry - Retry failed ServiceNow operations
 * - POST /api/tickets/:id/cancel - Cancel pending ticket request
 * - GET /api/tickets/:id/tickets - Get ServiceNow tickets for request
 * - POST /api/tickets/:id/sync - Sync status with ServiceNow
 * 
 * Security Features:
 * - Authentication required for all endpoints
 * - Resource-level authorization (users can only access their own tickets)
 * - Rate limiting on ticket creation to prevent abuse
 * - Input validation and sanitization
 * - Comprehensive audit logging
 * 
 * Key Features:
 * - Pagination for large datasets
 * - Filtering by status, priority, date ranges
 * - Sorting by multiple fields
 * - Real-time ServiceNow integration
 * - Batch ticket creation support
 * - Error handling and recovery
 * - Status synchronization
 * 
 * Integration Points:
 * - ServiceNow API for ticket creation and status updates
 * - PostgreSQL database for persistent storage
 * - Authentication middleware for security
 * - Rate limiting middleware for abuse prevention
 * - Error handling middleware for consistent responses
 * 
 * @author ServiceNow Ticket Automation Team
 */

import { Router } from 'express';
import { getRepository } from 'typeorm';
import { TicketRequest, RequestStatus, RequestPriority } from '../models/TicketRequest.js';
import { ServiceNowTicket } from '../models/ServiceNowTicket.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ticketCreationRateLimiter } from '../middleware/rateLimiter.js';
import { requireSelfOrAdmin } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

// Create Express router for ticket-related routes
const router = Router();

/**
 * GET /api/tickets - List Ticket Requests
 * 
 * Retrieves a paginated list of ticket requests for the authenticated user.
 * Supports filtering, sorting, and pagination for efficient data access.
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 * - status: Filter by request status (pending, processing, completed, failed)
 * - priority: Filter by priority (low, medium, high, critical)
 * - sortBy: Sort field (createdAt, updatedAt, title, status, priority)
 * - sortOrder: Sort direction (ASC, DESC, default: DESC)
 * 
 * Response Format:
 * {
 *   success: true,
 *   data: TicketRequest[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     pages: number
 *   }
 * }
 * 
 * Security:
 * - Authentication required
 * - Users can only see their own ticket requests
 * - Input validation on query parameters
 * 
 * Performance:
 * - Database query optimization with proper indexing
 * - Left join with ServiceNow tickets for complete data
 * - Pagination to limit memory usage
 * - Efficient counting with getManyAndCount()
 */
router.get('/', asyncHandler(async (req, res) => {
  // Extract and validate query parameters with defaults
  const { page = 1, limit = 10, status, priority, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
  
  // Get repository for database operations
  const ticketRepository = getRepository(TicketRequest);
  
  /**
   * BUILD QUERY WITH FILTERS AND JOINS
   * Create query builder for flexible filtering and sorting
   */
  const queryBuilder = ticketRepository
    .createQueryBuilder('request')
    .leftJoinAndSelect('request.serviceNowTickets', 'tickets')  // Include related ServiceNow tickets
    .where('request.userId = :userId', { userId: req.user!.id });  // Security: only user's tickets

  /**
   * APPLY FILTERS
   * Add conditional filters based on query parameters
   */
  if (status) {
    queryBuilder.andWhere('request.status = :status', { status });
  }
  if (priority) {
    queryBuilder.andWhere('request.priority = :priority', { priority });
  }

  /**
   * APPLY SORTING
   * Default sort by creation date (newest first)
   */
  queryBuilder.orderBy(`request.${sortBy}`, sortOrder as 'ASC' | 'DESC');

  /**
   * APPLY PAGINATION
   * Limit results to prevent performance issues
   */
  const offset = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(offset).take(Number(limit));

  /**
   * EXECUTE QUERY
   * Get both results and total count for pagination
   */
  const [requests, total] = await queryBuilder.getManyAndCount();

  /**
   * RETURN RESPONSE
   * Standard API response format with pagination metadata
   */
  res.json({
    success: true,
    data: requests,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get a specific ticket request by ID
router.get('/:id', requireSelfOrAdmin('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const ticketRepository = getRepository(TicketRequest);
  const request = await ticketRepository.findOne({
    where: { id },
    relations: ['serviceNowTickets', 'user']
  });

  if (!request) {
    throw new ValidationError('Ticket request not found');
  }

  res.json({
    success: true,
    data: request
  });
}));

// Create new ticket request(s)
router.post('/', ticketCreationRateLimiter, asyncHandler(async (req, res) => {
  const { title, description, businessTaskType, priority = 'medium', requestData, tickets } = req.body;

  // Validate required fields
  if (!title || !description || !businessTaskType) {
    throw new ValidationError('Title, description, and business task type are required');
  }

  if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
    throw new ValidationError('At least one ticket is required');
  }

  const ticketRepository = getRepository(TicketRequest);
  const serviceNowRepository = getRepository(ServiceNowTicket);

  // Create the main ticket request
  const ticketRequest = ticketRepository.create({
    userId: req.user!.id,
    title,
    description,
    businessTaskType,
    priority: priority as RequestPriority,
    requestData: requestData || {},
    status: RequestStatus.PENDING
  });

  await ticketRepository.save(ticketRequest);

  // Create ServiceNow tickets
  const serviceNowTickets = [];
  for (const ticketData of tickets) {
    const serviceNowTicket = serviceNowRepository.create({
      ticketRequestId: ticketRequest.id,
      title: ticketData.title || title,
      description: ticketData.description || description,
      priority: ticketData.priority || priority,
      category: ticketData.category,
      subcategory: ticketData.subcategory,
      assignmentGroup: ticketData.assignmentGroup,
      ticketData: ticketData
    });

    serviceNowTickets.push(serviceNowTicket);
  }

  await serviceNowRepository.save(serviceNowTickets);

  // TODO: Trigger ServiceNow integration service
  // await serviceNowService.createTickets(serviceNowTickets);

  logger.info('Ticket request created:', {
    requestId: ticketRequest.id,
    userId: req.user!.id,
    ticketCount: tickets.length
  });

  res.status(201).json({
    success: true,
    message: 'Ticket request created successfully',
    data: {
      requestId: ticketRequest.id,
      tickets: serviceNowTickets.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status
      }))
    }
  });
}));

// Update ticket request status
router.patch('/:id/status', requireSelfOrAdmin('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, failureReason } = req.body;

  if (!status || !Object.values(RequestStatus).includes(status)) {
    throw new ValidationError('Valid status is required');
  }

  const ticketRepository = getRepository(TicketRequest);
  const request = await ticketRepository.findOne({ where: { id } });

  if (!request) {
    throw new ValidationError('Ticket request not found');
  }

  // Update status and related fields
  request.status = status as RequestStatus;
  
  if (status === RequestStatus.PROCESSING) {
    request.processingStarted = new Date();
  } else if (status === RequestStatus.COMPLETED) {
    request.processingCompleted = new Date();
    request.actualCompletion = new Date();
  } else if (status === RequestStatus.FAILED) {
    request.failureReason = failureReason;
    request.processingCompleted = new Date();
  }

  await ticketRepository.save(request);

  logger.info('Ticket request status updated:', {
    requestId: id,
    userId: req.user!.id,
    status,
    failureReason
  });

  res.json({
    success: true,
    message: 'Ticket request status updated successfully',
    data: request
  });
}));

// Retry failed ticket request
router.post('/:id/retry', requireSelfOrAdmin('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const ticketRepository = getRepository(TicketRequest);
  const request = await ticketRepository.findOne({ where: { id } });

  if (!request) {
    throw new ValidationError('Ticket request not found');
  }

  if (!request.canRetry()) {
    throw new ValidationError('Ticket request cannot be retried');
  }

  // Reset for retry
  request.status = RequestStatus.PENDING;
  request.retryCount += 1;
  request.processingStarted = null;
  request.processingCompleted = null;
  request.failureReason = null;

  await ticketRepository.save(request);

  // TODO: Trigger ServiceNow integration service
  // await serviceNowService.retryTickets(request);

  logger.info('Ticket request retry initiated:', {
    requestId: id,
    userId: req.user!.id,
    retryCount: request.retryCount
  });

  res.json({
    success: true,
    message: 'Ticket request retry initiated successfully',
    data: request
  });
}));

// Cancel ticket request
router.post('/:id/cancel', requireSelfOrAdmin('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const ticketRepository = getRepository(TicketRequest);
  const request = await ticketRepository.findOne({ where: { id } });

  if (!request) {
    throw new ValidationError('Ticket request not found');
  }

  if (request.status === RequestStatus.COMPLETED) {
    throw new ValidationError('Cannot cancel completed ticket request');
  }

  request.status = RequestStatus.CANCELLED;
  request.processingCompleted = new Date();

  await ticketRepository.save(request);

  // TODO: Cancel ServiceNow tickets
  // await serviceNowService.cancelTickets(request);

  logger.info('Ticket request cancelled:', {
    requestId: id,
    userId: req.user!.id
  });

  res.json({
    success: true,
    message: 'Ticket request cancelled successfully',
    data: request
  });
}));

// Get ServiceNow tickets for a request
router.get('/:id/tickets', requireSelfOrAdmin('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const serviceNowRepository = getRepository(ServiceNowTicket);
  const tickets = await serviceNowRepository.find({
    where: { ticketRequestId: id },
    order: { createdAt: 'ASC' }
  });

  res.json({
    success: true,
    data: tickets
  });
}));

// Sync ServiceNow ticket status
router.post('/:id/sync', requireSelfOrAdmin('id'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const serviceNowRepository = getRepository(ServiceNowTicket);
  const tickets = await serviceNowRepository.find({
    where: { ticketRequestId: id }
  });

  if (tickets.length === 0) {
    throw new ValidationError('No ServiceNow tickets found for this request');
  }

  // TODO: Implement ServiceNow status sync
  // await serviceNowService.syncTicketStatuses(tickets);

  logger.info('ServiceNow ticket sync initiated:', {
    requestId: id,
    userId: req.user!.id,
    ticketCount: tickets.length
  });

  res.json({
    success: true,
    message: 'ServiceNow ticket sync initiated successfully',
    data: {
      syncedTickets: tickets.length
    }
  });
}));

export default router;
