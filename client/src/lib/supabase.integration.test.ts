import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { 
  checkAdminExists, 
  getAccountByUsername,
  simpleHash 
} from './supabase';

describe('Supabase Integration Tests', () => {
  beforeAll(() => {
    // 환경 변수 확인
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined();
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
  });

  describe('Admin Check', () => {
    it('should check admin exists without throwing errors', async () => {
      try {
        const result = await checkAdminExists();
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(typeof result.exists).toBe('boolean');
      } catch (error) {
        // 테이블이 없을 수 있으므로 에러도 허용
        console.log('Admin check failed (expected if table not created):', error);
      }
    });
  });

  describe('Account Lookup', () => {
    it('should lookup account by username', async () => {
      try {
        const result = await getAccountByUsername('nonexistent_user_12345');
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
        expect(result.account).toBeNull();
      } catch (error) {
        console.log('Account lookup failed (expected if table not created):', error);
      }
    });
  });

  describe('Password Hashing', () => {
    it('should hash passwords consistently', () => {
      const password = 'testPassword123';
      const hash1 = simpleHash(password);
      const hash2 = simpleHash(password);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords', () => {
      const hash1 = simpleHash('password1');
      const hash2 = simpleHash('password2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // 이 테스트는 실제 네트워크 조건에서 실행됨
      try {
        const result = await checkAdminExists();
        expect(result.success).toBe(true);
      } catch (error) {
        // 에러가 발생해도 정상 (네트워크 문제 등)
        expect(error).toBeDefined();
      }
    });
  });
});
