import { Router } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/User.js';
import { TicketRequest } from '../models/TicketRequest.js';
import { ServiceNowTicket } from '../models/ServiceNowTicket.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Basic health check
router.get('/', asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
}));

// Detailed health check with database connectivity
router.get('/detailed', asyncHandler(async (req, res) => {
  const health = {
    success: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: {
        status: 'unknown',
        message: '',
        responseTime: 0
      },
      memory: {
        status: 'unknown',
        message: '',
        usage: {}
      },
      disk: {
        status: 'unknown',
        message: '',
        usage: {}
      }
    }
  };

  // Database health check
  try {
    const startTime = Date.now();
    const userRepository = getRepository(User);
    await userRepository.query('SELECT 1');
    const responseTime = Date.now() - startTime;
    
    health.checks.database = {
      status: 'healthy',
      message: 'Database connection successful',
      responseTime
    };
  } catch (error) {
    health.checks.database = {
      status: 'unhealthy',
      message: `Database connection failed: ${error.message}`,
      responseTime: 0
    };
    health.success = false;
  }

  // Memory usage check
  try {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };

    // Consider unhealthy if heap usage is over 1GB
    const isHealthy = memUsageMB.heapUsed < 1024;
    
    health.checks.memory = {
      status: isHealthy ? 'healthy' : 'warning',
      message: isHealthy ? 'Memory usage is normal' : 'High memory usage detected',
      usage: memUsageMB
    };

    if (!isHealthy) {
      health.success = false;
    }
  } catch (error) {
    health.checks.memory = {
      status: 'unknown',
      message: `Memory check failed: ${error.message}`,
      usage: {}
    };
  }

  // Disk usage check (simplified - just check if we can write to logs)
  try {
    const fs = await import('fs/promises');
    const testFile = 'logs/health-check-test.txt';
    await fs.writeFile(testFile, 'health check test');
    await fs.unlink(testFile);
    
    health.checks.disk = {
      status: 'healthy',
      message: 'Disk write access is available',
      usage: {}
    };
  } catch (error) {
    health.checks.disk = {
      status: 'warning',
      message: `Disk check failed: ${error.message}`,
      usage: {}
    };
  }

  const statusCode = health.success ? 200 : 503;
  res.status(statusCode).json(health);
}));

// System statistics
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    const userRepository = getRepository(User);
    const ticketRepository = getRepository(TicketRequest);
    const serviceNowRepository = getRepository(ServiceNowTicket);

    const [
      totalUsers,
      totalRequests,
      totalTickets,
      pendingRequests,
      completedRequests,
      failedRequests
    ] = await Promise.all([
      userRepository.count(),
      ticketRepository.count(),
      serviceNowRepository.count(),
      ticketRepository.count({ where: { status: 'pending' } }),
      ticketRepository.count({ where: { status: 'completed' } }),
      ticketRepository.count({ where: { status: 'failed' } })
    ]);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      statistics: {
        users: {
          total: totalUsers
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          completed: completedRequests,
          failed: failedRequests
        },
        tickets: {
          total: totalTickets
        }
      }
    });
  } catch (error) {
    logger.error('Failed to get system statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve system statistics'
      }
    });
  }
}));

// Readiness check (for Kubernetes)
router.get('/ready', asyncHandler(async (req, res) => {
  try {
    // Check database connectivity
    const userRepository = getRepository(User);
    await userRepository.query('SELECT 1');
    
    res.json({
      success: true,
      message: 'Service is ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      success: false,
      message: 'Service is not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}));

// Liveness check (for Kubernetes)
router.get('/live', (req, res) => {
  res.json({
    success: true,
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
