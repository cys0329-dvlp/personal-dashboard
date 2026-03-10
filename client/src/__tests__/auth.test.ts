import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createAccount, loginAccount, simpleHash } from '@/lib/supabase';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table) => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          data: [{ id: 'test-id', username: 'testuser', isAdmin: false }],
          error: null,
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-id', username: 'testuser', password_hash: simpleHash('password123') },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('simpleHash', () => {
    it('should generate consistent hash for same input', () => {
      const password = 'test-password';
      const hash1 = simpleHash(password);
      const hash2 = simpleHash(password);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different input', () => {
      const hash1 = simpleHash('password1');
      const hash2 = simpleHash('password2');
      expect(hash1).not.toBe(hash2);
    });

    it('should return hex string', () => {
      const hash = simpleHash('test');
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('createAccount', () => {
    it('should create account with valid credentials', async () => {
      const result = await createAccount('newuser', 'password123', false);
      expect(result.success).toBe(true);
      expect(result.userId).toBeDefined();
    });

    it('should throw error for invalid credentials', async () => {
      const mockError = new Error('Failed to create account');
      vi.mocked(createAccount).mockRejectedValueOnce(mockError);

      await expect(createAccount('', '')).rejects.toThrow();
    });
  });

  describe('loginAccount', () => {
    it('should login with correct credentials', async () => {
      const result = await loginAccount('testuser', 'password123');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should throw error for incorrect password', async () => {
      const mockError = new Error('Invalid username or password');
      vi.mocked(loginAccount).mockRejectedValueOnce(mockError);

      await expect(loginAccount('testuser', 'wrongpassword')).rejects.toThrow();
    });

    it('should throw error for non-existent user', async () => {
      const mockError = new Error('Invalid username or password');
      vi.mocked(loginAccount).mockRejectedValueOnce(mockError);

      await expect(loginAccount('nonexistent', 'password')).rejects.toThrow();
    });
  });
});
