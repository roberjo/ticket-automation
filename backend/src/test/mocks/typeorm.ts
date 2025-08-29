// Comprehensive TypeORM mock for testing
// This file replaces the entire TypeORM module during testing

// Create mock decorators that do nothing
const createMockDecorator = (decoratorName: string) => {
  return (...args: any[]) => {
    return (target: any, propertyKey?: string | symbol) => {
      // Store metadata for testing purposes if needed
      if (!target.__mockMetadata) {
        target.__mockMetadata = {};
      }
      target.__mockMetadata[decoratorName] = args;
      return target;
    };
  };
};

// Mock all TypeORM decorators
export const PrimaryGeneratedColumn = createMockDecorator('PrimaryGeneratedColumn');
export const Column = createMockDecorator('Column');
export const Entity = createMockDecorator('Entity');
export const CreateDateColumn = createMockDecorator('CreateDateColumn');
export const UpdateDateColumn = createMockDecorator('UpdateDateColumn');
export const ManyToOne = createMockDecorator('ManyToOne');
export const OneToMany = createMockDecorator('OneToMany');
export const JoinColumn = createMockDecorator('JoinColumn');
export const Index = createMockDecorator('Index');

// Mock repository functions
export const getRepository = jest.fn();
export const getConnection = jest.fn();

// Mock DataSource
export const DataSource = jest.fn().mockImplementation(() => ({
  initialize: jest.fn().mockResolvedValue(true),
  getRepository: jest.fn(),
  createQueryBuilder: jest.fn(),
  transaction: jest.fn(),
  close: jest.fn(),
}));

// Mock other TypeORM functions and classes
export const Repository = jest.fn();
export const BaseEntity = class {};
export const SelectQueryBuilder = jest.fn();

// Export common enums and types (these don't have decorators)
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

// Default export for compatibility
export default {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  getRepository,
  getConnection,
  DataSource,
  Repository,
  BaseEntity,
  SelectQueryBuilder,
};
