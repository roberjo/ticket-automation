/**
 * User Entity Model for ServiceNow Ticket Automation
 * 
 * This TypeORM entity represents users in the system who can create and manage
 * ticket requests. Users are authenticated through Okta and have role-based
 * permissions for different system operations.
 * 
 * Key Features:
 * - Okta integration for authentication
 * - Role-based access control (User, Manager, Admin)
 * - Profile data storage for additional user information
 * - Activity tracking (last login, created/updated timestamps)
 * - Relationship management with ticket requests
 * 
 * Database Design:
 * - UUID primary key for security and scalability
 * - Unique indexes on oktaId and email for fast lookups
 * - JSONB profile data for flexible user information storage
 * - Soft deletion support through isActive flag
 * 
 * Security Considerations:
 * - oktaId links to external identity provider
 * - Email uniqueness prevents duplicate accounts
 * - Role-based permissions control system access
 * - Profile data allows for audit trails and personalization
 * 
 * @author ServiceNow Ticket Automation Team
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { TicketRequest } from './TicketRequest.js';

/**
 * User Role Enumeration
 * 
 * Defines the hierarchical role system for user permissions:
 * 
 * - USER: Standard user who can create and view their own tickets
 * - MANAGER: Can view and manage tickets for their team/department
 * - ADMIN: Full system access, can manage all users and tickets
 * 
 * Role Hierarchy (higher roles inherit lower role permissions):
 * ADMIN > MANAGER > USER
 */
export enum UserRole {
  USER = 'user',        // Standard user permissions
  ADMIN = 'admin',      // Full administrative access
  MANAGER = 'manager'   // Team/department management permissions
}

/**
 * User Entity Class
 * 
 * Maps to the 'users' table in PostgreSQL database.
 * Includes unique indexes for performance and data integrity.
 */
@Entity('users')
@Index(['oktaId'], { unique: true })  // Fast lookup by Okta ID
@Index(['email'], { unique: true })   // Fast lookup by email, prevent duplicates
export class User {
  /**
   * PRIMARY KEY
   * UUID primary key provides:
   * - Security: Non-guessable IDs
   * - Scalability: No collision risk in distributed systems
   * - Privacy: No sequential enumeration possible
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * OKTA INTEGRATION
   * Links user to Okta identity provider
   * - Unique constraint prevents duplicate Okta accounts
   * - Used for JWT token validation
   * - Enables single sign-on (SSO) functionality
   */
  @Column({ name: 'okta_id', type: 'varchar', unique: true })
  oktaId: string;

  /**
   * USER IDENTIFICATION
   * Email address for user identification and communication
   * - Unique constraint prevents duplicate accounts
   * - Used for notifications and password resets
   * - Must be valid email format (enforced at application level)
   */
  @Column({ type: 'varchar', length: 255 })
  email: string;

  /**
   * PERSONAL INFORMATION
   * User's first name for personalization and identification
   * - Limited to 100 characters for database efficiency
   * - Used in UI displays and notifications
   */
  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  /**
   * PERSONAL INFORMATION
   * User's last name for personalization and identification
   * - Limited to 100 characters for database efficiency
   * - Combined with firstName for full name display
   */
  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  /**
   * ROLE-BASED ACCESS CONTROL
   * Determines user permissions throughout the system
   * - Enum constraint ensures valid roles only
   * - Default to USER role for security (principle of least privilege)
   * - Used by authorization middleware to control access
   */
  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.USER 
  })
  role: UserRole;

  /**
   * ACCOUNT STATUS
   * Soft deletion flag for account management
   * - Default to true (active) for new accounts
   * - Set to false to disable account without data loss
   * - Allows for account restoration if needed
   */
  @Column({ 
    name: 'is_active', 
    type: 'boolean',
    default: true 
  })
  isActive: boolean;

  /**
   * ACTIVITY TRACKING
   * Tracks user's last login for security and analytics
   * - Nullable for users who haven't logged in yet
   * - Updated by authentication middleware
   * - Used for inactive account cleanup policies
   */
  @Column({ 
    name: 'last_login', 
    type: 'timestamp', 
    nullable: true 
  })
  lastLogin: Date;

  /**
   * FLEXIBLE PROFILE DATA
   * JSONB storage for additional user information
   * - Flexible schema for future user attributes
   * - Can store preferences, settings, metadata
   * - JSONB allows efficient querying of nested data
   * - Nullable for users with minimal profile data
   */
  @Column({ 
    name: 'profile_data', 
    type: 'jsonb', 
    nullable: true 
  })
  profileData: Record<string, any>;

  /**
   * AUDIT TIMESTAMPS
   * Automatically managed creation timestamp
   * - Set once when user is created
   * - Immutable after creation
   * - Used for audit trails and analytics
   */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  /**
   * AUDIT TIMESTAMPS
   * Automatically managed update timestamp
   * - Updated whenever user record changes
   * - Used for audit trails and cache invalidation
   * - Helps track user profile modifications
   */
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  /**
   * RELATIONSHIPS
   * One-to-Many relationship with TicketRequest
   * - One user can have many ticket requests
   * - Lazy loading by default for performance
   * - Cascade operations can be configured as needed
   */
  @OneToMany(() => TicketRequest, ticketRequest => ticketRequest.user)
  ticketRequests: TicketRequest[];

  /**
   * COMPUTED PROPERTIES
   * Virtual property for user's full name
   * - Combines firstName and lastName
   * - Used in UI displays and notifications
   * - Not stored in database, computed on access
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * PERMISSION HELPER METHODS
   * These methods encapsulate role-checking logic for cleaner code
   */

  /**
   * Check if user has administrative privileges
   * - Returns true only for ADMIN role
   * - Used to control access to admin-only features
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Check if user has manager-level privileges
   * - Returns true for MANAGER and ADMIN roles
   * - Implements role hierarchy (ADMIN inherits MANAGER permissions)
   * - Used to control access to management features
   */
  isManager(): boolean {
    return this.role === UserRole.MANAGER || this.role === UserRole.ADMIN;
  }
}
