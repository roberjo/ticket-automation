import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { TicketRequest } from './TicketRequest.js';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

@Entity('users')
@Index(['oktaId'], { unique: true })
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'okta_id', type: 'varchar', unique: true })
  oktaId: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName: string;

  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.USER 
  })
  role: UserRole;

  @Column({ 
    name: 'is_active', 
    type: 'boolean',
    default: true 
  })
  isActive: boolean;

  @Column({ 
    name: 'last_login', 
    type: 'timestamp', 
    nullable: true 
  })
  lastLogin: Date;

  @Column({ 
    name: 'profile_data', 
    type: 'jsonb', 
    nullable: true 
  })
  profileData: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => TicketRequest, ticketRequest => ticketRequest.user)
  ticketRequests: TicketRequest[];

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
