/* ========================================
   회원분배 관리 페이지 v3 (최종 확정안)
   - 시스템 자동: 전화번호 형식 오류만 소스외
   - 관리자 수동 3탭: 신규/중복/기간만료(재컨텍)
   - 분배 이력 모니터링
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { MockAssociates, saveMemberChange } from '@mock/associates.js';
import { MockRegulars } from '@mock/regulars.js';
import { screenIncomingDB } from '@services/screening.service.js';
import { CONSULTANTS, BRANCHES, CONSULTANT_BRANCH } from '@config/constants.js';

initLayout({ pageId: 'member-distribute', breadcrumbs: ['회원분배'] });

let selectedIds = [];

function addDistHistory(name, manager) {
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem('purples_dist_history') || '[]'); } catch(e) {}
  hist.push({ name, manager, date: new Date().toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) });
  if (hist.length > 50) hist = hist.slice(-50);
  try { localStorage.setItem('purples_dist_history', JSON.stringify(hist)); } catch(e) {}
}

/** 소스외 이력 저장 */
function addScreeningLog(member, screenResult) {
  let logs = [];
  try { logs = JSON.parse(localStorage.getItem('purples_screening_log') || '[]'); } catch(e) {}
  logs.push({
    memberId: member.id,
    name: member.name,
    phone: member.phone,
    action: screenResult.action,
    reasons: screenResult.reasons,
    tags: screenResult.tags,
    existingManager: screenResult.existingMember?.consultant || null,
    date: new Date().toISOString(),
  });
  if (logs.length > 200) logs = logs.slice(-200);
  try { localStorage.setItem('purples_screening_log', JSON.stringify(logs)); } catch(e) {}
}

// 모든 회원에 대해 스크리닝 결과 캐시
const screeningCache = new Map();
function getScreening(member) {
  if (screeningCache.has(member.id)) return screeningCache.get(member.id);
  const result = screenIncomingDB(member);
  screeningCache.set(member.id, result);
  return result;
}

function getManagerStats() {
  const stats = {};
  CONSULTANTS.forEach(c => { stats[c] = { total: 0 }; });
  MockAssociates.forEach(m => {
    if (m.consultant && m.consultant !== '-' && stats[m.consultant]) {
      stats[m.consultant].total++;
    }
  });
  return stats;
}

// 통계 계산 (최종안: new/duplicate/recontact 분류)
function getScreeningStats() {
  let blocked = 0, newCount = 0, duplicate = 0, recontact = 0;
  const undist = MockAssociates.filter(m => !m.consultant || m.consultant === '-' || m.status === '컨텍전');
  undist.forEach(m => {
    const s = getScreening(m);
    if (s.action === 'block') blocked++;
    else if (s.routeTo === 'duplicate') duplicate++;
    else if (s.routeTo === 'recontact') recontact++;
    else newCount++;
  });
  return { blocked, newCount, duplicate, recontact, total: undist.length };
}

const content = document.getElementById('content');

const PAGE_SIZE = 20;
let currentPage = 1;
let currentTab = 'new'; // new | duplicate | recontact | history

function render() {
  const stats = getScreeningStats();
  const totalDist = MockAssociates.filter(m => m.consultant && m.consultant !== '-' && m.status !== '컨텍전').length;


  content.innerHTML = `
    <div class="page-header" style="margin-bottom:20px">
      <div>
        <h1 class="page-header__title">회원분배</h1>
        <p class="page-header__subtitle">미분배 준회원을 상담매니저에게 배정합니다</p>
      </div>
    </div>

    <!-- 탭 영역 -->
    <div class="std-tabs" id="dist-tabs">
      <button class="std-tab${currentTab==='new'?' active':''}" data-tab="new">
        신규 회원 분배 <span class="std-tab__count">${stats.newCount}</span>
      </button>
      <button class="std-tab${currentTab==='duplicate'?' active':''}" data-tab="duplicate">
        중복 회원 분배 <span class="std-tab__count std-tab__count--amber">${stats.duplicate}</span>
      </button>
      <button class="std-tab${currentTab==='recontact'?' active':''}" data-tab="recontact">
        기간만료 (재컨텍) <span class="std-tab__count std-tab__count--purple">${stats.recontact}</span>
      </button>
    </div>

    <!-- 검색 영역 (std-table 형식) -->
    <table class="std-table" id="filter-bar" style="margin-bottom:0;table-layout:fixed">
      <colgroup>
        <col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col>
      </colgroup>
      <tbody>
        <tr>
          <th>회원검색</th>
          <td colspan="3"><input type="text" class="form-input form-input--sm" id="member-search" placeholder="이름 또는 연락처 입력" style="width:100%"></td>
          <th>성별</th>
          <td>
            <div class="ms-wrap" id="ms-gender" data-placeholder="성별 전체">
              <div class="ms-trigger"><span class="ms-text">성별 전체</span><span class="ms-arrow">▾</span></div>
              <div class="ms-dropdown">
                <label class="ms-item"><input type="checkbox" value="남"> 남</label>
                <label class="ms-item"><input type="checkbox" value="여"> 여</label>
              </div>
            </div>
          </td>
          <th>학력</th>
          <td>
            <div class="ms-wrap" id="ms-edu" data-placeholder="학력 전체">
              <div class="ms-trigger"><span class="ms-text">학력 전체</span><span class="ms-arrow">▾</span></div>
              <div class="ms-dropdown">
                <label class="ms-item"><input type="checkbox" value="고졸"> 고졸</label>
                <label class="ms-item"><input type="checkbox" value="전문대 재중"> 전문대 재중</label><label class="ms-item"><input type="checkbox" value="전문대 중퇴"> 전문대 중퇴</label><label class="ms-item"><input type="checkbox" value="전문대 졸업"> 전문대 졸업</label>
                <label class="ms-item"><input type="checkbox" value="대학 재중"> 대학 재중</label><label class="ms-item"><input type="checkbox" value="대학 중퇴"> 대학 중퇴</label><label class="ms-item"><input type="checkbox" value="대학 졸업"> 대학 졸업</label>
                <label class="ms-item"><input type="checkbox" value="대학원 재중"> 대학원 재중</label><label class="ms-item"><input type="checkbox" value="대학원 중퇴"> 대학원 중퇴</label><label class="ms-item"><input type="checkbox" value="대학원 졸업"> 대학원 졸업</label>
                <label class="ms-item"><input type="checkbox" value="박사 과정"> 박사 과정</label><label class="ms-item"><input type="checkbox" value="박사 수료"> 박사 수료</label><label class="ms-item"><input type="checkbox" value="박사"> 박사</label>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <th>등록일</th>
          <td colspan="3">
            <div style="display:flex;gap:4px;align-items:center">
              <input type="date" class="form-input form-input--sm" id="filter-date-from" style="width:130px">
              <span style="font-size:11px;color:#94a3b8">~</span>
              <input type="date" class="form-input form-input--sm" id="filter-date-to" style="width:130px">
            </div>
          </td>
          <th>유입경로</th>
          <td>
            <div class="ms-wrap" id="ms-channel" data-placeholder="경로 전체">
              <div class="ms-trigger"><span class="ms-text">경로 전체</span><span class="ms-arrow">▾</span></div>
              <div class="ms-dropdown">
                <label class="ms-item"><input type="checkbox" value="카카오커플"> 카카오커플</label><label class="ms-item"><input type="checkbox" value="네이버커플"> 네이버커플</label>
                <label class="ms-item"><input type="checkbox" value="구글커플"> 구글커플</label><label class="ms-item"><input type="checkbox" value="블라인드커플"> 블라인드커플</label>
                <label class="ms-item"><input type="checkbox" value="실시간상담"> 실시간상담</label><label class="ms-item"><input type="checkbox" value="전화문의"> 전화문의</label>
                <label class="ms-item"><input type="checkbox" value="지인소개"> 지인소개</label><label class="ms-item"><input type="checkbox" value="기간만료(재컨텍)"> 기간만료(재컨텍)</label>
              </div>
            </div>
          </td>
          <th>지역</th>
          <td>
            <div class="ms-wrap" id="ms-region" data-placeholder="지역 전체">
              <div class="ms-trigger"><span class="ms-text">지역 전체</span><span class="ms-arrow">▾</span></div>
              <div class="ms-dropdown">
                <label class="ms-item"><input type="checkbox" value="서울"> 서울</label><label class="ms-item"><input type="checkbox" value="부산"> 부산</label>
                <label class="ms-item"><input type="checkbox" value="대구"> 대구</label><label class="ms-item"><input type="checkbox" value="광주"> 광주</label>
                <label class="ms-item"><input type="checkbox" value="인천"> 인천</label><label class="ms-item"><input type="checkbox" value="대전"> 대전</label>
                <label class="ms-item"><input type="checkbox" value="울산"> 울산</label><label class="ms-item"><input type="checkbox" value="경기"> 경기</label>
                <label class="ms-item"><input type="checkbox" value="강원"> 강원</label><label class="ms-item"><input type="checkbox" value="세종"> 세종</label>
                <label class="ms-item"><input type="checkbox" value="충북"> 충북</label><label class="ms-item"><input type="checkbox" value="충남"> 충남</label>
                <label class="ms-item"><input type="checkbox" value="경북"> 경북</label><label class="ms-item"><input type="checkbox" value="경남"> 경남</label>
                <label class="ms-item"><input type="checkbox" value="전북"> 전북</label><label class="ms-item"><input type="checkbox" value="전남"> 전남</label>
                <label class="ms-item"><input type="checkbox" value="제주"> 제주</label>
              </div>
            </div>
          </td>
        </tr>
        ${currentTab !== 'new' ? `<tr>
          <th>매니저</th>
          <td colspan="7">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <div style="position:relative;display:inline-block">
                <input type="text" class="form-input form-input--sm" id="mgr-search-input" placeholder="매니저 이름 입력" style="width:140px">
                <div class="mgr-autocomplete" id="mgr-autocomplete"></div>
              </div>
              <button class="mgr-modal-btn" id="btn-open-mgr-modal">매니저 선택</button>
              <div class="mgr-tags" id="mgr-tags"></div>
            </div>
          </td>
        </tr>` : ''}
      </tbody>
    </table>
    <div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px">
      <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
      <button class="btn btn--reset btn--sm" id="btn-filter-reset">초기화</button>
    </div>

    <!-- 리스트 영역 -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0 6px">
      <div style="font-size:13px;font-weight:600;color:var(--text-secondary)" id="dist-count"></div>
      <div style="display:flex;gap:6px" id="action-buttons"></div>
    </div>
    <table class="std-table" style="white-space:nowrap">
      <thead>
        <tr id="dist-thead-row"></tr>
      </thead>
      <tbody id="dist-tbody"></tbody>
    </table>
    <div id="dist-pagination" class="pagination"></div>

    <style>
      /* 폰트 13px 통일 */
      #filter-bar, #filter-bar th, #filter-bar td,
      .std-table, .std-table th, .std-table td { font-size: 13px; }

      .screening-tag {
        display: inline-flex; align-items: center; gap: 3px;
        font-size: 13px; padding: 2px 6px; border-radius: 4px;
        font-weight: 500; line-height: 1.4;
      }
      .screening-tag--block { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
      .screening-tag--alert { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
      .screening-tag--dup { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }

      .mgr-modal-btn {
        border: 1px solid var(--border-light); background: #fff; color: var(--text-primary);
        font-size: 11px; padding: 0 10px; height: 28px;
        cursor: pointer; border-radius: 2px; font-weight: 600;
        font-family: inherit; transition: background 0.1s;
      }
      .mgr-modal-btn:hover { background: #f1f3f5; border-color: var(--border-dark); }
      .mgr-autocomplete {
        position: absolute; top: 100%; left: 0; width: 180px;
        background: #fff; border: 1px solid var(--border-medium);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 100;
        max-height: 180px; overflow-y: auto; display: none;
      }
      .mgr-autocomplete.visible { display: block; }
      .mgr-ac-item {
        padding: 6px 10px; font-size: 11px; cursor: pointer;
        display: flex; align-items: center; gap: 6px;
        border-bottom: 1px solid #f1f3f5;
      }
      .mgr-ac-item:hover { background: #f0f4f8; }
      .mgr-ac-item__tag {
        font-size: 9px; color: #666; background: #f1f3f5;
        padding: 1px 4px;
      }
      .mgr-tags {
        display: flex; flex-wrap: wrap; gap: 3px; align-items: center;
      }
      .mgr-tag {
        display: inline-flex; align-items: center; gap: 3px;
        font-size: 10px; font-weight: 500; padding: 2px 8px;
        background: #e9ecef; color: var(--text-primary);
        border: 1px solid var(--border-light);
      }
      .mgr-tag__x {
        cursor: pointer; font-size: 11px; color: #888;
        margin-left: 2px; font-weight: 700; line-height: 1;
      }
      .mgr-tag__x:hover { color: #c53030; }

      /* ── 매니저 모달 ── */
      .mgr-modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.4);
        z-index: 9999; display: flex; align-items: center; justify-content: center;
      }
      .mgr-modal {
        background: #fff; border: 1px solid #999; width: 520px; max-height: 80vh;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15); display: flex; flex-direction: column;
      }
      .mgr-modal__head {
        padding: 10px 16px; border-bottom: 1px solid var(--border-light);
        display: flex; align-items: center; justify-content: space-between;
        background: #f8f9fa;
      }
      .mgr-modal__title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
      .mgr-modal__close {
        width: 28px; height: 28px; border: none; background: none;
        cursor: pointer; font-size: 14px; color: var(--text-muted);
        display: flex; align-items: center; justify-content: center;
      }
      .mgr-modal__close:hover { color: var(--text-primary); }
      .mgr-modal__body { display: flex; flex: 1; min-height: 0; }
      .mgr-modal__col {
        display: flex; flex-direction: column; flex: 1;
      }
      .mgr-modal__col--left { border-right: 1px solid var(--border-light); background: #f8f9fa; }
      .mgr-modal__col-head {
        padding: 6px 14px; font-size: 11px; font-weight: 700; color: var(--text-secondary);
        border-bottom: 1px solid var(--border-light); background: #f1f3f5;
      }
      .mgr-modal__scroll { overflow-y: auto; max-height: 320px; }
      .mgr-modal__item {
        display: flex; align-items: center; gap: 8px;
        padding: 6px 14px; font-size: 12px; cursor: pointer;
        border-bottom: 1px solid #f1f3f5; transition: background 0.1s;
        user-select: none; color: var(--text-primary);
      }
      .mgr-modal__item:hover { background: #f0f4f8; }
      .mgr-modal__item input[type="checkbox"] {
        width: 15px; height: 15px; accent-color: var(--accent); cursor: pointer;
      }
      .mgr-modal__item-name { flex: 1; font-weight: 500; }
      .mgr-modal__item-count {
        font-size: 10px; color: #888; background: #f1f3f5;
        padding: 1px 6px;
      }
      .mgr-modal__item-tag {
        font-size: 10px; color: var(--accent); background: #e9ecef;
        padding: 1px 6px;
      }
      .mgr-modal__item.checked { background: #f0f4f8; }
      .mgr-modal__empty {
        padding: 30px; text-align: center; font-size: 12px;
        color: #888;
      }
      .mgr-modal__foot {
        padding: 10px 16px; border-top: 1px solid var(--border-light);
        display: flex; align-items: center; justify-content: space-between;
        background: #f8f9fa;
      }
      .mgr-modal__foot-info { font-size: 11px; color: #666; }
      .mgr-modal__foot-info strong { color: var(--accent); }

      /* ── 멀티셀렉트 드롭다운 ── */
      .ms-wrap { position: relative; width: 100%; }
      .ms-trigger {
        display: flex; align-items: center; justify-content: space-between;
        padding: 4px 8px; border: 1px solid var(--border-medium);
        border-radius: 2px; font-size: 13px; cursor: pointer;
        background: #fff; min-height: 26px; gap: 4px;
        user-select: none;
      }
      .ms-trigger:hover { border-color: var(--border-dark); }
      .ms-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-primary); }
      .ms-text--placeholder { color: var(--text-muted); }
      .ms-arrow { font-size: 10px; color: #888; flex-shrink: 0; }
      .ms-dropdown {
        display: none; position: absolute; top: 100%; left: 0; right: 0;
        background: #fff; border: 1px solid var(--border-medium);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 200;
        max-height: 220px; overflow-y: auto;
      }
      .ms-wrap.open .ms-dropdown { display: block; }
      .ms-item {
        display: flex; align-items: center; gap: 6px;
        padding: 4px 10px; font-size: 12px; cursor: pointer;
        border-bottom: 1px solid #f5f5f5; user-select: none;
      }
      .ms-item:hover { background: #f0f4f8; }
      .ms-item input[type="checkbox"] {
        width: 14px; height: 14px; accent-color: var(--accent); cursor: pointer; margin: 0;
      }
    </style>
  `;

  initMultiSelects();
  bindTabEvents();
  applyFilter(true);
}

// 선택된 매니저 칩 상태
let selectedManagers = [];

function bindTabEvents() {
  document.querySelectorAll('.std-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.tab;
      selectedManagers = [];
      render();
    });
  });

  // 회원 검색
  const memberSearch = document.getElementById('member-search');
  if (memberSearch) memberSearch.addEventListener('input', () => applyFilter(true));

  // 매니저 검색 (자동완성)
  const mgrInput = document.getElementById('mgr-search-input');
  const acEl = document.getElementById('mgr-autocomplete');
  if (mgrInput && acEl) {
    mgrInput.addEventListener('input', function() {
      const q = this.value.trim().toLowerCase();
      if (!q) { acEl.classList.remove('visible'); return; }
      const matches = CONSULTANTS.filter(c => c.toLowerCase().includes(q) && !selectedManagers.includes(c));
      if (matches.length === 0) { acEl.classList.remove('visible'); return; }
      acEl.innerHTML = matches.map(c => {
        const branch = BRANCHES.find(b => b.code === CONSULTANT_BRANCH[c]);
        return `<div class="mgr-ac-item" data-mgr="${c}">
          <span>${c}</span>
          <span class="mgr-ac-item__tag">${branch?.name || ''}</span>
        </div>`;
      }).join('');
      acEl.classList.add('visible');
      acEl.querySelectorAll('.mgr-ac-item').forEach(item => {
        item.addEventListener('click', function() {
          if (!selectedManagers.includes(this.dataset.mgr)) selectedManagers.push(this.dataset.mgr);
          mgrInput.value = '';
          acEl.classList.remove('visible');
          updateMgrBadge();
          applyFilter(true);
        });
      });
    });
    mgrInput.addEventListener('blur', () => { setTimeout(() => acEl.classList.remove('visible'), 150); });
  }

  ['filter-date-from', 'filter-date-to'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => applyFilter(true));
  });

  // 매니저 모달 열기
  const mgrBtn = document.getElementById('btn-open-mgr-modal');
  if (mgrBtn) mgrBtn.addEventListener('click', openMgrModal);
  // 검색 버튼
  const searchBtn = document.getElementById('btn-search');
  if (searchBtn) searchBtn.addEventListener('click', () => applyFilter(true));

  // 초기화
  document.getElementById('btn-filter-reset').addEventListener('click', () => {
    if (memberSearch) memberSearch.value = '';
    if (mgrInput) mgrInput.value = '';
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value = '';
    // 멀티셀렉트 초기화
    document.querySelectorAll('.ms-wrap').forEach(wrap => {
      wrap.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      const textEl = wrap.querySelector('.ms-text');
      if (textEl) {
        textEl.textContent = wrap.dataset.placeholder;
        textEl.classList.add('ms-text--placeholder');
      }
    });
    selectedManagers = [];
    updateMgrBadge();
    applyFilter(true);
  });
}

/** 매니저 선택 모달 열기 */
function openMgrModal() {
  // 모달에서 사용할 임시 선택 상태
  let tempSelected = [...selectedManagers];
  let checkedBranches = [];

  const overlay = document.createElement('div');
  overlay.className = 'mgr-modal-overlay';
  overlay.innerHTML = `
    <div class="mgr-modal">
      <div class="mgr-modal__head">
        <div class="mgr-modal__title">매니저 선택</div>
        <button class="mgr-modal__close" id="mgr-modal-close">✕</button>
      </div>
      <div class="mgr-modal__body">
        <div class="mgr-modal__col mgr-modal__col--left">
          <div class="mgr-modal__col-head">지사 선택</div>
          <div class="mgr-modal__scroll" id="mm-branch-scroll">
            ${BRANCHES.map(b => {
              const cnt = CONSULTANTS.filter(c => CONSULTANT_BRANCH[c] === b.code).length;
              return `<label class="mgr-modal__item">
                <input type="checkbox" class="mm-branch-check" value="${b.code}">
                <span class="mgr-modal__item-name">${b.name}</span>
                <span class="mgr-modal__item-count">${cnt}명</span>
              </label>`;
            }).join('')}
          </div>
        </div>
        <div class="mgr-modal__col">
          <div class="mgr-modal__col-head">소속 매니저</div>
          <div class="mgr-modal__scroll" id="mm-mgr-scroll">
            <div class="mgr-modal__empty">지사를 선택하세요</div>
          </div>
        </div>
      </div>
      <div class="mgr-modal__foot">
        <div class="mgr-modal__foot-info" id="mm-foot-info">선택된 매니저 없음</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn--sm" id="mm-reset" style="font-size:11px;background:#f1f5f9;border:1px solid #e2e8f0;color:#475569">초기화</button>
          <button class="btn btn--sm" id="mm-confirm" style="font-size:11px;background:#0369a1;color:#fff;border:none;padding:6px 16px">선택 완료</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  function refreshMgrList() {
    const scroll = document.getElementById('mm-mgr-scroll');
    if (checkedBranches.length === 0) {
      scroll.innerHTML = `<div class="mgr-modal__empty">← 지사를 선택하세요</div>`;
      updateFootInfo();
      return;
    }
    let html = '';
    checkedBranches.forEach(code => {
      const branch = BRANCHES.find(b => b.code === code);
      CONSULTANTS.filter(c => CONSULTANT_BRANCH[c] === code).forEach(mgr => {
        const checked = tempSelected.includes(mgr);
        html += `<label class="mgr-modal__item${checked ? ' checked' : ''}">
          <input type="checkbox" class="mm-mgr-check" value="${mgr}" ${checked ? 'checked' : ''}>
          <span class="mgr-modal__item-name">${mgr}</span>
          <span class="mgr-modal__item-tag">${branch?.name || ''}</span>
        </label>`;
      });
    });
    scroll.innerHTML = html || `<div class="mgr-modal__empty">소속 매니저 없음</div>`;
    scroll.querySelectorAll('.mm-mgr-check').forEach(cb => {
      cb.addEventListener('change', function() {
        const mgr = this.value;
        if (this.checked) { if (!tempSelected.includes(mgr)) tempSelected.push(mgr); }
        else { tempSelected = tempSelected.filter(m => m !== mgr); }
        this.closest('.mgr-modal__item').classList.toggle('checked', this.checked);
        updateFootInfo();
      });
    });
    updateFootInfo();
  }

  function updateFootInfo() {
    const el = document.getElementById('mm-foot-info');
    if (!el) return;
    if (tempSelected.length > 0) {
      el.innerHTML = `<strong>${tempSelected.length}명</strong> 선택: ${tempSelected.slice(0,3).join(', ')}${tempSelected.length > 3 ? ` 외 ${tempSelected.length-3}명` : ''}`;
    } else {
      el.textContent = '선택된 매니저 없음';
    }
  }

  // 지사 체크 이벤트
  overlay.querySelectorAll('.mm-branch-check').forEach(cb => {
    cb.addEventListener('change', function() {
      if (this.checked) checkedBranches.push(this.value);
      else checkedBranches = checkedBranches.filter(c => c !== this.value);
      refreshMgrList();
    });
  });

  // 닫기
  document.getElementById('mgr-modal-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  // 초기화
  document.getElementById('mm-reset').addEventListener('click', () => {
    tempSelected = [];
    checkedBranches = [];
    overlay.querySelectorAll('.mm-branch-check').forEach(cb => { cb.checked = false; });
    refreshMgrList();
  });

  // 선택 완료
  document.getElementById('mm-confirm').addEventListener('click', () => {
    selectedManagers = [...tempSelected];
    updateMgrBadge();
    applyFilter(true);
    overlay.remove();
  });
}

/** 멀티셀렉트 드롭다운 초기화 */
function initMultiSelects() {
  document.querySelectorAll('.ms-wrap').forEach(wrap => {
    const trigger = wrap.querySelector('.ms-trigger');
    const textEl = wrap.querySelector('.ms-text');
    const placeholder = wrap.dataset.placeholder;

    // 트리거 클릭 시 열기/닫기
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      // 다른 열린 드롭다운 닫기
      document.querySelectorAll('.ms-wrap.open').forEach(w => {
        if (w !== wrap) w.classList.remove('open');
      });
      wrap.classList.toggle('open');
    });

    // 체크박스 변경 시
    wrap.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const checked = Array.from(wrap.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
        if (checked.length === 0) {
          textEl.textContent = placeholder;
          textEl.classList.add('ms-text--placeholder');
        } else {
          textEl.textContent = checked.length <= 3 ? checked.join(', ') : `${checked.slice(0,2).join(', ')} 외 ${checked.length - 2}개`;
          textEl.classList.remove('ms-text--placeholder');
        }
        applyFilter(true);
      });
    });

    // 드롭다운 내부 클릭 시 버블링 차단
    wrap.querySelector('.ms-dropdown').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

  // 외부 클릭 시 닫기
  document.addEventListener('click', () => {
    document.querySelectorAll('.ms-wrap.open').forEach(w => w.classList.remove('open'));
  });
}

/** 멀티셀렉트에서 선택된 값 배열 반환 */
function getMultiSelectValues(wrapperId) {
  const wrap = document.getElementById(wrapperId);
  if (!wrap) return [];
  return Array.from(wrap.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
}

/** 필터바의 매니저 태그 렌더링 */
function updateMgrBadge() {
  const tagsEl = document.getElementById('mgr-tags');
  if (!tagsEl) return;
  if (selectedManagers.length > 0) {
    tagsEl.innerHTML = selectedManagers.map(m =>
      `<span class="mgr-tag">${m}<span class="mgr-tag__x" data-mgr="${m}">×</span></span>`
    ).join('');
    tagsEl.querySelectorAll('.mgr-tag__x').forEach(x => {
      x.addEventListener('click', function(e) {
        e.stopPropagation();
        selectedManagers = selectedManagers.filter(m => m !== this.dataset.mgr);
        updateMgrBadge();
        applyFilter(true);
      });
    });
  } else {
    tagsEl.innerHTML = '';
  }
}

function applyFilter(resetPage) {
  if (resetPage) currentPage = 1;
  const search = (document.getElementById('member-search')?.value || '').trim().toLowerCase();
  const channels = getMultiSelectValues('ms-channel');
  const edus = getMultiSelectValues('ms-edu');
  const genders = getMultiSelectValues('ms-gender');
  const regions = getMultiSelectValues('ms-region');
  const dateFrom = document.getElementById('filter-date-from')?.value || '';
  const dateTo = document.getElementById('filter-date-to')?.value || '';
  let filtered = [];

  function getManagerName(m) {
    if (currentTab === 'duplicate') {
      const s = getScreening(m);
      return s.duplicateInfo?.existingManager || '';
    } else if (currentTab === 'history') {
      return m.consultant || '';
    } else if (currentTab === 'recontact') {
      return m.pastConsultant || '';
    }
    return '';
  }

  function matchFilters(m) {
    if (search && !m.name.toLowerCase().includes(search) && !m.phone.includes(search)) return false;
    if (channels.length > 0 && !channels.includes(m.channel)) return false;
    if (edus.length > 0 && !edus.includes(m.education)) return false;
    if (genders.length > 0 && !genders.includes(m.gender)) return false;
    if (regions.length > 0 && !regions.includes(m.region)) return false;
    if (dateFrom && m.registeredAt < dateFrom) return false;
    if (dateTo && m.registeredAt > dateTo + 'T23:59:59') return false;
    // 매니저 칩 다중선택 필터
    if (selectedManagers.length > 0 && !selectedManagers.includes(getManagerName(m))) return false;
    return true;
  }

  const undist = MockAssociates.filter(m => {
    if (m.consultant && m.consultant !== '-' && m.status !== '컨텍전') return false;
    return matchFilters(m);
  });
  if (currentTab === 'duplicate') {
    filtered = undist.filter(m => getScreening(m).routeTo === 'duplicate');
  } else if (currentTab === 'recontact') {
    filtered = undist.filter(m => getScreening(m).routeTo === 'recontact');
  } else {
    filtered = undist.filter(m => { const s = getScreening(m); return s.action !== 'block' && s.routeTo === 'new'; });
  }
  renderTable(filtered);
  renderActionButtons();
}

function renderActionButtons() {
  const btnArea = document.getElementById('action-buttons');
  if (!btnArea) return;
  const stats = getManagerStats();
  btnArea.innerHTML = `<select class="form-select form-input--sm" id="dist-mgr-select" style="height:28px;width:160px">
    <option value="">매니저 선택</option>
    ${CONSULTANTS.map(c => {
      const cnt = stats[c] ? stats[c].total : 0;
      return `<option value="${c}">${c} (${cnt}명)</option>`;
    }).join('')}
  </select>
  <button class="btn btn--primary btn--sm" id="btn-manual">상담매니저 등록</button>
  <button class="btn btn--outline btn--sm" id="btn-sourceout">소스외 처리</button>
  ${currentTab === 'recontact' ? '<button class="btn btn--outline btn--sm" id="btn-recall-reg">리콜대기 등록</button>' : ''}`;
  document.getElementById('btn-manual').addEventListener('click', handleManualDist);
  document.getElementById('btn-sourceout').addEventListener('click', () => Toast.show('소스외 처리 기능은 추후 구현 예정입니다.', 'info'));

  // 리콜대기등록 버튼
  const recallBtn = document.getElementById('btn-recall-reg');
  if (recallBtn) recallBtn.addEventListener('click', handleRecallRegister);
}

function renderTable(filtered) {
  const thead = document.getElementById('dist-thead-row');
  const tbody = document.getElementById('dist-tbody');
  const countEl = document.getElementById('dist-count');
  if (!thead || !tbody) return;

  const labels = { 'new': '신규 회원 분배', duplicate: '중복 회원 분배', recontact: '기간만료 (재컨텍)' };
  if (countEl) countEl.textContent = `${labels[currentTab]} ${filtered.length}건`;

  if (currentTab === 'duplicate') {
    thead.innerHTML = `<th style="width:30px"><input type="checkbox" id="dist-check-all"></th>
      <th style="width:40px">No</th><th>이름</th><th>성별</th><th>나이</th>
      <th>연락처</th><th>지역</th><th>유입경로</th><th>등록일</th><th>기존 담당자</th><th>현재 상태</th><th>최종 컨택일</th>`;
  } else if (currentTab === 'recontact') {
    thead.innerHTML = `<th style="width:30px"><input type="checkbox" id="dist-check-all"></th>
      <th style="width:40px">No</th><th>이름</th><th>성별</th><th>나이</th>
      <th>연락처</th><th>지역</th><th>등록일</th><th>과거 프로그램</th><th>미팅 횟수</th><th>총 결제액</th><th>클레임</th>`;
  } else {
    thead.innerHTML = `<th style="width:30px"><input type="checkbox" id="dist-check-all"></th>
      <th style="width:40px">No</th><th>이름</th><th>성별</th><th>나이</th>
      <th>연락처</th><th>지역</th><th>학력</th><th>유입경로</th><th>등록일</th>`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12" style="text-align:center;padding:40px;color:var(--text-muted)">조건에 맞는 회원이 없습니다.</td></tr>`;
    document.getElementById('dist-pagination').innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = paged.map((m, i) => {
    const screening = getScreening(m);
    const no = start + i + 1;

    if (currentTab === 'duplicate') {
      const info = screening.duplicateInfo || {};
      return `<tr>
        <td class="tc"><input type="checkbox" class="dist-check" value="${m.id}"></td>
        <td class="tc">${no}</td>
        <td class="tc"><a href="dist-detail.html?id=${m.id}" target="_blank" style="font-weight:600;color:var(--accent);text-decoration:none">${m.name}</a></td>
        <td class="tc">${m.gender}</td><td class="tc">${m.age}세</td>
        <td class="tc">${Formatters.phone(m.phone)}</td>
        <td class="tc">${m.region || '-'}</td>
        <td class="tc">${m.channel || '-'}</td><td class="tc">${Formatters.date(m.registeredAt)}</td>
        <td class="tc"><span style="font-weight:600;color:#d97706">${info.existingManager || '미배정'}</span></td>
        <td class="tc">${info.existingStatus || '-'}</td>
        <td class="tc">${info.lastContactAt ? Formatters.date(info.lastContactAt) : '-'}</td>
      </tr>`;
    }
    if (currentTab === 'recontact') {
      const info = screening.recontactInfo || {};
      return `<tr>
        <td class="tc"><input type="checkbox" class="dist-check" value="${m.id}"></td>
        <td class="tc">${no}</td>
        <td class="tc"><a href="../regular/detail.html?id=${m.id}" target="_blank" style="font-weight:600;color:var(--accent);text-decoration:none">${m.name}</a></td>
        <td class="tc">${m.gender}</td><td class="tc">${m.age}세</td>
        <td class="tc">${Formatters.phone(m.phone)}</td><td class="tc">${m.region || '-'}</td><td class="tc">${Formatters.date(m.registeredAt)}</td>
        <td class="tc">${info.program || '-'}</td>
        <td class="tc">${info.meetingCount || 0}회</td>
        <td class="tc">${info.totalPayment ? info.totalPayment.toLocaleString() + '원' : '-'}</td>
        <td class="tc">${info.hasClaim ? '<span style="color:#dc2626;font-weight:600">있음</span>' : '-'}</td>
      </tr>`;
    }
    // new
    return `<tr>
      <td class="tc"><input type="checkbox" class="dist-check" value="${m.id}"></td>
      <td class="tc">${no}</td>
      <td class="tc"><a href="dist-detail.html?id=${m.id}" target="_blank" style="font-weight:600;color:var(--accent);text-decoration:none">${m.name}</a></td>
      <td class="tc">${m.gender}</td><td class="tc">${m.age}세</td>
      <td class="tc">${Formatters.phone(m.phone)}</td>
      <td class="tc">${m.region || '-'}</td>
      <td class="tc">${m.education || '-'}</td>
      <td class="tc">${m.channel || '-'}</td><td class="tc">${Formatters.date(m.registeredAt)}</td>
    </tr>`;
  }).join('');

  // 체크박스 전체 선택
  const checkAll = document.getElementById('dist-check-all');
  if (checkAll) {
    checkAll.addEventListener('change', function() {
      document.querySelectorAll('.dist-check').forEach(c => { c.checked = this.checked; });
    });
  }

  // 페이지네이션
  const pagEl = document.getElementById('dist-pagination');
  if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
  let pagHtml = `<button class="pagination__btn" ${currentPage===1?'disabled':''} data-page="${currentPage-1}">◀ 이전</button>`;
  const maxShow = 10;
  let startP = Math.max(1, currentPage - Math.floor(maxShow/2));
  let endP = Math.min(totalPages, startP + maxShow - 1);
  if (endP - startP < maxShow - 1) startP = Math.max(1, endP - maxShow + 1);
  for (let p = startP; p <= endP; p++) {
    pagHtml += `<button class="pagination__btn${p===currentPage?' active':''}" data-page="${p}">${p}</button>`;
  }
  pagHtml += `<button class="pagination__btn" ${currentPage===totalPages?'disabled':''} data-page="${currentPage+1}">다음 ▶</button>`;
  pagEl.innerHTML = pagHtml;
  pagEl.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); applyFilter(); });
  });
}

function handleManualDist() {
  const checks = document.querySelectorAll('.dist-check:checked');
  selectedIds = [];
  checks.forEach(c => selectedIds.push(parseInt(c.value)));
  if (selectedIds.length === 0) { Toast.show('등록할 회원을 선택하세요.', 'warning'); return; }

  const manager = document.getElementById('dist-mgr-select')?.value;
  if (!manager) { Toast.show('매니저를 선택하세요.', 'warning'); return; }

  if (!confirm(`${selectedIds.length}명을 ${manager} 매니저에게 등록하시겠습니까?`)) return;

  const selected = MockAssociates.filter(m => selectedIds.includes(m.id));
  selected.forEach(m => {
    m.consultant = manager;
    m.distributedAt = new Date().toISOString();
    saveMemberChange(m.id, { consultant: m.consultant, distributedAt: m.distributedAt });
    addDistHistory(m.name, manager);

    const s = getScreening(m) || {};
    if (s.tags && s.tags.length > 0) {
      addScreeningLog(m, s);
    }
  });
  screeningCache.clear();
  Toast.show(`${selected.length}명이 ${manager} 매니저에게 등록되었습니다.`, 'success');
  render();
}

/** 리콜대기 등록 핸들러 */
function handleRecallRegister() {
  const checks = document.querySelectorAll('.dist-check:checked');
  const selectedIds = [];
  checks.forEach(c => selectedIds.push(parseInt(c.value)));
  if (selectedIds.length === 0) { Toast.show('리콜대기 등록할 회원을 선택하세요.', 'warning'); return; }

  // 선택된 회원의 recontactInfo 가져오기
  const targets = MockAssociates.filter(m => selectedIds.includes(m.id));
  const names = targets.map(m => m.name).join(', ');
  if (!confirm(names + ' 회원을 리콜대기로 등록하시겠습니까?\n정회원 > 리콜관리 리스트에 추가됩니다.')) return;

  targets.forEach(m => {
    const screening = getScreening(m);
    const info = screening.recontactInfo || {};
    // 정회원 MockRegulars에서 해당 회원 찾기 (이름+전화번호 매칭)
    let regular = MockRegulars.find(r => r.name === m.name);
    if (regular) {
      regular.status = '리콜대기';
      regular._esignStatus = '미발송';
      regular._esignDocId = null;
      regular._recallRegisteredAt = new Date().toISOString();
      if (!regular.statusHistory) regular.statusHistory = [];
      regular.statusHistory.push({
        date: new Date().toISOString(),
        from: '만료',
        to: '리콜대기',
        reason: '회원분배에서 리콜대기 등록',
        processor: '영업기획',
      });
    }
    // 분배 리스트에서 처리 완료 표시
    m.status = '리콜대기등록';
    m.consultant = '리콜관리';
  });

  screeningCache.clear();
  Toast.show(targets.length + '명이 리콜대기로 등록되었습니다. 정회원 > 리콜관리에서 확인하세요.', 'success');
  render();
}

render();
