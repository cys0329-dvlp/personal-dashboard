import { useState, useEffect } from 'react';
import { Lock, Mail, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { createAccount, loginAccount, checkAdminExists as checkAdminExistsFunc } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin?: (username: string, userId: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { login: authLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  // 관리자 계정 존재 여부 확인
  const checkAdminExists = async () => {
    try {
      setAdminCheckLoading(true);
      console.log('🔍 Admin check starting...');
      const result = await checkAdminExistsFunc();
      console.log('📊 Query result:', result);
      const adminExistsResult = result.success && result.exists;
      console.log('✅ Admin exists:', adminExistsResult);
      setAdminExists(adminExistsResult);
    } catch (err) {
      console.error('❌ Error checking admin:', err);
      setAdminExists(false);
    } finally {
      setAdminCheckLoading(false);
    }
  };

  // 첫 로드 시 관리자 확인
  useEffect(() => {
    checkAdminExists();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginAccount(username, password);
      toast.success('로그인 성공!');
      
      // AuthContext에 로그인 정보 저장
      authLogin({ id: result.userId, username });
      onLogin?.(username, result.userId);
      
      // 대시보드로 리다이렉트
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '로그인 실패';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요');
      return;
    }

    if (password.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다');
      return;
    }

    // 관리자 비밀번호가 비어있으면 첫 번째 계정으로 생성
    // (adminExists 값이 정확하지 않을 수 있으므로 관리자 비밀번호 입력 여부로 판단)
    const isFirstAdmin = !adminPassword.trim();

    // 관리자가 있으면 관리자 비밀번호 확인
    if (!isFirstAdmin && !adminPassword.trim()) {
      setError('관리자 비밀번호를 입력해주세요');
      return;
    }

    setIsLoading(true);
    try {
      // 관리자 비밀번호 검증 (첫 계정이 아닌 경우)
      if (!isFirstAdmin) {
        try {
          await loginAccount('admin', adminPassword);
        } catch {
          setError('관리자 비밀번호가 일치하지 않습니다');
          setIsLoading(false);
          return;
        }
      }

      const result = await createAccount(username, password, isFirstAdmin);
      toast.success(isFirstAdmin ? '관리자 계정이 생성되었습니다!' : '계정이 생성되었습니다!');
      
      // AuthContext에 로그인 정보 저장
      authLogin({ id: result.userId, username });
      onLogin?.(username, result.userId);
      
      // 대시보드로 리다이렉트
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '계정 생성 실패';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">LO</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Life-OS</h1>
          <p className="text-gray-600">개인 맞춤 생활 관리 시스템</p>
        </div>

        {/* 로그인/회원가입 폼 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 모드 선택 탭 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setAdminPassword('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => {
                if (!adminCheckLoading) {
                  setMode('register');
                  setError('');
                  setAdminPassword('');
                }
              }}
              disabled={adminCheckLoading}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${adminCheckLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {adminCheckLoading ? '로드 중...' : '회원가입'}
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* 로그인 폼 */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">아이디</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  '로그인'
                )}
              </button>
            </form>
          )}

          {/* 회원가입 폼 */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {adminExists === null ? (
                <div className="text-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">아이디</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="아이디를 입력하세요"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요 (4자 이상)"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {adminExists && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">관리자 비밀번호</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="관리자 비밀번호를 입력하세요"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  )}

                  {!adminExists && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        첫 번째 계정이 자동으로 관리자 계정으로 생성됩니다.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        계정 생성 중...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        계정 생성
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        {/* 푸터 */}
        <p className="text-center text-sm text-gray-600 mt-6">
          오직 당신 만을 위한 OS 서비스!!
        </p>
      </div>
    </div>
  );
}
