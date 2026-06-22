/* ========================================
   준회원 상담통계 — KPI + 기간검색 + 매니저별 리스트
   공통 스타일(search-table, kpi-stat) 사용
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, CONSULTANT_BRANCH, BRANCHES } from '@config/constants.js';
import { ManagerPicker, renderManagerPickerHTML, getManagerPickerStyles } from '@components/ManagerPicker.js';

initLayout({ pageId: 'associate-consult-status', breadcrumbs: ['준회원 관리', '상담통계'] });
const content = document.getElementById('content');
let statPage = 1;
const STAT_PAGE_SIZE = 20;

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

function calcStats(dateFrom, dateTo) {
  const data = getStatusData();
  const managerStats = CONSULTANTS.map(name => {
    const members = data.filter(m => m.consultant === name);
    const branch = branchMap[CONSULTANT_BRANCH[name]] || '-';
    let callCount = 0, contacts = 0, meetingRes = 0, actualVisits = 0, joins = 0, joinAmount = 0, totalAmount = 0;
    // DB 포기/변경 건수
    const abandoned = members.filter(m => (m.status || '').includes('불가')).length;
    const changed = members.filter(m => m.status === '변경').length;

    members.forEach(m => {
      (m.contactHistory || []).forEach(h => {
        const d = (h.date || '').slice(0, 10);
        if (d >= dateFrom && d <= dateTo) {
          callCount++;
          if (h.result !== '부재중(미연락)' && h.result !== '부재중') contacts++;
          if (h.result === '방문상담') meetingRes++;
          if (h.result === '가입완료' || h.result === '가입중') { joins++; joinAmount += 3000000; totalAmount += 3000000; }
        }
      });
      try {
        JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]').forEach(h => {
          const d = (h.date || '').slice(0, 10);
          if (d >= dateFrom && d <= dateTo) {
            callCount++;
            if (h.result !== '부재중(미연락)' && h.result !== '부재중') contacts++;
            if (h.result === '방문상담') meetingRes++;
            if (h.result === '가입완료' || h.result === '가입중') { joins++; joinAmount += 3000000; totalAmount += 3000000; }
          }
        });
      } catch (e) {}
      try {
        JSON.parse(localStorage.getItem('purples_meeting_history_' + m.id) || '[]').forEach(h => {
          const d = (h.date || '').slice(0, 10);
          if (d >= dateFrom && d <= dateTo) actualVisits++;
        });
      } catch (e) {}
    });

    const visitRate = meetingRes > 0 ? Math.round((actualVisits / meetingRes) * 100) : 0;
    const closeRate = actualVisits > 0 ? Math.round((joins / actualVisits) * 100) : 0;
    const convertedAmount = Math.round(totalAmount * 0.91);

    return { name, branch, db: members.length, callCount, contacts, abandoned, changed, meetingRes, actualVisits, visitRate, joins, closeRate, joinAmount, totalAmount, convertedAmount };
  });

  const totals = managerStats.reduce((t, m) => ({
    db: t.db + m.db, callCount: t.callCount + m.callCount, contacts: t.contacts + m.contacts,
    abandoned: t.abandoned + m.abandoned, changed: t.changed + m.changed,
    meetingRes: t.meetingRes + m.meetingRes, actualVisits: t.actualVisits + m.actualVisits,
    joins: t.joins + m.joins, joinAmount: t.joinAmount + m.joinAmount,
    totalAmount: t.totalAmount + m.totalAmount, convertedAmount: t.convertedAmount + m.convertedAmount,
  }), { db: 0, callCount: 0, contacts: 0, abandoned: 0, changed: 0, meetingRes: 0, actualVisits: 0, joins: 0, joinAmount: 0, totalAmount: 0, convertedAmount: 0 });
  totals.visitRate = totals.meetingRes > 0 ? Math.round((totals.actualVisits / totals.meetingRes) * 100) : 0;
  totals.closeRate = totals.actualVisits > 0 ? Math.round((totals.joins / totals.actualVisits) * 100) : 0;

  return { managerStats, totals };
}

function render() {
  const today = new Date().toISOString().slice(0, 10);

  content.innerHTML = `
    <div class="page-header">
      <div><h1 class="page-header__title">상담통계</h1>
      <p class="page-header__subtitle">준회원 상담 활동 현황 · 컨텍수, 방문, 가입, 매출 조회</p></div>
    </div>

    <!-- 검색 필터 (std-table 스타일) -->
    <table class="std-table" id="filter-table" style="margin-bottom:0;table-layout:fixed">
      <colgroup>
        <col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col>
      </colgroup>
      <tbody>
        <tr>
          <th>기간</th>
          <td colspan="7">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
              <input type="date" id="f-from" value="${today}" class="form-input form-input--sm" style="width:140px">
              <span class="text-muted">~</span>
              <input type="date" id="f-to" value="${today}" class="form-input form-input--sm" style="width:140px">
              <div style="display:flex;gap:4px;margin-left:8px">
                <button class="btn btn--ghost btn--sm" id="btn-today">오늘</button>
                <button class="btn btn--ghost btn--sm" id="btn-week">이번주</button>
                <button class="btn btn--ghost btn--sm" id="btn-month">이번달</button>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <th>매니저</th>
          <td colspan="7">
            ${renderManagerPickerHTML('cmgr')}
          </td>
        </tr>
      </tbody>
    </table>
    <div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px">
      <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
      <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
    </div>

    <!-- KPI 카드 (공통 kpi-stat 스타일) -->
    <div class="kpi-stat-grid kpi-stat-grid--6" id="kpi-area" style="margin-top:20px"></div>

    <!-- 매니저별 리스트 -->
    <div class="list-section">
      <div class="list-section__header">
        <h3 class="list-section__title">상담사별 현황</h3>
        <span class="list-section__meta" id="period-label"></span>
      </div>
      <div class="list-section__body">
        <table class="std-table" style="white-space:nowrap">
          <thead>
            <tr>
              <th rowspan="2" style="width:50px">No.</th>
              <th rowspan="2" style="width:60px">지사</th>
              <th rowspan="2" style="width:70px">부서</th>
              <th rowspan="2" style="width:60px">상담사</th>
              <th rowspan="2">보유DB</th>
              <th rowspan="2">콜수</th>
              <th rowspan="2">회원컨텍수</th>
              <th colspan="2" style="background:#fff0f0;color:#c62828">DB정리</th>
              <th colspan="3" class="th-blue">방문상담</th>
              <th colspan="2" class="th-green">체결</th>
              <th colspan="3" class="th-yellow">매출</th>
            </tr>
            <tr>
              <th style="background:#fff0f0;color:#c62828">포기(불가)</th>
              <th style="background:#fff0f0;color:#c62828">변경</th>
              <th class="th-blue">총 방문예약</th>
              <th class="th-blue">실제 방문</th>
              <th class="th-blue">실방문율(%)</th>
              <th class="th-green">체결건수</th>
              <th class="th-green">체결율(%)</th>
              <th class="th-yellow">신규매출(1가입)</th>
              <th class="th-yellow">총매출금액</th>
              <th class="th-yellow">환산매출</th>
            </tr>
          </thead>
          <tbody id="stats-tbody"></tbody>
        </table>
        <div class="list-section__footer">* 환산매출 = 총매출금액 x 0.91 (부가세 제외)</div>
        <div style="display:flex;justify-content:center;margin-top:12px">
          <div class="pagination" id="stat-pagination"></div>
        </div>
      </div>
    </div>
    <style>${getManagerPickerStyles()}</style>
  `;

  const DEPT_MAP = {
    '김지은': '상담1팀', '박서연': '상담1팀', '이하나': '상담1팀', '정민수': '상담2팀', '최유리': '상담2팀',
    '한소희': '상담1팀', '강다연': '상담2팀', '윤채영': '상담1팀', '임서진': '상담2팀', '조예린': '상담1팀',
    '송지은': '상담1팀', '나예림': '상담2팀', '문정은': '상담1팀', '백수진': '상담2팀', '오은서': '상담1팀',
    '신유리': '상담2팀', '권미라': '상담1팀', '서예지': '상담2팀', '류해인': '상담1팀', '차수빈': '상담2팀',
    '양수아': '상담1팀', '황은정': '상담2팀', '전지현': '상담1팀', '장세희': '상담2팀', '김나영': '상담1팀',
    '이수정': '상담2팀', '박미란': '상담1팀', '조하연': '상담2팀', '정은채': '상담1팀', '최지우': '상담2팀',
  };

  function updateData() {
    const from = document.getElementById('f-from').value;
    const to = document.getElementById('f-to').value;
    const branchFilter = '';
    const selMgrs = mgrPicker ? mgrPicker.getSelected() : [];
    let { managerStats, totals } = calcStats(from, to);

    // 부서 데이터 추가
    managerStats = managerStats.map(m => ({ ...m, dept: DEPT_MAP[m.name] || '-', date: from === to ? from : `${from}~${to}` }));

    if (branchFilter) managerStats = managerStats.filter(m => m.branch === branchFilter);
    if (selMgrs.length > 0) managerStats = managerStats.filter(m => selMgrs.includes(m.name));

    totals = managerStats.reduce((t, m) => ({
      db: t.db + m.db, callCount: t.callCount + m.callCount, contacts: t.contacts + m.contacts,
      abandoned: t.abandoned + m.abandoned, changed: t.changed + m.changed,
      meetingRes: t.meetingRes + m.meetingRes, actualVisits: t.actualVisits + m.actualVisits,
      joins: t.joins + m.joins, joinAmount: t.joinAmount + m.joinAmount,
      totalAmount: t.totalAmount + m.totalAmount, convertedAmount: t.convertedAmount + m.convertedAmount,
    }), { db:0, callCount:0, contacts:0, abandoned:0, changed:0, meetingRes:0, actualVisits:0, joins:0, joinAmount:0, totalAmount:0, convertedAmount:0 });
    totals.visitRate = totals.meetingRes > 0 ? Math.round((totals.actualVisits / totals.meetingRes) * 100) : 0;
    totals.closeRate = totals.actualVisits > 0 ? Math.round((totals.joins / totals.actualVisits) * 100) : 0;

    document.getElementById('period-label').textContent = from === to ? from : `${from} ~ ${to}`;

    const kpiData = [
      { label: '총 보유DB', value: totals.db, color: '#374151' },
      { label: '회원 컨텍수', value: totals.contacts, color: '#3b82f6' },
      { label: '총 콜수', value: totals.callCount, color: '#6366f1' },
      { label: '총 방문예약', value: totals.meetingRes, color: '#8b5cf6' },
      { label: '체결 건수', value: totals.joins, color: '#10b981' },
      { label: '총매출금액', value: totals.totalAmount, color: '#f59e0b', isMoney: true },
      { label: '환산매출', value: totals.convertedAmount, color: '#ef4444', isMoney: true },
    ];
    document.getElementById('kpi-area').innerHTML = kpiData.map(k => `
      <div class="kpi-stat-card">
        <div class="kpi-stat-card__value${k.isMoney ? ' kpi-stat-card__value--sm' : ''}" style="color:${k.color}">${k.isMoney ? k.value.toLocaleString() + '원' : k.value}</div>
        <div class="kpi-stat-card__label">${k.label}</div>
      </div>
    `).join('');

    function numCell(val, color) {
      return `<td class="tc" style="font-weight:${val ? '700' : '400'};color:${val ? color : 'var(--text-muted)'}">${val}</td>`;
    }
    function pctCell(val) {
      const c = val >= 50 ? '#059669' : val > 0 ? '#d97706' : 'var(--text-muted)';
      return `<td class="tc" style="font-weight:${val ? '700' : '400'};color:${c}">${val}%</td>`;
    }
    function moneyCell(val) {
      return `<td class="tr" style="font-weight:${val ? '600' : '400'};color:${val ? 'var(--text-primary)' : 'var(--text-muted)'};font-size:11px">${val ? val.toLocaleString() : '0'}</td>`;
    }

    const totalPages = Math.max(1, Math.ceil(managerStats.length / STAT_PAGE_SIZE));
    if (statPage > totalPages) statPage = totalPages;
    const pgStart = (statPage - 1) * STAT_PAGE_SIZE;
    const pageStats = managerStats.slice(pgStart, pgStart + STAT_PAGE_SIZE);

    document.getElementById('stats-tbody').innerHTML = pageStats.map((m, i) => `<tr>
      <td class="tc">${pgStart + i + 1}</td>
      <td class="tc">${m.branch}</td>
      <td class="tc">${m.dept}</td>
      <td class="tc" style="font-weight:600"><span style="color:var(--accent);cursor:pointer" onclick="window.open('consult-detail.html?manager=${encodeURIComponent(m.name)}&date=${document.getElementById('f-to').value}','_blank')">${m.name}</span></td>
      ${numCell(m.db, '#374151')}
      ${numCell(m.callCount, '#6366f1')}
      ${numCell(m.contacts, '#2563eb')}
      ${numCell(m.abandoned, '#c62828')}
      ${numCell(m.changed, '#e65100')}
      ${numCell(m.meetingRes, '#7c3aed')}
      ${numCell(m.actualVisits, '#0ea5e9')}
      ${pctCell(m.visitRate)}
      ${numCell(m.joins, '#059669')}
      ${pctCell(m.closeRate)}
      ${moneyCell(m.joinAmount)}
      ${moneyCell(m.totalAmount)}
      ${moneyCell(m.convertedAmount)}
    </tr>`).join('') + `<tr style="background:var(--bg-secondary);font-weight:700;border-top:1px solid var(--border-light)">
      <td class="tc" colspan="2">합계</td>
      <td class="tc" colspan="2">${managerStats.length}명</td>
      <td class="tc">${totals.db}</td>
      <td class="tc" style="color:#6366f1">${totals.callCount}</td>
      <td class="tc" style="color:#2563eb">${totals.contacts}</td>
      <td class="tc" style="color:#c62828">${totals.abandoned}</td>
      <td class="tc" style="color:#e65100">${totals.changed}</td>
      <td class="tc" style="color:#7c3aed">${totals.meetingRes}</td>
      <td class="tc" style="color:#0ea5e9">${totals.actualVisits}</td>
      <td class="tc">${totals.visitRate}%</td>
      <td class="tc" style="color:#059669">${totals.joins}</td>
      <td class="tc">${totals.closeRate}%</td>
      <td class="tr">${totals.joinAmount.toLocaleString()}</td>
      <td class="tr">${totals.totalAmount.toLocaleString()}</td>
      <td class="tr">${totals.convertedAmount.toLocaleString()}</td>
    </tr>`;

    // 페이지네이션
    const pagArea = document.getElementById('stat-pagination');
    if (totalPages <= 1) { pagArea.innerHTML = ''; return; }
    let btns = `<button class="pagination__btn" ${statPage <= 1 ? 'disabled' : ''} data-p="${statPage - 1}">‹</button>`;
    const maxBtns = 5;
    let ps = Math.max(1, statPage - Math.floor(maxBtns / 2));
    let pe = Math.min(totalPages, ps + maxBtns - 1);
    if (pe - ps < maxBtns - 1) ps = Math.max(1, pe - maxBtns + 1);
    for (let p = ps; p <= pe; p++) {
      btns += `<button class="pagination__btn ${p === statPage ? 'active' : ''}" data-p="${p}">${p}</button>`;
    }
    btns += `<button class="pagination__btn" ${statPage >= totalPages ? 'disabled' : ''} data-p="${statPage + 1}">›</button>`;
    pagArea.innerHTML = btns;
    pagArea.querySelectorAll('.pagination__btn').forEach(b => {
      b.addEventListener('click', () => { statPage = parseInt(b.dataset.p); updateData(); });
    });
  }

  updateData();

  document.getElementById('btn-search').addEventListener('click', () => { statPage = 1; updateData(); });
  document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('f-from').value = today;
    document.getElementById('f-to').value = today;
    if (mgrPicker) mgrPicker.reset();
    statPage = 1; updateData();
  });
  document.getElementById('btn-today').addEventListener('click', () => {
    document.getElementById('f-from').value = today;
    document.getElementById('f-to').value = today;
    updateData();
  });
  document.getElementById('btn-week').addEventListener('click', () => {
    const d = new Date(); const day = d.getDay();
    const mon = new Date(d); mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    document.getElementById('f-from').value = mon.toISOString().slice(0, 10);
    document.getElementById('f-to').value = today;
    updateData();
  });
  document.getElementById('btn-month').addEventListener('click', () => {
    const d = new Date();
    document.getElementById('f-from').value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
    document.getElementById('f-to').value = today;
    updateData();
  });
}

let mgrPicker = null;
render();
mgrPicker = new ManagerPicker({
  inputId: 'cmgr-search-input',
  modalBtnId: 'cmgr-open-modal',
  tagsId: 'cmgr-tags',
  onChange: () => {}
});
