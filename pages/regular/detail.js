/* ========================================
   정회원 상세 페이지 — 메인 컨트롤러
   (4탭 · 1단 레이아웃 · 사이드바 없이 새 탭에서 노출)
   ======================================== */
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars } from '@mock/regulars.js';
import { supabase } from '@services/supabase.js';

// 탭 렌더러
import { renderBasicInfo } from './detail-tab-basic.js';
import { renderExtraInfo } from './detail-tab-extra.js';
import { renderPayment } from './detail-tab-payment.js';
import { renderMatchingInfo } from './detail-tab-matching.js';

// 분리된 모듈
import { renderDetailPage } from './detail-header.js';
import { bindEvents } from './detail-events.js';
import { bindModals } from './detail-modals.js';
import { bindHistoryPopup } from './detail-history.js';


// ── 초기화 ──
var content = document.getElementById('content');
var params = new URLSearchParams(window.location.search);
var rawId = params.get('id');
var isUUID = rawId && rawId.length > 10 && rawId.indexOf('-') > -1;


// ── 데이터 로드 ──
async function loadMember() {
  try {
    if (isUUID) {
      const { data, error } = await supabase
        .from('regulars')
        .select('*')
        .eq('id', rawId)
        .single();

      if (!error && data) {
        // snake_case → camelCase 자동 변환
        const member = Formatters.snakeToCamelObj(data);
        // 계산 필드 추가
        member.age = data.birth_date ? Formatters.age(data.birth_date) : '';
        // preferences JSON 파싱
        const prefs = typeof data.preferences === 'string' ? JSON.parse(data.preferences || '{}') : (data.preferences || {});
        Object.assign(member, {
          preferAge: prefs.preferAge || '-',
          preferHeight: prefs.preferHeight || '-',
          preferEdu: prefs.preferEdu || '-',
          preferReligion: prefs.preferReligion || '-',
          preferJob: prefs.preferJob || '-',
          preferRegion: prefs.preferRegion || '-',
          preferMarital: prefs.preferMarital || '-',
          preferEtc: prefs.preferEtc || '',
          introProfile: '',
          statusHistory: [],
          payments: [],
          contactLogs: [],
          matchHistory: [],
          photo: [],
        });
        return member;
      } else {
        console.error('[Regular Detail] Supabase 조회 오류:', error);
      }
    }
  } catch (e) {
    console.error('[Regular Detail] loadMember 오류:', e);
  }
  // Mock 폴백
  var numId = parseInt(rawId) || 1;
  return MockRegulars.find(function(r) { return r.id === numId || String(r.id) === rawId; }) || MockRegulars[0] || { name: '데이터 없음', memberId: '-', status: '-', brand: '-', program: '-', photo: [] };
}

var m = await loadMember();
console.log('[Regular Detail] 로드된 회원:', m?.name);


// ── 소송중 블라인드 처리 (법무팀/admin 제외) ──
const currentUserRole = localStorage.getItem('purples_user_role') || 'admin';
const LEGAL_SAFE_ROLES = ['admin', 'legal', 'director'];
if (m.marriageConfirm === '소송중' && !LEGAL_SAFE_ROLES.includes(currentUserRole)) {
  content.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;min-height:60vh">
      <div style="background:#fff;border:2px solid #dc2626;border-radius:16px;padding:48px;text-align:center;max-width:480px;box-shadow:0 8px 32px rgba(220,38,38,.15)">
        <div style="font-size:48px;margin-bottom:16px">🔒</div>
        <div style="font-size:20px;font-weight:800;color:#dc2626;margin-bottom:12px">법무팀 전담 응대 회원</div>
        <div style="font-size:14px;color:#991b1b;line-height:1.8;margin-bottom:24px">
          해당 회원은 현재 <strong>법무팀 전담 관리</strong> 상태입니다.<br>
          <strong>연락 및 결제 진행을 즉시 중단</strong>하시고,<br>
          법무팀에 문의해 주세요.
        </div>
        <div style="background:#fef2f2;border-radius:8px;padding:12px;font-size:12px;color:#b91c1c;margin-bottom:24px">
          ⚠️ 무단 응대 시 사규에 따라 조치될 수 있습니다.
        </div>
        <button class="btn btn--primary" onclick="history.back()" style="background:#dc2626;border-color:#dc2626">← 목록으로 돌아가기</button>
      </div>
    </div>
  `;
  throw new Error('LEGAL_BLOCK');
}


// ── 탭 렌더링 (에러 방지) ──
function safeRender(name, fn) {
  try { var result = fn(); console.log('[Detail] ✅ ' + name + ' 렌더 성공'); return result || ''; }
  catch(e) { console.error('[Detail] ❌ ' + name + ' 렌더 실패:', e); return '<div style="padding:20px;color:#ef4444;font-size:13px">⚠ ' + name + ' 렌더링 오류: ' + (e.message||e) + '</div>'; }
}

var tabs = {
  basic: safeRender('기본정보', function(){ return renderBasicInfo(m); }),
  extra: safeRender('추가정보', function(){ return renderExtraInfo(m); }),
  payment: safeRender('결제정보', function(){ return renderPayment(m); }),
  matching: safeRender('매칭관리', function(){ return renderMatchingInfo(m); }),
};


// ── 페이지 렌더링 ──
content.innerHTML = renderDetailPage(m, tabs);


// ── 탭 전환 ──
document.getElementById('detail-tabs').addEventListener('click', function(e) {
  var btn = e.target.closest('.tabs__btn');
  if (!btn) return;
  document.querySelectorAll('.tabs__btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
});


// ── 이벤트 바인딩 (분리된 모듈) ──
bindEvents(m);
bindModals(m);
bindHistoryPopup(m);
