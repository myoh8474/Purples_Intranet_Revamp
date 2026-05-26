/* ========================================
   상담매니저 관리
   탭1: 보유DB 현황 | 탭2: 성과 관리
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, CONSULTANT_BRANCH, BRANCHES } from '@config/constants.js';

initLayout({ pageId: 'associate-db-status', breadcrumbs: ['준회원 관리', '상담매니저 관리'] });
const content = document.getElementById('content');

const branchMap = {};
BRANCHES.forEach(b => { branchMap[b.code] = b.name; });

function getStatusData() {
  let d = [...MockAssociates];
  try {
    const u = JSON.parse(localStorage.getItem('purples_status_updates') || '{}');
    d = d.map(x => u[x.id] ? { ...x, status: typeof u[x.id] === 'string' ? u[x.id] : u[x.id].status || x.status } : x);
  } catch (e) {}
  return d;
}

/* ── 매니저별 DB 통계 ── */
function calcDbStats(data) {
  return CONSULTANTS.map(name => {
    const members = data.filter(m => m.consultant === name);
    const branch = branchMap[CONSULTANT_BRANCH[name]] || '-';
    const brand = members.length > 0 ? members[0].brand || '-' : '-';
    return { name, branch, brand, db: members.length };
  });
}

/* ── 매니저별 성과 통계 ── */
function calcPerfStats(data) {
  return CONSULTANTS.map(name => {
    const members = data.filter(m => m.consultant === name);
    const branch = branchMap[CONSULTANT_BRANCH[name]] || '-';
    const brand = members.length > 0 ? members[0].brand || '-' : '-';
    let contacts = 0, calls = 0, meetings = 0, joins = 0, amount = 0;

    members.forEach(m => {
      (m.contactHistory || []).forEach(h => {
        contacts++;
        if (h.type === '통화' || h.type === '전화') calls++;
        if (h.result === '가입완료' || h.result === '가입중') { joins++; amount += 3000000; }
      });
      try {
        JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]').forEach(h => {
          contacts++;
          calls++;
          if (h.result === '가입완료' || h.result === '가입중') { joins++; amount += 3000000; }
        });
      } catch (e) {}
      try {
        JSON.parse(localStorage.getItem('purples_meeting_history_' + m.id) || '[]').forEach(h => {
          if (h.status !== '예약' && h.status !== '취소') meetings++;
        });
      } catch (e) {}
    });

    return { name, branch, brand, db: members.length, contacts, calls, meetings, joins, amount };
  });
}

/* ── 보유DB 테이블 렌더 ── */
function renderDbTable(stats, brandFilter) {
  const filtered = brandFilter === '전체' ? stats : stats.filter(m => m.brand === brandFilter);
  const sorted = [...filtered].filter(m => m.db > 0).sort((a, b) => b.db - a.db);
  const total = sorted.reduce((s, m) => s + m.db, 0);

  if (sorted.length === 0) return '<tr><td colspan="4" class="tc" style="padding:40px;color:var(--text-muted)">데이터 없음</td></tr>';

  return sorted.map((m, i) => `<tr>
    <td class="tc col-no">${i + 1}</td>
    <td class="tc">${m.branch}</td>
    <td class="tc"><span class="col-link" onclick="window.open('consult-detail.html?manager=${encodeURIComponent(m.name)}','_blank')">${m.name}</span></td>
    <td class="tc"><span style="cursor:pointer;color:#2563eb;text-decoration:underline" onclick="window.open('db-detail.html?manager=${encodeURIComponent(m.name)}','_blank')">${m.db}</span></td>
  </tr>`).join('') + `<tr style="background:var(--bg-secondary);font-weight:700;border-top:1px solid var(--border-light)">
    <td class="tc" colspan="3">합계</td>
    <td class="tc" style="font-weight:800">${total}</td>
  </tr>`;
}

/* ── 성과 테이블 렌더 ── */
function renderPerfTable(stats, branchFilter) {
  const filtered = branchFilter === '전체' ? stats : stats.filter(m => m.branch === branchFilter);
  const sorted = [...filtered].filter(m => m.db > 0 || m.contacts > 0).sort((a, b) => b.contacts - a.contacts);

  const totals = sorted.reduce((t, m) => ({
    contacts: t.contacts + m.contacts, calls: t.calls + m.calls,
    meetings: t.meetings + m.meetings, joins: t.joins + m.joins, amount: t.amount + m.amount,
  }), { contacts: 0, calls: 0, meetings: 0, joins: 0, amount: 0 });

  if (sorted.length === 0) return '<tr><td colspan="8" class="tc" style="padding:40px;color:var(--text-muted)">데이터 없음</td></tr>';

  function numCell(val) {
    return `<td class="tc" style="color:${val > 0 ? 'var(--text-primary)' : 'var(--text-muted)'}">${val}</td>`;
  }
  function moneyCell(val) {
    return `<td class="tr" style="color:${val > 0 ? 'var(--text-primary)' : 'var(--text-muted)'}">${val > 0 ? val.toLocaleString() : '0'}</td>`;
  }

  return sorted.map((m, i) => `<tr>
    <td class="tc col-no">${i + 1}</td>
    <td class="tc">${m.branch}</td>
    <td class="tc"><span class="col-link" onclick="window.open('consult-detail.html?manager=${encodeURIComponent(m.name)}','_blank')">${m.name}</span></td>
    ${numCell(m.contacts)}
    ${numCell(m.calls)}
    ${numCell(m.meetings)}
    ${numCell(m.joins)}
    ${moneyCell(m.amount)}
  </tr>`).join('') + `<tr style="background:var(--bg-secondary);font-weight:700;border-top:1px solid var(--border-light)">
    <td class="tc" colspan="3">합계</td>
    <td class="tc">${totals.contacts}</td>
    <td class="tc">${totals.calls}</td>
    <td class="tc">${totals.meetings}</td>
    <td class="tc">${totals.joins}</td>
    <td class="tr">${totals.amount > 0 ? totals.amount.toLocaleString() : '0'}</td>
  </tr>`;
}

/* ── 메인 렌더 ── */
/* ── 보유DB 가로 병합 테이블 ── */
function renderDbMergedTable(stats, brands) {
  const brandData = {};
  brands.forEach(b => {
    brandData[b] = stats.filter(m => m.brand === b && m.db > 0).sort((a, b2) => b2.db - a.db);
  });
  const maxRows = Math.max(...brands.map(b => brandData[b].length), 1);

  // 브랜드명 + 소계 헤더
  let headRow1 = brands.map(b => {
    const total = brandData[b].reduce((s, m) => s + m.db, 0);
    return `<th colspan="3" style="text-align:center;font-weight:700">${b} <span style="color:var(--accent)">${total}</span></th>`;
  }).join('');

  // 지사/매니저/DB 서브 헤더
  let headRow2 = brands.map(() =>
    '<th>지사</th><th>매니저</th><th>보유DB</th>'
  ).join('');

  // 데이터 행
  let bodyRows = '';
  for (let i = 0; i < maxRows; i++) {
    bodyRows += '<tr>';
    brands.forEach(b => {
      const m = brandData[b][i];
      if (m) {
        bodyRows += `<td class="tc">${m.branch}</td>`;
        bodyRows += `<td class="tc"><span class="col-link" onclick="window.open('consult-detail.html?manager=${encodeURIComponent(m.name)}','_blank')">${m.name}</span></td>`;
        bodyRows += `<td class="tc"><span style="cursor:pointer;color:#2563eb;text-decoration:underline" onclick="window.open('db-detail.html?manager=${encodeURIComponent(m.name)}','_blank')">${m.db}</span></td>`;
      } else {
        bodyRows += '<td></td><td></td><td></td>';
      }
    });
    bodyRows += '</tr>';
  }

  // 합계행
  const grandTotal = brands.reduce((s, b) => s + brandData[b].reduce((s2, m) => s2 + m.db, 0), 0);
  bodyRows += `<tr style="background:var(--bg-secondary);font-weight:700;border-top:1px solid var(--border-light)">`;
  brands.forEach((b, idx) => {
    const total = brandData[b].reduce((s, m) => s + m.db, 0);
    bodyRows += `<td class="tc" colspan="2">소계</td><td class="tc" style="font-weight:800">${total}</td>`;
  });
  bodyRows += '</tr>';

  return { headRow1, headRow2, bodyRows };
}

/* ── 메인 렌더 ── */
function render() {
  const data = getStatusData();
  const dbStats = calcDbStats(data);
  const perfStats = calcPerfStats(data);
  const brands = ['퍼플스', '디노블', '르매리'];
  const brandCounts = {};
  brands.forEach(b => { brandCounts[b] = dbStats.filter(m => m.brand === b).reduce((s, m) => s + m.db, 0); });
  const grandTotal = Object.values(brandCounts).reduce((s, v) => s + v, 0);
  const db = renderDbMergedTable(dbStats, brands);

  const _tab = new URLSearchParams(window.location.search).get('tab');
  const pageTitle = _tab === 'db' ? '보유DB 현황' : _tab === 'perf' ? '매니저 활동관리' : '매니저 관리';
  const pageSub = _tab === 'db' ? '브랜드별 매니저 보유DB 현황' : _tab === 'perf' ? '매니저별 활동 현황 관리' : '매니저별 보유DB 현황 및 성과 관리';

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">${pageTitle}</h1>
      <p class="page-header__subtitle">${pageSub}</p></div>
    </div>

    <!-- 기능 탭 -->
    <div class="std-tabs" id="func-tabs" style="margin-bottom:16px">
      <button class="std-tab active" data-func="db">보유DB 현황 <span class="std-tab__count">${grandTotal}</span></button>
      <button class="std-tab" data-func="perf">성과 관리</button>
    </div>

    <!-- 보유DB: 가로 병합 테이블 -->
    <div id="tab-db" class="list-section">
      <div class="list-section__body">
        <table class="std-table" style="white-space:nowrap">
          <thead>
            <tr>${db.headRow1}</tr>
            <tr>${db.headRow2}</tr>
          </thead>
          <tbody>${db.bodyRows}</tbody>
        </table>
      </div>
    </div>

    <!-- 성과 관리 -->
    <div id="tab-perf" style="display:none">
      <!-- 검색 필터 -->
      <table class="search-table">
        <tbody>
          <tr>
            <th class="search-table__th">기간</th>
            <td class="search-table__td">
              <input type="date" id="pf-from" class="form-input form-input--sm fi" style="width:140px">
              <span class="text-muted">~</span>
              <input type="date" id="pf-to" class="form-input form-input--sm fi" style="width:140px">
              <div class="period-quick-btns" style="margin-left:8px">
                <button class="btn btn--ghost btn--sm" id="pf-today">오늘</button>
                <button class="btn btn--ghost btn--sm" id="pf-week">이번주</button>
                <button class="btn btn--ghost btn--sm" id="pf-month">이번달</button>
              </div>
            </td>
          </tr>
          <tr>
            <th class="search-table__th">지사</th>
            <td class="search-table__td">
              <select class="form-input form-input--sm fi" id="pf-branch" style="width:100px">
                <option value="">전체</option>
                <option>본사</option>
                <option>대전</option>
                <option>대구</option>
                <option>부산</option>
              </select>
              <input type="text" id="pf-manager" class="form-input form-input--sm fi" placeholder="상담사명" style="width:120px;margin-left:8px">
            </td>
          </tr>
        </tbody>
      </table>
      <div class="search-actions">
        <button class="btn btn--sm search-btn" id="pf-search">검색</button>
        <button class="btn btn--sm filter-reset-btn" id="pf-reset">초기화</button>
      </div>

      <div class="list-section">
        <div class="list-section__body">
          <table class="std-table" style="white-space:nowrap">
            <thead>
              <tr>
                <th style="width:40px">No</th>
                <th style="width:70px">지사</th>
                <th style="width:70px">매니저</th>
                <th>컨텍수</th>
                <th>콜수</th>
                <th>방문미팅</th>
                <th>가입건수</th>
                <th style="width:120px">가입금액</th>
              </tr>
            </thead>
            <tbody id="perf-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const todayStr = new Date().toISOString().slice(0, 10);
  function weekStart() { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0, 10); }
  function monthStart() { const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10); }

  function updatePerfTable() {
    const branch = document.getElementById('pf-branch').value;
    const manager = document.getElementById('pf-manager').value.trim();
    let filtered = [...perfStats];
    if (branch) filtered = filtered.filter(m => m.branch.includes(branch));
    if (manager) filtered = filtered.filter(m => m.name.includes(manager));
    document.getElementById('perf-tbody').innerHTML = renderPerfTable(filtered, '전체');
  }
  updatePerfTable();

  // 기능 탭 전환
  function switchTab(func) {
    document.querySelectorAll('#func-tabs .std-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.func === func);
    });
    document.getElementById('tab-db').style.display = func === 'db' ? '' : 'none';
    document.getElementById('tab-perf').style.display = func === 'perf' ? '' : 'none';
  }
  document.querySelectorAll('#func-tabs .std-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.func));
  });

  // URL 파라미터로 탭 제어: 특정 탭이면 탭바 숨기고 해당 콘텐츠만
  const urlTab = new URLSearchParams(window.location.search).get('tab');
  if (urlTab === 'db' || urlTab === 'perf') {
    document.getElementById('func-tabs').style.display = 'none';
    switchTab(urlTab);
  }

  // 성과 검색/초기화
  document.getElementById('pf-search').addEventListener('click', updatePerfTable);
  document.getElementById('pf-reset').addEventListener('click', () => {
    document.getElementById('pf-branch').value = '';
    document.getElementById('pf-manager').value = '';
    document.getElementById('pf-from').value = '';
    document.getElementById('pf-to').value = '';
    updatePerfTable();
  });
  document.getElementById('pf-today').addEventListener('click', () => {
    document.getElementById('pf-from').value = todayStr;
    document.getElementById('pf-to').value = todayStr;
  });
  document.getElementById('pf-week').addEventListener('click', () => {
    document.getElementById('pf-from').value = weekStart();
    document.getElementById('pf-to').value = todayStr;
  });
  document.getElementById('pf-month').addEventListener('click', () => {
    document.getElementById('pf-from').value = monthStart();
    document.getElementById('pf-to').value = todayStr;
  });
}

render();

