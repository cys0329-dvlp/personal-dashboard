import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    },
  },
  createAccount: vi.fn(),
  loginAccount: vi.fn(),
  checkAdminExists: vi.fn(),
}));

describe('LoginPage', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  it('should render login form by default', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    expect(screen.getByText('Life-OS')).toBeInTheDocument();
    expect(screen.getByText('로그인')).toBeInTheDocument();
    expect(screen.getByText('회원가입')).toBeInTheDocument();
  });

  it('should switch between login and register modes', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const registerButton = screen.getAllByText('회원가입')[0];
    fireEvent.click(registerButton);
    
    // 회원가입 모드로 전환되었는지 확인
    expect(screen.getByPlaceholderText('비밀번호를 입력하세요 (4자 이상)')).toBeInTheDocument();
  });

  it('should show error when username is empty', async () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const loginButton = screen.getByText('로그인');
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('아이디와 비밀번호를 입력해주세요')).toBeInTheDocument();
    });
  });

  it('should have proper styling for warm earth tone theme', () => {
    render(<LoginPage onLogin={mockOnLogin} />);
    
    const container = screen.getByText('Life-OS').closest('div');
    expect(container).toHaveClass('bg-gradient-to-br');
    expect(container).toHaveClass('from-amber-50');
  });
});
