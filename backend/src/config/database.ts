/**
 * Database Configuration for ServiceNow Ticket Automation
 * 
 * This module configures the TypeORM DataSource for PostgreSQL database connection.
 * It handles all database-related configuration including connection parameters,
 * entity registration, and environment-specific settings.
 * 
 * Key Features:
 * - Environment-based configuration (development vs production)
 * - Connection pooling for performance
 * - SSL support for production deployments
 * - Automatic schema synchronization in development
 * - Migration and subscriber support
 * 
 * Security Considerations:
 * - Database credentials loaded from environment variables
 * - SSL encryption enabled in production
 * - Connection timeouts to prevent hanging connections
 * - Connection pool limits to prevent resource exhaustion
 * 
 * @author ServiceNow Ticket Automation Team
 */

import { DataSource } from 'typeorm';

// Import all entity models that need to be registered with TypeORM
import { User } from '../models/User.js';
import { TicketRequest } from '../models/TicketRequest.js';
import { ServiceNowTicket } from '../models/ServiceNowTicket.js';

/**
 * TypeORM DataSource Configuration
 * 
 * This configuration object defines all database connection parameters
 * and TypeORM behavior settings. The configuration adapts based on
 * the NODE_ENV environment variable.
 * 
 * Environment Variables Required:
 * - DB_HOST: Database server hostname
 * - DB_PORT: Database server port (default: 5432)
 * - DB_USERNAME: Database username
 * - DB_PASSWORD: Database password
 * - DB_NAME: Database name
 * - NODE_ENV: Environment (development/production)
 */
export const config = new DataSource({
  // Database type - PostgreSQL for robust ACID compliance
  type: 'postgres',
  
  // Connection parameters from environment variables with fallbacks
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ticket_automation',
  
  /**
   * DEVELOPMENT vs PRODUCTION SETTINGS
   */
  
  // Synchronize: Automatically create/update database schema
  // WARNING: Only enabled in development to prevent accidental data loss
  synchronize: process.env.NODE_ENV === 'development',
  
  // Logging: Enable SQL query logging in development for debugging
  logging: process.env.NODE_ENV === 'development',
  
  /**
   * ENTITY REGISTRATION
   * All TypeORM entities must be registered here to be recognized by the ORM
   */
  entities: [User, TicketRequest, ServiceNowTicket],
  
  /**
   * MIGRATION AND SUBSCRIBER PATHS
   * Define where TypeORM should look for migrations and event subscribers
   */
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  
  /**
   * SSL CONFIGURATION
   * Enable SSL in production for secure database connections
   * rejectUnauthorized: false allows self-signed certificates (common in cloud providers)
   */
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  /**
   * CONNECTION POOL CONFIGURATION
   * Optimizes database performance and prevents resource exhaustion
   */
  extra: {
    // Maximum number of connections in the pool
    max: 20,
    
    // Time to wait for a connection before timing out (5 seconds)
    connectionTimeoutMillis: 5000,
    
    // Time a connection can remain idle before being closed (30 seconds)
    idleTimeoutMillis: 30000,
  }
});

/**
 * Database Connection Helper Function
 * 
 * Provides a convenient way to get an initialized database connection.
 * This function ensures the DataSource is properly initialized before
 * returning it, preventing connection errors.
 * 
 * Usage Pattern:
 * ```typescript
 * const connection = await getConnection();
 * const userRepository = connection.getRepository(User);
 * ```
 * 
 * Error Handling:
 * - If initialization fails, the error will propagate to the caller
 * - Callers should wrap this in try/catch blocks
 * 
 * @returns Promise<DataSource> - Initialized TypeORM DataSource
 * @throws Error if database connection cannot be established
 */
export const getConnection = async (): Promise<DataSource> => {
  // Check if DataSource is already initialized to avoid duplicate initialization
  if (!config.isInitialized) {
    // Initialize the connection (connects to database, runs migrations if needed)
    await config.initialize();
  }
  return config;
};
