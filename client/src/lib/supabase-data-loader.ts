import { getUserData } from './supabase';
import { Transaction, Project, Task } from './types';

/**
 * Supabase에서 모든 사용자 데이터를 읽어옵니다
 */
export async function loadAllData(userId: string, username?: string) {
  console.log('📥 Supabase에서 데이터 로드 시작:', { userId, username });
  
  const result = {
    transactions: [] as Transaction[],
    projects: [] as Project[],
    tasks: [] as Task[],
    deletedProjects: [] as Project[],
  };

  try {
    // 가계부 데이터 로드
    console.log('📊 가계부 데이터 로드 중...');
    try {
      const financeResult = await getUserData(userId, 'finance');
      console.log('가계부 조회 결과:', financeResult);
      
      if (financeResult.success && financeResult.data && financeResult.data.length > 0) {
        const financeRecord = financeResult.data[0];
        if (financeRecord.data && Array.isArray(financeRecord.data)) {
          result.transactions = financeRecord.data as Transaction[];
          console.log(`✅ 가계부: ${result.transactions.length}개 항목 로드됨`);
        } else if (financeRecord.data) {
          console.log('⚠️ 가계부 데이터 형식 확인:', typeof financeRecord.data);
        }
      } else {
        console.log('⚠️ 가계부 데이터 없음');
      }
    } catch (error) {
      console.warn('⚠️ 가계부 로드 실패:', error);
    }

    // 프로젝트 데이터 로드
    console.log('📋 프로젝트 데이터 로드 중...');
    try {
      const projectResult = await getUserData(userId, 'project');
      console.log('프로젝트 조회 결과:', projectResult);
      
      if (projectResult.success && projectResult.data && projectResult.data.length > 0) {
        const projectRecord = projectResult.data[0];
        if (projectRecord.data && Array.isArray(projectRecord.data)) {
          result.projects = projectRecord.data as Project[];
          console.log(`✅ 프로젝트: ${result.projects.length}개 항목 로드됨`);
        }
      } else {
        console.log('⚠️ 프로젝트 데이터 없음');
      }
    } catch (error) {
      console.warn('⚠️ 프로젝트 로드 실패:', error);
    }

    // 할 일 데이터 로드
    console.log('✓ 할 일 데이터 로드 중...');
    try {
      const taskResult = await getUserData(userId, 'task');
      console.log('할 일 조회 결과:', taskResult);
      
      if (taskResult.success && taskResult.data && taskResult.data.length > 0) {
        const taskRecord = taskResult.data[0];
        if (taskRecord.data && Array.isArray(taskRecord.data)) {
          result.tasks = taskRecord.data as Task[];
          console.log(`✅ 할 일: ${result.tasks.length}개 항목 로드됨`);
        }
      } else {
        console.log('⚠️ 할 일 데이터 없음');
      }
    } catch (error) {
      console.warn('⚠️ 할 일 로드 실패:', error);
    }

    // 강의/삭제된 프로젝트 데이터 로드
    console.log('📚 강의 데이터 로드 중...');
    try {
      const lectureResult = await getUserData(userId, 'lecture');
      console.log('강의 조회 결과:', lectureResult);
      
      if (lectureResult.success && lectureResult.data && lectureResult.data.length > 0) {
        const lectureRecord = lectureResult.data[0];
        if (lectureRecord.data && Array.isArray(lectureRecord.data)) {
          result.deletedProjects = lectureRecord.data as Project[];
          console.log(`✅ 강의: ${result.deletedProjects.length}개 항목 로드됨`);
        }
      } else {
        console.log('⚠️ 강의 데이터 없음');
      }
    } catch (error) {
      console.warn('⚠️ 강의 로드 실패:', error);
    }

    console.log('✅ 모든 데이터 로드 완료:', result);
    return result;
  } catch (error) {
    console.error('❌ 데이터 로드 중 오류 발생:', error);
    return result;
  }
}
