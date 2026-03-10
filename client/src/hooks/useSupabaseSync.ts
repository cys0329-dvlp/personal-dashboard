import { useEffect, useCallback } from 'react';
import { saveUserData, getUserData, migrateDataFromLocalStorage } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';

/**
 * Supabase 데이터 동기화 훅
 * - 초기 로드 시 Supabase에서 데이터 로드
 * - 데이터 변경 시 Supabase에 저장
 * - localStorage에서 Supabase로 마이그레이션
 */
export function useSupabaseSync() {
  const { user } = useAuth();
  const {
    transactions, projects, tasks, schedules, incomeAllocations,
    addTransaction, addProject, addTask, addSchedule, setIncomeAllocation,
  } = useDashboard();

  // 1. 초기 로드 - Supabase에서 데이터 가져오기
  useEffect(() => {
    if (!user) return;

    const loadDataFromSupabase = async () => {
      try {
        // 트랜잭션 로드
        const transactionsResult = await getUserData(user.id, 'transactions');
        if (transactionsResult.success && transactionsResult.data.length > 0) {
          const data = transactionsResult.data[0]?.data;
          if (data && Array.isArray(data)) {
            data.forEach(t => addTransaction(t));
          }
        }

        // 프로젝트 로드
        const projectsResult = await getUserData(user.id, 'projects');
        if (projectsResult.success && projectsResult.data.length > 0) {
          const data = projectsResult.data[0]?.data;
          if (data && Array.isArray(data)) {
            data.forEach(p => addProject(p));
          }
        }

        // 할 일 로드
        const tasksResult = await getUserData(user.id, 'tasks');
        if (tasksResult.success && tasksResult.data.length > 0) {
          const data = tasksResult.data[0]?.data;
          if (data && Array.isArray(data)) {
            data.forEach(t => addTask(t));
          }
        }

        // 일정 로드
        const schedulesResult = await getUserData(user.id, 'schedules');
        if (schedulesResult.success && schedulesResult.data.length > 0) {
          const data = schedulesResult.data[0]?.data;
          if (data && Array.isArray(data)) {
            data.forEach(s => addSchedule(s));
          }
        }

        // 수입 배분 로드
        const allocationsResult = await getUserData(user.id, 'incomeAllocations');
        if (allocationsResult.success && allocationsResult.data.length > 0) {
          const data = allocationsResult.data[0]?.data;
          if (data && Array.isArray(data)) {
            data.forEach((ia: any) => setIncomeAllocation(ia.month, ia));
          }
        }
      } catch (error) {
        console.error('Failed to load data from Supabase:', error);
        
        // Supabase 로드 실패 시 localStorage에서 마이그레이션 시도
        try {
          await migrateDataFromLocalStorage(user.id, user.username);
        } catch (migrationError) {
          console.error('Failed to migrate data from localStorage:', migrationError);
        }
      }
    };

    loadDataFromSupabase();
  }, [user?.id]);

  // 2. 트랜잭션 변경 시 Supabase에 저장
  useEffect(() => {
    if (!user || transactions.length === 0) return;

    const saveTransactionsToSupabase = async () => {
      try {
        await saveUserData(user.id, 'transactions', transactions);
      } catch (error) {
        console.error('Failed to save transactions to Supabase:', error);
      }
    };

    // 500ms 디바운싱으로 과도한 저장 방지
    const timer = setTimeout(saveTransactionsToSupabase, 500);
    return () => clearTimeout(timer);
  }, [transactions, user?.id]);

  // 3. 프로젝트 변경 시 Supabase에 저장
  useEffect(() => {
    if (!user || projects.length === 0) return;

    const saveProjectsToSupabase = async () => {
      try {
        await saveUserData(user.id, 'projects', projects);
      } catch (error) {
        console.error('Failed to save projects to Supabase:', error);
      }
    };

    const timer = setTimeout(saveProjectsToSupabase, 500);
    return () => clearTimeout(timer);
  }, [projects, user?.id]);

  // 4. 할 일 변경 시 Supabase에 저장
  useEffect(() => {
    if (!user || tasks.length === 0) return;

    const saveTasksToSupabase = async () => {
      try {
        await saveUserData(user.id, 'tasks', tasks);
      } catch (error) {
        console.error('Failed to save tasks to Supabase:', error);
      }
    };

    const timer = setTimeout(saveTasksToSupabase, 500);
    return () => clearTimeout(timer);
  }, [tasks, user?.id]);

  // 5. 일정 변경 시 Supabase에 저장
  useEffect(() => {
    if (!user || schedules.length === 0) return;

    const saveSchedulesToSupabase = async () => {
      try {
        await saveUserData(user.id, 'schedules', schedules);
      } catch (error) {
        console.error('Failed to save schedules to Supabase:', error);
      }
    };

    const timer = setTimeout(saveSchedulesToSupabase, 500);
    return () => clearTimeout(timer);
  }, [schedules, user?.id]);

  // 6. 수입 배분 변경 시 Supabase에 저장
  useEffect(() => {
    if (!user || incomeAllocations.length === 0) return;

    const saveAllocationsToSupabase = async () => {
      try {
        await saveUserData(user.id, 'incomeAllocations', incomeAllocations);
      } catch (error) {
        console.error('Failed to save income allocations to Supabase:', error);
      }
    };

    const timer = setTimeout(saveAllocationsToSupabase, 500);
    return () => clearTimeout(timer);
  }, [incomeAllocations, user?.id]);
}
