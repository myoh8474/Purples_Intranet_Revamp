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

initLayout({ pageId: 'member-distribute-history', breadcrumbs: ['회원분배', '회원분배내역조회'] });

const PAGE_SIZE = 20;
let currentPage = 1;
let sortKey = 'distributedAt';  // 기본 정렬 기준: 분배일
let sortDir = 'desc';           // 기본 정렬 방향: 최신순

// 컬럼 정의 (key: 데이터 필드, label: 표시명, sortable: 정렬 가능 여부)
const COLUMNS = [
  { key: 'no',            label: 'No',       sortable: false, width: '40px', align: 'center' },
  { key: 'name',          label: '이름',      sortable: false },
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

    <!-- 검색 영역 (테이블 형식) -->
    <table class="search-table" id="filter-bar">
      <tbody>
        <tr>
          <th class="search-table__th">회원검색</th>
          <td class="search-table__td">
            <input type="text" class="form-input form-input--sm fi" id="h-search" placeholder="이름 또는 연락처 입력" style="width:200px">
          </td>
        </tr>
        <tr>
          <th class="search-table__th">상세검색</th>
          <td class="search-table__td">
            <select class="form-input form-input--sm fi" id="h-dtype" style="width:90px">
              <option value="">유입구분</option>
              <option value="신규">신규</option>
              <option value="기간만료">기간만료</option>
            </select>
            <select class="form-input form-input--sm fi" id="h-channel" style="width:110px">
              <option value="">경로 전체</option>
              <option value="카카오커플">카카오커플</option><option value="네이버커플">네이버커플</option>
              <option value="구글커플">구글커플</option><option value="블라인드커플">블라인드커플</option>
              <option value="실시간상담">실시간상담</option><option value="전화문의">전화문의</option>
              <option value="지인소개">지인소개</option><option value="기간만료(재컨텍)">기간만료(재컨텍)</option>
            </select>
            <select class="form-input form-input--sm fi" id="h-gender" style="width:70px">
              <option value="">성별</option>
              <option value="남">남</option><option value="여">여</option>
            </select>
            <select class="form-input form-input--sm fi" id="h-status" style="width:120px">
              <option value="">상태 전체</option>
              ${ASSOCIATE_STATUSES.filter(s => s !== '컨텍전').map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
          </td>
        </tr>
        <tr>
          <th class="search-table__th">등록일</th>
          <td class="search-table__td">
            <input type="date" class="form-input form-input--sm fi" id="h-reg-from" title="등록일 시작" style="width:130px">
            <span style="font-size:11px;color:#94a3b8">~</span>
            <input type="date" class="form-input form-input--sm fi" id="h-reg-to" title="등록일 종료" style="width:130px">
          </td>
        </tr>
        <tr>
          <th class="search-table__th">분배일</th>
          <td class="search-table__td">
            <input type="date" class="form-input form-input--sm fi" id="h-dist-from" title="분배일 시작" style="width:130px">
            <span style="font-size:11px;color:#94a3b8">~</span>
            <input type="date" class="form-input form-input--sm fi" id="h-dist-to" title="분배일 종료" style="width:130px">
          </td>
        </tr>
        <tr>
          <th class="search-table__th">매니저</th>
          <td class="search-table__td">
            <select class="form-input form-input--sm fi" id="h-manager" style="width:140px">
              <option value="">매니저 전체</option>
              ${CONSULTANTS.map(c => {
                const branch = BRANCHES.find(b => b.code === CONSULTANT_BRANCH[c]);
                const bName = branch?.name.replace('퍼플스','P.').replace('디노블','D.').replace('르매리','LM') || '';
                return `<option value="${c}">${c} (${bName})</option>`;
              }).join('')}
            </select>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="search-actions">
      <button class="btn btn--sm search-btn" id="btn-search">검색</button>
      <button class="btn btn--sm filter-reset-btn" id="btn-reset">초기화</button>
    </div>

    <!-- 리스트 영역 -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0 6px">
      <div style="font-size:12px;font-weight:600;color:var(--text-secondary)" id="h-count"></div>
    </div>
    <table class="data-table" style="font-size:12px">
      <thead>
        <tr id="h-thead-row"></tr>
      </thead>
      <tbody id="h-tbody"></tbody>
    </table>
    <div id="h-pagination" class="pagination"></div>

    <style>
      .page-header { margin-bottom: 20px; }
      .page-header__title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
      .page-header__desc { font-size: 12px; color: var(--text-muted); margin: 0; }

      .search-table {
        width: 100%; border-collapse: collapse;
        margin-bottom: 16px; font-size: 12px;
        border: 1px solid #cbd5e1;
      }
      .search-table__th {
        background: #f1f5f9; color: #334155; font-weight: 700;
        padding: 8px 14px; text-align: left; white-space: nowrap;
        width: 80px; border-bottom: 1px solid #e2e8f0;
        border-right: 1px solid #e2e8f0; font-size: 11px;
      }
      .search-table__td {
        padding: 6px 14px; border-bottom: 1px solid #e2e8f0;
        display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
        background: #fff;
      }
      .search-table tr:last-child .search-table__th,
      .search-table tr:last-child .search-table__td { border-bottom: none; }
      .fi { font-size: 11px !important; height: 30px; }
      .search-actions {
        display: flex; justify-content: center; gap: 8px;
        margin-bottom: 16px;
      }
      .search-btn {
        font-size: 12px !important; background: #0369a1; color: #fff;
        border: none; padding: 6px 24px; border-radius: 6px;
        cursor: pointer; font-weight: 600; transition: background 0.15s;
      }
      .search-btn:hover { background: #0284c7; }
      .filter-reset-btn {
        font-size: 11px !important; background: #fff;
        border: 1px solid #e2e8f0; color: #475569;
        padding: 4px 10px; border-radius: 6px; cursor: pointer;
        transition: all 0.15s ease;
      }
      .filter-reset-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }

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
  const dtype = document.getElementById('h-dtype')?.value || '';
  const channel = document.getElementById('h-channel')?.value || '';
  const gender = document.getElementById('h-gender')?.value || '';
  const status = document.getElementById('h-status')?.value || '';
  const manager = document.getElementById('h-manager')?.value || '';
  const regFrom = document.getElementById('h-reg-from')?.value || '';
  const regTo = document.getElementById('h-reg-to')?.value || '';
  const distFrom = document.getElementById('h-dist-from')?.value || '';
  const distTo = document.getElementById('h-dist-to')?.value || '';

  let filtered = MockAssociates.filter(m => {
    if (!(m.consultant && m.consultant !== '-' && m.status !== '컨텍전')) return false;
    if (search && !m.name.toLowerCase().includes(search) && !m.phone.includes(search)) return false;
    if (dtype) {
      const mType = m.channel === '기간만료(재컨텍)' ? '기간만료' : '신규';
      if (mType !== dtype) return false;
    }
    if (channel && m.channel !== channel) return false;
    if (gender && m.gender !== gender) return false;
    if (status && m.status !== status) return false;
    if (manager && m.consultant !== manager) return false;
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
      // 유입구분: 기간만료 vs 신규
      va = a.channel === '기간만료(재컨텍)' ? '기간만료' : '신규';
      vb = b.channel === '기간만료(재컨텍)' ? '기간만료' : '신규';
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
    const dtype = m.channel === '기간만료(재컨텍)' ? '기간만료' : '신규';
    const dtTag = dtype === '기간만료'
      ? '<span style="font-size:10px;padding:2px 6px;border-radius:3px;background:#f5f3ff;color:#7c3aed;border:1px solid #c4b5fd">기간만료</span>'
      : '<span style="font-size:10px;padding:2px 6px;border-radius:3px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0">신규</span>';
    return `<tr>
      <td style="text-align:center">${no}</td>
      <td><a href="dist-detail.html?id=${m.id}" target="_blank" style="font-weight:600;color:var(--accent);text-decoration:underline">${m.name}</a></td>
      <td style="text-align:center">${dtTag}</td>
      <td style="text-align:center">${m.gender}</td><td style="text-align:center">${m.age}세</td>
      <td>${Formatters.phone(m.phone)}</td>
      <td style="font-size:11px">${m.channel || '-'}</td>
      <td>${Formatters.date(m.registeredAt)}</td>
      <td>${Formatters.date(m.distributedAt)}</td>
      <td><span style="font-weight:600;color:#0369a1">${m.consultant}</span></td>
      <td style="text-align:center"><span class="badge badge--green" style="font-size:10px;padding:2px 8px">${m.status}</span></td>
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
  // 검색 버튼
  document.getElementById('btn-search')?.addEventListener('click', () => { currentPage = 1; applyFilter(); });

  // 초기화
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    document.getElementById('h-search').value = '';
    document.getElementById('h-dtype').value = '';
    document.getElementById('h-channel').value = '';
    document.getElementById('h-gender').value = '';
    document.getElementById('h-status').value = '';
    document.getElementById('h-reg-from').value = '';
    document.getElementById('h-reg-to').value = '';
    document.getElementById('h-dist-from').value = '';
    document.getElementById('h-dist-to').value = '';
    document.getElementById('h-manager').value = '';
    sortKey = 'distributedAt';
    sortDir = 'desc';
    currentPage = 1;
    renderThead();
    applyFilter();
  });

  // 필터 변경 시 자동 검색
  ['h-dtype', 'h-channel', 'h-gender', 'h-status', 'h-manager', 'h-reg-from', 'h-reg-to', 'h-dist-from', 'h-dist-to'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => { currentPage = 1; applyFilter(); });
  });
}

render();
