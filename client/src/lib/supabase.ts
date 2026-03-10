import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 환경 변수 안전하게 로드
function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('🔍 Supabase 설정 확인:');
  console.log('   URL:', url ? '✅ 설정됨' : '❌ 설정 안 됨');
  console.log('   Key:', key ? '✅ 설정됨' : '❌ 설정 안 됨');

  if (!url || !key) {
    console.error('❌ Supabase 환경 변수가 설정되지 않았습니다!');
    console.error('   VITE_SUPABASE_URL:', url);
    console.error('   VITE_SUPABASE_ANON_KEY:', key ? '***' : 'undefined');
    throw new Error("Supabase URL and Anon Key are required");
  }

  return { url, key };
}

// Supabase 클라이언트 생성 (지연 초기화)
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const { url, key } = getSupabaseConfig();
    supabaseClient = createClient(url, key);
    console.log('✅ Supabase 클라이언트 생성 완료');
  }
  return supabaseClient;
}

// 기존 코드와의 호환성을 위해 export
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});

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

// 간단한 해시 함수 (bcrypt 대신 사용)
export function simpleHash(str: string): string {
  // 더 안정적인 해시 함수
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) + hash) + char; // hash * 33 + c
  }
  return Math.abs(hash).toString(16);
}

// 계정 생성
export async function createAccount(username: string, password: string, isAdmin: boolean = false) {
  try {
    const client = getSupabaseClient();
    
    // 1. 사용자명 중복 확인
    const { data: existingUser, error: checkError } = await client
      .from('user_accounts')
      .select('id')
      .eq('username', username)
      .limit(1);

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check username: ${checkError.message}`);
    }

    if (existingUser && existingUser.length > 0) {
      throw new Error('Username already exists');
    }

    // 2. 사용자 계정 정보 저장 (비밀번호는 해시하여 저장)
    const passwordHash = simpleHash(password);
    const { data: insertData, error: insertError } = await client
      .from('user_accounts')
      .insert([
        {
          username: username,
          email: `${username}@lifeOS.local`,
          isAdmin: isAdmin,
          password_hash: passwordHash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ])
      .select();

    if (insertError) {
      throw new Error(`Failed to create account: ${insertError.message}`);
    }

    if (!insertData || insertData.length === 0) {
      throw new Error("Failed to create user account");
    }

    return { success: true, userId: insertData[0].id };
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
}

// 계정 로그인
export async function loginAccount(username: string, password: string) {
  try {
    const client = getSupabaseClient();
    
    // 1. 사용자 조회
    const { data: accounts, error: queryError } = await client
      .from('user_accounts')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (queryError) {
      throw new Error(`Failed to query account: ${queryError.message}`);
    }

    if (!accounts || accounts.length === 0) {
      throw new Error('Invalid username or password');
    }

    const account = accounts[0];

    // 2. 비밀번호 확인
    const passwordHash = simpleHash(password);
    if (account.password_hash !== passwordHash) {
      throw new Error('Invalid username or password');
    }

    return { success: true, userId: account.id, username: account.username };
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}

// 로그아웃
export async function logoutAccount() {
  try {
    return { success: true };
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
}

// 사용자 데이터 저장
export async function saveUserData(userId: string, dataType: string, data: any) {
  try {
    const client = getSupabaseClient();
    
    const { error } = await client
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

    if (error) throw new Error(`Failed to save data: ${error.message}`);
    return { success: true };
  } catch (error) {
    console.error("Error saving user data:", error);
    throw error;
  }
}

// 사용자 데이터 조회
export async function getUserData(userId: string, dataType?: string) {
  try {
    const client = getSupabaseClient();
    
    let query = client
      .from('user_data')
      .select('*')
      .eq('userid', userId);

    if (dataType) {
      query = query.eq('dataType', dataType);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch data: ${error.message}`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// 사용자 데이터 업데이트
export async function updateUserData(dataId: string, data: Record<string, unknown>) {
  try {
    const client = getSupabaseClient();
    
    const { error } = await client
      .from('user_data')
      .update({
        data: data,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', dataId);

    if (error) throw new Error(`Failed to update data: ${error.message}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

// 사용자 데이터 삭제
export async function deleteUserData(dataId: string) {
  try {
    const client = getSupabaseClient();
    
    const { error } = await client
      .from('user_data')
      .delete()
      .eq('id', dataId);

    if (error) throw new Error(`Failed to delete data: ${error.message}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
}

// 현재 로그인한 사용자 정보 조회
export async function getCurrentUser() {
  try {
    const userId = localStorage.getItem('dashboardUserId');
    const username = localStorage.getItem('dashboardUsername');
    
    if (!userId || !username) {
      return { success: false, user: null };
    }

    return { success: true, user: { id: userId, username } };
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
}

// 사용자 이름으로 계정 조회
export async function getAccountByUsername(username: string) {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('user_accounts')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch account: ${error.message}`);
    }
    
    return { success: true, account: (data && data.length > 0) ? data[0] : null };
  } catch (error) {
    console.error("Error fetching account:", error);
    throw error;
  }
}

// 관리자 계정 존재 여부 확인
export async function checkAdminExists() {
  try {
    const client = getSupabaseClient();
    
    const { data, error } = await client
      .from('user_accounts')
      .select('id')
      .eq('isAdmin', true)
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.warn('Admin check warning:', error.message);
      return { success: true, exists: false };
    }
    
    return { success: true, exists: data && data.length > 0 };
  } catch (error) {
    console.error("Error checking admin:", error);
    return { success: true, exists: false };
  }
}

// 모든 사용자 데이터 삭제 (로그아웃 시)
export async function deleteAllUserData(userId: string) {
  try {
    const client = getSupabaseClient();
    
    const { error } = await client
      .from('user_data')
      .delete()
      .eq('userId', userId);

    if (error) throw new Error(`Failed to delete all data: ${error.message}`);
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
      try {
        await saveUserData(userId, 'project', JSON.parse(projectsData));
      } catch (err) {
        console.warn('Failed to migrate projects:', err);
      }
    }

    // 강의 데이터 마이그레이션
    const lecturesKey = `${username}_lectures`;
    const lecturesData = localStorage.getItem(lecturesKey);
    if (lecturesData) {
      try {
        await saveUserData(userId, 'lecture', JSON.parse(lecturesData));
      } catch (err) {
        console.warn('Failed to migrate lectures:', err);
      }
    }

    // 가계부 데이터 마이그레이션
    const financeKey = `${username}_finance`;
    const financeData = localStorage.getItem(financeKey);
    if (financeData) {
      try {
        await saveUserData(userId, 'finance', JSON.parse(financeData));
      } catch (err) {
        console.warn('Failed to migrate finance:', err);
      }
    }

    // 할 일 데이터 마이그레이션
    const tasksKey = `${username}_tasks`;
    const tasksData = localStorage.getItem(tasksKey);
    if (tasksData) {
      try {
        await saveUserData(userId, 'task', JSON.parse(tasksData));
      } catch (err) {
        console.warn('Failed to migrate tasks:', err);
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error migrating data:", error);
    throw error;
  }
}
