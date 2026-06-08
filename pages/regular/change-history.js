/* ========================================
   정회원 - 변경이력 관리 (4탭 통합)
   탭: 매칭매니저 | 회원상태 | 미팅횟수 | 지사변경
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';

initLayout({ pageId: 'regular-change-history', breadcrumbs: ['정회원 관리', '변경이력 관리'] });

const content = document.getElementById('content');

/** 테이블 헤더 정렬 */
function bindSortableHeaders() {
  document.querySelectorAll('.sortable-th').forEach(th => {
    if (th.dataset.sortBound) return;
    th.dataset.sortBound = '1';
    th.style.cursor = 'pointer';
    th.style.userSelect = 'none';
    th.addEventListener('click', () => {
      const table = th.closest('table');
      const tbody = table?.querySelector('tbody');
      if (!tbody) return;
      const idx = Array.from(th.parentNode.children).indexOf(th);
      const rows = Array.from(tbody.querySelectorAll('tr'));
      const asc = th.dataset.sortDir !== 'asc';
      th.parentNode.querySelectorAll('.sortable-th').forEach(h => delete h.dataset.sortDir);
      th.dataset.sortDir = asc ? 'asc' : 'desc';
      const type = th.dataset.sortType || 'text';
      rows.sort((a, b) => {
        const av = (a.children[idx]?.textContent || '').trim();
        const bv = (b.children[idx]?.textContent || '').trim();
        if (type === 'num') return asc ? parseFloat(av) - parseFloat(bv) : parseFloat(bv) - parseFloat(av);
        if (type === 'date') return asc ? new Date(av) - new Date(bv) : new Date(bv) - new Date(av);
        return asc ? av.localeCompare(bv, 'ko') : bv.localeCompare(av, 'ko');
      });
      rows.forEach(r => tbody.appendChild(r));
    });
  });
}

/* ── Mock 데이터 ── */
const mockManagerChange = [
  { id: 1, name: '김서연', gender: '여', status: '활동', changeDate: '2026-05-20', prevManager: '이수진', newManager: '박태영', reason: '매니저 퇴사로 인한 재배정', processor: '최팀장' },
  { id: 2, name: '박준혁', gender: '남', status: '활동', changeDate: '2026-05-18', prevManager: '박태영', newManager: '김나리', reason: '고객 요청에 의한 변경', processor: '관리자' },
  { id: 3, name: '이하은', gender: '여', status: '보류', changeDate: '2026-05-15', prevManager: '김나리', newManager: '이수진', reason: '지사 이동', processor: '최팀장' },
  { id: 4, name: '최민수', gender: '남', status: '활동', changeDate: '2026-05-10', prevManager: '이수진', newManager: '박태영', reason: '담당 업무 조정', processor: '관리자' },
  { id: 5, name: '정유진', gender: '여', status: '활동', changeDate: '2026-05-05', prevManager: '박태영', newManager: '김나리', reason: '클레임 대응', processor: '최팀장' },
  { id: 6, name: '한소희', gender: '여', status: '정지', changeDate: '2026-04-28', prevManager: '김나리', newManager: '이수진', reason: '매니저 휴직 대체', processor: '관리자' },
];

const mockStatusChange = [
  { id: 1, name: '김서연', gender: '여', changeDate: '2026-05-22', prevStatus: '활동', newStatus: '보류', reason: '개인 사유 요청', processor: '이수진' },
  { id: 2, name: '박준혁', gender: '남', changeDate: '2026-05-20', prevStatus: '보류', newStatus: '활동', reason: '보류 해제 (재활동)', processor: '박태영' },
  { id: 3, name: '오세진', gender: '남', changeDate: '2026-05-18', prevStatus: '활동', newStatus: '정지', reason: '규정 위반 (3회 경고)', processor: '최팀장' },
  { id: 4, name: '윤지아', gender: '여', changeDate: '2026-05-15', prevStatus: '정지', newStatus: '활동', reason: '정지 해제 승인', processor: '관리자' },
  { id: 5, name: '한소희', gender: '여', changeDate: '2026-05-10', prevStatus: '활동', newStatus: '만료', reason: '계약 기간 종료', processor: '시스템' },
  { id: 6, name: '이하은', gender: '여', changeDate: '2026-05-08', prevStatus: '활동', newStatus: '보류', reason: '해외 출장 (3개월)', processor: '김나리' },
  { id: 7, name: '최민수', gender: '남', changeDate: '2026-05-05', prevStatus: '보류', newStatus: '활동', reason: '복귀 신청', processor: '이수진' },
];

const mockMeetingChange = [
  { id: 1, name: '김서연', gender: '여', changeDate: '2026-05-25', prevCount: 5, newCount: 6, reason: '미팅 진행 완료', processor: '이수진' },
  { id: 2, name: '박준혁', gender: '남', changeDate: '2026-05-23', prevCount: 3, newCount: 4, reason: '미팅 진행 완료', processor: '박태영' },
  { id: 3, name: '이하은', gender: '여', changeDate: '2026-05-20', prevCount: 2, newCount: 3, reason: '보너스 미팅 추가', processor: '최팀장' },
  { id: 4, name: '최민수', gender: '남', changeDate: '2026-05-18', prevCount: 7, newCount: 8, reason: '미팅 진행 완료', processor: '김나리' },
  { id: 5, name: '정유진', gender: '여', changeDate: '2026-05-15', prevCount: 4, newCount: 3, reason: '펑크 미팅 차감', processor: '관리자' },
];

const mockBranchChange = [
  { id: 1, name: '김서연', gender: '여', changeDate: '2026-05-20', prevBranch: '강남지사', newBranch: '서초지사', reason: '거주지 이동', processor: '관리자' },
  { id: 2, name: '박준혁', gender: '남', changeDate: '2026-05-15', prevBranch: '서초지사', newBranch: '분당지사', reason: '직장 이동', processor: '최팀장' },
  { id: 3, name: '오세진', gender: '남', changeDate: '2026-05-10', prevBranch: '분당지사', newBranch: '강남지사', reason: '고객 요청', processor: '관리자' },
];

/* ── 탭 상태 ── */
const tabs = [
  { key: 'manager',  label: '매칭매니저 변경', data: mockManagerChange },
  { key: 'status',   label: '회원상태 변경', data: mockStatusChange },
  { key: 'meeting',  label: '미팅횟수 변경', data: mockMeetingChange },
  { key: 'branch',   label: '지사 변경', data: mockBranchChange },
];

const params = new URLSearchParams(window.location.search);
let activeTab = params.get('tab') || 'manager';
if (!tabs.find(t => t.key === activeTab)) activeTab = 'manager';

/* ── 상태 뱃지 헬퍼 ── */
function statusBadge(status) {
  const map = {
    '활동': 'green', '보류': 'amber', '정지': 'red', '만료': 'gray',
    '탈회': 'red', '성혼': 'purple', '휴면': 'gray',
  };
  return `<span class="badge badge--${map[status] || 'gray'}" style="font-size:11px;padding:2px 10px;">${status}</span>`;
}

/* ── 메인 렌더 ── */
function render() {
  const totalAll = tabs.reduce((s, t) => s + t.data.length, 0);
  const activeData = tabs.find(t => t.key === activeTab)?.data || [];

  content.innerHTML = `
    <div class="page-header" style="margin-bottom:20px;">
      <div>
        <h1 class="page-header__title">변경이력 관리</h1>
        <p class="page-header__subtitle">정회원 관련 변경 이력을 통합 조회합니다.</p>
      </div>
    </div>

    <!-- 탭 (std-tabs 스타일) -->
    <div class="std-tabs" id="change-tabs">
      ${tabs.map(t => `
        <button class="std-tab${activeTab === t.key ? ' active' : ''}" data-tab="${t.key}">
          ${t.label} <span class="std-tab__count">${t.data.length}</span>
        </button>
      `).join('')}
    </div>

    <!-- 검색 필터 (std-table 형식) -->
    <div id="filter-area"></div>

    <!-- 통합 건수 요약 카드 -->
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin:16px 0;">
      <div class="card" style="text-align:center;padding:16px 12px;">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">전체 변경건수</div>
        <div style="font-size:24px;font-weight:800;color:var(--accent);">${totalAll}</div>
      </div>
      ${tabs.map(t => `
        <div class="card" style="text-align:center;padding:16px 12px;cursor:pointer;${activeTab === t.key ? 'background:var(--bg-subtle);' : ''}" data-tab-card="${t.key}">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">${t.label}</div>
          <div style="font-size:24px;font-weight:800;color:${activeTab === t.key ? 'var(--accent)' : 'var(--text-primary)'};">${t.data.length}</div>
        </div>
      `).join('')}
    </div>

    <!-- 결과 건수 -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0 6px;">
      <div style="font-size:13px;font-weight:600;color:var(--text-secondary);">조회 결과 <span style="color:var(--accent);">${activeData.length}</span>건</div>
    </div>

    <!-- 리스트 테이블 -->
    <div id="list-area"></div>
  `;

  renderFilter();
  renderList();
  bindTabEvents();
  bindFilterEvents();
}

/* ── 탭별 검색 필터 렌더 (std-table) ── */
function renderFilter() {
  const area = document.getElementById('filter-area');
  if (!area) return;

  let filterHtml = '';

  if (activeTab === 'manager') {
    filterHtml = `
    <table class="std-table" style="margin-bottom:0;table-layout:fixed;">
      <colgroup><col style="width:80px"><col><col style="width:80px"><col></colgroup>
      <tbody>
        <tr>
          <th>회원명</th>
          <td><input type="text" class="form-input form-input--sm filter-input" data-field="name" placeholder="회원명 검색" style="width:100%;"></td>
          <th>회원상태</th>
          <td>
            <select class="form-select form-input--sm filter-input" data-field="status" style="width:100%;">
              <option value="">전체</option>
              <option>활동</option><option>보류</option><option>정지</option><option>만료</option><option>리콜대기</option><option>리콜</option>
            </select>
          </td>
        </tr>
        <tr>
          <th>변경일</th>
          <td>
            <div style="display:flex;align-items:center;gap:4px;">
              <input type="date" class="form-input form-input--sm filter-input" data-field="dateFrom" style="width:130px;">
              <span style="font-size:11px;color:#94a3b8;">~</span>
              <input type="date" class="form-input form-input--sm filter-input" data-field="dateTo" style="width:130px;">
            </div>
          </td>
          <th>매니저</th>
          <td><input type="text" class="form-input form-input--sm filter-input" data-field="manager" placeholder="매니저명" style="width:100%;"></td>
        </tr>
      </tbody>
    </table>`;
  } else if (activeTab === 'status') {
    filterHtml = `
    <table class="std-table" style="margin-bottom:0;table-layout:fixed;">
      <colgroup><col style="width:80px"><col><col style="width:80px"><col></colgroup>
      <tbody>
        <tr>
          <th>회원명</th>
          <td><input type="text" class="form-input form-input--sm filter-input" data-field="name" placeholder="회원명 검색" style="width:100%;"></td>
          <th>변경상태</th>
          <td>
            <select class="form-select form-input--sm filter-input" data-field="status" style="width:100%;">
              <option value="">전체</option>
              <option>활동</option><option>보류</option><option>정지</option><option>만료</option><option>탈회</option><option>성혼</option><option>리콜대기</option><option>리콜</option>
            </select>
          </td>
        </tr>
        <tr>
          <th>변경일</th>
          <td colspan="3">
            <div style="display:flex;align-items:center;gap:4px;">
              <input type="date" class="form-input form-input--sm filter-input" data-field="dateFrom" style="width:130px;">
              <span style="font-size:11px;color:#94a3b8;">~</span>
              <input type="date" class="form-input form-input--sm filter-input" data-field="dateTo" style="width:130px;">
            </div>
          </td>
        </tr>
      </tbody>
    </table>`;
  } else {
    // meeting, branch 공통 간단 필터
    filterHtml = `
    <table class="std-table" style="margin-bottom:0;table-layout:fixed;">
      <colgroup><col style="width:80px"><col><col style="width:80px"><col></colgroup>
      <tbody>
        <tr>
          <th>회원명</th>
          <td><input type="text" class="form-input form-input--sm filter-input" data-field="name" placeholder="회원명 검색" style="width:100%;"></td>
          <th>변경일</th>
          <td>
            <div style="display:flex;align-items:center;gap:4px;">
              <input type="date" class="form-input form-input--sm filter-input" data-field="dateFrom" style="width:130px;">
              <span style="font-size:11px;color:#94a3b8;">~</span>
              <input type="date" class="form-input form-input--sm filter-input" data-field="dateTo" style="width:130px;">
            </div>
          </td>
        </tr>
      </tbody>
    </table>`;
  }

  filterHtml += `
    <div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px;">
      <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
      <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
    </div>`;

  area.innerHTML = filterHtml;
}

/* ── 리스트 테이블 렌더 ── */
function renderList() {
  const area = document.getElementById('list-area');
  if (!area) return;

  let html = '';

  if (activeTab === 'manager') {
    html = `
    <table class="std-table" style="white-space:nowrap;">
      <thead><tr>
        <th class="sortable-th" data-sort-type="num" style="width:50px;text-align:center;">번호</th>
        <th class="sortable-th" data-sort-type="text">회원명(성별)</th>
        <th>회원상태</th>
        <th class="sortable-th" data-sort-type="date">변경일</th>
        <th class="sortable-th" data-sort-type="text">변경전 매칭매니저</th>
        <th class="sortable-th" data-sort-type="text">변경후 매칭매니저</th>
        <th>변경사유</th>
        <th class="sortable-th" data-sort-type="text">처리자</th>
      </tr></thead>
      <tbody>
        ${mockManagerChange.map((d, i) => `<tr>
          <td class="tc">${i + 1}</td>
          <td class="tc"><strong>${d.name}</strong> <span style="color:${d.gender === '남' ? '#3b82f6' : '#ec4899'};font-size:11px;">(${d.gender})</span></td>
          <td class="tc">${statusBadge(d.status)}</td>
          <td class="tc">${Formatters.date(d.changeDate)}</td>
          <td class="tc">${d.prevManager}</td>
          <td class="tc"><strong style="color:var(--accent);">${d.newManager}</strong></td>
          <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${d.reason}">${d.reason}</td>
          <td class="tc">${d.processor}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  } else if (activeTab === 'status') {
    html = `
    <table class="std-table" style="white-space:nowrap;">
      <thead><tr>
        <th class="sortable-th" data-sort-type="num" style="width:50px;text-align:center;">번호</th>
        <th class="sortable-th" data-sort-type="text">회원명(성별)</th>
        <th class="sortable-th" data-sort-type="date">변경일</th>
        <th>변경전 상태</th>
        <th>변경후 상태</th>
        <th>변경사유</th>
        <th class="sortable-th" data-sort-type="text">처리자</th>
      </tr></thead>
      <tbody>
        ${mockStatusChange.map((d, i) => `<tr>
          <td class="tc">${i + 1}</td>
          <td class="tc"><strong>${d.name}</strong> <span style="color:${d.gender === '남' ? '#3b82f6' : '#ec4899'};font-size:11px;">(${d.gender})</span></td>
          <td class="tc">${Formatters.date(d.changeDate)}</td>
          <td class="tc">${statusBadge(d.prevStatus)}</td>
          <td class="tc">${statusBadge(d.newStatus)}</td>
          <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${d.reason}">${d.reason}</td>
          <td class="tc">${d.processor}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  } else if (activeTab === 'meeting') {
    html = `
    <table class="std-table" style="white-space:nowrap;">
      <thead><tr>
        <th class="sortable-th" data-sort-type="num" style="width:50px;text-align:center;">번호</th>
        <th class="sortable-th" data-sort-type="text">회원명(성별)</th>
        <th class="sortable-th" data-sort-type="date">변경일</th>
        <th class="sortable-th" data-sort-type="num">변경전 횟수</th>
        <th class="sortable-th" data-sort-type="num">변경후 횟수</th>
        <th>증감</th>
        <th>변경사유</th>
        <th class="sortable-th" data-sort-type="text">처리자</th>
      </tr></thead>
      <tbody>
        ${mockMeetingChange.map((d, i) => {
          const diff = d.newCount - d.prevCount;
          const diffColor = diff > 0 ? '#16a34a' : diff < 0 ? '#dc2626' : '#64748b';
          const diffText = diff > 0 ? `+${diff}` : `${diff}`;
          return `<tr>
            <td class="tc">${i + 1}</td>
            <td class="tc"><strong>${d.name}</strong> <span style="color:${d.gender === '남' ? '#3b82f6' : '#ec4899'};font-size:11px;">(${d.gender})</span></td>
            <td class="tc">${Formatters.date(d.changeDate)}</td>
            <td class="tc">${d.prevCount}회</td>
            <td class="tc" style="font-weight:700;">${d.newCount}회</td>
            <td class="tc" style="font-weight:700;color:${diffColor};">${diffText}</td>
            <td style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${d.reason}">${d.reason}</td>
            <td class="tc">${d.processor}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  } else if (activeTab === 'branch') {
    html = `
    <table class="std-table" style="white-space:nowrap;">
      <thead><tr>
        <th class="sortable-th" data-sort-type="num" style="width:50px;text-align:center;">번호</th>
        <th class="sortable-th" data-sort-type="text">회원명(성별)</th>
        <th class="sortable-th" data-sort-type="date">변경일</th>
        <th class="sortable-th" data-sort-type="text">변경전 지사</th>
        <th class="sortable-th" data-sort-type="text">변경후 지사</th>
        <th>변경사유</th>
        <th class="sortable-th" data-sort-type="text">처리자</th>
      </tr></thead>
      <tbody>
        ${mockBranchChange.map((d, i) => `<tr>
          <td class="tc">${i + 1}</td>
          <td class="tc"><strong>${d.name}</strong> <span style="color:${d.gender === '남' ? '#3b82f6' : '#ec4899'};font-size:11px;">(${d.gender})</span></td>
          <td class="tc">${Formatters.date(d.changeDate)}</td>
          <td class="tc">${d.prevBranch}</td>
          <td class="tc"><strong style="color:var(--accent);">${d.newBranch}</strong></td>
          <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${d.reason}">${d.reason}</td>
          <td class="tc">${d.processor}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
  }

  area.innerHTML = html;
  bindSortableHeaders();
}

/* ── 탭 이벤트 ── */
function bindTabEvents() {
  // 탭 버튼 클릭
  document.querySelectorAll('.std-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      const url = new URL(window.location);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url);
      render();
    });
  });
  // 요약 카드 클릭
  document.querySelectorAll('[data-tab-card]').forEach(card => {
    card.addEventListener('click', () => {
      activeTab = card.dataset.tabCard;
      const url = new URL(window.location);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url);
      render();
    });
  });
}

function bindFilterEvents() {
  document.getElementById('btn-search')?.addEventListener('click', () => {
    // 필터 로직은 실제 API 연결 시 구현 — 현재는 전체 데이터 표시
    renderFilter();
    renderList();
  });
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    document.querySelectorAll('.filter-input').forEach(el => {
      if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = '';
    });
    renderFilter();
    renderList();
  });
}

/* ── 초기화 ── */
render();
