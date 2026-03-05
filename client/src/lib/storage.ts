// ============================================================
// LocalStorage utilities for Personal Dashboard
// ============================================================

import { Transaction, Project, Task } from './types';

const KEYS = {
  TRANSACTIONS: 'dashboard_transactions',
  PROJECTS: 'dashboard_projects',
  TASKS: 'dashboard_tasks',
  DELETED_PROJECTS: 'dashboard_deleted_projects',
};

// Generic helpers
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error', e);
  }
}

// ---- Transactions ----
export function loadTransactions(): Transaction[] {
  return load<Transaction[]>(KEYS.TRANSACTIONS, []);
}
export function saveTransactions(data: Transaction[]): void {
  save(KEYS.TRANSACTIONS, data);
}

// ---- Projects ----
export function loadProjects(): Project[] {
  return load<Project[]>(KEYS.PROJECTS, []);
}
export function saveProjects(data: Project[]): void {
  save(KEYS.PROJECTS, data);
}

// Deleted (completed) projects for recovery
export function loadDeletedProjects(): Project[] {
  return load<Project[]>(KEYS.DELETED_PROJECTS, []);
}
export function saveDeletedProjects(data: Project[]): void {
  save(KEYS.DELETED_PROJECTS, data);
}

// ---- Tasks ----
export function loadTasks(): Task[] {
  return load<Task[]>(KEYS.TASKS, []);
}
export function saveTasks(data: Task[]): void {
  save(KEYS.TASKS, data);
}
