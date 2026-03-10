import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSupabaseSync } from '../useSupabaseSync';
import * as supabaseLib from '@/lib/supabase';

// Mock Supabase functions
vi.mock('@/lib/supabase', () => ({
  saveUserData: vi.fn(),
  getUserData: vi.fn(),
  migrateDataFromLocalStorage: vi.fn(),
}));

// Mock Auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id', username: 'testuser' },
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));

// Mock Dashboard context
vi.mock('@/contexts/DashboardContext', () => ({
  useDashboard: vi.fn(() => ({
    transactions: [],
    projects: [],
    tasks: [],
    schedules: [],
    incomeAllocations: [],
    addTransaction: vi.fn(),
    addProject: vi.fn(),
    addTask: vi.fn(),
    addSchedule: vi.fn(),
    setIncomeAllocation: vi.fn(),
  })),
}));

describe('useSupabaseSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load transactions from Supabase on mount', async () => {
    const mockTransactions = [
      { id: '1', type: 'income', amount: 1000, date: '2026-03-10', category: 'salary' },
    ];

    vi.mocked(supabaseLib.getUserData).mockResolvedValueOnce({
      success: true,
      data: [{ data: mockTransactions }],
    });

    renderHook(() => useSupabaseSync());

    await waitFor(() => {
      expect(supabaseLib.getUserData).toHaveBeenCalledWith('test-user-id', 'transactions');
    });
  });

  it('should handle Supabase load failure gracefully', async () => {
    vi.mocked(supabaseLib.getUserData).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(supabaseLib.migrateDataFromLocalStorage).mockResolvedValueOnce({ success: true });

    renderHook(() => useSupabaseSync());

    await waitFor(() => {
      expect(supabaseLib.migrateDataFromLocalStorage).toHaveBeenCalledWith('test-user-id', 'testuser');
    });
  });

  it('should not sync when user is not authenticated', () => {
    // Mock useAuth to return no user
    vi.mocked(supabaseLib.getUserData).mockClear();

    renderHook(() => useSupabaseSync());

    expect(supabaseLib.getUserData).not.toHaveBeenCalled();
  });
});
