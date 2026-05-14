/* ========================================
   인증 관리 — 로그인 상태 + 사용자 정보
   
   현재: localStorage 기반 임시 구현
   향후: Supabase Auth 또는 JWT로 전환 예정
   ======================================== */

const AUTH_KEY = 'purples_auth';

/** 기본 사용자 (개발용) */
const DEFAULT_USER = {
  id: 1,
  name: '관리자',
  role: 'admin',
  branch: '퍼플스본사',
  branchCode: '1',
  team: '영업기획팀',
  brand: 'purples',
};

export const Auth = {
  /**
   * 현재 로그인 사용자 정보 반환
   * @returns {Object|null}
   */
  getUser() {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) { /* ignore */ }
    // 개발 모드: 기본 사용자 자동 로그인 (로그인 페이지 미구현)
    this.setUser(DEFAULT_USER);
    return DEFAULT_USER;
  },

  /**
   * 사용자 정보 저장 (로그인 시)
   */
  setUser(user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  },

  /**
   * 로그아웃
   */
  logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = '/pages/auth/login.html';
  },

  /**
   * 로그인 여부 확인
   */
  isLoggedIn() {
    return this.getUser() !== null;
  },

  /**
   * 현재 사용자의 역할(role) 반환
   */
  getRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  /**
   * 현재 사용자 이름의 첫 글자 (아바타용)
   */
  getInitial() {
    const user = this.getUser();
    return user ? user.name.charAt(0) : '?';
  },
};
