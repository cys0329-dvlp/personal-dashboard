import { supabase } from './supabase';

/**
 * Supabase 연결 테스트
 * 이 함수는 Supabase가 제대로 연결되었는지 확인합니다.
 */
export async function testSupabaseConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...');
  
  try {
    // 1. 환경 변수 확인
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    console.log('✅ 환경 변수 확인:');
    console.log('   - VITE_SUPABASE_URL:', url ? '설정됨' : '❌ 설정 안 됨');
    console.log('   - VITE_SUPABASE_ANON_KEY:', key ? '설정됨' : '❌ 설정 안 됨');
    
    if (!url || !key) {
      throw new Error('환경 변수가 설정되지 않았습니다');
    }

    // 2. 테이블 존재 확인
    console.log('\n✅ 테이블 확인:');
    
    // user_accounts 테이블 확인
    const { data: accountsData, error: accountsError } = await supabase
      .from('user_accounts')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (accountsError) {
      console.log('   - user_accounts:', `❌ ${accountsError.message}`);
    } else {
      console.log('   - user_accounts: ✅ 존재함');
    }

    // user_data 테이블 확인
    const { data: dataData, error: dataError } = await supabase
      .from('user_data')
      .select('count', { count: 'exact' })
      .limit(1);
    
    if (dataError) {
      console.log('   - user_data:', `❌ ${dataError.message}`);
    } else {
      console.log('   - user_data: ✅ 존재함');
    }

    // 3. 데이터 쓰기 테스트
    console.log('\n✅ 데이터 쓰기 테스트:');
    
    const testId = `test-${Date.now()}`;
    const { data: insertData, error: insertError } = await supabase
      .from('user_accounts')
      .insert([
        {
          username: testId,
          email: `${testId}@test.local`,
          password_hash: 'test_hash',
          isAdmin: false,
        }
      ])
      .select();
    
    if (insertError) {
      console.log('   - 데이터 삽입:', `❌ ${insertError.message}`);
    } else {
      console.log('   - 데이터 삽입: ✅ 성공');
      
      // 4. 데이터 읽기 테스트
      console.log('\n✅ 데이터 읽기 테스트:');
      
      const { data: readData, error: readError } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('username', testId)
        .limit(1);
      
      if (readError) {
        console.log('   - 데이터 조회:', `❌ ${readError.message}`);
      } else if (readData && readData.length > 0) {
        console.log('   - 데이터 조회: ✅ 성공');
        console.log('   - 조회된 데이터:', readData[0]);
        
        // 5. 데이터 삭제 테스트
        console.log('\n✅ 데이터 삭제 테스트:');
        
        const { error: deleteError } = await supabase
          .from('user_accounts')
          .delete()
          .eq('username', testId);
        
        if (deleteError) {
          console.log('   - 데이터 삭제:', `❌ ${deleteError.message}`);
        } else {
          console.log('   - 데이터 삭제: ✅ 성공');
        }
      } else {
        console.log('   - 데이터 조회: ❌ 데이터를 찾을 수 없음');
      }
    }

    console.log('\n✅ Supabase 연결 테스트 완료!');
    return { success: true, message: 'Supabase 연결 성공' };
  } catch (error) {
    console.error('❌ Supabase 연결 테스트 실패:', error);
    return { success: false, message: String(error) };
  }
}

// 개발 환경에서 자동 실행
if (import.meta.env.DEV) {
  // 페이지 로드 후 테스트 실행
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      // 콘솔에서 수동으로 testSupabaseConnection() 호출 가능
      (window as any).testSupabaseConnection = testSupabaseConnection;
    });
  }
}
