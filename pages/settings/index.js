/* ========================================
   설정 — 준비중
   ======================================== */
import { initLayout } from '@core/layout.js';

initLayout({ pageId: 'settings', breadcrumbs: ['설정'] });
const content = document.getElementById('content');

content.innerHTML = `
  <div class="page-header">
    <div><h1 class="page-header__title">설정</h1>
    <p class="page-header__subtitle">사용자 권한, 시스템 설정 관련 기능</p></div>
  </div>
  <div class="coming-soon">
    <div class="coming-soon__icon"></div>
    <div class="coming-soon__title">준비중입니다</div>
    <p class="text-muted">설정 기능은 현재 기획 중입니다. 세부 메뉴가 확정되면 업데이트됩니다.</p>
    <a class="btn btn--outline" href="/">대시보드로 돌아가기</a>
  </div>
`;
