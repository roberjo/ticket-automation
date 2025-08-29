import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './User.js';
import { ServiceNowTicket } from './ServiceNowTicket.js';

export enum RequestStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@Entity('ticket_requests')
@Index(['userId', 'status'])
@Index(['status', 'createdAt'])
export class TicketRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: RequestStatus, 
    default: RequestStatus.PENDING 
  })
  status: RequestStatus;

  @Column({ 
    type: 'enum', 
    enum: RequestPriority, 
    default: RequestPriority.MEDIUM 
  })
  priority: RequestPriority;

  @Column({ 
    name: 'business_task_type', 
    type: 'varchar',
    length: 100 
  })
  businessTaskType: string;

  @Column({ 
    name: 'request_data', 
    type: 'jsonb' 
  })
  requestData: Record<string, any>;

  @Column({ 
    name: 'estimated_completion', 
    type: 'timestamp', 
    nullable: true 
  })
  estimatedCompletion: Date;

  @Column({ 
    name: 'actual_completion', 
    type: 'timestamp', 
    nullable: true 
  })
  actualCompletion: Date;

  @Column({ 
    name: 'failure_reason', 
    type: 'text', 
    nullable: true 
  })
  failureReason: string;

  @Column({ 
    name: 'retry_count', 
    type: 'int',
    default: 0 
  })
  retryCount: number;

  @Column({ 
    name: 'max_retries', 
    type: 'int',
    default: 3 
  })
  maxRetries: number;

  @Column({ 
    name: 'processing_started', 
    type: 'timestamp', 
    nullable: true 
  })
  processingStarted: Date;

  @Column({ 
    name: 'processing_completed', 
    type: 'timestamp', 
    nullable: true 
  })
  processingCompleted: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => User, user => user.ticketRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ServiceNowTicket, serviceNowTicket => serviceNowTicket.ticketRequest)
  serviceNowTickets: ServiceNowTicket[];

  // Helper methods
  isCompleted(): boolean {
    return this.status === RequestStatus.COMPLETED;
  }

  isFailed(): boolean {
    return this.status === RequestStatus.FAILED;
  }

  canRetry(): boolean {
    return this.isFailed() && this.retryCount < this.maxRetries;
  }

  getProcessingTime(): number | null {
    if (this.processingStarted && this.processingCompleted) {
      return this.processingCompleted.getTime() - this.processingStarted.getTime();
    }
    return null;
  }

  getTotalProcessingTime(): number | null {
    if (this.createdAt && this.actualCompletion) {
      return this.actualCompletion.getTime() - this.createdAt.getTime();
    }
    return null;
  }
}
