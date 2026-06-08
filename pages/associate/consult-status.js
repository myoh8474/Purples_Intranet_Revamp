/* ========================================
   준회원 상담통계 — KPI + 기간검색 + 매니저별 리스트
   공통 스타일(search-table, kpi-stat) 사용
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, CONSULTANT_BRANCH, BRANCHES } from '@config/constants.js';

initLayout({ pageId: 'associate-consult-status', breadcrumbs: ['준회원 관리', '상담통계'] });
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

function calcStats(dateFrom, dateTo) {
  const data = getStatusData();
  const managerStats = CONSULTANTS.map(name => {
    const members = data.filter(m => m.consultant === name);
    const branch = branchMap[CONSULTANT_BRANCH[name]] || '-';
    let contacts = 0, meetingRes = 0, actualVisits = 0, joins = 0, joinAmount = 0, totalAmount = 0;

    members.forEach(m => {
      (m.contactHistory || []).forEach(h => {
        const d = (h.date || '').slice(0, 10);
        if (d >= dateFrom && d <= dateTo) {
          contacts++;
          if (h.result === '방문상담') meetingRes++;
          if (h.result === '가입완료' || h.result === '가입중') { joins++; joinAmount += 3000000; totalAmount += 3000000; }
        }
      });
      try {
        JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]').forEach(h => {
          const d = (h.date || '').slice(0, 10);
          if (d >= dateFrom && d <= dateTo) {
            contacts++;
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

    return { name, branch, db: members.length, contacts, meetingRes, actualVisits, visitRate, joins, closeRate, joinAmount, totalAmount, convertedAmount };
  });

  const totals = managerStats.reduce((t, m) => ({
    db: t.db + m.db, contacts: t.contacts + m.contacts,
    meetingRes: t.meetingRes + m.meetingRes, actualVisits: t.actualVisits + m.actualVisits,
    joins: t.joins + m.joins, joinAmount: t.joinAmount + m.joinAmount,
    totalAmount: t.totalAmount + m.totalAmount, convertedAmount: t.convertedAmount + m.convertedAmount,
  }), { db: 0, contacts: 0, meetingRes: 0, actualVisits: 0, joins: 0, joinAmount: 0, totalAmount: 0, convertedAmount: 0 });
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

    <!-- 검색 필터 (공통 search-table 스타일) -->
    <table class="search-table">
      <tbody>
        <tr>
          <th class="search-table__th">기간</th>
          <td class="search-table__td">
            <input type="date" id="f-from" value="${today}" class="form-input form-input--sm fi" style="width:140px">
            <span class="text-muted">~</span>
            <input type="date" id="f-to" value="${today}" class="form-input form-input--sm fi" style="width:140px">
            <div class="period-quick-btns" style="margin-left:8px">
              <button class="btn btn--ghost btn--sm" id="btn-today">오늘</button>
              <button class="btn btn--ghost btn--sm" id="btn-week">이번주</button>
              <button class="btn btn--ghost btn--sm" id="btn-month">이번달</button>
            </div>
          </td>
        </tr>
        <tr>
          <th class="search-table__th">지사</th>
          <td class="search-table__td">
            <select class="form-input form-input--sm fi" id="f-branch" style="width:100px">
              <option value="">전체</option>
              <option>본사</option>
              <option>대전</option>
              <option>대구</option>
              <option>부산</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="search-actions">
      <button class="btn btn--sm search-btn" id="btn-search">검색</button>
      <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
    </div>

    <!-- KPI 카드 (공통 kpi-stat 스타일) -->
    <div class="kpi-stat-grid" id="kpi-area"></div>

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
              <th rowspan="2" style="width:60px">지사</th>
              <th rowspan="2" style="width:60px">상담사</th>
              <th rowspan="2">회원컨텍수</th>
              <th colspan="3" class="th-blue">방문상담</th>
              <th colspan="2" class="th-green">체결</th>
              <th colspan="3" class="th-yellow">매출</th>
            </tr>
            <tr>
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
      </div>
    </div>
  `;

  function updateData() {
    const from = document.getElementById('f-from').value;
    const to = document.getElementById('f-to').value;
    const branchFilter = document.getElementById('f-branch').value;
    let { managerStats, totals } = calcStats(from, to);

    if (branchFilter) {
      managerStats = managerStats.filter(m => m.branch === branchFilter);
      totals = managerStats.reduce((t, m) => ({
        contacts: t.contacts + m.contacts, meetingRes: t.meetingRes + m.meetingRes,
        actualVisits: t.actualVisits + m.actualVisits, joins: t.joins + m.joins,
        joinAmount: t.joinAmount + m.joinAmount, totalAmount: t.totalAmount + m.totalAmount,
        convertedAmount: t.convertedAmount + m.convertedAmount, db: t.db + m.db,
      }), { contacts:0, meetingRes:0, actualVisits:0, joins:0, joinAmount:0, totalAmount:0, convertedAmount:0, db:0 });
      totals.visitRate = totals.meetingRes > 0 ? Math.round((totals.actualVisits / totals.meetingRes) * 100) : 0;
      totals.closeRate = totals.actualVisits > 0 ? Math.round((totals.joins / totals.actualVisits) * 100) : 0;
    }

    document.getElementById('period-label').textContent = from === to ? from : `${from} ~ ${to}`;

    const kpiData = [
      { label: '회원 컨텍수', value: totals.contacts, color: '#3b82f6' },
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

    document.getElementById('stats-tbody').innerHTML = managerStats.map(m => `<tr>
      <td class="tc">${m.branch}</td>
      <td class="tc" style="font-weight:600"><span style="color:var(--accent);cursor:pointer" onclick="window.open('consult-detail.html?manager=${encodeURIComponent(m.name)}&date=${document.getElementById('f-to').value}','_blank')">${m.name}</span></td>
      ${numCell(m.contacts, '#2563eb')}
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
      <td class="tc" style="color:#2563eb">${totals.contacts}</td>
      <td class="tc" style="color:#7c3aed">${totals.meetingRes}</td>
      <td class="tc" style="color:#0ea5e9">${totals.actualVisits}</td>
      <td class="tc">${totals.visitRate}%</td>
      <td class="tc" style="color:#059669">${totals.joins}</td>
      <td class="tc">${totals.closeRate}%</td>
      <td class="tr">${totals.joinAmount.toLocaleString()}</td>
      <td class="tr">${totals.totalAmount.toLocaleString()}</td>
      <td class="tr">${totals.convertedAmount.toLocaleString()}</td>
    </tr>`;
  }

  updateData();

  document.getElementById('btn-search').addEventListener('click', updateData);
  document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('f-from').value = today;
    document.getElementById('f-to').value = today;
    document.getElementById('f-branch').value = '';
    updateData();
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

render();
