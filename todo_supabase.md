# Life-OS Supabase 마이그레이션 TODO

## Phase 1: Supabase 로그인 페이지 구현 및 계정 관리 시스템 완성
- [x] Supabase 클라이언트 설정 (supabase.ts)
- [x] 로그인 페이지 UI 구현 (LoginPage.tsx)
- [x] 계정 생성/로그인 함수 구현
- [x] 관리자 계정 시스템 구현 (첫 계정은 관리자, 이후 관리자 비밀번호 필요)
- [ ] Supabase 테이블 생성 (user_accounts, user_data)
- [ ] 환경 변수 설정 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

## Phase 2: 각 페이지의 데이터 로드/저장 로직을 Supabase와 연동
- [ ] CalendarPage.tsx - Supabase 연동
- [ ] FinancePage.tsx - Supabase 연동
- [ ] ProjectsPage.tsx - Supabase 연동
- [ ] LecturesPage.tsx - Supabase 연동
- [ ] DashboardContext.tsx - Supabase 데이터 소스로 변경

## Phase 3: localStorage에서 Supabase로 데이터 마이그레이션 기능 구현
- [ ] 마이그레이션 함수 구현 (migrateDataFromLocalStorage)
- [ ] 첫 로그인 시 자동 마이그레이션 실행
- [ ] 마이그레이션 진행 상황 표시
- [ ] 마이그레이션 완료 후 localStorage 정리

## Phase 4: 실시간 데이터 동기화 및 테스트
- [ ] Supabase 실시간 구독 설정 (Realtime)
- [ ] 다중 디바이스 동기화 테스트
- [ ] 오프라인 모드 처리
- [ ] 데이터 충돌 해결 로직

## Phase 5: 최종 검증 및 배포 준비
- [ ] 전체 기능 테스트
- [ ] 성능 최적화
- [ ] 보안 검토 (RLS 정책 설정)
- [ ] 배포 준비
