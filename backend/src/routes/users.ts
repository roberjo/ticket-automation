import { Router } from 'express';
import { getRepository } from 'typeorm';
import { User, UserRole } from '../models/User.js';
import { TicketRequest } from '../models/TicketRequest.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAdmin, requireManager } from '../middleware/auth.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';

const router = Router();

// Get current user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({
    where: { id: req.user!.id },
    select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'lastLogin', 'createdAt', 'updatedAt']
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: user
  });
}));

// Update current user profile
router.patch('/profile', asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;
  
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { id: req.user!.id } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Only allow updating certain fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;

  await userRepository.save(user);

  logger.info('User profile updated:', {
    userId: req.user!.id,
    updatedFields: Object.keys(req.body)
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      updatedAt: user.updatedAt
    }
  });
}));

// Get user statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const ticketRepository = getRepository(TicketRequest);
  
  const [
    totalRequests,
    pendingRequests,
    completedRequests,
    failedRequests,
    recentRequests
  ] = await Promise.all([
    ticketRepository.count({ where: { userId: req.user!.id } }),
    ticketRepository.count({ where: { userId: req.user!.id, status: 'pending' } }),
    ticketRepository.count({ where: { userId: req.user!.id, status: 'completed' } }),
    ticketRepository.count({ where: { userId: req.user!.id, status: 'failed' } }),
    ticketRepository.find({
      where: { userId: req.user!.id },
      order: { createdAt: 'DESC' },
      take: 5
    })
  ]);

  res.json({
    success: true,
    data: {
      totalRequests,
      pendingRequests,
      completedRequests,
      failedRequests,
      recentRequests
    }
  });
}));

// Admin: Get all users (admin only)
router.get('/', requireAdmin, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, isActive, search } = req.query;
  
  const userRepository = getRepository(User);
  const queryBuilder = userRepository.createQueryBuilder('user');

  // Apply filters
  if (role) {
    queryBuilder.andWhere('user.role = :role', { role });
  }
  if (isActive !== undefined) {
    queryBuilder.andWhere('user.isActive = :isActive', { isActive: isActive === 'true' });
  }
  if (search) {
    queryBuilder.andWhere(
      '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
      { search: `%${search}%` }
    );
  }

  // Apply pagination
  const offset = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(offset).take(Number(limit));
  queryBuilder.orderBy('user.createdAt', 'DESC');

  const [users, total] = await queryBuilder.getManyAndCount();

  res.json({
    success: true,
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Admin: Get specific user (admin only)
router.get('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({
    where: { id },
    relations: ['ticketRequests']
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    success: true,
    data: user
  });
}));

// Admin: Update user (admin only)
router.patch('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, role, isActive } = req.body;
  
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { id } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Update allowed fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (role && Object.values(UserRole).includes(role)) {
    user.role = role as UserRole;
  }
  if (isActive !== undefined) {
    user.isActive = isActive;
  }

  await userRepository.save(user);

  logger.info('User updated by admin:', {
    adminId: req.user!.id,
    userId: id,
    updatedFields: Object.keys(req.body)
  });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
}));

// Admin: Deactivate user (admin only)
router.post('/:id/deactivate', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { id } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.isActive) {
    throw new ValidationError('User is already deactivated');
  }

  user.isActive = false;
  await userRepository.save(user);

  logger.info('User deactivated by admin:', {
    adminId: req.user!.id,
    userId: id
  });

  res.json({
    success: true,
    message: 'User deactivated successfully',
    data: user
  });
}));

// Admin: Activate user (admin only)
router.post('/:id/activate', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const userRepository = getRepository(User);
  const user = await userRepository.findOne({ where: { id } });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.isActive) {
    throw new ValidationError('User is already active');
  }

  user.isActive = true;
  await userRepository.save(user);

  logger.info('User activated by admin:', {
    adminId: req.user!.id,
    userId: id
  });

  res.json({
    success: true,
    message: 'User activated successfully',
    data: user
  });
}));

// Manager: Get user requests (manager or admin only)
router.get('/:id/requests', requireManager, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10, status } = req.query;
  
  const ticketRepository = getRepository(TicketRequest);
  const queryBuilder = ticketRepository
    .createQueryBuilder('request')
    .leftJoinAndSelect('request.serviceNowTickets', 'tickets')
    .where('request.userId = :userId', { userId: id });

  // Apply filters
  if (status) {
    queryBuilder.andWhere('request.status = :status', { status });
  }

  // Apply pagination
  const offset = (Number(page) - 1) * Number(limit);
  queryBuilder.skip(offset).take(Number(limit));
  queryBuilder.orderBy('request.createdAt', 'DESC');

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

// Admin: Get user statistics (admin only)
router.get('/:id/stats', requireAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const ticketRepository = getRepository(TicketRequest);
  
  const [
    totalRequests,
    pendingRequests,
    completedRequests,
    failedRequests,
    cancelledRequests
  ] = await Promise.all([
    ticketRepository.count({ where: { userId: id } }),
    ticketRepository.count({ where: { userId: id, status: 'pending' } }),
    ticketRepository.count({ where: { userId: id, status: 'completed' } }),
    ticketRepository.count({ where: { userId: id, status: 'failed' } }),
    ticketRepository.count({ where: { userId: id, status: 'cancelled' } })
  ]);

  res.json({
    success: true,
    data: {
      totalRequests,
      pendingRequests,
      completedRequests,
      failedRequests,
      cancelledRequests
    }
  });
}));

export default router;
