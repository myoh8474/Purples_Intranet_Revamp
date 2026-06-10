/* ========================================
   회원분배 내역조회 페이지
   - 분배 완료된 회원 이력 조회
   - 기간별/매니저별 필터링
   - 컬럼 정렬 (오름/내림차순)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, BRANCHES, CONSULTANT_BRANCH, ASSOCIATE_STATUSES } from '@config/constants.js';
import { ManagerPicker, renderManagerPickerHTML, getManagerPickerStyles } from '@components/ManagerPicker.js';

initLayout({ pageId: 'member-distribute-history', breadcrumbs: ['회원분배', '회원분배내역조회'] });

const PAGE_SIZE = 20;
let currentPage = 1;
let sortKey = 'distributedAt';  // 기본 정렬 기준: 분배일
let sortDir = 'desc';           // 기본 정렬 방향: 최신순
let mgrPicker = null;

// 컬럼 정의 (key: 데이터 필드, label: 표시명, sortable: 정렬 가능 여부)
const COLUMNS = [
  { key: 'no',            label: 'No',       sortable: false, width: '40px', align: 'center' },
  { key: 'name',          label: '이름',      sortable: false },
  { key: 'distMethod',    label: '분배방식',   sortable: false, align: 'center' },
  { key: 'channel',       label: '유입구분',   sortable: false, align: 'center' },
  { key: 'gender',        label: '성별',      sortable: false, align: 'center' },
  { key: 'age',           label: '나이',      sortable: false, align: 'center' },
  { key: 'phone',         label: '연락처',    sortable: false },
  { key: 'channel_raw',   label: '유입경로',   sortable: false },
  { key: 'registeredAt',  label: '등록일',    sortable: true },
  { key: 'distributedAt', label: '분배일',    sortable: true },
  { key: 'consultant',    label: '담당매니저', sortable: false },
  { key: 'status',        label: '현재 상태', sortable: false, align: 'center' },
];

function render() {
  const app = document.getElementById('app');
  const main = app.querySelector('main') || app;
  const container = main.querySelector ? (main.querySelector('.content-area') || main) : main;

  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">회원분배내역조회</h2>
      <p class="page-header__desc">분배 완료된 회원의 이력을 조회합니다.</p>
    </div>

    <!-- 검색 영역 (std-table 형식) -->
    <table class="std-table" id="filter-bar" style="margin-bottom:0;table-layout:fixed">
      <colgroup>
        <col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col>
      </colgroup>
      <tbody>
        <tr>
          <th>회원검색</th>
          <td colspan="3"><input type="text" class="form-input form-input--sm" id="h-search" placeholder="이름 또는 연락처 입력" style="width:100%"></td>
          <th>분배방식</th>
          <td>
            <div class="select-wrap"><select class="form-select form-input--sm" id="h-distmethod" style="width:100%">
              <option value="">분배방식 전체</option>
              <option value="자동분배">자동분배</option>
              <option value="수동분배">수동분배</option>
            </select></div>
          </td>
          <th>유입구분</th>
          <td>
            <div class="select-wrap"><select class="form-select form-input--sm" id="h-dtype" style="width:100%">
              <option value="">유입구분 전체</option>
              <option value="신규">신규</option>
              <option value="기간만료">기간만료</option>
              <option value="중복">중복</option>
            </select></div>
          </td>
        </tr>
        <tr>
          <th>등록일</th>
          <td colspan="3">
            <div style="display:flex;gap:4px;align-items:center">
              <input type="date" class="form-input form-input--sm" id="h-reg-from" style="width:130px">
              <span style="font-size:11px;color:#94a3b8">~</span>
              <input type="date" class="form-input form-input--sm" id="h-reg-to" style="width:130px">
            </div>
          </td>
          <th>분배일</th>
          <td colspan="3">
            <div style="display:flex;gap:4px;align-items:center">
              <input type="date" class="form-input form-input--sm" id="h-dist-from" style="width:130px">
              <span style="font-size:11px;color:#94a3b8">~</span>
              <input type="date" class="form-input form-input--sm" id="h-dist-to" style="width:130px">
            </div>
          </td>
        </tr>
        <tr>
          <th>성별</th>
          <td>
            <div class="select-wrap"><select class="form-select form-input--sm" id="h-gender" style="width:100%">
              <option value="">성별 전체</option>
              <option value="남">남</option><option value="여">여</option>
            </select></div>
          </td>
          <th>유입경로</th>
          <td>
            <div class="select-wrap"><select class="form-select form-input--sm" id="h-channel" style="width:100%">
              <option value="">경로 전체</option>
              <option value="카카오커플">카카오커플</option><option value="네이버커플">네이버커플</option>
              <option value="구글커플">구글커플</option><option value="블라인드커플">블라인드커플</option>
              <option value="실시간상담">실시간상담</option><option value="전화문의">전화문의</option>
              <option value="지인소개">지인소개</option><option value="기간만료(재컨텍)">기간만료(재컨텍)</option>
            </select></div>
          </td>
          <th>상태</th>
          <td>
            <div class="select-wrap"><select class="form-select form-input--sm" id="h-status" style="width:100%">
              <option value="">상태 전체</option>
              ${ASSOCIATE_STATUSES.filter(s => s !== '컨텍전').map(s => `<option value="${s}">${s}</option>`).join('')}
            </select></div>
          </td>
          <th>매니저</th>
          <td>
            ${renderManagerPickerHTML('hmgr')}
          </td>
        </tr>
      </tbody>
    </table>
    <div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px">
      <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
      <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
    </div>

    <!-- 리스트 영역 -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0 6px">
      <div style="font-size:13px;font-weight:600;color:var(--text-secondary)" id="h-count"></div>
    </div>
    <table class="std-table" style="white-space:nowrap">
      <thead>
        <tr id="h-thead-row"></tr>
      </thead>
      <tbody id="h-tbody"></tbody>
    </table>
    <div id="h-pagination" class="pagination"></div>

    <style>
      .page-header { margin-bottom: 20px; }
      .page-header__title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
      .page-header__desc { font-size: 13px; color: var(--text-muted); margin: 0; }

      /* 폰트 13px 통일 */
      #filter-bar, #filter-bar th, #filter-bar td,
      .std-table, .std-table th, .std-table td { font-size: 13px; }

      /* 정렬 헤더 */
      .sortable-th {
        cursor: pointer; user-select: none; white-space: nowrap;
        transition: background 0.15s;
      }
      .sortable-th:hover { background: rgba(0,0,0,0.04); }
      .sort-icon {
        display: inline-block; margin-left: 3px; font-size: 9px;
        color: #94a3b8; vertical-align: middle;
      }
      .sort-icon--active { color: #0369a1; font-weight: 700; }
      ${getManagerPickerStyles()}
    </style>
  `;

  renderThead();
  applyFilter();
  bindEvents();
}

function renderThead() {
  const theadRow = document.getElementById('h-thead-row');
  if (!theadRow) return;
  theadRow.innerHTML = COLUMNS.map(col => {
    if (!col.sortable) {
      return `<th style="${col.width ? 'width:'+col.width : ''}">${col.label}</th>`;
    }
    const isActive = sortKey === col.key;
    const arrow = isActive
      ? (sortDir === 'asc' ? '▲' : '▼')
      : '▲▼';
    const activeClass = isActive ? ' sort-icon--active' : '';
    return `<th class="sortable-th" data-sort="${col.key}" style="${col.width ? 'width:'+col.width : ''}">
      ${col.label}<span class="sort-icon${activeClass}">${arrow}</span>
    </th>`;
  }).join('');

  // 정렬 이벤트
  theadRow.querySelectorAll('.sortable-th').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (sortKey === key) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey = key;
        sortDir = 'asc';
      }
      currentPage = 1;
      renderThead();
      applyFilter();
    });
  });
}

function applyFilter() {
  const search = (document.getElementById('h-search')?.value || '').trim().toLowerCase();
  const manager = mgrPicker ? mgrPicker.getSelected() : [];
  const distmethod = document.getElementById('h-distmethod')?.value || '';
  const dtype = document.getElementById('h-dtype')?.value || '';
  const channel = document.getElementById('h-channel')?.value || '';
  const gender = document.getElementById('h-gender')?.value || '';
  const status = document.getElementById('h-status')?.value || '';
  const regFrom = document.getElementById('h-reg-from')?.value || '';
  const regTo = document.getElementById('h-reg-to')?.value || '';
  const distFrom = document.getElementById('h-dist-from')?.value || '';
  const distTo = document.getElementById('h-dist-to')?.value || '';

  let filtered = MockAssociates.filter(m => {
    if (!(m.consultant && m.consultant !== '-' && m.status !== '컨텍전')) return false;
    if (search && !m.name.toLowerCase().includes(search) && !m.phone.includes(search)) return false;
    if (distmethod && (m.distMethod || '수동분배') !== distmethod) return false;
    if (dtype) {
      const mType = m.isDuplicate ? '중복' : (m.channel === '기간만료(재컨텍)' ? '기간만료' : '신규');
      if (mType !== dtype) return false;
    }
    if (channel && m.channel !== channel) return false;
    if (gender && m.gender !== gender) return false;
    if (status && m.status !== status) return false;
    if (manager.length > 0 && !manager.includes(m.consultant)) return false;
    if (regFrom && m.registeredAt < regFrom) return false;
    if (regTo && m.registeredAt > regTo + 'T23:59:59') return false;
    if (distFrom && (m.distributedAt || '') < distFrom) return false;
    if (distTo && (m.distributedAt || '') > distTo + 'T23:59:59') return false;
    return true;
  });

  // 정렬 적용
  filtered.sort((a, b) => {
    let va, vb;
    if (sortKey === 'age') {
      va = parseInt(a.age) || 0;
      vb = parseInt(b.age) || 0;
    } else if (sortKey === 'channel') {
      // 유입구분: 중복/기간만료/신규
      va = a.isDuplicate ? '중복' : (a.channel === '기간만료(재컨텍)' ? '기간만료' : '신규');
      vb = b.isDuplicate ? '중복' : (b.channel === '기간만료(재컨텍)' ? '기간만료' : '신규');
    } else if (sortKey === 'channel_raw') {
      va = a.channel || '';
      vb = b.channel || '';
    } else {
      va = a[sortKey] || '';
      vb = b[sortKey] || '';
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable(filtered);
}

function renderTable(filtered) {
  const tbody = document.getElementById('h-tbody');
  const countEl = document.getElementById('h-count');
  if (!tbody) return;

  if (countEl) countEl.textContent = `분배내역 ${filtered.length}건`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${COLUMNS.length}" style="text-align:center;padding:40px;color:var(--text-muted)">조건에 맞는 회원이 없습니다.</td></tr>`;
    document.getElementById('h-pagination').innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = paged.map((m, i) => {
    const no = start + i + 1;
    const dtype = m.isDuplicate ? '중복' : (m.channel === '기간만료(재컨텍)' ? '기간만료' : '신규');
    const dtTag = dtype === '중복'
      ? '<span style="font-weight:600;color:#dc2626">중복</span>'
      : dtype === '기간만료'
        ? '<span style="font-weight:600;color:#7c3aed">기간만료</span>'
        : '<span style="font-weight:600;color:#16a34a">신규</span>';
    const dm = m.distMethod || '수동분배';
    const dmTag = dm === '자동분배'
      ? '<span style="font-weight:600;color:#1d4ed8">자동</span>'
      : '<span style="font-weight:600;color:#a16207">수동</span>';
    return `<tr>
      <td class="tc">${no}</td>
      <td class="tc"><a href="dist-detail.html?id=${m.id}" target="_blank" style="font-weight:600;color:var(--accent);text-decoration:none">${m.name}</a></td>
      <td class="tc">${dmTag}</td>
      <td class="tc">${dtTag}</td>
      <td class="tc">${m.gender}</td>
      <td class="tc">${m.age}세</td>
      <td class="tc">${Formatters.phone(m.phone)}</td>
      <td class="tc">${m.channel || '-'}</td>
      <td class="tc">${Formatters.date(m.registeredAt)}</td>
      <td class="tc">${Formatters.date(m.distributedAt)}</td>
      <td class="tc"><span style="font-weight:600;color:#0369a1">${m.consultant}</span></td>
      <td class="tc">${m.status}</td>
    </tr>`;
  }).join('');

  // 페이지네이션
  const pagEl = document.getElementById('h-pagination');
  if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
  let pagHtml = `<button class="pagination__btn" ${currentPage===1?'disabled':''} data-page="${currentPage-1}">◀ 이전</button>`;
  const maxShow = 10;
  let startP = Math.max(1, currentPage - Math.floor(maxShow/2));
  let endP = Math.min(totalPages, startP + maxShow - 1);
  if (endP - startP < maxShow - 1) startP = Math.max(1, endP - maxShow + 1);
  for (let p = startP; p <= endP; p++) {
    pagHtml += `<button class="pagination__btn${p===currentPage?' pagination__btn--active':''}" data-page="${p}">${p}</button>`;
  }
  pagHtml += `<button class="pagination__btn" ${currentPage===totalPages?'disabled':''} data-page="${currentPage+1}">다음 ▶</button>`;
  pagEl.innerHTML = pagHtml;
  pagEl.querySelectorAll('.pagination__btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.disabled) return;
      currentPage = parseInt(this.dataset.page);
      applyFilter();
    });
  });
}

function bindEvents() {
  // 매니저 검색 Picker 초기화
  mgrPicker = new ManagerPicker({
    inputId: 'hmgr-search-input',
    modalBtnId: 'hmgr-open-modal',
    tagsId: 'hmgr-tags',
    onChange: () => { currentPage = 1; applyFilter(); }
  });

  // 검색 버튼
  document.getElementById('btn-search')?.addEventListener('click', () => { currentPage = 1; applyFilter(); });

  // 초기화
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    document.getElementById('h-search').value = '';
    document.getElementById('h-distmethod').value = '';
    document.getElementById('h-dtype').value = '';
    document.getElementById('h-channel').value = '';
    document.getElementById('h-gender').value = '';
    document.getElementById('h-status').value = '';
    document.getElementById('h-reg-from').value = '';
    document.getElementById('h-reg-to').value = '';
    document.getElementById('h-dist-from').value = '';
    document.getElementById('h-dist-to').value = '';
    if (mgrPicker) mgrPicker.reset();
    sortKey = 'distributedAt';
    sortDir = 'desc';
    currentPage = 1;
    renderThead();
    applyFilter();
  });

  // 필터 변경 시 자동 검색
  ['h-distmethod', 'h-dtype', 'h-channel', 'h-gender', 'h-status', 'h-reg-from', 'h-reg-to', 'h-dist-from', 'h-dist-to'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => { currentPage = 1; applyFilter(); });
  });
}

render();
