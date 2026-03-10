import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/supabase';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 앱 시작 시 로그인 상태 확인
    const checkAuth = async () => {
      try {
        const { success, user: currentUser } = await getCurrentUser();
        if (success && currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('dashboardUserId', newUser.id);
    localStorage.setItem('dashboardUsername', newUser.username);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dashboardUserId');
    localStorage.removeItem('dashboardUsername');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
