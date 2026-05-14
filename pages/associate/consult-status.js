/* ========================================
   준회원 상담현황 관리 (Consult Status)
   
   기존 시스템 기반 — 매니저별 상담현황 + 상담활동 로그
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, BRANCHES } from '@config/constants.js';

initLayout({ pageId: 'associate-consult-status', breadcrumbs: ['준회원 관리', '상담현황'] });
const content = document.getElementById('content');

/* ── 상태 분류 헬퍼 ── */
const STATUS_CATEGORIES = {
  inflow: ['컨텍전'],
  missed: ['부재중(미컨텍)'],
  consulting: ['낮음(컨텍)', '보통(컨텍)', '높음(컨텍)', '장기상담(컨텍)', '가입보류(컨텍)'],
  meeting: ['방문상담'],
  contract: ['가입중', '가입완료'],
  pending: ['기간만료(재컨텍)', '변경', '중복', '불가', '소스외'],
};

function classifyStatus(status) {
  for (const [cat, list] of Object.entries(STATUS_CATEGORIES)) {
    if (list.includes(status)) return cat;
  }
  return 'other';
}

/* ── 데이터 통계 집계 ── */
function getStatusData() {
  let d = [...MockAssociates];
  try {
    const u = JSON.parse(localStorage.getItem('purples_status_updates') || '{}');
    d = d.map(x => u[x.id] ? { ...x, status: typeof u[x.id] === 'string' ? u[x.id] : u[x.id].status || x.status } : x);
  } catch (e) {}
  return d;
}

function buildConsultantStats(data, branchFilter) {
  let filtered = [...data];
  if (branchFilter) filtered = filtered.filter(m => m.branch === branchFilter);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const stats = {};

  filtered.forEach(m => {
    const key = m.consultant;
    if (!stats[key]) {
      stats[key] = {
        consultant: key, branch: m.branch, team: m.team || '1팀',
        today_contact: 0, today_meeting_reserve: 0, today_meeting: 0, today_join: 0, today_join_amount: 0,
        yesterday_contact: 0, yesterday_meeting_reserve: 0, yesterday_meeting: 0, yesterday_join: 0, yesterday_join_amount: 0,
      };
    }
    const s = stats[key];

    (m.contactHistory || []).forEach(h => {
      const d = (h.date || '').slice(0, 10);
      if (d === todayStr) s.today_contact++;
      else if (d === yesterdayStr) s.yesterday_contact++;
    });

    try {
      const callHist = JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]');
      callHist.forEach(h => {
        const d = (h.date || h.createdAt || '').slice(0, 10);
        if (d === todayStr) s.today_contact++;
        else if (d === yesterdayStr) s.yesterday_contact++;
      });
    } catch (e) {}

    (m.meetingHistory || []).forEach(h => {
      const d = (h.date || '').slice(0, 10);
      if (d === todayStr) { s.today_meeting++; if (h.status === '예약' || h.status === '확정') s.today_meeting_reserve++; }
      else if (d === yesterdayStr) { s.yesterday_meeting++; if (h.status === '예약' || h.status === '확정') s.yesterday_meeting_reserve++; }
    });

    if (m.status === '가입완료' || m.status === '가입중') {
      const joinDate = (m.joinedAt || m.contractDate || m.registeredAt || '').slice(0, 10);
      const amount = m.contractAmount || m.joinAmount || 0;
      if (joinDate === todayStr) { s.today_join++; s.today_join_amount += amount; }
      else if (joinDate === yesterdayStr) { s.yesterday_join++; s.yesterday_join_amount += amount; }
    }
  });

  return Object.values(stats).sort((a, b) => {
    if (a.branch < b.branch) return -1;
    if (a.branch > b.branch) return 1;
    return a.consultant.localeCompare(b.consultant);
  });
}

/* ── 상담활동 로그 데이터 생성 ── */
function getConsultLogs(branchFilter) {
  let data = getStatusData();
  if (branchFilter) data = data.filter(m => m.branch === branchFilter);

  const logs = [];
  // localStorage에서 전화상담 이력 수집
  data.forEach(m => {
    // contactHistory에서 로그 추출
    (m.contactHistory || []).forEach(h => {
      logs.push({
        consultant: m.consultant,
        memberName: m.name,
        date: h.date,
        type: h.type || '통화',
        content: h.content || '-',
        result: h.result || '-',
        latestNote: '',
      });
    });

    // localStorage 전화상담 기록
    try {
      const callHist = JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]');
      callHist.forEach(h => {
        logs.push({
          consultant: h.consultant || m.consultant,
          memberName: m.name,
          date: h.date || h.createdAt,
          type: '통화',
          content: h.content || '-',
          result: h.result || '-',
          latestNote: '',
        });
      });
    } catch (e) {}
  });

  logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  return logs.slice(0, 50); // 최근 50건
}

/* ── 상담 현황 테이블 렌더링 ── */
function renderStatsTable(stats) {
  if (stats.length === 0) {
    return '<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px">데이터가 없습니다.</div>';
  }
  const totals = stats.reduce((acc, s) => {
    ['today_contact','today_meeting_reserve','today_meeting','today_join','today_join_amount',
     'yesterday_contact','yesterday_meeting_reserve','yesterday_meeting','yesterday_join','yesterday_join_amount'
    ].forEach(k => { acc[k] = (acc[k] || 0) + (s[k] || 0); });
    return acc;
  }, {});
  const fmtAmt = (v) => v ? Formatters.number(v) : '0';
  const rows = stats.map(s => `
    <tr>
      <td class="cs-cell cs-branch">${s.branch}</td>
      <td class="cs-cell" style="font-weight:600;color:var(--text-secondary)">${s.team}</td>
      <td class="cs-cell cs-manager"><a href="consult-detail.html?manager=${encodeURIComponent(s.consultant)}" target="_blank" class="cs-manager-link">${s.consultant}</a></td>
      <td class="cs-cell cs-num cs-today">${s.today_contact}</td>
      <td class="cs-cell cs-num cs-today">${s.today_meeting_reserve}</td>
      <td class="cs-cell cs-num cs-today">${s.today_meeting}</td>
      <td class="cs-cell cs-num cs-today">${s.today_join}</td>
      <td class="cs-cell cs-num cs-today">${fmtAmt(s.today_join_amount)}</td>
      <td class="cs-cell cs-num cs-yest">${s.yesterday_contact}</td>
      <td class="cs-cell cs-num cs-yest">${s.yesterday_meeting_reserve}</td>
      <td class="cs-cell cs-num cs-yest">${s.yesterday_meeting}</td>
      <td class="cs-cell cs-num cs-yest">${s.yesterday_join}</td>
      <td class="cs-cell cs-num cs-yest">${fmtAmt(s.yesterday_join_amount)}</td>
    </tr>
  `).join('');
  return `
    <div style="overflow-x:auto">
      <table class="cs-table">
        <thead>
          <tr>
            <th class="cs-th" rowspan="2" style="width:60px">지사</th>
            <th class="cs-th" rowspan="2" style="width:50px">팀</th>
            <th class="cs-th" rowspan="2" style="width:80px">매니저</th>
            <th class="cs-th cs-group-today" colspan="5">오늘</th>
            <th class="cs-th cs-group-yesterday" colspan="5">어제</th>
          </tr>
          <tr>
            <th class="cs-th cs-sub">회원<br>컨텍수</th>
            <th class="cs-th cs-sub">미팅<br>예약건수</th>
            <th class="cs-th cs-sub">금일<br>미팅건수</th>
            <th class="cs-th cs-sub">금일<br>가입건수</th>
            <th class="cs-th cs-sub">금일<br>가입금액</th>
            <th class="cs-th cs-sub">회원<br>컨텍수</th>
            <th class="cs-th cs-sub">미팅<br>예약건수</th>
            <th class="cs-th cs-sub">금일<br>미팅건수</th>
            <th class="cs-th cs-sub">금일<br>가입건수</th>
            <th class="cs-th cs-sub">금일<br>가입금액</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr class="cs-total">
            <td class="cs-cell" colspan="3" style="text-align:center;font-weight:700">합계</td>
            <td class="cs-cell cs-num">${totals.today_contact || 0}</td>
            <td class="cs-cell cs-num">${totals.today_meeting_reserve || 0}</td>
            <td class="cs-cell cs-num">${totals.today_meeting || 0}</td>
            <td class="cs-cell cs-num">${totals.today_join || 0}</td>
            <td class="cs-cell cs-num">${fmtAmt(totals.today_join_amount)}</td>
            <td class="cs-cell cs-num">${totals.yesterday_contact || 0}</td>
            <td class="cs-cell cs-num">${totals.yesterday_meeting_reserve || 0}</td>
            <td class="cs-cell cs-num">${totals.yesterday_meeting || 0}</td>
            <td class="cs-cell cs-num">${totals.yesterday_join || 0}</td>
            <td class="cs-cell cs-num">${fmtAmt(totals.yesterday_join_amount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

/* ── 상담 활동 로그 테이블 렌더링 ── */
function renderLogTable(logs) {
  if (logs.length === 0) {
    return '<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:13px">상담 활동 내역이 없습니다.</div>';
  }

  const typeBadge = (t) => {
    const colors = { '통화': '#3b82f6', '방문': '#10b981', '문자': '#f59e0b', 'SMS': '#f59e0b' };
    const c = colors[t] || '#6b7280';
    return `<span style="display:inline-block;padding:2px 8px;font-size:10px;font-weight:600;border-radius:3px;background:${c}15;color:${c};border:1px solid ${c}30">${t}</span>`;
  };

  const resultBadge = (r) => {
    if (!r || r === '-') return '<span style="color:var(--text-muted)">-</span>';
    const colors = {
      '상담중': '#3b82f6', '완료': '#10b981', '부재중': '#ef4444',
      '부재중(미컨텍)': '#ef4444', '방문상담': '#8b5cf6',
    };
    const c = colors[r] || '#6b7280';
    return `<span style="display:inline-block;padding:2px 8px;font-size:10px;font-weight:600;border-radius:3px;background:${c}15;color:${c};border:1px solid ${c}30">${r}</span>`;
  };

  const rows = logs.map((l, i) => `
    <tr>
      <td class="cs-cell cs-num" style="width:50px">${i + 1}</td>
      <td class="cs-cell">${l.consultant}</td>
      <td class="cs-cell">${l.memberName}</td>
      <td class="cs-cell">${Formatters.date(l.date)}</td>
      <td class="cs-cell">${typeBadge(l.type)}</td>
      <td class="cs-cell" style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.content}</td>
      <td class="cs-cell">${resultBadge(l.result)}</td>
      <td class="cs-cell" style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${l.latestNote || '-'}</td>
    </tr>
  `).join('');

  return `
    <table class="cs-table cs-log-table">
      <thead>
        <tr>
          <th class="cs-th" style="width:50px">번호</th>
          <th class="cs-th">매니저</th>
          <th class="cs-th">회원명</th>
          <th class="cs-th">날짜</th>
          <th class="cs-th">Type</th>
          <th class="cs-th">내용</th>
          <th class="cs-th">결과</th>
          <th class="cs-th">최신내용</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

/* ── 메인 렌더 ── */
function render() {
  const data = getStatusData();
  const branches = [...new Set(data.map(m => m.branch))].sort();

  content.innerHTML = `
    <style>
      .cs-table { width:100%; border-collapse:collapse; font-size:12px; }
      .cs-th { padding:6px 8px; background:var(--bg-secondary); border:1px solid var(--border-light);
               font-weight:700; text-align:center; font-size:11px; white-space:nowrap;
               color:var(--text-secondary); }
      .cs-th.cs-group-today { background:#e0f2fe; color:#0369a1; border-bottom:2px solid #0ea5e9; }
      .cs-th.cs-group-yesterday { background:#fef3c7; color:#92400e; border-bottom:2px solid #f59e0b; }
      .cs-th.cs-sub { font-size:10px; font-weight:600; }
      .cs-cell { padding:5px 8px; border:1px solid var(--border-light); text-align:center; font-size:12px; }
      .cs-cell.cs-branch { font-weight:600; color:var(--text-secondary); background:var(--bg-secondary); }
      .cs-cell.cs-manager { font-weight:600; color:var(--text-primary); }
      .cs-manager-link { color:var(--accent); text-decoration:underline; font-weight:700; 
                         cursor:pointer; transition:color var(--transition-fast); }
      .cs-manager-link:hover { color:var(--accent-dark); }
      .cs-cell.cs-num { text-align:center; font-variant-numeric:tabular-nums; }
      .cs-cell.cs-today { background:#f0f9ff; }
      .cs-cell.cs-yest { background:#fffbeb; }
      .cs-total { background:#f0f0ff; }
      .cs-total .cs-cell { font-weight:700; color:var(--accent-dark); border-top:2px solid var(--accent); }
      .cs-log-table .cs-th { background:var(--bg-sidebar-solid); color:#fff; font-size:11px; }
      .cs-log-table tbody tr:hover { background:var(--accent-bg); }

      .cs-summary-card {
        display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px;
      }
      .cs-card {
        flex:1; min-width:140px; padding:16px 20px;
        background:var(--bg-primary); border:1px solid var(--border-light);
        border-radius:var(--radius-lg); text-align:center;
        box-shadow:var(--shadow-sm); transition:all var(--transition-fast);
      }
      .cs-card:hover { box-shadow:var(--shadow-md); transform:translateY(-1px); }
      .cs-card__value { font-size:1.5rem; font-weight:800; color:var(--accent); }
      .cs-card__label { font-size:11px; color:var(--text-muted); margin-top:4px; }

      tbody tr:nth-child(even) .cs-cell:not(.cs-branch):not(.cs-today):not(.cs-yest) { background:var(--bg-secondary); }
      tbody tr:nth-child(even) .cs-cell.cs-today { background:#e8f4fd; }
      tbody tr:nth-child(even) .cs-cell.cs-yest { background:#fef9e7; }
    </style>

    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div>
        <h1 class="page-header__title">상담 현황</h1>
        <p class="page-header__subtitle">매니저별 준회원 상담 현황 및 활동 로그</p>
      </div>
      <div class="page-header__actions">
        <select class="form-select form-input--sm" id="f-branch" style="width:auto;min-width:120px">
          <option value="">본사 / 지사</option>
          ${branches.map(b => `<option value="${b}">${b}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- 요약 카드 -->
    <div class="cs-summary-card" id="summary-cards"></div>

    <!-- 상담 현황 테이블 -->
    <div class="card" style="margin-bottom:24px">
      <div class="card__header" style="display:flex;justify-content:space-between;align-items:center">
        <h3 class="card__title" style="font-size:14px">매니저별 상담 현황</h3>
        <span style="font-size:11px;color:var(--text-muted)">유입: 최근 30일 등록 | 미제: 30일 이전 등록</span>
      </div>
      <div class="card__body" style="padding:0" id="stats-table"></div>
    </div>

    <!-- 상담 활동 로그 -->
    <div class="card">
      <div class="card__header" style="display:flex;justify-content:space-between;align-items:center">
        <h3 class="card__title" style="font-size:14px">상담 활동 로그</h3>
        <span style="font-size:11px;color:var(--text-muted)">최근 50건</span>
      </div>
      <div class="card__body" style="padding:0;max-height:500px;overflow-y:auto" id="log-table"></div>
    </div>
  `;

  updateView('');

  // 지사 필터 이벤트
  document.getElementById('f-branch').addEventListener('change', (e) => {
    updateView(e.target.value);
  });
}

function updateView(branchFilter) {
  const data = getStatusData();
  const stats = buildConsultantStats(data, branchFilter);
  const logs = getConsultLogs(branchFilter);

  // 요약 카드
  let filtered = branchFilter ? data.filter(m => m.branch === branchFilter) : data;
  const totalMembers = filtered.length;
  const totalMissed = filtered.filter(m => classifyStatus(m.status) === 'missed' || classifyStatus(m.status) === 'inflow').length;
  const totalConsulting = filtered.filter(m => classifyStatus(m.status) === 'consulting').length;
  const totalMeeting = filtered.filter(m => classifyStatus(m.status) === 'meeting').length;
  const totalContract = filtered.filter(m => ['가입중', '가입완료'].includes(m.status)).length;
  const totalPending = filtered.filter(m => classifyStatus(m.status) === 'pending').length;

  document.getElementById('summary-cards').innerHTML = `
    <div class="cs-card">
      <div class="cs-card__value" style="color:var(--text-primary)">${totalMembers}</div>
      <div class="cs-card__label">전체 회원 DB</div>
    </div>
    <div class="cs-card">
      <div class="cs-card__value" style="color:#ef4444">${totalMissed}</div>
      <div class="cs-card__label">미통화 / 컨텍전</div>
    </div>
    <div class="cs-card">
      <div class="cs-card__value" style="color:#3b82f6">${totalConsulting}</div>
      <div class="cs-card__label">상담 중</div>
    </div>
    <div class="cs-card">
      <div class="cs-card__value" style="color:#8b5cf6">${totalMeeting}</div>
      <div class="cs-card__label">미팅 진행</div>
    </div>
    <div class="cs-card">
      <div class="cs-card__value" style="color:#10b981">${totalContract}</div>
      <div class="cs-card__label">계약 / 가입</div>
    </div>
    <div class="cs-card">
      <div class="cs-card__value" style="color:#f59e0b">${totalPending}</div>
      <div class="cs-card__label">미제 (기타)</div>
    </div>
  `;

  // 테이블 렌더링
  document.getElementById('stats-table').innerHTML = renderStatsTable(stats);
  document.getElementById('log-table').innerHTML = renderLogTable(logs);
}

render();
