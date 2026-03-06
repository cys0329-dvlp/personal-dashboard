import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 계정 관련 타입
export interface UserAccount {
  id: string;
  username: string;
  email?: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

// 사용자 데이터 저장 타입
export interface UserData {
  id: string;
  userId: string;
  dataType: 'project' | 'lecture' | 'finance' | 'task';
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// 계정 생성
export async function createAccount(username: string, password: string, isAdmin: boolean = false) {
  try {
    // 1. Supabase Auth에 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: `${username}@lifeOS.local`,
      password: password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user");

    // 2. 사용자 계정 정보 저장
    const { error: dbError } = await supabase
      .from('user_accounts')
      .insert([
        {
          id: authData.user.id,
          username: username,
          email: `${username}@lifeOS.local`,
          isAdmin: isAdmin,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);

    if (dbError) throw dbError;

    return { success: true, userId: authData.user.id };
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
}

// 계정 로그인
export async function loginAccount(username: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@lifeOS.local`,
      password: password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Login failed");

    return { success: true, userId: data.user.id, session: data.session };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

// 로그아웃
export async function logoutAccount() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

// 사용자 데이터 저장
export async function saveUserData(userId: string, dataType: 'project' | 'lecture' | 'finance' | 'task', data: Record<string, unknown>) {
  try {
    const { error } = await supabase
      .from('user_data')
      .insert([
        {
          userId: userId,
          dataType: dataType,
          data: data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
}

// 사용자 데이터 조회
export async function getUserData(userId: string, dataType?: 'project' | 'lecture' | 'finance' | 'task') {
  try {
    let query = supabase
      .from('user_data')
      .select('*')
      .eq('userId', userId);

    if (dataType) {
      query = query.eq('dataType', dataType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// 사용자 데이터 업데이트
export async function updateUserData(dataId: string, data: Record<string, unknown>) {
  try {
    const { error } = await supabase
      .from('user_data')
      .update({
        data: data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', dataId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

// 사용자 데이터 삭제
export async function deleteUserData(dataId: string) {
  try {
    const { error } = await supabase
      .from('user_data')
      .delete()
      .eq('id', dataId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
}

// 현재 로그인한 사용자 정보 조회
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
}

// 현재 세션 조회
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session: data.session };
  } catch (error) {
    console.error("Error fetching session:", error);
    throw error;
  }
}

// 사용자 이름으로 계정 조회
export async function getAccountByUsername(username: string) {
  try {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return { success: true, account: data || null };
  } catch (error) {
    console.error("Error fetching account:", error);
    throw error;
  }
}

// 관리자 계정 존재 여부 확인
export async function checkAdminExists() {
  try {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('id')
      .eq('isAdmin', true)
      .limit(1);

    if (error) throw error;
    return { success: true, exists: data && data.length > 0 };
  } catch (error) {
    console.error("Error checking admin:", error);
    throw error;
  }
}

// 모든 사용자 데이터 삭제 (로그아웃 시)
export async function deleteAllUserData(userId: string) {
  try {
    const { error } = await supabase
      .from('user_data')
      .delete()
      .eq('userId', userId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting all user data:", error);
    throw error;
  }
}

// localStorage에서 Supabase로 데이터 마이그레이션
export async function migrateDataFromLocalStorage(userId: string, username: string) {
  try {
    // 프로젝트 데이터 마이그레이션
    const projectsKey = `${username}_projects`;
    const projectsData = localStorage.getItem(projectsKey);
    if (projectsData) {
      await saveUserData(userId, 'project', JSON.parse(projectsData));
    }

    // 강의 데이터 마이그레이션
    const lecturesKey = `${username}_lectures`;
    const lecturesData = localStorage.getItem(lecturesKey);
    if (lecturesData) {
      await saveUserData(userId, 'lecture', JSON.parse(lecturesData));
    }

    // 가계부 데이터 마이그레이션
    const financeKey = `${username}_finance`;
    const financeData = localStorage.getItem(financeKey);
    if (financeData) {
      await saveUserData(userId, 'finance', JSON.parse(financeData));
    }

    // 할 일 데이터 마이그레이션
    const tasksKey = `${username}_tasks`;
    const tasksData = localStorage.getItem(tasksKey);
    if (tasksData) {
      await saveUserData(userId, 'task', JSON.parse(tasksData));
    }

    return { success: true };
  } catch (error) {
    console.error("Error migrating data:", error);
    throw error;
  }
}
