// Mock models for testing - no TypeORM decorators
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

export enum RequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export enum ServiceNowTicketStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export class MockUser {
  id: string;
  oktaId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  profileData?: Record<string, any>;
  ticketRequests?: MockTicketRequest[];

  constructor(data: Partial<MockUser> = {}) {
    Object.assign(this, data);
  }

  // Helper methods
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isManager(): boolean {
    return this.role === UserRole.MANAGER || this.role === UserRole.ADMIN;
  }
}

export enum RequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export class MockTicketRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: RequestStatus;
  priority: string;
  businessTaskType: string;
  requestData: any;
  createdAt: Date;
  updatedAt: Date;
  user?: MockUser;
  serviceNowTickets?: MockServiceNowTicket[];

  constructor(data: Partial<MockTicketRequest> = {}) {
    Object.assign(this, data);
  }
}

export enum ServiceNowTicketStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export class MockServiceNowTicket {
  id: string;
  ticketRequestId: string;
  serviceNowId: string;
  serviceNowNumber: string;
  title: string;
  description: string;
  status: ServiceNowTicketStatus;
  priority: string;
  category: string;
  subcategory: string;
  assignmentGroup: string;
  assignedTo: string;
  ticketData: any;
  createdAt: Date;
  updatedAt: Date;
  lastSync?: Date;
  syncStatus?: string;
  syncError?: string;
  updatedInServiceNow?: Date;
  closedInServiceNow?: Date;
  ticketRequest?: MockTicketRequest;

  constructor(data: Partial<MockServiceNowTicket> = {}) {
    Object.assign(this, data);
  }
}

// Mock repository functions
export const createMockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
    getCount: jest.fn(),
  })),
});

// Export the same names as the original models for compatibility
export const User = MockUser;
export const TicketRequest = MockTicketRequest;
export const ServiceNowTicket = MockServiceNowTicket;
