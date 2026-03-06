import { useState } from 'react';
import { Lock, Mail, UserPlus, ArrowLeft, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 로컬스토리지에서 계정 데이터 로드
  const getAccounts = () => {
    const stored = localStorage.getItem('dashboard_accounts');
    return stored ? JSON.parse(stored) : {};
  };

  const saveAccounts = (accounts: Record<string, { password: string; isAdmin: boolean }>) => {
    localStorage.setItem('dashboard_accounts', JSON.stringify(accounts));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요');
      return;
    }

    const accounts = getAccounts();
    const account = accounts[username];

    if (!account) {
      setError('존재하지 않는 계정입니다');
      return;
    }

    if (account.password !== password) {
      setError('비밀번호가 일치하지 않습니다');
      return;
    }

    setIsLoading(true);
    onLogin(username, password);
    setIsLoading(false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const accounts = getAccounts();
    const isFirstAccount = Object.keys(accounts).length === 0;

    // 첫 계정은 관리자 비밀번호 필드가 필요 없음
    if (isFirstAccount) {
      if (!username.trim() || !password.trim()) {
        setError('모든 필드를 입력해주세요');
        return;
      }
    } else {
      if (!username.trim() || !password.trim() || !adminPassword.trim()) {
        setError('모든 필드를 입력해주세요');
        return;
      }
    }

    if (username.length < 3) {
      setError('아이디는 3자 이상이어야 합니다');
      return;
    }

    if (password.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다');
      return;
    }

    if (!isFirstAccount) {
      // 관리자 비밀번호 확인
      const adminAccount = Object.values(accounts).find((acc: any) => acc.isAdmin);
      if (!adminAccount || (adminAccount as any).password !== adminPassword) {
        setError('관리자 비밀번호가 일치하지 않습니다');
        return;
      }
    }

    if (accounts[username]) {
      setError('이미 존재하는 아이디입니다');
      return;
    }

    // 새 계정 생성
    accounts[username] = {
      password,
      isAdmin: isFirstAccount
    };
    saveAccounts(accounts);

    if (isFirstAccount) {
      setError('');
      setUsername('');
      setPassword('');
      setAdminPassword('');
      setMode('login');
      alert('관리자 계정이 생성되었습니다. 로그인해주세요.');
    } else {
      setError('');
      setUsername('');
      setPassword('');
      setAdminPassword('');
      setMode('login');
      alert('새 계정이 생성되었습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, oklch(0.95 0.04 50), oklch(0.98 0.012 80))' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">MY</span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'oklch(0.22 0.04 50)' }}>
            My Dashboard
          </h1>
          <p className="text-muted-foreground">개인 맞춤 대시보드</p>
        </div>

        {/* Form */}
        <div className="warm-card p-8 space-y-6">
          {mode === 'login' ? (
            <>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">아이디</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError('');
                      }}
                      placeholder="아이디를 입력하세요"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="비밀번호를 입력하세요"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg text-white font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'oklch(0.55 0.15 55)' }}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  계정이 없으신가요?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setError('');
                      setUsername('');
                      setPassword('');
                    }}
                    className="font-semibold hover:opacity-70 transition"
                    style={{ color: 'oklch(0.55 0.15 55)' }}
                  >
                    계정 생성
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">아이디 *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError('');
                      }}
                      placeholder="3자 이상의 아이디"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-semibold text-muted-foreground mb-2 block">비밀번호 *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="4자 이상의 비밀번호"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Admin Password (if not first account) */}
                {Object.keys(getAccounts()).length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                      관리자 비밀번호 *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          setError('');
                        }}
                        placeholder="관리자 비밀번호를 입력하세요"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}

                {/* Info Message */}
                {Object.keys(getAccounts()).length === 0 && (
                  <div className="flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <AlertCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-600">첫 번째 계정은 관리자 계정으로 설정됩니다.</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'oklch(0.55 0.15 55)' }}
                >
                  <UserPlus size={18} />
                  {isLoading ? '생성 중...' : '계정 생성'}
                </button>
              </form>

              {/* Back to Login */}
              <button
                onClick={() => {
                  setMode('login');
                  setError('');
                  setUsername('');
                  setPassword('');
                  setAdminPassword('');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-all hover:opacity-70"
                style={{ color: 'oklch(0.55 0.15 55)' }}
              >
                <ArrowLeft size={16} />
                로그인으로 돌아가기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
