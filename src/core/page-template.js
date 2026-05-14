/* ========================================
   페이지 템플릿 유틸 — Coming Soon 페이지 빠르게 생성
   ======================================== */
import { initLayout } from '@core/layout.js';

/**
 * 아직 구현되지 않은 페이지를 Coming Soon으로 표시
 * @param {Object} opts
 * @param {string} opts.pageId
 * @param {string[]} opts.breadcrumbs
 * @param {string} opts.title
 */
export function renderComingSoon({ pageId, breadcrumbs, title }) {
  initLayout({ pageId, breadcrumbs });
  const content = document.getElementById('content');
  content.innerHTML = `
    <div class="coming-soon">
      <div class="coming-soon__icon"></div>
      <div class="coming-soon__title">${title}</div>
      <p class="text-muted">이 기능은 현재 개발 중입니다. 곧 업데이트됩니다.</p>
      <a class="btn btn--outline" href="/">대시보드로 돌아가기</a>
    </div>`;
}
