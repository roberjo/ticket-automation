export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    }],
  },
  moduleNameMapper: {
    // Map TypeORM to our mock FIRST
    '^typeorm$': '<rootDir>/src/test/mocks/typeorm.ts',
    // Map all model imports to mock models (comprehensive patterns)
    '^../../models$': '<rootDir>/src/test/mocks/models.ts',
    '^../models$': '<rootDir>/src/test/mocks/models.ts',
    '^../../models\\.js$': '<rootDir>/src/test/mocks/models.ts',
    '^../models\\.js$': '<rootDir>/src/test/mocks/models.ts',
    '^../../models/(.*)$': '<rootDir>/src/test/mocks/models.ts',
    '^../models/(.*)$': '<rootDir>/src/test/mocks/models.ts',
    '^../../models/(.*)\\.js$': '<rootDir>/src/test/mocks/models.ts',
    '^../models/(.*)\\.js$': '<rootDir>/src/test/mocks/models.ts',
    // Transform .js imports (this should come LAST)
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFiles: ['<rootDir>/jest.pre-setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/src/test/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(typeorm|reflect-metadata)/)'
  ],
  moduleDirectories: ['node_modules', 'src'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
};
