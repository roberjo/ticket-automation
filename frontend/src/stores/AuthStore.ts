import { makeAutoObservable } from 'mobx';
import { User, DemoUser } from '../types';

export class AuthStore {
  currentUser: User | null = null;
  isAuthenticated = false;
  isDemoMode = true;
  impersonatedUser: User | null = null;

  // Demo users for testing different roles
  demoUsers: DemoUser[] = [
    {
      user: {
        id: '1',
        email: 'john.manager@company.com',
        name: 'John Smith',
        role: 'manager',
        department: 'Infrastructure',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        lastLogin: new Date()
      },
      scenarios: [
        {
          id: 's1',
          title: 'Infrastructure Setup Request',
          description: 'New employee onboarding infrastructure setup',
          taskType: 'infrastructure',
          expectedTickets: 3,
          department: 'Infrastructure'
        }
      ]
    },
    {
      user: {
        id: '2',
        email: 'sarah.admin@company.com',
        name: 'Sarah Johnson',
        role: 'admin',
        department: 'IT Administration',
        isActive: true,
        createdAt: new Date('2024-01-10'),
        lastLogin: new Date()
      },
      scenarios: [
        {
          id: 's2',
          title: 'System Administration Task',
          description: 'User access management and system configuration',
          taskType: 'administration',
          expectedTickets: 2,
          department: 'IT Administration'
        }
      ]
    },
    {
      user: {
        id: '3',
        email: 'mike.user@company.com',
        name: 'Mike Davis',
        role: 'user',
        department: 'Development',
        isActive: true,
        createdAt: new Date('2024-02-01'),
        lastLogin: new Date()
      },
      scenarios: [
        {
          id: 's3',
          title: 'Application Request',
          description: 'New development environment setup',
          taskType: 'application',
          expectedTickets: 2,
          department: 'Development'
        }
      ]
    },
    {
      user: {
        id: '4',
        email: 'lisa.servicenow@company.com',
        name: 'Lisa Wilson',
        role: 'servicenow_admin',
        department: 'IT Operations',
        isActive: true,
        createdAt: new Date('2024-01-05'),
        lastLogin: new Date()
      },
      scenarios: [
        {
          id: 's4',
          title: 'Ticket Management',
          description: 'ServiceNow template and workflow management',
          taskType: 'ticket_management',
          expectedTickets: 1,
          department: 'IT Operations'
        }
      ]
    }
  ];

  constructor() {
    makeAutoObservable(this);
    // Initialize with admin user after MobX setup
    setTimeout(() => {
      this.login(this.demoUsers[1].user); // Start with admin user
    }, 0);
  }

  login(user: User) {
    this.currentUser = user;
    this.isAuthenticated = true;
    this.impersonatedUser = null;
  }

  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.impersonatedUser = null;
    this.isDemoMode = true;
  }

  impersonateUser(user: User) {
    // Add safety check
    if (this.currentUser?.role === 'admin') {
      this.impersonatedUser = user;
    } else {
      console.warn('Only admin users can impersonate other users');
    }
  }

  stopImpersonation() {
    this.impersonatedUser = null;
  }

  toggleDemoMode() {
    this.isDemoMode = !this.isDemoMode;
  }

  get activeUser(): User | null {
    return this.impersonatedUser || this.currentUser;
  }

  get canImpersonate(): boolean {
    return Boolean(this.currentUser?.role === 'admin' && !this.impersonatedUser);
  }

  get isImpersonating(): boolean {
    return this.impersonatedUser !== null;
  }
}

export const authStore = new AuthStore();