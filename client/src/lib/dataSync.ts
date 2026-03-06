// dataSync.ts - 데이터 내보내기/가져오기 기능

export interface DashboardData {
  version: string;
  exportedAt: string;
  username: string;
  projects: any[];
  finance: any[];
  calendar: any[];
  tasks: any[];
  lectures: any[];
  customCategories: any[];
}

/**
 * 모든 데이터를 로컬스토리지에서 추출하여 JSON으로 내보내기
 */
export function exportAllData(username: string): DashboardData {
  const prefix = `dashboard_${username}_`;
  
  const data: DashboardData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    username,
    projects: JSON.parse(localStorage.getItem(`${prefix}projects`) || '[]'),
    finance: JSON.parse(localStorage.getItem(`${prefix}finance`) || '[]'),
    calendar: JSON.parse(localStorage.getItem(`${prefix}calendar`) || '[]'),
    tasks: JSON.parse(localStorage.getItem(`${prefix}tasks`) || '[]'),
    lectures: JSON.parse(localStorage.getItem(`${prefix}lectures`) || '[]'),
    customCategories: JSON.parse(localStorage.getItem(`${prefix}customCategories`) || '[]'),
  };

  return data;
}

/**
 * JSON 데이터를 로컬스토리지에 가져오기
 */
export function importData(data: DashboardData, username: string): boolean {
  try {
    // 버전 확인
    if (data.version !== '1.0') {
      throw new Error('지원하지 않는 데이터 버전입니다');
    }

    const prefix = `dashboard_${username}_`;

    // 기존 데이터 백업
    const backup: Record<string, string> = {};
    const keys = ['projects', 'finance', 'calendar', 'tasks', 'lectures', 'customCategories'];
    
    keys.forEach(key => {
      const storageKey = `${prefix}${key}`;
      backup[storageKey] = localStorage.getItem(storageKey) || '';
    });

    try {
      // 새 데이터 저장
      localStorage.setItem(`${prefix}projects`, JSON.stringify(data.projects));
      localStorage.setItem(`${prefix}finance`, JSON.stringify(data.finance));
      localStorage.setItem(`${prefix}calendar`, JSON.stringify(data.calendar));
      localStorage.setItem(`${prefix}tasks`, JSON.stringify(data.tasks));
      localStorage.setItem(`${prefix}lectures`, JSON.stringify(data.lectures));
      localStorage.setItem(`${prefix}customCategories`, JSON.stringify(data.customCategories));

      return true;
    } catch (e) {
      // 실패 시 백업에서 복구
      Object.entries(backup).forEach(([key, value]) => {
        if (value) {
          localStorage.setItem(key, value);
        } else {
          localStorage.removeItem(key);
        }
      });
      throw e;
    }
  } catch (error) {
    console.error('데이터 가져오기 실패:', error);
    return false;
  }
}

/**
 * 데이터를 JSON 파일로 다운로드
 */
export function downloadDataAsFile(data: DashboardData, filename?: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `dashboard-backup-${data.username}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 파일에서 데이터 읽기
 */
export function readDataFromFile(file: File): Promise<DashboardData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as DashboardData;
        resolve(data);
      } catch (error) {
        reject(new Error('유효하지 않은 JSON 파일입니다'));
      }
    };
    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'));
    };
    reader.readAsText(file);
  });
}
