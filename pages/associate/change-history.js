/* ========================================
   준회원 - 담당자(상담매니저) 변경이력 조회
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';

initLayout({ pageId: 'associate-change-history', breadcrumbs: ['준회원 관리', '담당자 변경이력'] });

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
const mockData = [
  { id: 1, memberName: '김서연', prevConsultant: '이미영', assignDate: '2026-04-10', newConsultant: '박지현', changeDate: '2026-05-15', processor: '최팀장', reason: '지사 이동에 따른 담당자 변경' },
  { id: 2, memberName: '박준혁', prevConsultant: '정수민', assignDate: '2026-03-22', newConsultant: '이미영', changeDate: '2026-05-12', processor: '최팀장', reason: '매니저 퇴사로 인한 재배정' },
  { id: 3, memberName: '이하은', prevConsultant: '김태연', assignDate: '2026-02-05', newConsultant: '정수민', changeDate: '2026-05-10', processor: '관리자', reason: '고객 요청에 의한 담당자 변경' },
  { id: 4, memberName: '최민수', prevConsultant: '박지현', assignDate: '2026-01-18', newConsultant: '김태연', changeDate: '2026-05-08', processor: '최팀장', reason: '담당 업무 조정' },
  { id: 5, memberName: '정유진', prevConsultant: '이미영', assignDate: '2026-04-25', newConsultant: '박지현', changeDate: '2026-05-05', processor: '관리자', reason: '상담 스케줄 조정' },
  { id: 6, memberName: '한소희', prevConsultant: '정수민', assignDate: '2026-03-10', newConsultant: '이미영', changeDate: '2026-04-28', processor: '최팀장', reason: '지사 통합에 따른 재배정' },
  { id: 7, memberName: '오세진', prevConsultant: '김태연', assignDate: '2026-02-20', newConsultant: '정수민', changeDate: '2026-04-22', processor: '최팀장', reason: '고객 클레임 대응' },
  { id: 8, memberName: '윤지아', prevConsultant: '박지현', assignDate: '2026-01-05', newConsultant: '김태연', changeDate: '2026-04-15', processor: '관리자', reason: '매니저 휴직 대체' },
];

let filteredData = [...mockData];

/* ── 렌더링 ── */
function render() {
  content.innerHTML = `
    <div class="page-header" style="margin-bottom:20px;">
      <div>
        <h1 class="page-header__title">담당자 변경이력</h1>
        <p class="page-header__subtitle">준회원 상담매니저 변경 내역을 조회합니다.</p>
      </div>
      <div style="display:flex;gap:8px;">
        <span class="badge badge--blue" style="font-size:12px;padding:6px 14px;">전체 ${mockData.length}건</span>
      </div>
    </div>

    <table class="std-table" style="margin-bottom:0;table-layout:fixed;">
      <colgroup>
        <col style="width:80px"><col><col style="width:80px"><col>
      </colgroup>
      <tbody>
        <tr>
          <th>회원명</th>
          <td><input type="text" class="form-input form-input--sm" id="filter-name" placeholder="회원명 검색" style="width:100%;"></td>
          <th>상담매니저</th>
          <td><input type="text" class="form-input form-input--sm" id="filter-consultant" placeholder="매니저명 검색" style="width:100%;"></td>
        </tr>
        <tr>
          <th>분배일</th>
          <td>
            <div style="display:flex;align-items:center;gap:4px;">
              <input type="date" class="form-input form-input--sm" id="filter-assign-from" style="width:130px;">
              <span style="font-size:11px;color:#94a3b8;">~</span>
              <input type="date" class="form-input form-input--sm" id="filter-assign-to" style="width:130px;">
            </div>
          </td>
          <th>변경일</th>
          <td>
            <div style="display:flex;align-items:center;gap:4px;">
              <input type="date" class="form-input form-input--sm" id="filter-change-from" style="width:130px;">
              <span style="font-size:11px;color:#94a3b8;">~</span>
              <input type="date" class="form-input form-input--sm" id="filter-change-to" style="width:130px;">
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px;">
      <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
      <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
    </div>

    <!-- 결과 테이블 -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0 6px;">
      <div style="font-size:13px;font-weight:600;color:var(--text-secondary);">조회 결과 <span style="color:var(--accent);">${filteredData.length}</span>건</div>
      <button class="btn btn--outline btn--sm" id="btn-export">엑셀 다운로드</button>
    </div>
    <table class="std-table" style="white-space:nowrap;">
      <thead>
        <tr>
          <th class="sortable-th" data-sort-type="num" style="width:50px;text-align:center;">번호</th>
          <th class="sortable-th" data-sort-type="text">회원명</th>
          <th class="sortable-th" data-sort-type="text">이전 상담매니저</th>
          <th class="sortable-th" data-sort-type="date">분배일</th>
          <th class="sortable-th" data-sort-type="text">변경 담당매니저</th>
          <th class="sortable-th" data-sort-type="date">변경일</th>
          <th class="sortable-th" data-sort-type="text">처리자</th>
          <th>변경사유</th>
        </tr>
      </thead>
      <tbody>
        ${filteredData.length === 0 ? `
          <tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted);">검색 결과가 없습니다.</td></tr>
        ` : filteredData.map((d, i) => `
          <tr>
            <td class="tc">${i + 1}</td>
            <td class="tc"><strong>${d.memberName}</strong></td>
            <td class="tc">${d.prevConsultant}</td>
            <td class="tc">${Formatters.date(d.assignDate)}</td>
            <td class="tc"><strong style="color:var(--accent);">${d.newConsultant}</strong></td>
            <td class="tc">${Formatters.date(d.changeDate)}</td>
            <td class="tc">${d.processor}</td>
            <td class="tc" style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${d.reason}">${d.reason}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  bindEvents();
  bindSortableHeaders();
}

/* ── 이벤트 ── */
function bindEvents() {
  document.getElementById('btn-search')?.addEventListener('click', applyFilter);
  document.getElementById('btn-reset')?.addEventListener('click', resetFilter);
  document.getElementById('btn-export')?.addEventListener('click', () => {
    alert('엑셀 다운로드 기능은 추후 지원 예정입니다.');
  });
}

function applyFilter() {
  const name = document.getElementById('filter-name')?.value.trim().toLowerCase();
  const consultant = document.getElementById('filter-consultant')?.value.trim().toLowerCase();
  const assignFrom = document.getElementById('filter-assign-from')?.value;
  const assignTo = document.getElementById('filter-assign-to')?.value;
  const changeFrom = document.getElementById('filter-change-from')?.value;
  const changeTo = document.getElementById('filter-change-to')?.value;

  filteredData = mockData.filter(d => {
    if (name && !d.memberName.toLowerCase().includes(name)) return false;
    if (consultant && !d.prevConsultant.toLowerCase().includes(consultant) && !d.newConsultant.toLowerCase().includes(consultant)) return false;
    if (assignFrom && d.assignDate < assignFrom) return false;
    if (assignTo && d.assignDate > assignTo) return false;
    if (changeFrom && d.changeDate < changeFrom) return false;
    if (changeTo && d.changeDate > changeTo) return false;
    return true;
  });

  render();
}

function resetFilter() {
  filteredData = [...mockData];
  render();
}

/* ── 초기화 ── */
render();
