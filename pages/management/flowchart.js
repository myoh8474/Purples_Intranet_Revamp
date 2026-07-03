/* ========================================
   업무 플로우차트 (Flowchart)
   회원분배 → 준회원 → 정회원 업무 흐름
   ======================================== */
import { initLayout } from '@core/layout.js';

initLayout({ pageId: 'management-flowchart', breadcrumbs: ['운영관리', '업무 플로우차트'] });
const content = document.getElementById('content');

content.innerHTML = `
  <div class="page-header">
    <h1 class="page-header__title">업무 플로우차트</h1>
    <p class="page-header__subtitle">회원분배 → 준회원 → 정회원 업무 흐름을 확인합니다.</p>
  </div>
  <div style="padding:60px;text-align:center;background:#fff;border:1px solid #e0e0e0;border-radius:8px">
    <div style="font-size:48px;margin-bottom:16px">📋</div>
    <div style="font-size:16px;font-weight:600;color:#333">플로우차트 준비 중</div>
    <div style="font-size:13px;color:#888;margin-top:8px">업무 흐름 플로우차트가 곧 추가됩니다.</div>
  </div>
`;
