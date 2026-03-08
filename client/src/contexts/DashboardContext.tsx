// ============================================================
// Dashboard Context - Global state for all data
// Design: 웜 어스톤 생산성 대시보드
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Project, Task, Schedule, IncomeAllocation, ScheduleCategory, ScheduleCategoryMap, DEFAULT_SCHEDULE_COLORS } from '@/lib/types';
import {
  loadTransactions, saveTransactions,
  loadProjects, saveProjects,
  loadTasks, saveTasks,
  loadDeletedProjects, saveDeletedProjects,
} from '@/lib/storage';
import { generateId } from '@/lib/utils';

interface DashboardContextType {
  // Transactions
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Projects
  projects: Project[];
  addProject: (p: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  completeProject: (id: string) => void;
  deletedProjects: Project[];
  restoreProject: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, t: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Schedules (일정)
  schedules: Schedule[];
  addSchedule: (s: Omit<Schedule, 'id' | 'createdAt'>) => void;
  updateSchedule: (id: string, s: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;

  // Income Allocation (월별 수입 배분)
  incomeAllocations: IncomeAllocation[];
  setIncomeAllocation: (month: string, allocation: Omit<IncomeAllocation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getIncomeAllocation: (month: string) => IncomeAllocation | undefined;

  // Schedule Categories (일정 카테고리)
  scheduleCategories: ScheduleCategoryMap;
  addScheduleCategory: (category: Omit<ScheduleCategory, 'id'>) => void;
  updateScheduleCategory: (id: string, category: Partial<ScheduleCategory>) => void;
  deleteScheduleCategory: (id: string) => void;
  getScheduleCategory: (id: string) => ScheduleCategory | undefined;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
  children: React.ReactNode;
  username?: string;
  initialTransactions?: Transaction[];
  initialProjects?: Project[];
  initialTasks?: Task[];
  initialDeletedProjects?: Project[];
  initialSchedules?: Schedule[];
  initialIncomeAllocations?: IncomeAllocation[];
}

export function DashboardProvider({ 
  children, 
  username, 
  initialTransactions, 
  initialProjects, 
  initialTasks, 
  initialDeletedProjects,
  initialSchedules,
  initialIncomeAllocations,
}: DashboardProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => initialTransactions || loadTransactions(username));
  const [projects, setProjects] = useState<Project[]>(() => initialProjects || loadProjects(username));
  const [tasks, setTasks] = useState<Task[]>(() => initialTasks || loadTasks(username));
  const [deletedProjects, setDeletedProjects] = useState<Project[]>(() => initialDeletedProjects || loadDeletedProjects(username));
  const [schedules, setSchedules] = useState<Schedule[]>(() => initialSchedules || []);
  const [incomeAllocations, setIncomeAllocations] = useState<IncomeAllocation[]>(() => initialIncomeAllocations || []);
  const [scheduleCategories, setScheduleCategories] = useState<ScheduleCategoryMap>(() => {
    const stored = localStorage.getItem(`scheduleCategories_${username}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse schedule categories:', e);
      }
    }
    // Initialize with default categories
    const defaults: ScheduleCategoryMap = {};
    Object.entries(DEFAULT_SCHEDULE_COLORS).forEach(([type, color]) => {
      const id = `default_${type}`;
      defaults[id] = {
        id,
        name: type === 'lecture' ? '강의' : type === 'work' ? '알바/일' : '이벤트',
        color,
        type: type as any,
      };
    });
    return defaults;
  });

  // Persist on change
  useEffect(() => { saveTransactions(transactions, username); }, [transactions, username]);
  useEffect(() => { saveProjects(projects, username); }, [projects, username]);
  useEffect(() => { saveTasks(tasks, username); }, [tasks, username]);
  useEffect(() => { saveDeletedProjects(deletedProjects, username); }, [deletedProjects, username]);
  useEffect(() => { localStorage.setItem(`schedules_${username}`, JSON.stringify(schedules)); }, [schedules, username]);
  useEffect(() => { localStorage.setItem(`incomeAllocations_${username}`, JSON.stringify(incomeAllocations)); }, [incomeAllocations, username]);
  useEffect(() => { localStorage.setItem(`scheduleCategories_${username}`, JSON.stringify(scheduleCategories)); }, [scheduleCategories, username]);

  // ---- Transactions ----
  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newT: Transaction = { ...t, id: generateId(), createdAt: new Date().toISOString() };
    setTransactions(prev => [newT, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, t: Partial<Transaction>) => {
    setTransactions(prev => prev.map(item => item.id === id ? { ...item, ...t } : item));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(item => item.id !== id));
  }, []);

  // ---- Projects ----
  const addProject = useCallback((p: Omit<Project, 'id' | 'createdAt'>) => {
    const newP: Project = { ...p, id: generateId(), createdAt: new Date().toISOString() };
    setProjects(prev => [newP, ...prev]);
  }, []);

  const updateProject = useCallback((id: string, p: Partial<Project>) => {
    setProjects(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
  }, []);

  const completeProject = useCallback((id: string) => {
    setProjects(prev => {
      const project = prev.find(p => p.id === id);
      if (!project) return prev;
      const completed = { ...project, status: 'done' as const, deletedAt: new Date().toISOString() };
      setDeletedProjects(dp => [completed, ...dp]);
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const restoreProject = useCallback((id: string) => {
    setDeletedProjects(prev => {
      const project = prev.find(p => p.id === id);
      if (!project) return prev;
      const restored = { ...project, status: 'inprogress' as const, deletedAt: undefined };
      setProjects(pp => [restored, ...pp]);
      return prev.filter(p => p.id !== id);
    });
  }, []);

  // ---- Tasks ----
  const addTask = useCallback((t: Omit<Task, 'id' | 'createdAt'>) => {
    const newT: Task = { ...t, id: generateId(), createdAt: new Date().toISOString() };
    setTasks(prev => [newT, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, t: Partial<Task>) => {
    setTasks(prev => prev.map(item => item.id === id ? { ...item, ...t } : item));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  }, []);

  // ---- Schedules ----
  const addSchedule = useCallback((s: Omit<Schedule, 'id' | 'createdAt'>) => {
    const newS: Schedule = { ...s, id: generateId(), createdAt: new Date().toISOString() };
    setSchedules(prev => [newS, ...prev]);
  }, []);

  const updateSchedule = useCallback((id: string, s: Partial<Schedule>) => {
    setSchedules(prev => prev.map(item => item.id === id ? { ...item, ...s } : item));
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setSchedules(prev => prev.filter(item => item.id !== id));
  }, []);

  // ---- Income Allocation ----
  const setIncomeAllocationFn = useCallback((month: string, allocation: Omit<IncomeAllocation, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIncomeAllocations(prev => {
      const existing = prev.find(ia => ia.month === month);
      if (existing) {
        return prev.map(ia => ia.month === month ? { ...ia, ...allocation, updatedAt: new Date().toISOString() } : ia);
      }
      const newIA: IncomeAllocation = {
        ...allocation,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return [newIA, ...prev];
    });
  }, []);

  const getIncomeAllocation = useCallback((month: string) => {
    return incomeAllocations.find(ia => ia.month === month);
  }, [incomeAllocations]);

  // ---- Schedule Categories ----
  const addScheduleCategory = useCallback((category: Omit<ScheduleCategory, 'id'>) => {
    const id = generateId();
    setScheduleCategories(prev => ({
      ...prev,
      [id]: { ...category, id },
    }));
  }, []);

  const updateScheduleCategory = useCallback((id: string, category: Partial<ScheduleCategory>) => {
    setScheduleCategories(prev => ({
      ...prev,
      [id]: { ...prev[id], ...category },
    }));
  }, []);

  const deleteScheduleCategory = useCallback((id: string) => {
    setScheduleCategories(prev => {
      const newCategories = { ...prev };
      delete newCategories[id];
      return newCategories;
    });
  }, []);

  const getScheduleCategory = useCallback((id: string) => {
    return scheduleCategories[id];
  }, [scheduleCategories]);

  return (
    <DashboardContext.Provider value={{
      transactions, addTransaction, updateTransaction, deleteTransaction,
      projects, addProject, updateProject, completeProject,
      deletedProjects, restoreProject,
      tasks, addTask, updateTask, deleteTask, toggleTask,
      schedules, addSchedule, updateSchedule, deleteSchedule,
      incomeAllocations, setIncomeAllocation: setIncomeAllocationFn, getIncomeAllocation,
      scheduleCategories, addScheduleCategory, updateScheduleCategory, deleteScheduleCategory, getScheduleCategory,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
