/* ========================================
   권한(Role) 정의 및 접근 규칙
   ======================================== */

export const ROLES = {
  ADMIN: 'admin',           // 시스템 관리자 — 전체 접근
  DIRECTOR: 'director',     // 본부장 — 통계/인사 포함
  MANAGER: 'manager',       // 매니저 — 회원관리 중심
  CONSULTANT: 'consultant', // 컨설턴트 — 본인 담당 회원만
  LEGAL: 'legal',           // 법무팀 — 성혼/소송 전담
  VIEWER: 'viewer',         // 열람자 — 읽기 전용
};

/**
 * 역할별 접근 가능 페이지 ID 목록
 * '*' = 전체 접근, 'stats/*' = stats 하위 전체
 */
export const ROLE_PERMISSIONS = {
  admin: ['*'],
  director: [
    'dashboard',
    'associate-list', 'associate-detail', 'associate-consult-status', 'associate-db-status', 'associate-visit',
    'regular-list', 'regular-detail', 'regular-register',
    'member-distribute',
    'matching-search',
    // 약속 및 미팅 관리
    'meeting-calendar', 'meeting-schedule', 'meeting-stats', 'meeting-place',
    // 계약 관리
    'contract-billing', 'contract-status', 'contract-claim', 'contract-withdrawal',
    // 인증/통계/인사
    'cert-dashboard', 'cert-register',
    'sales-report', 'consultant-perf', 'ops-dashboard',
    // 매니저 성과 관리
    'perf-ranking', 'perf-weekly-visit',
    'hr-performance', 'hr-salary', 'hr-evaluation', 'hr-attendance',
    'user-permission',
    // 성혼 관리
    'marriage-list', 'marriage-detail',
  ],
  manager: [
    'dashboard',
    'associate-list', 'associate-detail', 'associate-consult-status', 'associate-db-status', 'associate-visit',
    'regular-list', 'regular-detail', 'regular-register',
    'member-distribute',
    'matching-search',
    'meeting-calendar', 'meeting-schedule', 'meeting-stats', 'meeting-place',
    'contract-billing', 'contract-status', 'contract-claim',
    'cert-dashboard', 'cert-register',
    // 매니저 성과 관리
    'perf-ranking', 'perf-weekly-visit',
  ],
  consultant: [
    'dashboard',
    'associate-list', 'associate-detail', 'associate-consult-status', 'associate-db-status', 'associate-visit',
    'regular-list', 'regular-detail',
    'matching-search',
    'meeting-calendar', 'meeting-schedule',
  ],
  legal: [
    'dashboard',
    'marriage-list', 'marriage-detail',
    'regular-list', 'regular-detail',
    'contract-billing',
  ],
  viewer: ['dashboard'],
};
