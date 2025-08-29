import request from 'supertest';
import express from 'express';
import healthRoutes from '../../routes/health';

// Mock database connection
jest.mock('../../config/database', () => ({
  getConnection: jest.fn(),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock TypeORM getRepository
jest.mock('typeorm', () => ({
  getRepository: jest.fn(),
}));

describe('Health Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/health', healthRoutes);
  });

  describe('GET /api/health', () => {
    it('should return basic health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Service is healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
        version: expect.any(String),
      });
    });
  });

  describe('GET /api/health/detailed', () => {
    it('should return detailed health information', async () => {
      const mockRepository = {
        query: jest.fn().mockResolvedValue([{ '1': 1 }]),
      };

      const { getRepository } = require('typeorm');
      getRepository.mockReturnValue(mockRepository);

      const response = await request(app)
        .get('/api/health/detailed')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        environment: expect.any(String),
        version: expect.any(String),
        checks: {
          database: {
            status: 'healthy',
            message: 'Database connection successful',
            responseTime: expect.any(Number),
          },
          memory: {
            status: expect.stringMatching(/healthy|warning/),
            message: expect.any(String),
            usage: expect.any(Object),
          },
          disk: {
            status: expect.stringMatching(/healthy|warning/),
            message: expect.any(String),
            usage: expect.any(Object),
          },
        },
      });
    });

    it('should handle database connection failure', async () => {
      const { getRepository } = require('typeorm');
      getRepository.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/api/health/detailed')
        .expect(503);

      expect(response.body.checks.database.status).toBe('unhealthy');
      expect(response.body.checks.database.message).toContain('Database connection failed');
    });
  });

  describe('GET /api/health/stats', () => {
    it('should return system statistics', async () => {
      const mockRepository = {
        count: jest.fn().mockResolvedValue(10),
      };

      const { getRepository } = require('typeorm');
      getRepository.mockReturnValue(mockRepository);

      const response = await request(app)
        .get('/api/health/stats')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        timestamp: expect.any(String),
        statistics: {
          users: {
            total: 10,
          },
          requests: {
            total: 10,
            pending: 10,
            completed: 10,
            failed: 10,
          },
          tickets: {
            total: 10,
          },
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      const { getRepository } = require('typeorm');
      getRepository.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .get('/api/health/stats')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Failed to retrieve system statistics',
        },
      });
    });
  });

  describe('GET /api/health/ready', () => {
    it('should return ready status when all checks pass', async () => {
      const mockRepository = {
        query: jest.fn().mockResolvedValue([{ '1': 1 }]),
      };

      const { getRepository } = require('typeorm');
      getRepository.mockReturnValue(mockRepository);

      const response = await request(app)
        .get('/api/health/ready')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Service is ready',
        timestamp: expect.any(String),
      });
    });

    it('should return not ready status when database is down', async () => {
      const { getRepository } = require('typeorm');
      getRepository.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const response = await request(app)
        .get('/api/health/ready')
        .expect(503);

      expect(response.body).toEqual({
        success: false,
        message: 'Service is not ready',
        error: 'Database connection failed',
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /api/health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/api/health/live')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Service is alive',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });
  });
});
