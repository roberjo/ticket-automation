import { DataSource } from 'typeorm';
import { User } from '../models/User.js';
import { TicketRequest } from '../models/TicketRequest.js';
import { ServiceNowTicket } from '../models/ServiceNowTicket.js';

export const config = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ticket_automation',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, TicketRequest, ServiceNowTicket],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  extra: {
    max: 20,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  }
});

// Database connection helper
export const getConnection = async (): Promise<DataSource> => {
  if (!config.isInitialized) {
    await config.initialize();
  }
  return config;
};
