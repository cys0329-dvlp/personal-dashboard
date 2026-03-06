import { describe, it, expect, vi } from 'vitest';
import { simpleHash } from './supabase';

describe('Supabase Auth Functions', () => {
  it('should hash passwords consistently', () => {
    const password = 'testPassword123';
    const hash1 = simpleHash(password);
    const hash2 = simpleHash(password);
    
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe('string');
    expect(hash1.length).toBeGreaterThan(0);
  });

  it('should produce different hashes for different passwords', () => {
    const hash1 = simpleHash('password1');
    const hash2 = simpleHash('password2');
    
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty strings', () => {
    const hash = simpleHash('');
    expect(typeof hash).toBe('string');
  });

  it('should handle special characters', () => {
    const hash = simpleHash('p@ssw0rd!#$%');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });
});
