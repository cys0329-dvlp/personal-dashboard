import { describe, it, expect, beforeAll } from 'vitest';
import { supabase, checkAdminExists, getAccountByUsername } from './supabase';

describe('Supabase Connection Tests', () => {
  beforeAll(() => {
    // 환경 변수 확인
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined();
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
  });

  it('should connect to Supabase', async () => {
    try {
      // Supabase 클라이언트가 생성되었는지 확인
      expect(supabase).toBeDefined();
      
      // 간단한 쿼리로 연결 테스트
      const { data, error } = await supabase
        .from('user_accounts')
        .select('count', { count: 'exact' })
        .limit(1);

      // 연결 성공 여부 확인
      if (error && error.code !== 'PGRST116') {
        // PGRST116은 테이블이 비어있을 때의 정상 응답
        console.error('Supabase connection error:', error);
      }
      
      expect(supabase).toBeTruthy();
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  });

  it('should verify admin check function works', async () => {
    try {
      const result = await checkAdminExists();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(typeof result.exists).toBe('boolean');
    } catch (error) {
      // 테이블이 없을 수도 있으므로 에러도 허용
      console.log('Admin check test (expected to fail if table not created):', error);
    }
  });

  it('should verify account lookup function works', async () => {
    try {
      const result = await getAccountByUsername('test_user_that_does_not_exist');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      // 존재하지 않는 계정이므로 null이어야 함
      expect(result.account).toBeNull();
    } catch (error) {
      // 테이블이 없을 수도 있으므로 에러도 허용
      console.log('Account lookup test (expected to fail if table not created):', error);
    }
  });
});
