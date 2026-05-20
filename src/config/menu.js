/* ========================================
   메뉴 구조 — 단일 소스 오브 트루스
   플랫 라인 아이콘 (inline SVG) 포함
   ======================================== */

/** SVG 아이콘 헬퍼 — 18x18, stroke 기반 */
const I = (d) => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const icons = {
  home:     I('<path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
  users:    I('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
  diamond:  I('<path d="M12 2L2 9l10 13L22 9z"/><path d="M2 9h20"/>'),
  calendar: I('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  heart:    I('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>'),
  headset:  I('<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5z"/>'),
  chart:    I('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>'),
  trending: I('<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'),
  briefcase:I('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="2" y1="13" x2="22" y2="13"/>'),
  clipboard:I('<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>'),
  settings: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
  star:     I('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
};

/**
 * @param {string} basePath
 * @returns {Array} 메뉴 아이템 배열
 */
export function getMenuItems(basePath = '/') {
  return [
    // ━━ 홈 ━━
    {
      id: 'dashboard',
      icon: icons.home,
      text: '홈',
      href: `${basePath}index.html`,
    },

    { type: 'divider' },

    // ━━ 회원 관리 ━━
    {
      id: 'associate',
      icon: icons.users,
      text: '준회원 관리',
      children: [
        { id: 'associate-list', text: '준회원 목록', href: `${basePath}pages/associate/list.html` },
        { id: 'associate-consult-status', text: '상담현황', href: `${basePath}pages/associate/consult-status.html` },
        { id: 'associate-db-status', text: '보유DB 현황', href: `${basePath}pages/associate/db-status.html` },
        { id: 'associate-visit', text: '방문상담 관리', href: `${basePath}pages/associate/visit.html` },
        { id: 'member-distribute', text: '회원분배', href: `${basePath}pages/management/distribute.html` },
      ],
    },
    {
      id: 'regular',
      icon: icons.diamond,
      text: '정회원 관리',
      children: [
        { id: 'regular-list', text: '정회원 목록', href: `${basePath}pages/regular/list.html` },
        { id: 'matching-search', text: '매칭 대상자 검색', href: `${basePath}pages/matching/search.html` },
        { type: 'group', text: '약속 및 미팅 관리' },
        { id: 'meeting-calendar', text: '약속/미팅 조회', href: `${basePath}pages/meeting/calendar.html` },
        { id: 'meeting-stats', text: '미팅 현황', href: `${basePath}pages/meeting/stats.html` },
        { type: 'group', text: '계약 관리' },
        { id: 'contract-status', text: '보류/상태 변경 승인', href: `${basePath}pages/contract/status-approval.html` },
        { type: 'group', text: '인증관리' },
        { id: 'cert-dashboard', text: '인증 현황', href: `${basePath}pages/management/cert.html` },
        { id: 'cert-register', text: '서류인증 등록', href: `${basePath}pages/management/cert-register.html` },
        { type: 'group', text: '특별회원 관리' },
        { id: 'regular-trinity', text: '트리니티 관리', href: `${basePath}pages/regular/trinity.html` },
        { type: 'group', text: '성혼관리' },
        { id: 'marriage-list', text: '성혼 현황', href: `${basePath}pages/marriage/list.html` },
      ],
    },

    { type: 'divider' },

    // ━━ 고객·매출 ━━
    {
      id: 'event',
      icon: icons.calendar,
      text: '행사관리',
      children: [
        { id: 'event-party', text: '파티/행사 관리', href: `${basePath}pages/event/party.html` },
      ],
    },
    {
      id: 'customer',
      icon: icons.headset,
      text: '고객관리',
      children: [
        { id: 'customer-satisfaction', text: '고객만족 프로그램', href: `${basePath}pages/customer/satisfaction.html` },
        { id: 'customer-center', text: '고객센터', href: `${basePath}pages/customer/center.html` },
        { id: 'manager-claim', text: '매니저 클레임 관리', href: `${basePath}pages/customer/manager-claim.html` },
        { id: 'contract-withdrawal', text: '탈회 및 환불 현황', href: `${basePath}pages/contract/withdrawal.html` },
      ],
    },
    {
      id: 'sales',
      icon: icons.chart,
      text: '매출 및 통계',
      children: [
        { type: 'group', text: '재무/정산' },
        { id: 'sales-input', text: '매출 현황 조회', href: `${basePath}pages/sales/input.html` },
        { id: 'sales-stats', text: '매출 통계', href: `${basePath}pages/sales/stats.html` },
      ],
    },

    { type: 'divider' },

    // ━━ 성과·인사 ━━
    {
      id: 'performance',
      icon: icons.trending,
      text: '성과 관리',
      children: [
        { type: 'group', text: '성과' },
        { id: 'perf-ranking', text: '성과관리', href: `${basePath}pages/performance/ranking.html` },
        { type: 'group', text: '활동 지표' },
        { id: 'perf-weekly-visit', text: '주간 방문상담 현황', href: `${basePath}pages/performance/weekly-visit.html` },
        { id: 'perf-contact-stats', text: '회원 컨텍 현황', href: `${basePath}pages/performance/contact-stats.html` },
        { id: 'perf-matching-meeting', text: '매칭 미팅 등록 현황', href: `${basePath}pages/performance/matching-meeting.html` },
      ],
    },
    {
      id: 'hr',
      icon: icons.briefcase,
      text: '인사관리',
      href: `${basePath}pages/hr/index.html`,
    },

    { type: 'divider' },

    // ━━ 소통·설정 ━━
    {
      id: 'board',
      icon: icons.clipboard,
      text: '게시판',
      children: [
        { id: 'board-notice', text: '공지사항', href: `${basePath}pages/board/notice.html` },
        { id: 'board-request', text: '요청사항', href: `${basePath}pages/board/request.html` },
        { id: 'board-education', text: '교육자료', href: `${basePath}pages/board/education.html` },
      ],
    },
    {
      id: 'settings',
      icon: icons.settings,
      text: '설정',
      href: `${basePath}pages/settings/index.html`,
    },
  ];
}
