/* ========================================
   인사관리 — 준비중
   ======================================== */
import { initLayout } from '@core/layout.js';

initLayout({ pageId: 'hr', breadcrumbs: ['인사관리'] });
const content = document.getElementById('content');

content.innerHTML = `
  <div class="page-header">
    <div><h1 class="page-header__title">인사관리</h1>
    <p class="page-header__subtitle">매니저 성과, 급여, 평가, 근태 관련 기능</p></div>
  </div>
  <div class="coming-soon">
    <div class="coming-soon__icon"></div>
    <div class="coming-soon__title">준비중입니다</div>
    <p class="text-muted">인사관리 기능은 현재 기획 중입니다. 세부 메뉴가 확정되면 업데이트됩니다.</p>
    <a class="btn btn--outline" href="/">대시보드로 돌아가기</a>
  </div>
`;
