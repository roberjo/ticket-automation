import { describe, it, expect, beforeEach } from 'vitest';
import { authStore } from '@/stores/AuthStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test by logging out
    authStore.logout();
  });

  describe('User Management', () => {
    it('should initialize with demo mode enabled', () => {
      expect(authStore.isDemoMode).toBe(true);
    });

    it('should login user', () => {
      const testUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      authStore.login(testUser);

      expect(authStore.activeUser).toEqual(testUser);
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('should clear active user on logout', () => {
      const testUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      authStore.login(testUser);
      expect(authStore.isAuthenticated).toBe(true);

      authStore.logout();
      expect(authStore.activeUser).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('Demo Mode', () => {
    it('should have demo users available', () => {
      expect(authStore.demoUsers).toHaveLength(4);
      expect(authStore.demoUsers[0]).toHaveProperty('user');
      expect(authStore.demoUsers[0].user).toHaveProperty('name');
      expect(authStore.demoUsers[0].user).toHaveProperty('role');
    });

    it('should toggle demo mode', () => {
      const initialDemoMode = authStore.isDemoMode;
      
      authStore.toggleDemoMode();
      expect(authStore.isDemoMode).toBe(!initialDemoMode);

      authStore.toggleDemoMode();
      expect(authStore.isDemoMode).toBe(initialDemoMode);
    });
  });

  describe('User Impersonation', () => {
    it('should allow admin to impersonate users', () => {
      const adminUser = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      const regularUser = {
        id: '2',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      authStore.login(adminUser);
      expect(authStore.canImpersonate).toBe(true);

      authStore.impersonateUser(regularUser);
      expect(authStore.activeUser).toEqual(regularUser);
      expect(authStore.isImpersonating).toBe(true);
    });

    it('should stop impersonation', () => {
      const adminUser = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      const regularUser = {
        id: '2',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
        department: 'IT',
        isActive: true,
        createdAt: new Date(),
        lastLogin: new Date()
      };

      authStore.login(adminUser);
      authStore.impersonateUser(regularUser);
      expect(authStore.isImpersonating).toBe(true);

      authStore.stopImpersonation();
      expect(authStore.activeUser).toEqual(adminUser);
      expect(authStore.isImpersonating).toBe(false);
    });
  });
});
