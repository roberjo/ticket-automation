/**
 * Authentication Store
 * 
 * This MobX store manages authentication state, user information, and demo mode functionality.
 * It provides a centralized way to handle user authentication, role-based access control,
 * user impersonation for administrative purposes, and demo mode for development/testing.
 * 
 * Purpose:
 * - Manage user authentication state and user information
 * - Provide role-based access control functionality
 * - Enable user impersonation for administrative support
 * - Support demo mode for development and testing scenarios
 * - Centralize authentication logic across the application
 * 
 * State Management:
 * - currentUser: The currently logged-in user
 * - isAuthenticated: Authentication status flag
 * - isDemoMode: Demo mode toggle for development
 * - impersonatedUser: User being impersonated by admin
 * - demoUsers: Pre-configured demo users for testing
 * 
 * Key Features:
 * - User login/logout functionality
 * - Admin user impersonation capabilities
 * - Demo mode toggle for development
 * - Role-based access control
 * - Pre-configured demo users with scenarios
 */

import { makeAutoObservable } from 'mobx';
import { User, DemoUser } from '../types';

export class AuthStore {
  // Current authenticated user - null when not authenticated
  currentUser: User | null = null;
  
  // Authentication status flag - true when user is logged in
  isAuthenticated = false;
  
  // Demo mode flag - enables demo functionality and sample data
  isDemoMode = true;
  
  // User being impersonated by admin - null when not impersonating
  impersonatedUser: User | null = null;

  /**
   * Demo Users Configuration
   * 
   * Pre-configured demo users for testing different roles and scenarios.
   * Each demo user includes sample scenarios that demonstrate the application's
   * capabilities for different user types and departments.
   * 
   * User Roles:
   * - manager: Team management and approval capabilities
   * - admin: Full system access and administrative privileges
   * - user: Basic user access and task management
   * - servicenow_admin: ServiceNow integration and ticket management
   */
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

  /**
   * Constructor
   * 
   * Initializes the MobX store with auto-observable properties and sets up
   * the initial demo user for development purposes.
   */
  constructor() {
    // Make all properties observable for reactive updates
    makeAutoObservable(this);
    
    // Initialize with admin user after MobX setup
    // Using setTimeout to ensure MobX is fully initialized
    setTimeout(() => {
      this.login(this.demoUsers[1].user); // Start with admin user (Sarah Johnson)
    }, 0);
  }

  /**
   * Login Method
   * 
   * Authenticates a user and sets up the user session.
   * Clears any existing impersonation when a new user logs in.
   * 
   * @param user - The user object to authenticate
   * 
   * Expected Result:
   * - currentUser is set to the provided user
   * - isAuthenticated is set to true
   * - impersonatedUser is cleared (null)
   */
  login(user: User) {
    this.currentUser = user;
    this.isAuthenticated = true;
    this.impersonatedUser = null;
  }

  /**
   * Logout Method
   * 
   * Clears the current user session and resets authentication state.
   * Also resets demo mode to true for development purposes.
   * 
   * Expected Result:
   * - currentUser is set to null
   * - isAuthenticated is set to false
   * - impersonatedUser is cleared (null)
   * - isDemoMode is set to true
   */
  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.impersonatedUser = null;
    this.isDemoMode = true;
  }

  /**
   * Impersonate User Method
   * 
   * Allows admin users to impersonate other users for support and debugging.
   * Only admin users can impersonate other users for security reasons.
   * 
   * @param user - The user to impersonate
   * 
   * Expected Result:
   * - If current user is admin: impersonatedUser is set to the provided user
   * - If current user is not admin: warning is logged, no change to state
   */
  impersonateUser(user: User) {
    // Add safety check - only admin users can impersonate
    if (this.currentUser?.role === 'admin') {
      this.impersonatedUser = user;
    } else {
      console.warn('Only admin users can impersonate other users');
    }
  }

  /**
   * Stop Impersonation Method
   * 
   * Ends the current user impersonation and returns to the original admin user.
   * 
   * Expected Result:
   * - impersonatedUser is set to null
   * - activeUser will return the original currentUser
   */
  stopImpersonation() {
    this.impersonatedUser = null;
  }

  /**
   * Toggle Demo Mode Method
   * 
   * Switches demo mode on/off for development and testing purposes.
   * 
   * Expected Result:
   * - isDemoMode is toggled between true and false
   */
  toggleDemoMode() {
    this.isDemoMode = !this.isDemoMode;
  }

  /**
   * Active User Getter
   * 
   * Returns the currently active user, which is either the impersonated user
   * (if impersonating) or the current user (if not impersonating).
   * 
   * @returns User | null - The currently active user
   */
  get activeUser(): User | null {
    return this.impersonatedUser || this.currentUser;
  }

  /**
   * Can Impersonate Getter
   * 
   * Determines if the current user can impersonate other users.
   * Only admin users can impersonate, and they cannot impersonate while already impersonating.
   * 
   * @returns boolean - True if user can impersonate, false otherwise
   */
  get canImpersonate(): boolean {
    return Boolean(this.currentUser?.role === 'admin' && !this.impersonatedUser);
  }

  /**
   * Is Impersonating Getter
   * 
   * Determines if the current user is currently impersonating another user.
   * 
   * @returns boolean - True if impersonating, false otherwise
   */
  get isImpersonating(): boolean {
    return this.impersonatedUser !== null;
  }
}

// Create and export a singleton instance of the AuthStore
// This ensures all components use the same authentication state
export const authStore = new AuthStore();