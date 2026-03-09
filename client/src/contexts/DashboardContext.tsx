// ============================================================
// Dashboard Context - Global state for all data
// Design: 웜 어스톤 생산성 대시보드
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Project, Task, Schedule, IncomeAllocation } from '@/lib/types';
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
  addRepeatSchedule: (s: Omit<Schedule, 'id' | 'createdAt'>) => void; // 반복 일정 추가

  // Income Allocation (월별 수입 배분)
  incomeAllocations: IncomeAllocation[];
  setIncomeAllocation: (month: string, allocation: Omit<IncomeAllocation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getIncomeAllocation: (month: string) => IncomeAllocation | undefined;
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

  // Persist on change
  useEffect(() => { saveTransactions(transactions, username); }, [transactions, username]);
  useEffect(() => { saveProjects(projects, username); }, [projects, username]);
  useEffect(() => { saveTasks(tasks, username); }, [tasks, username]);
  useEffect(() => { saveDeletedProjects(deletedProjects, username); }, [deletedProjects, username]);
  useEffect(() => { localStorage.setItem(`schedules_${username}`, JSON.stringify(schedules)); }, [schedules, username]);
  useEffect(() => { localStorage.setItem(`incomeAllocations_${username}`, JSON.stringify(incomeAllocations)); }, [incomeAllocations, username]);

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

  // 반복 일정 추가 함수
  const addRepeatSchedule = useCallback((s: Omit<Schedule, 'id' | 'createdAt'>) => {
    const scheduleList: Schedule[] = [];
    const repeatType = s.repeatType || 'none';
    const repeatEndDate = s.repeatEndDate ? new Date(s.repeatEndDate) : new Date();
    const repeatDays = s.repeatDays || [0, 1, 2, 3, 4, 5, 6];
    
    if (repeatType === 'none') {
      // 반복 없음 - 단일 일정 추가
      const newS: Schedule = { ...s, id: generateId(), createdAt: new Date().toISOString() };
      scheduleList.push(newS);
    } else if (repeatType === 'weekly') {
      // 매주 반복
      const startDate = new Date(s.date);
      let currentDate = new Date(startDate);
      const parentId = generateId();
      
      while (currentDate <= repeatEndDate) {
        const dayOfWeek = currentDate.getDay();
        if (repeatDays.includes(dayOfWeek)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const newS: Schedule = {
            ...s,
            id: generateId(),
            date: dateStr,
            parentId,
            createdAt: new Date().toISOString(),
          };
          scheduleList.push(newS);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (repeatType === 'monthly') {
      // 매월 반복
      const startDate = new Date(s.date);
      const dayOfMonth = startDate.getDate();
      let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), dayOfMonth);
      const parentId = generateId();
      
      while (currentDate <= repeatEndDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const newS: Schedule = {
          ...s,
          id: generateId(),
          date: dateStr,
          parentId,
          createdAt: new Date().toISOString(),
        };
        scheduleList.push(newS);
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    setSchedules(prev => [...prev, ...scheduleList]);
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

  return (
    <DashboardContext.Provider value={{
      transactions, addTransaction, updateTransaction, deleteTransaction,
      projects, addProject, updateProject, completeProject,
      deletedProjects, restoreProject,
      tasks, addTask, updateTask, deleteTask, toggleTask,
      schedules, addSchedule, updateSchedule, deleteSchedule, addRepeatSchedule,
      incomeAllocations, setIncomeAllocation: setIncomeAllocationFn, getIncomeAllocation,
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
