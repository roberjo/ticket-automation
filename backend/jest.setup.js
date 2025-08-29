// TypeORM is now mocked via moduleNameMapper, so we don't need to mock it here

// Mock other dependencies
jest.mock('./src/config/database', () => ({
  getConnection: jest.fn(),
  config: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'test_user',
    password: 'test_password',
    database: 'ticket_automation_test',
    entities: [],
    synchronize: true,
    logging: false,
  },
}));

jest.mock('./src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock axios for ServiceNow service
jest.mock('axios', () => ({
  create: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock reflect-metadata
jest.mock('reflect-metadata', () => ({
  __esModule: true,
  default: {},
  Reflect: {
    defineMetadata: jest.fn(),
    getMetadata: jest.fn(),
    getOwnMetadata: jest.fn(),
    hasMetadata: jest.fn(),
    hasOwnMetadata: jest.fn(),
    metadata: jest.fn(),
  },
}));
