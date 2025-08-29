/**
 * Winston Logger Configuration for ServiceNow Ticket Automation
 * 
 * This module configures a comprehensive logging system using Winston.
 * It provides structured logging with multiple output formats and destinations
 * to support both development debugging and production monitoring.
 * 
 * Key Features:
 * - Environment-based log levels and formats
 * - File-based logging with rotation for production
 * - Console logging with colors for development
 * - Structured JSON logging for log aggregation systems
 * - Error stack trace capture
 * - Automatic log directory creation
 * 
 * Log Levels (in order of priority):
 * - error: Error conditions that need immediate attention
 * - warn: Warning conditions that should be monitored
 * - info: General application flow and important events
 * - debug: Detailed information for debugging
 * 
 * Usage Examples:
 * ```typescript
 * import { logger } from './utils/logger.js';
 * 
 * logger.info('User logged in', { userId: '123', email: 'user@example.com' });
 * logger.error('Database connection failed', { error: error.message });
 * logger.debug('Processing ticket request', { ticketId: 'abc123' });
 * ```
 * 
 * @author ServiceNow Ticket Automation Team
 */

import winston from 'winston';

/**
 * ENVIRONMENT CONFIGURATION
 * Adapt logging behavior based on environment variables
 */

// Log level from environment variable (error, warn, info, debug)
// Default to 'info' for production safety
const logLevel = process.env.LOG_LEVEL || 'info';

// Determine if we're in development mode for console logging
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * LOG FORMAT DEFINITIONS
 * Different formats for different output destinations
 */

/**
 * Production Log Format (JSON)
 * 
 * Structured JSON format suitable for:
 * - Log aggregation systems (ELK stack, Splunk, etc.)
 * - Machine parsing and analysis
 * - Production monitoring and alerting
 * 
 * Includes:
 * - ISO timestamp for precise timing
 * - Error stack traces for debugging
 * - JSON structure for easy parsing
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),  // Capture error stack traces
  winston.format.json()  // Output as JSON for structured logging
);

/**
 * Development Console Format (Human-readable)
 * 
 * Colorized, human-readable format for development:
 * - Color-coded log levels for quick visual scanning
 * - Readable timestamp format
 * - Pretty-printed metadata
 * - Stack traces on separate lines for clarity
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),  // Add colors for different log levels
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    // Build the log message with timestamp and level
    let log = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present (user IDs, request IDs, etc.)
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    // Add stack trace on new line if present (for errors)
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

/**
 * WINSTON LOGGER INSTANCE
 * 
 * Main logger instance configured with appropriate transports and formats.
 * This logger is exported and used throughout the application.
 * 
 * Configuration:
 * - Log level controlled by LOG_LEVEL environment variable
 * - Default metadata includes service name for log aggregation
 * - Multiple transports for different log destinations
 */
export const logger = winston.createLogger({
  // Set log level from environment (error, warn, info, debug)
  level: logLevel,
  
  // Use JSON format for file logging (production-ready)
  format: logFormat,
  
  // Default metadata added to all log entries
  // Useful for filtering logs in aggregation systems
  defaultMeta: { service: 'ticket-automation-backend' },
  
  /**
   * TRANSPORT CONFIGURATION
   * Define where logs should be written
   */
  transports: [
    /**
     * Error Log File Transport
     * 
     * Dedicated file for error-level logs only.
     * This allows quick access to critical issues without
     * searching through all log entries.
     * 
     * Features:
     * - Only error-level and above (error only in Winston)
     * - 5MB file size limit with rotation
     * - Keeps 5 historical files
     */
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB in bytes
      maxFiles: 5,      // Keep 5 rotated files
    }),
    
    /**
     * Combined Log File Transport
     * 
     * All log levels written to combined log file.
     * This provides complete application log history
     * for debugging and audit purposes.
     * 
     * Features:
     * - All log levels (error, warn, info, debug)
     * - 5MB file size limit with rotation
     * - Keeps 5 historical files
     */
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB in bytes
      maxFiles: 5,      // Keep 5 rotated files
    }),
  ],
});

/**
 * DEVELOPMENT CONSOLE TRANSPORT
 * 
 * Add colorized console output in development environment.
 * This provides immediate feedback during development
 * without needing to check log files.
 * 
 * Only enabled in development to avoid cluttering
 * production console output.
 */
if (isDevelopment) {
  logger.add(new winston.transports.Console({
    format: consoleFormat  // Use human-readable format with colors
  }));
}

/**
 * LOG DIRECTORY INITIALIZATION
 * 
 * Ensure the logs directory exists before Winston tries to write to it.
 * This prevents application startup failures due to missing directories.
 */

// Import file system utilities for directory creation
import { promises as fs } from 'fs';
import { dirname } from 'path';

/**
 * Ensure Logs Directory Exists
 * 
 * Creates the logs directory if it doesn't exist.
 * Uses recursive creation to handle nested directory structures.
 * 
 * Error Handling:
 * - Gracefully handles directory already exists
 * - Warns about permission errors but doesn't crash
 * - Allows application to continue (logs will fail silently)
 */
async function ensureLogsDirectory() {
  try {
    // Create logs directory recursively (creates parent dirs if needed)
    await fs.mkdir('logs', { recursive: true });
  } catch (error) {
    // Directory might already exist or we might lack permissions
    // Don't crash the application, just warn
    console.warn('Could not create logs directory:', error);
    console.warn('Logging to files may fail - check directory permissions');
  }
}

// Initialize logs directory on module load
// This runs when the module is first imported
ensureLogsDirectory();
