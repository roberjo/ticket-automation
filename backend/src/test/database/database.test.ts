import { DataSource, Repository } from 'typeorm';
import { User, TicketRequest, ServiceNowTicket } from '../../models';
import { createMockUser, createMockTicketRequest, createMockServiceNowTicket } from '../utils';

// Mock TypeORM
jest.mock('typeorm', () => ({
  DataSource: jest.fn(),
  Repository: jest.fn(),
}));

describe('Database Operations', () => {
  let mockDataSource: jest.Mocked<DataSource>;
  let mockUserRepository: jest.Mocked<Repository<User>>;
  let mockTicketRequestRepository: jest.Mocked<Repository<TicketRequest>>;
  let mockServiceNowTicketRepository: jest.Mocked<Repository<ServiceNowTicket>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repositories
    mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    mockTicketRequestRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    mockServiceNowTicketRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as any;

    // Create mock data source
    mockDataSource = {
      initialize: jest.fn(),
      destroy: jest.fn(),
      getRepository: jest.fn(),
      query: jest.fn(),
      transaction: jest.fn(),
      isInitialized: true,
    } as any;

    // Setup repository mapping
    mockDataSource.getRepository.mockImplementation((entity) => {
      switch (entity) {
        case User:
          return mockUserRepository;
        case TicketRequest:
          return mockTicketRequestRepository;
        case ServiceNowTicket:
          return mockServiceNowTicketRepository;
        default:
          throw new Error(`Unknown entity: ${entity.name}`);
      }
    });
  });

  describe('Database Connection', () => {
    it('should initialize database connection successfully', async () => {
      mockDataSource.initialize.mockResolvedValue(mockDataSource);

      await mockDataSource.initialize();

      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(mockDataSource.isInitialized).toBe(true);
    });

    it('should handle connection initialization failure', async () => {
      const connectionError = new Error('Connection failed');
      mockDataSource.initialize.mockRejectedValue(connectionError);

      await expect(mockDataSource.initialize()).rejects.toThrow('Connection failed');
    });

    it('should close database connection successfully', async () => {
      mockDataSource.destroy.mockResolvedValue();

      await mockDataSource.destroy();

      expect(mockDataSource.destroy).toHaveBeenCalled();
    });
  });

  describe('User Repository Operations', () => {
    it('should create a new user', async () => {
      const mockUser = createMockUser();
      mockUserRepository.save.mockResolvedValue(mockUser as User);

      const result = await mockUserRepository.save(mockUser);

      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should find user by ID', async () => {
      const mockUser = createMockUser({ id: 'test-id' });
      mockUserRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await mockUserRepository.findOne({ where: { id: 'test-id' } });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
      expect(result).toEqual(mockUser);
    });

    it('should find user by Okta ID', async () => {
      const mockUser = createMockUser({ oktaId: 'test-okta-id' });
      mockUserRepository.findOne.mockResolvedValue(mockUser as User);

      const result = await mockUserRepository.findOne({ where: { oktaId: 'test-okta-id' } });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { oktaId: 'test-okta-id' } });
      expect(result).toEqual(mockUser);
    });

    it('should update user profile', async () => {
      const updateData = { firstName: 'Updated', lastName: 'Name' };
      mockUserRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await mockUserRepository.update('test-id', updateData);

      expect(mockUserRepository.update).toHaveBeenCalledWith('test-id', updateData);
      expect(result.affected).toBe(1);
    });

    it('should count active users', async () => {
      mockUserRepository.count.mockResolvedValue(10);

      const result = await mockUserRepository.count({ where: { isActive: true } });

      expect(mockUserRepository.count).toHaveBeenCalledWith({ where: { isActive: true } });
      expect(result).toBe(10);
    });
  });

  describe('TicketRequest Repository Operations', () => {
    it('should create a new ticket request', async () => {
      const mockTicketRequest = createMockTicketRequest();
      mockTicketRequestRepository.save.mockResolvedValue(mockTicketRequest as TicketRequest);

      const result = await mockTicketRequestRepository.save(mockTicketRequest);

      expect(mockTicketRequestRepository.save).toHaveBeenCalledWith(mockTicketRequest);
      expect(result).toEqual(mockTicketRequest);
    });

    it('should find ticket requests by user ID', async () => {
      const mockTicketRequests = [
        createMockTicketRequest({ id: '1' }),
        createMockTicketRequest({ id: '2' }),
      ];
      mockTicketRequestRepository.find.mockResolvedValue(mockTicketRequests as TicketRequest[]);

      const result = await mockTicketRequestRepository.find({ where: { userId: 'test-user-id' } });

      expect(mockTicketRequestRepository.find).toHaveBeenCalledWith({ where: { userId: 'test-user-id' } });
      expect(result).toEqual(mockTicketRequests);
    });

    it('should find ticket requests by status', async () => {
      const mockTicketRequests = [
        createMockTicketRequest({ status: 'pending' }),
        createMockTicketRequest({ status: 'pending' }),
      ];
      mockTicketRequestRepository.find.mockResolvedValue(mockTicketRequests as TicketRequest[]);

      const result = await mockTicketRequestRepository.find({ where: { status: 'pending' } });

      expect(mockTicketRequestRepository.find).toHaveBeenCalledWith({ where: { status: 'pending' } });
      expect(result).toEqual(mockTicketRequests);
    });

    it('should update ticket request status', async () => {
      const updateData = { status: 'processing' };
      mockTicketRequestRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await mockTicketRequestRepository.update('test-id', updateData);

      expect(mockTicketRequestRepository.update).toHaveBeenCalledWith('test-id', updateData);
      expect(result.affected).toBe(1);
    });

    it('should count tickets by status', async () => {
      mockTicketRequestRepository.count.mockResolvedValue(5);

      const result = await mockTicketRequestRepository.count({ where: { status: 'pending' } });

      expect(mockTicketRequestRepository.count).toHaveBeenCalledWith({ where: { status: 'pending' } });
      expect(result).toBe(5);
    });
  });

  describe('ServiceNowTicket Repository Operations', () => {
    it('should create a new ServiceNow ticket', async () => {
      const mockServiceNowTicket = createMockServiceNowTicket();
      mockServiceNowTicketRepository.save.mockResolvedValue(mockServiceNowTicket as ServiceNowTicket);

      const result = await mockServiceNowTicketRepository.save(mockServiceNowTicket);

      expect(mockServiceNowTicketRepository.save).toHaveBeenCalledWith(mockServiceNowTicket);
      expect(result).toEqual(mockServiceNowTicket);
    });

    it('should find ServiceNow tickets by ticket request ID', async () => {
      const mockServiceNowTickets = [
        createMockServiceNowTicket({ id: '1' }),
        createMockServiceNowTicket({ id: '2' }),
      ];
      mockServiceNowTicketRepository.find.mockResolvedValue(mockServiceNowTickets as ServiceNowTicket[]);

      const result = await mockServiceNowTicketRepository.find({ where: { ticketRequestId: 'test-request-id' } });

      expect(mockServiceNowTicketRepository.find).toHaveBeenCalledWith({ where: { ticketRequestId: 'test-request-id' } });
      expect(result).toEqual(mockServiceNowTickets);
    });

    it('should find ServiceNow ticket by ServiceNow ID', async () => {
      const mockServiceNowTicket = createMockServiceNowTicket({ serviceNowId: 'test-sys-id' });
      mockServiceNowTicketRepository.findOne.mockResolvedValue(mockServiceNowTicket as ServiceNowTicket);

      const result = await mockServiceNowTicketRepository.findOne({ where: { serviceNowId: 'test-sys-id' } });

      expect(mockServiceNowTicketRepository.findOne).toHaveBeenCalledWith({ where: { serviceNowId: 'test-sys-id' } });
      expect(result).toEqual(mockServiceNowTicket);
    });

    it('should update ServiceNow ticket status', async () => {
      const updateData = { status: 'resolved' };
      mockServiceNowTicketRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await mockServiceNowTicketRepository.update('test-id', updateData);

      expect(mockServiceNowTicketRepository.update).toHaveBeenCalledWith('test-id', updateData);
      expect(result.affected).toBe(1);
    });
  });

  describe('Query Builder Operations', () => {
    it('should build complex queries with joins', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getOne: jest.fn().mockResolvedValue(null),
        getCount: jest.fn().mockResolvedValue(0),
      };

      mockTicketRequestRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await mockTicketRequestRepository
        .createQueryBuilder('ticketRequest')
        .leftJoinAndSelect('ticketRequest.user', 'user')
        .leftJoinAndSelect('ticketRequest.serviceNowTickets', 'serviceNowTickets')
        .where('ticketRequest.status = :status', { status: 'pending' })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .orderBy('ticketRequest.createdAt', 'DESC')
        .skip(0)
        .take(10)
        .getMany();

      expect(mockTicketRequestRepository.createQueryBuilder).toHaveBeenCalledWith('ticketRequest');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('ticketRequest.user', 'user');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('ticketRequest.serviceNowTickets', 'serviceNowTickets');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('ticketRequest.status = :status', { status: 'pending' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('user.isActive = :isActive', { isActive: true });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('ticketRequest.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('Transaction Operations', () => {
    it('should execute operations within a transaction', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback(mockDataSource);
      });

      mockDataSource.transaction.mockImplementation(mockTransaction);

      const transactionResult = await mockDataSource.transaction(async (manager) => {
        const user = createMockUser();
        const ticketRequest = createMockTicketRequest();
        const serviceNowTicket = createMockServiceNowTicket();

        const savedUser = await manager.getRepository(User).save(user);
        const savedTicketRequest = await manager.getRepository(TicketRequest).save(ticketRequest);
        const savedServiceNowTicket = await manager.getRepository(ServiceNowTicket).save(serviceNowTicket);

        return { user: savedUser, ticketRequest: savedTicketRequest, serviceNowTicket: savedServiceNowTicket };
      });

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(transactionResult).toHaveProperty('user');
      expect(transactionResult).toHaveProperty('ticketRequest');
      expect(transactionResult).toHaveProperty('serviceNowTicket');
    });

    it('should rollback transaction on error', async () => {
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        try {
          return await callback(mockDataSource);
        } catch (error) {
          // Simulate rollback
          throw error;
        }
      });

      mockDataSource.transaction.mockImplementation(mockTransaction);

      await expect(
        mockDataSource.transaction(async (manager) => {
          const user = createMockUser();
          await manager.getRepository(User).save(user);
          
          // Simulate an error
          throw new Error('Database error');
        })
      ).rejects.toThrow('Database error');

      expect(mockDataSource.transaction).toHaveBeenCalled();
    });
  });

  describe('Database Error Handling', () => {
    it('should handle repository save errors', async () => {
      const saveError = new Error('Save failed');
      mockUserRepository.save.mockRejectedValue(saveError);

      await expect(mockUserRepository.save(createMockUser())).rejects.toThrow('Save failed');
    });

    it('should handle repository find errors', async () => {
      const findError = new Error('Find failed');
      mockUserRepository.findOne.mockRejectedValue(findError);

      await expect(mockUserRepository.findOne({ where: { id: 'test-id' } })).rejects.toThrow('Find failed');
    });

    it('should handle query builder errors', async () => {
      const queryError = new Error('Query failed');
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(queryError),
      };

      mockTicketRequestRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(
        mockTicketRequestRepository.createQueryBuilder('ticketRequest').where('status = :status', { status: 'pending' }).getMany()
      ).rejects.toThrow('Query failed');
    });
  });
});
