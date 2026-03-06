import { useState, useRef } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { exportAllData, importData, downloadDataAsFile, readDataFromFile, DashboardData } from '@/lib/dataSync';
import { toast } from 'sonner';

interface DataSyncPageProps {
  username: string;
}

export default function DataSyncPage({ username }: DataSyncPageProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      setIsExporting(true);
      const data = exportAllData(username);
      downloadDataAsFile(data);
      toast.success('데이터가 다운로드되었습니다');
    } catch (error) {
      console.error('내보내기 실패:', error);
      toast.error('데이터 내보내기 실패');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const data = await readDataFromFile(file);
      
      // 데이터 검증
      if (!data.version || !data.projects) {
        throw new Error('유효하지 않은 데이터 형식입니다');
      }

      // 데이터 가져오기
      const success = importData(data, username);
      
      if (success) {
        toast.success('데이터가 성공적으로 가져와졌습니다. 페이지를 새로고침해주세요.');
        // 선택적: 자동 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error('데이터 가져오기 실패');
      }
    } catch (error) {
      console.error('가져오기 실패:', error);
      toast.error(error instanceof Error ? error.message : '데이터 가져오기 실패');
    } finally {
      setIsImporting(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">데이터 동기화</h1>
        <p className="text-gray-600">다른 기기에서 사용하기 위해 데이터를 내보내거나 가져올 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 내보내기 카드 */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">데이터 내보내기</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            현재 계정의 모든 데이터를 JSON 파일로 다운로드합니다. 이 파일을 다른 기기에서 가져올 수 있습니다.
          </p>

          <div className="space-y-3 mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-blue-900">프로젝트 및 할 일</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-blue-900">가계부 내역</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-blue-900">강의 및 녹음 정보</span>
            </div>
            <div className="flex gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-blue-900">커스텀 카테고리</span>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isExporting ? '내보내는 중...' : '데이터 내보내기'}
          </button>
        </div>

        {/* 가져오기 카드 */}
        <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">데이터 가져오기</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            다른 기기에서 내보낸 JSON 파일을 업로드하여 데이터를 복원합니다.
          </p>

          <div className="space-y-3 mb-6 p-4 bg-amber-50 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-amber-900">기존 데이터는 자동으로 백업됩니다</span>
            </div>
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-amber-900">같은 계정으로 로그인한 상태에서 진행하세요</span>
            </div>
          </div>

          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isImporting ? '가져오는 중...' : '파일 선택 및 가져오기'}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* 사용 방법 */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">사용 방법</h3>
        <ol className="space-y-3 text-gray-700">
          <li className="flex gap-3">
            <span className="font-semibold text-gray-900 w-6">1.</span>
            <span><strong>첫 번째 기기</strong>에서 "데이터 내보내기"를 클릭하여 JSON 파일을 다운로드합니다.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-gray-900 w-6">2.</span>
            <span>다운로드한 파일을 <strong>다른 기기</strong>로 전송합니다 (이메일, 클라우드 드라이브 등).</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-gray-900 w-6">3.</span>
            <span><strong>다른 기기</strong>에서 같은 계정으로 로그인합니다.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-gray-900 w-6">4.</span>
            <span>"데이터 가져오기"를 클릭하여 다운로드한 JSON 파일을 선택합니다.</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-gray-900 w-6">5.</span>
            <span>페이지가 자동으로 새로고침되고 모든 데이터가 동기화됩니다.</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
