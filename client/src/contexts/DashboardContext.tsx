// ============================================================
// Dashboard Context - Global state for all data
// Design: 웜 어스톤 생산성 대시보드
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Transaction, Project, Task } from '@/lib/types';
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
}

const DashboardContext = createContext<DashboardContextType | null>(null);

interface DashboardProviderProps {
  children: React.ReactNode;
  username?: string;
}

export function DashboardProvider({ children, username }: DashboardProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions(username));
  const [projects, setProjects] = useState<Project[]>(() => loadProjects(username));
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks(username));
  const [deletedProjects, setDeletedProjects] = useState<Project[]>(() => loadDeletedProjects(username));

  // Persist on change
  useEffect(() => { saveTransactions(transactions, username); }, [transactions, username]);
  useEffect(() => { saveProjects(projects, username); }, [projects, username]);
  useEffect(() => { saveTasks(tasks, username); }, [tasks, username]);
  useEffect(() => { saveDeletedProjects(deletedProjects, username); }, [deletedProjects, username]);

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

  return (
    <DashboardContext.Provider value={{
      transactions, addTransaction, updateTransaction, deleteTransaction,
      projects, addProject, updateProject, completeProject,
      deletedProjects, restoreProject,
      tasks, addTask, updateTask, deleteTask, toggleTask,
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
