/* ========================================
   인증관리 - 서류인증 등록 페이지
   ─ 페이지 준비중
   ======================================== */
import { initLayout } from '@core/layout.js';

initLayout({ pageId: 'cert-register', breadcrumbs: ['정회원 관리', '서류인증 등록'] });

const content = document.getElementById('content');

content.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:center;min-height:60vh;flex-direction:column;gap:20px;">
    <div style="font-size:64px;">🚧</div>
    <h2 style="font-size:22px;font-weight:700;color:var(--text-primary);margin:0;">페이지 준비중</h2>
    <p style="color:var(--text-muted);font-size:14px;text-align:center;line-height:1.6;max-width:400px;">
      서류인증 등록 페이지는 현재 개발 진행 중입니다.<br>
      빠른 시일 내에 서비스를 제공할 예정입니다.
    </p>
    <div style="display:flex;gap:12px;margin-top:8px;">
      <span class="badge badge--blue" style="font-size:12px;padding:6px 16px;">예정 기능: 서류 업로드 및 검증</span>
      <span class="badge badge--amber" style="font-size:12px;padding:6px 16px;">인증서류 관리</span>
    </div>
  </div>
`;
