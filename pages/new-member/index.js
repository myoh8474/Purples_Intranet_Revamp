/* 신규회원 통합관리 — 준비중 페이지 */
import { initLayout } from '@core/layout.js';

initLayout({ pageId: 'new-member', breadcrumbs: ['신규회원 통합관리'] });

const content = document.getElementById('content');
content.innerHTML = `
  <div class="page-header" style="margin-bottom:20px">
    <div>
      <h1 class="page-header__title">신규회원 통합관리</h1>
      <p class="page-header__subtitle">분배 후 초기 컨택부터 가입까지의 진행 현황을 추적합니다</p>
    </div>
  </div>
  <div class="card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;text-align:center">
    <div style="font-size:64px;margin-bottom:20px">🚧</div>
    <h2 style="font-size:22px;font-weight:700;color:var(--text-primary);margin:0 0 8px 0">준비중입니다</h2>
    <p style="font-size:14px;color:var(--text-muted);margin:0 0 24px 0;max-width:400px;line-height:1.6">
      분배된 신규회원의 컨택 진행 상황, 가입 전환율,<br>
      매니저별 응대 현황을 통합 관리하는 화면입니다.
    </p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
      <div style="padding:12px 20px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;font-size:12px;color:#0369a1">
        📞 컨택 진행 현황
      </div>
      <div style="padding:12px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:12px;color:#16a34a">
        📊 가입 전환율 모니터링
      </div>
      <div style="padding:12px 20px;background:#f5f3ff;border:1px solid #c4b5fd;border-radius:8px;font-size:12px;color:#7c3aed">
        👤 매니저별 응대 현황
      </div>
    </div>
  </div>
`;
