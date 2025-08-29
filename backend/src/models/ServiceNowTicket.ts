import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { TicketRequest } from './TicketRequest.js';

export enum ServiceNowTicketStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export enum ServiceNowTicketPriority {
  CRITICAL = '1',
  HIGH = '2',
  MEDIUM = '3',
  LOW = '4',
  PLANNING = '5'
}

@Entity('servicenow_tickets')
@Index(['ticketRequestId'])
@Index(['serviceNowId'], { unique: true })
@Index(['status', 'updatedAt'])
export class ServiceNowTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ticket_request_id', type: 'uuid' })
  ticketRequestId: string;

  @Column({ name: 'servicenow_id', type: 'varchar', unique: true })
  serviceNowId: string;

  @Column({ name: 'servicenow_number', type: 'varchar', length: 50 })
  serviceNowNumber: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ServiceNowTicketStatus, 
    default: ServiceNowTicketStatus.NEW 
  })
  status: ServiceNowTicketStatus;

  @Column({ 
    type: 'enum', 
    enum: ServiceNowTicketPriority, 
    default: ServiceNowTicketPriority.MEDIUM 
  })
  priority: ServiceNowTicketPriority;

  @Column({ 
    name: 'category', 
    type: 'varchar',
    length: 100, 
    nullable: true 
  })
  category: string;

  @Column({ 
    name: 'subcategory', 
    type: 'varchar',
    length: 100, 
    nullable: true 
  })
  subcategory: string;

  @Column({ 
    name: 'assignment_group', 
    type: 'varchar',
    length: 100, 
    nullable: true 
  })
  assignmentGroup: string;

  @Column({ 
    name: 'assigned_to', 
    type: 'varchar',
    length: 100, 
    nullable: true 
  })
  assignedTo: string;

  @Column({ 
    name: 'ticket_data', 
    type: 'jsonb' 
  })
  ticketData: Record<string, any>;

  @Column({ 
    name: 'last_sync', 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  lastSync: Date;

  @Column({ 
    name: 'sync_status', 
    type: 'varchar',
    length: 50, 
    default: 'success' 
  })
  syncStatus: string;

  @Column({ 
    name: 'sync_error', 
    type: 'text', 
    nullable: true 
  })
  syncError: string;

  @Column({ 
    name: 'created_in_servicenow', 
    type: 'timestamp', 
    nullable: true 
  })
  createdInServiceNow: Date;

  @Column({ 
    name: 'updated_in_servicenow', 
    type: 'timestamp', 
    nullable: true 
  })
  updatedInServiceNow: Date;

  @Column({ 
    name: 'closed_in_servicenow', 
    type: 'timestamp', 
    nullable: true 
  })
  closedInServiceNow: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => TicketRequest, ticketRequest => ticketRequest.serviceNowTickets)
  @JoinColumn({ name: 'ticket_request_id' })
  ticketRequest: TicketRequest;

  // Helper methods
  isOpen(): boolean {
    return [
      ServiceNowTicketStatus.NEW,
      ServiceNowTicketStatus.IN_PROGRESS,
      ServiceNowTicketStatus.ON_HOLD
    ].includes(this.status);
  }

  isClosed(): boolean {
    return [
      ServiceNowTicketStatus.RESOLVED,
      ServiceNowTicketStatus.CLOSED,
      ServiceNowTicketStatus.CANCELLED
    ].includes(this.status);
  }

  isResolved(): boolean {
    return this.status === ServiceNowTicketStatus.RESOLVED;
  }

  needsSync(): boolean {
    const syncThreshold = new Date();
    syncThreshold.setMinutes(syncThreshold.getMinutes() - 5); // Sync if older than 5 minutes
    return this.lastSync < syncThreshold;
  }

  getUrl(): string {
    const baseUrl = process.env.SERVICENOW_BASE_URL || 'https://your-instance.service-now.com';
    return `${baseUrl}/nav_to.do?uri=sc_req_item.do?sys_id=${this.serviceNowId}`;
  }
}
