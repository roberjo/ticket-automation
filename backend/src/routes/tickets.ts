import { Router } from 'express';
import { getRepository } from 'typeorm';
import { TicketRequest, RequestStatus, RequestPriority } from '../models/TicketRequest.js';
import { ServiceNowTicket } from '../models/ServiceNowTicket.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { ticketCreationRateLimiter } from '../middleware/rateLimiter.js';
import { requireSelfOrAdmin } from '../middleware/auth.js';
import { ValidationError } from '../middleware/errorHandler.js';

const router = Router();

// Get all ticket requests for the authenticated user
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, priority, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
  
  const ticketRepository = getRepository(TicketRequest);
  const queryBuilder = ticketRepository
    .createQueryBuilder('request')
    .leftJoinAndSelect('request.serviceNowTickets', 'tickets')
    .where('request.userId = :userId', { userId: req.user!.id });

  // Apply filters
  if (status) {
    queryBuilder.andWhere('request.status = :status', { status });
  }
  if (priority) {
    queryBuilder.andWhere('request.priority = :priority', { priority });
  }

  // Apply sorting
  queryBuilder.orderBy(`request.${sortBy}`, sortOrder as 'ASC' | 'DESC');

  // Apply pagination
  const offset = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(offset).take(Number(limit));

  const [requests, total] = await queryBuilder.getManyAndCount();

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
