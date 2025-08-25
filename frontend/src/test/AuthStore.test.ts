import { describe, it, expect, beforeEach } from 'vitest';
import { authStore } from '@/stores/AuthStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    authStore.reset();
  });

  describe('User Management', () => {
    it('should initialize with no active user', () => {
      expect(authStore.activeUser).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });

    it('should set active user', () => {
      const testUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT'
      };

      authStore.setActiveUser(testUser);

      expect(authStore.activeUser).toEqual(testUser);
      expect(authStore.isAuthenticated).toBe(true);
    });

    it('should clear active user on logout', () => {
      const testUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        department: 'IT'
      };

      authStore.setActiveUser(testUser);
      expect(authStore.isAuthenticated).toBe(true);

      authStore.logout();
      expect(authStore.activeUser).toBeNull();
      expect(authStore.isAuthenticated).toBe(false);
    });
  });

  describe('Demo Mode', () => {
    it('should have demo users available', () => {
      expect(authStore.demoUsers).toHaveLength(3);
      expect(authStore.demoUsers[0]).toHaveProperty('name');
      expect(authStore.demoUsers[0]).toHaveProperty('role');
    });

    it('should enable demo mode', () => {
      authStore.enableDemoMode();
      expect(authStore.isDemoMode).toBe(true);
    });

    it('should disable demo mode', () => {
      authStore.enableDemoMode();
      expect(authStore.isDemoMode).toBe(true);

      authStore.disableDemoMode();
      expect(authStore.isDemoMode).toBe(false);
    });
  });

  describe('Role-based Access', () => {
    it('should identify admin users', () => {
      const adminUser = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        department: 'IT'
      };

      authStore.setActiveUser(adminUser);
      expect(authStore.isAdmin).toBe(true);
      expect(authStore.isManager).toBe(false);
      expect(authStore.isUser).toBe(false);
    });

    it('should identify manager users', () => {
      const managerUser = {
        id: '2',
        name: 'Manager User',
        email: 'manager@example.com',
        role: 'manager',
        department: 'IT'
      };

      authStore.setActiveUser(managerUser);
      expect(authStore.isAdmin).toBe(false);
      expect(authStore.isManager).toBe(true);
      expect(authStore.isUser).toBe(false);
    });

    it('should identify regular users', () => {
      const regularUser = {
        id: '3',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
        department: 'IT'
      };

      authStore.setActiveUser(regularUser);
      expect(authStore.isAdmin).toBe(false);
      expect(authStore.isManager).toBe(false);
      expect(authStore.isUser).toBe(true);
    });
  });
});
