import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('Supabase Credentials', () => {
  it('should validate Supabase credentials', async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const key = process.env.VITE_SUPABASE_ANON_KEY;

    expect(url).toBeDefined();
    expect(key).toBeDefined();

    // Create Supabase client
    const client = createClient(url!, key!);

    // Try to connect and fetch from user_accounts table
    const { data, error } = await client
      .from('user_accounts')
      .select('*')
      .limit(1);

    // Credentials are valid if:
    // - error is null (table exists)
    // - error code is PGRST205 (table not found - credentials still valid)
    // - error code is PGRST116 (relation does not exist)
    const isValid = error === null || 
                   error?.code === 'PGRST205' || 
                   error?.code === 'PGRST116';
    
    expect(isValid).toBe(true);
  });
});
