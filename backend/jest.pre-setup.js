// This file runs BEFORE any modules are imported
// It sets up global mocks that need to be available before module loading

// Mock TypeORM decorators globally before any imports
global.mockTypeORM = () => {
  const originalRequire = require;
  
  // Override require to intercept TypeORM imports
  require = function(id) {
    if (id === 'typeorm') {
      // Return mocked TypeORM module
      return {
        PrimaryGeneratedColumn: () => () => {},
        Column: () => () => {},
        Entity: () => () => {},
        CreateDateColumn: () => () => {},
        UpdateDateColumn: () => () => {},
        ManyToOne: () => () => {},
        OneToMany: () => () => {},
        JoinColumn: () => () => {},
        Index: () => () => {},
        getRepository: jest.fn(),
        getConnection: jest.fn(),
        DataSource: jest.fn().mockImplementation(() => ({
          initialize: jest.fn().mockResolvedValue(true),
          getRepository: jest.fn(),
          createQueryBuilder: jest.fn(),
          transaction: jest.fn(),
          close: jest.fn(),
        })),
      };
    }
    return originalRequire.apply(this, arguments);
  };
};

// Apply the mock immediately
global.mockTypeORM();
