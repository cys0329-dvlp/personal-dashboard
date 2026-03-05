// ============================================================
// LocalStorage utilities for Personal Dashboard
// ============================================================

import { Transaction, Project, Task } from './types';

// 계정별 키 생성 함수
function getAccountKey(key: string, username: string): string {
  return `${key}_${username}`;
}

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
export function loadTransactions(username?: string): Transaction[] {
  const key = username ? getAccountKey(KEYS.TRANSACTIONS, username) : KEYS.TRANSACTIONS;
  return load<Transaction[]>(key, []);
}
export function saveTransactions(data: Transaction[], username?: string): void {
  const key = username ? getAccountKey(KEYS.TRANSACTIONS, username) : KEYS.TRANSACTIONS;
  save(key, data);
}

// ---- Projects ----
export function loadProjects(username?: string): Project[] {
  const key = username ? getAccountKey(KEYS.PROJECTS, username) : KEYS.PROJECTS;
  return load<Project[]>(key, []);
}
export function saveProjects(data: Project[], username?: string): void {
  const key = username ? getAccountKey(KEYS.PROJECTS, username) : KEYS.PROJECTS;
  save(key, data);
}

// Deleted (completed) projects for recovery
export function loadDeletedProjects(username?: string): Project[] {
  const key = username ? getAccountKey(KEYS.DELETED_PROJECTS, username) : KEYS.DELETED_PROJECTS;
  return load<Project[]>(key, []);
}
export function saveDeletedProjects(data: Project[], username?: string): void {
  const key = username ? getAccountKey(KEYS.DELETED_PROJECTS, username) : KEYS.DELETED_PROJECTS;
  save(key, data);
}

// ---- Tasks ----
export function loadTasks(username?: string): Task[] {
  const key = username ? getAccountKey(KEYS.TASKS, username) : KEYS.TASKS;
  return load<Task[]>(key, []);
}
export function saveTasks(data: Task[], username?: string): void {
  const key = username ? getAccountKey(KEYS.TASKS, username) : KEYS.TASKS;
  save(key, data);
}
