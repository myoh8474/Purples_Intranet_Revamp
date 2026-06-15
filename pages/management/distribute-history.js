/* ========================================
   회원분배 내역조회 페이지
   - 분배 완료된 회원 이력 조회
   - 기간별/매니저별 필터링
   - 컬럼 정렬 (오름/내림차순)
   - 다중선택(멀티셀렉트) 검색
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
            <div class="ms-wrap" id="ms-distmethod" data-placeholder="분배방식 전체">
              <div class="ms-trigger"><span class="ms-text ms-text--placeholder">분배방식 전체</span><span class="ms-arrow">▾</span></div>
              <div class="ms-dropdown">
                <label class="ms-item"><input type="checkbox" value="자동분배"> 자동분배</label>
                <label class="ms-item"><input type="checkbox" value="수동분배"> 수동분배</label>
              </div>
            </div>
          </td>
          <th>유입구분</th>
          <td>
            <div class="ms-wrap" id="ms-dtype" data-placeholder="유입구분 전체">
              <div class="ms-trigger"><span class="ms-text ms-text--placeholder">유입구분 전체</span><span class="ms-arrow">▾</span></div>
              <div class="ms-dropdown">
                <label class="ms-item"><input type="checkbox" value="신규"> 신규</label>
                <label class="ms-item"><input type="checkbox" value="기간만료"> 기간만료</label>
                <label class="ms-item"><input type="checkbox" value="중복"> 중복</label>
              </div>
            </div>
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
            <div class="ms-wrap" id="ms-gender" data-placeholder="성별 전체">
              <div class="ms-trigger"><span class="ms-text ms-text--placeholder">성별 전체</span><span class="ms-arrow">▾</span></div>
              <div class="ms-dropdown">
                <label class="ms-item"><input type="checkbox" value="남"> 남</label>
                <label class="ms-item"><input type="checkbox" value="여"> 여</label>
              </div>
            </div>
          </td>
          <th>유입경로</th>
          <td>
            <div class="ms-wrap" id="ms-channel" data-placeholder="경로 전체">
              <div class="ms-trigger"><span class="ms-text ms-text--placeholder">경로 전체</span><span class="ms-arrow">▾</span></div>
              <div class="ms-dropdown">
                <label class="ms-item"><input type="checkbox" value="카카오커플"> 카카오커플</label><label class="ms-item"><input type="checkbox" value="네이버커플"> 네이버커플</label>
                <label class="ms-item"><input type="checkbox" value="구글커플"> 구글커플</label><label class="ms-item"><input type="checkbox" value="블라인드커플"> 블라인드커플</label>
                <label class="ms-item"><input type="checkbox" value="실시간상담"> 실시간상담</label><label class="ms-item"><input type="checkbox" value="전화문의"> 전화문의</label>
                <label class="ms-item"><input type="checkbox" value="지인소개"> 지인소개</label><label class="ms-item"><input type="checkbox" value="기간만료(재컨텍)"> 기간만료(재컨텍)</label>
              </div>
            </div>
          </td>
          <th>상태</th>
          <td>
            <div class="ms-wrap" id="ms-status" data-placeholder="상태 전체">
              <div class="ms-trigger"><span class="ms-text ms-text--placeholder">상태 전체</span><span class="ms-arrow">▾</span></div>
              <div class="ms-dropdown">
                ${ASSOCIATE_STATUSES.filter(s => s !== '컨텍전').map(s => `<label class="ms-item"><input type="checkbox" value="${s}"> ${s}</label>`).join('')}
              </div>
            </div>
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
      .sort-icon--active { color: var(--accent); font-weight: 700; }

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
      ${getManagerPickerStyles()}
    </style>
  `;

  initMultiSelects();
  renderThead();
  applyFilter();
  bindEvents();
}

/** 멀티셀렉트 드롭다운 초기화 */
function initMultiSelects() {
  document.querySelectorAll('.ms-wrap').forEach(wrap => {
    const trigger = wrap.querySelector('.ms-trigger');
    const textEl = wrap.querySelector('.ms-text');
    const placeholder = wrap.dataset.placeholder;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.ms-wrap.open').forEach(w => {
        if (w !== wrap) w.classList.remove('open');
      });
      wrap.classList.toggle('open');
    });

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
        currentPage = 1;
        applyFilter();
      });
    });

    wrap.querySelector('.ms-dropdown').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });

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
  const distmethods = getMultiSelectValues('ms-distmethod');
  const dtypes = getMultiSelectValues('ms-dtype');
  const channels = getMultiSelectValues('ms-channel');
  const genders = getMultiSelectValues('ms-gender');
  const statuses = getMultiSelectValues('ms-status');
  const regFrom = document.getElementById('h-reg-from')?.value || '';
  const regTo = document.getElementById('h-reg-to')?.value || '';
  const distFrom = document.getElementById('h-dist-from')?.value || '';
  const distTo = document.getElementById('h-dist-to')?.value || '';

  let filtered = MockAssociates.filter(m => {
    if (!(m.consultant && m.consultant !== '-' && m.status !== '컨텍전')) return false;
    if (search && !m.name.toLowerCase().includes(search) && !m.phone.includes(search)) return false;
    if (distmethods.length > 0 && !distmethods.includes(m.distMethod || '수동분배')) return false;
    if (dtypes.length > 0) {
      const mType = m.isDuplicate ? '중복' : (m.channel === '기간만료(재컨텍)' ? '기간만료' : '신규');
      if (!dtypes.includes(mType)) return false;
    }
    if (channels.length > 0 && !channels.includes(m.channel)) return false;
    if (genders.length > 0 && !genders.includes(m.gender)) return false;
    if (statuses.length > 0 && !statuses.includes(m.status)) return false;
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
      <td class="tc"><span style="font-weight:600;color:var(--accent)">${m.consultant}</span></td>
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
    document.getElementById('h-reg-from').value = '';
    document.getElementById('h-reg-to').value = '';
    document.getElementById('h-dist-from').value = '';
    document.getElementById('h-dist-to').value = '';
    // 멀티셀렉트 초기화
    document.querySelectorAll('.ms-wrap').forEach(wrap => {
      wrap.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      const textEl = wrap.querySelector('.ms-text');
      if (textEl) {
        textEl.textContent = wrap.dataset.placeholder;
        textEl.classList.add('ms-text--placeholder');
      }
    });
    if (mgrPicker) mgrPicker.reset();
    sortKey = 'distributedAt';
    sortDir = 'desc';
    currentPage = 1;
    renderThead();
    applyFilter();
  });

  // 날짜 필터 변경 시 자동 검색
  ['h-reg-from', 'h-reg-to', 'h-dist-from', 'h-dist-to'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => { currentPage = 1; applyFilter(); });
  });
}

render();
