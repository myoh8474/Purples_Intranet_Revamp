/* ========================================
   공통 레이아웃 주입 (Core Layout)
   
   좌측 사이드바 + 헤더 + 권한 체크
   모든 페이지에서 이 파일 하나만 import하면 자동 적용
   
   사용법:
     import { initLayout } from '@core/layout.js';
     initLayout({ pageId: 'associate-list', breadcrumbs: ['준회원 관리', '준회원 목록'] });
   ======================================== */

import '@styles/variables.css';
import '@styles/base.css';
import '@styles/layout.css';
import '@styles/components.css';
import '@styles/main.css'; /* Tailwind utilities */

import { getMenuItems } from '@config/menu.js';
import { Auth } from './auth.js';
import { filterMenuByRole, canAccess } from './permissions.js';

/**
 * 현재 페이지 경로에서 루트까지의 상대 경로를 계산
 */
function calcBasePath() {
  const path = window.location.pathname;
  const depth = (path.match(/pages\//g) || []).length;
  if (depth === 0) return './';
  const segments = path.split('/');
  const pagesIdx = segments.findIndex(s => s === 'pages');
  if (pagesIdx === -1) return './';
  const levels = segments.length - pagesIdx - 1;
  return '../'.repeat(levels);
}

/**
 * 현재 페이지가 특정 href와 일치하는지
 */
function isActivePage(href) {
  if (!href) return false;
  const currentFile = window.location.pathname.split('/').pop().split('?')[0];
  const hrefFile = href.split('/').pop().split('?')[0];
  return currentFile === hrefFile;
}

/**
 * 좌측 사이드바 HTML 생성
 */
function renderSidebar(menuItems, basePath, user) {
  const menuHtml = menuItems.map(item => {
    if (item.type === 'divider') {
      return `<div class="sidebar__divider"></div>`;
    }
    if (item.children) {
      const childActive = item.children.some(c => isActivePage(c.href));
      const openClass = childActive ? ' open' : '';
      return `
        <div class="sidebar__group${openClass}" data-group="${item.id}">
          <button class="sidebar__item sidebar__item--parent${childActive ? ' active' : ''}">
            <span class="sidebar__icon">${item.icon}</span>
            <span class="sidebar__text">${item.text}</span>
            <span class="sidebar__arrow">›</span>
          </button>
          <div class="sidebar__children">
            ${item.children.filter(c => c.type !== 'group').map(c => {
              const active = isActivePage(c.href) ? ' active' : '';
              return `<a class="sidebar__child${active}" href="${c.href}">${c.text}</a>`;
            }).join('')}
          </div>
        </div>`;
    }
    const active = isActivePage(item.href) ? ' active' : '';
    return `
      <a class="sidebar__item${active}" href="${item.href}">
        <span class="sidebar__icon">${item.icon}</span>
        <span class="sidebar__text">${item.text}</span>
      </a>`;
  }).join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__header">
        <a class="sidebar__logo" href="${basePath}index.html">
          <div class="sidebar__logo-icon">P</div>
          <span class="sidebar__logo-text">Purples</span>
        </a>
      </div>
      <div class="sidebar__user">
        <div class="sidebar__user-avatar">${user.name.charAt(0)}</div>
        <div class="sidebar__user-info">
          <div class="sidebar__user-name">${user.name}</div>
          <div class="sidebar__user-role">${user.team || user.role}</div>
        </div>
      </div>
      <nav class="sidebar__nav">
        ${menuHtml}
      </nav>
      <div class="sidebar__footer">
        <button class="sidebar__collapse-btn" id="sidebar-toggle" title="사이드바 접기">
          <span class="sidebar__collapse-icon">◀</span>
          <span class="sidebar__text">접기</span>
        </button>
      </div>
    </aside>`;
}

/**
 * 헤더(브레드크럼) HTML 생성
 */
function renderHeader(breadcrumbs) {
  const crumbsHtml = breadcrumbs.map((text, i) => {
    const sep = i < breadcrumbs.length - 1 ? '<span class="header__breadcrumb-sep">›</span>' : '';
    return `<span class="header__breadcrumb-item">${text}</span>${sep}`;
  }).join('');

  return `
    <header class="header" id="header">
      <div class="header__left">
        <div class="header__breadcrumb">${crumbsHtml}</div>
      </div>
      <div class="header__right">
        <button class="header__action" title="알림">🔔<span class="header__action-badge"></span></button>
        <button class="header__action" title="설정">⚙️</button>
      </div>
    </header>`;
}

/**
 * 사이드바 아코디언 + 접기/펼치기 이벤트 바인딩
 */
function bindSidebarEvents() {
  // 아코디언 토글
  document.querySelectorAll('.sidebar__item--parent').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.sidebar__group');
      group.classList.toggle('open');
    });
  });

  // 접기/펼치기
  const toggle = document.getElementById('sidebar-toggle');
  const body = document.body;
  
  // 로컬스토리지에서 상태 복원
  if (localStorage.getItem('sidebar-collapsed') === 'true') {
    body.classList.add('sidebar-collapsed');
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('sidebar-collapsed', body.classList.contains('sidebar-collapsed'));
    });
  }
}

/**
 * 레이아웃 초기화 — 모든 페이지에서 호출
 */
export function initLayout({ pageId, breadcrumbs = ['대시보드'] }) {
  const user = Auth.getUser();

  // 로그인 체크
  if (!user && pageId !== 'login') {
    window.location.href = '/pages/auth/login.html';
    return;
  }

  // 권한 체크
  if (user && pageId !== 'login' && !canAccess(pageId, user.role)) {
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:16px;">
        <div style="font-size:3rem;">🔒</div>
        <h2>접근 권한이 없습니다</h2>
        <p style="color:var(--text-muted);">이 페이지에 접근할 수 있는 권한이 없습니다.</p>
        <a href="/" style="color:var(--accent);text-decoration:underline;">대시보드로 이동</a>
      </div>`;
    return;
  }

  const basePath = calcBasePath();
  const allMenu = getMenuItems(basePath);
  const filteredMenu = user ? filterMenuByRole(allMenu, user.role) : allMenu;

  const app = document.getElementById('app');
  if (!app) return;

  const sidebarHtml = renderSidebar(filteredMenu, basePath, user || { name: '게스트', role: 'viewer', team: '' });
  const headerHtml = renderHeader(breadcrumbs);

  app.innerHTML = `
    ${sidebarHtml}
    <div class="main">
      ${headerHtml}
      <main class="content" id="content"></main>
    </div>`;

  // modal-root, toast-container 보장
  if (!document.getElementById('modal-root')) {
    const mr = document.createElement('div');
    mr.id = 'modal-root';
    document.body.appendChild(mr);
  }
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.className = 'toast-container';
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  bindSidebarEvents();
}
