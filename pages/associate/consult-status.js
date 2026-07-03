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
    let callCount = 0, meetingRes = 0, actualVisits = 0, joins = 0, joinAmount = 0, totalAmount = 0;
    const contactedMemberIds = new Set(); // 고유 컨텍 회원
    // DB 포기/변경 건수
    const abandoned = members.filter(m => (m.status || '').includes('불가')).length;
    const changed = members.filter(m => m.status === '변경').length;

    members.forEach(m => {
      (m.contactHistory || []).forEach(h => {
        const d = (h.date || '').slice(0, 10);
        if (d >= dateFrom && d <= dateTo) {
          if (h.result !== '부재중(미연락)' && h.result !== '부재중') {
            callCount++; // 연결된 통화만 카운트
            contactedMemberIds.add(m.id); // 고유 회원
          }
          if (h.result === '방문상담') meetingRes++;
          if (h.result === '가입완료' || h.result === '가입중') { joins++; joinAmount += 3000000; totalAmount += 3000000; }
        }
      });
      try {
        JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]').forEach(h => {
          const d = (h.date || '').slice(0, 10);
          if (d >= dateFrom && d <= dateTo) {
            if (h.result !== '부재중(미연락)' && h.result !== '부재중') {
              callCount++;
              contactedMemberIds.add(m.id);
            }
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
    const contacts = contactedMemberIds.size;

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
        <col style="width:80px"><col>
      </colgroup>
      <tbody>
        <tr>
          <th>기간</th>
          <td>
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
      </tbody>
    </table>
    <div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px">
      <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
      <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
    </div>

    <!-- 엑셀 다운로드 -->
    <div style="display:flex;justify-content:flex-end;margin-top:16px">
      <button class="btn btn--outline btn--sm" id="btn-excel">📥 엑셀 다운로드</button>
    </div>

    <!-- KPI 카드 (공통 kpi-stat 스타일) -->
    <div class="kpi-stat-grid kpi-stat-grid--7" id="kpi-area" style="margin-top:8px"></div>

    <!-- 지사별 요약 -->
    <div class="list-section" style="margin-top:20px">
      <div class="list-section__header">
        <h3 class="list-section__title">지사별 현황</h3>
        <span class="list-section__meta" id="branch-period-label"></span>
      </div>
      <div class="list-section__body">
        <table class="std-table" style="white-space:nowrap">
          <thead>
            <tr>
              <th style="width:60px">지사</th>
              <th>인원수</th>
              <th>보유DB</th>
              <th>콜수</th>
              <th>컨텍수</th>
              <th style="background:#fff0f0;color:#c62828">포기</th>
              <th style="background:#fff0f0;color:#c62828">변경</th>
              <th class="th-blue">방문예약</th>
              <th class="th-blue">실방문</th>
              <th class="th-blue">실방문율</th>
              <th class="th-green">체결</th>
              <th class="th-green">체결율</th>
              <th class="th-yellow">총매출</th>
              <th class="th-yellow">환산매출</th>
            </tr>
          </thead>
          <tbody id="branch-tbody"></tbody>
        </table>
      </div>
    </div>

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
      </div>
    </div>
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
    let { managerStats, totals } = calcStats(from, to);

    // 부서 데이터 추가
    managerStats = managerStats.map(m => ({ ...m, dept: DEPT_MAP[m.name] || '-', date: from === to ? from : `${from}~${to}` }));

    // ── 지사별 요약 테이블 (필터 전 전체 데이터 기준) ──
    const branchGroups = {};
    managerStats.forEach(m => {
      if (!branchGroups[m.branch]) branchGroups[m.branch] = [];
      branchGroups[m.branch].push(m);
    });
    const branchSummary = Object.entries(branchGroups).map(([branch, members]) => {
      const s = members.reduce((t, m) => ({
        db: t.db + m.db, callCount: t.callCount + m.callCount, contacts: t.contacts + m.contacts,
        abandoned: t.abandoned + m.abandoned, changed: t.changed + m.changed,
        meetingRes: t.meetingRes + m.meetingRes, actualVisits: t.actualVisits + m.actualVisits,
        joins: t.joins + m.joins, totalAmount: t.totalAmount + m.totalAmount,
        convertedAmount: t.convertedAmount + m.convertedAmount,
      }), { db:0, callCount:0, contacts:0, abandoned:0, changed:0, meetingRes:0, actualVisits:0, joins:0, totalAmount:0, convertedAmount:0 });
      s.visitRate = s.meetingRes > 0 ? Math.round((s.actualVisits / s.meetingRes) * 100) : 0;
      s.closeRate = s.actualVisits > 0 ? Math.round((s.joins / s.actualVisits) * 100) : 0;
      return { branch, count: members.length, ...s };
    });
    const branchTotal = branchSummary.reduce((t, b) => ({
      count: t.count + b.count, db: t.db + b.db, callCount: t.callCount + b.callCount, contacts: t.contacts + b.contacts,
      abandoned: t.abandoned + b.abandoned, changed: t.changed + b.changed,
      meetingRes: t.meetingRes + b.meetingRes, actualVisits: t.actualVisits + b.actualVisits,
      joins: t.joins + b.joins, totalAmount: t.totalAmount + b.totalAmount,
      convertedAmount: t.convertedAmount + b.convertedAmount,
    }), { count:0, db:0, callCount:0, contacts:0, abandoned:0, changed:0, meetingRes:0, actualVisits:0, joins:0, totalAmount:0, convertedAmount:0 });
    branchTotal.visitRate = branchTotal.meetingRes > 0 ? Math.round((branchTotal.actualVisits / branchTotal.meetingRes) * 100) : 0;
    branchTotal.closeRate = branchTotal.actualVisits > 0 ? Math.round((branchTotal.joins / branchTotal.actualVisits) * 100) : 0;

    function bCell(v, c) { return `<td class="tc" style="font-weight:${v?'700':'400'};color:${v?c:'var(--text-muted)'}">${v}</td>`; }
    function bPct(v) { const c = v >= 50 ? '#059669' : v > 0 ? '#d97706' : 'var(--text-muted)'; return `<td class="tc" style="font-weight:${v?'700':'400'};color:${c}">${v}%</td>`; }
    function bMon(v) { return `<td class="tr" style="font-weight:${v?'600':'400'};color:${v?'var(--text-primary)':'var(--text-muted)'};font-size:11px">${v?v.toLocaleString():'0'}</td>`; }

    document.getElementById('branch-tbody').innerHTML = branchSummary.map(b => `<tr>
      <td class="tc" style="font-weight:600">${b.branch}</td>
      ${bCell(b.count,'#374151')}${bCell(b.db,'#374151')}${bCell(b.callCount,'#6366f1')}${bCell(b.contacts,'#2563eb')}
      ${bCell(b.abandoned,'#c62828')}${bCell(b.changed,'#e65100')}
      ${bCell(b.meetingRes,'#7c3aed')}${bCell(b.actualVisits,'#0ea5e9')}${bPct(b.visitRate)}
      ${bCell(b.joins,'#059669')}${bPct(b.closeRate)}${bMon(b.totalAmount)}${bMon(b.convertedAmount)}
    </tr>`).join('') + `<tr style="background:var(--bg-secondary);font-weight:700;border-top:1px solid var(--border-light)">
      <td class="tc">합계</td>
      <td class="tc">${branchTotal.count}명</td><td class="tc">${branchTotal.db}</td>
      <td class="tc" style="color:#6366f1">${branchTotal.callCount}</td><td class="tc" style="color:#2563eb">${branchTotal.contacts}</td>
      <td class="tc" style="color:#c62828">${branchTotal.abandoned}</td><td class="tc" style="color:#e65100">${branchTotal.changed}</td>
      <td class="tc" style="color:#7c3aed">${branchTotal.meetingRes}</td><td class="tc" style="color:#0ea5e9">${branchTotal.actualVisits}</td>
      <td class="tc">${branchTotal.visitRate}%</td><td class="tc" style="color:#059669">${branchTotal.joins}</td>
      <td class="tc">${branchTotal.closeRate}%</td>
      <td class="tr">${branchTotal.totalAmount.toLocaleString()}</td><td class="tr">${branchTotal.convertedAmount.toLocaleString()}</td>
    </tr>`;
    const periodText = from === to ? from : `${from} ~ ${to}`;
    document.getElementById('branch-period-label').textContent = periodText;

    // ── 상담사별 테이블 ──

    totals = managerStats.reduce((t, m) => ({
      db: t.db + m.db, callCount: t.callCount + m.callCount, contacts: t.contacts + m.contacts,
      abandoned: t.abandoned + m.abandoned, changed: t.changed + m.changed,
      meetingRes: t.meetingRes + m.meetingRes, actualVisits: t.actualVisits + m.actualVisits,
      joins: t.joins + m.joins, joinAmount: t.joinAmount + m.joinAmount,
      totalAmount: t.totalAmount + m.totalAmount, convertedAmount: t.convertedAmount + m.convertedAmount,
    }), { db:0, callCount:0, contacts:0, abandoned:0, changed:0, meetingRes:0, actualVisits:0, joins:0, joinAmount:0, totalAmount:0, convertedAmount:0 });
    totals.visitRate = totals.meetingRes > 0 ? Math.round((totals.actualVisits / totals.meetingRes) * 100) : 0;
    totals.closeRate = totals.actualVisits > 0 ? Math.round((totals.joins / totals.actualVisits) * 100) : 0;

    document.getElementById('period-label').textContent = periodText;

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

    document.getElementById('stats-tbody').innerHTML = managerStats.map((m, i) => `<tr>
      <td class="tc">${i + 1}</td>
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
  }

  updateData();

  document.getElementById('btn-search').addEventListener('click', () => updateData());
  document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('f-from').value = today;
    document.getElementById('f-to').value = today;
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
  // 엑셀 다운로드
  document.getElementById('btn-excel').addEventListener('click', () => downloadExcel());
}

async function downloadExcel() {
  try {
    const XLSX = await import('xlsx');
    const from = document.getElementById('f-from').value;
    const to = document.getElementById('f-to').value;
    const { managerStats, totals } = calcStats(from, to);
    const DEPT_MAP = {
      '김지은':'상담1팀','박서연':'상담1팀','이하나':'상담1팀','정민수':'상담2팀','최유리':'상담2팀',
      '한소희':'상담1팀','강다연':'상담2팀','윤채영':'상담1팀','임서진':'상담2팀','조예린':'상담1팀',
      '송지은':'상담1팀','나예림':'상담2팀','문정은':'상담1팀','백수진':'상담2팀','오은서':'상담1팀',
      '신유리':'상담2팀','권미라':'상담1팀','서예지':'상담2팀','류해인':'상담1팀','차수빈':'상담2팀',
      '양수아':'상담1팀','황은정':'상담2팀','전지현':'상담1팀','장세희':'상담2팀','김나영':'상담1팀',
      '이수정':'상담2팀','박미란':'상담1팀','조하연':'상담2팀','정은채':'상담1팀','최지우':'상담2팀',
    };
    const wb = XLSX.utils.book_new();
    const period = from === to ? from : `${from}~${to}`;

    // Sheet 1: KPI 통계
    const kpiRows = [
      ['상담통계 KPI', '', '조회기간', period],
      [],
      ['항목', '값'],
      ['총 보유DB', totals.db],
      ['회원 컨텍수', totals.contacts],
      ['총 콜수', totals.callCount],
      ['총 방문예약', totals.meetingRes],
      ['체결 건수', totals.joins],
      ['총매출금액', totals.totalAmount],
      ['환산매출', totals.convertedAmount],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiRows), 'KPI통계');

    // Sheet 2: 지사별 현황
    const branchGroups = {};
    managerStats.forEach(m => {
      const br = branchMap[CONSULTANT_BRANCH[m.name]] || '-';
      if (!branchGroups[br]) branchGroups[br] = [];
      branchGroups[br].push(m);
    });
    const branchHeaders = ['지사','인원수','보유DB','콜수','컨텍수','포기','변경','방문예약','실방문','실방문율(%)','체결','체결율(%)','총매출','환산매출'];
    const branchRows = [branchHeaders];
    Object.entries(branchGroups).forEach(([branch, members]) => {
      const s = members.reduce((t,m) => ({
        db:t.db+m.db, callCount:t.callCount+m.callCount, contacts:t.contacts+m.contacts,
        abandoned:t.abandoned+m.abandoned, changed:t.changed+m.changed,
        meetingRes:t.meetingRes+m.meetingRes, actualVisits:t.actualVisits+m.actualVisits,
        joins:t.joins+m.joins, totalAmount:t.totalAmount+m.totalAmount,
        convertedAmount:t.convertedAmount+m.convertedAmount,
      }),{db:0,callCount:0,contacts:0,abandoned:0,changed:0,meetingRes:0,actualVisits:0,joins:0,totalAmount:0,convertedAmount:0});
      const vr = s.meetingRes>0 ? Math.round((s.actualVisits/s.meetingRes)*100) : 0;
      const cr = s.actualVisits>0 ? Math.round((s.joins/s.actualVisits)*100) : 0;
      branchRows.push([branch, members.length, s.db, s.callCount, s.contacts, s.abandoned, s.changed, s.meetingRes, s.actualVisits, vr+'%', s.joins, cr+'%', s.totalAmount, s.convertedAmount]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(branchRows), '지사별현황');

    // Sheet 3: 상담사별 현황
    const mgrHeaders = ['No','지사','부서','상담사','보유DB','콜수','컨텍수','포기(불가)','변경','총방문예약','실제방문','실방문율(%)','체결건수','체결율(%)','신규매출','총매출금액','환산매출'];
    const mgrRows = [mgrHeaders];
    managerStats.forEach((m, i) => {
      mgrRows.push([i+1, m.branch, DEPT_MAP[m.name]||'-', m.name, m.db, m.callCount, m.contacts, m.abandoned, m.changed, m.meetingRes, m.actualVisits, m.visitRate+'%', m.joins, m.closeRate+'%', m.joinAmount, m.totalAmount, m.convertedAmount]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(mgrRows), '상담사별현황');

    XLSX.writeFile(wb, `상담통계_${period}.xlsx`);
  } catch (e) {
    console.error('엑셀 다운로드 실패:', e);
    alert('엑셀 다운로드에 실패했습니다.');
  }
}

render();
