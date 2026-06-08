/* ========================================
   매니저 상세 — 기간별 성과 추이
   ======================================== */
import { Formatters } from '@utils/formatters.js';
import { MockAssociates } from '@mock/associates.js';
import { BRANCHES } from '@config/constants.js';

const params = new URLSearchParams(window.location.search);
const managerName = params.get('manager') || '';

const content = document.getElementById('detail-content');

/* ── 지사 코드→한글 ── */
const branchMap = {};
BRANCHES.forEach(b => { branchMap[b.code] = b.name; });

/* ── 데이터 가져오기 ── */
function getManagerData() {
  let data = [...MockAssociates];
  try {
    const u = JSON.parse(localStorage.getItem('purples_status_updates') || '{}');
    data = data.map(x => u[x.id] ? { ...x, status: typeof u[x.id] === 'string' ? u[x.id] : u[x.id].status || x.status } : x);
  } catch (e) {}
  return data.filter(m => m.consultant === managerName);
}

/* ── 기간 내 일별 성과 집계 ── */
function calcDailyStats(from, to) {
  const data = getManagerData();
  const dbCount = data.length;
  const branch = data.length > 0 ? (branchMap[data[0].branch] || data[0].branch || '-') : '-';

  // 날짜 범위 생성
  const dates = [];
  const start = new Date(from);
  const end = new Date(to);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }

  // 일별 초기값
  const daily = {};
  dates.forEach(dt => {
    daily[dt] = { date: dt, contacts: 0, calls: 0, meetings: 0, joins: 0, amount: 0 };
  });

  // 상담 로그 집계 (컨텍수, 콜수)
  data.forEach(m => {
    // contactHistory
    (m.contactHistory || []).forEach(h => {
      const dt = (h.date || h.createdAt || '').slice(0, 10);
      if (daily[dt]) {
        daily[dt].contacts++;
        if (h.type === '통화' || h.type === '전화') daily[dt].calls++;
      }
    });
    // localStorage 전화상담
    try {
      const callHist = JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]');
      callHist.forEach(h => {
        const dt = (h.date || h.createdAt || '').slice(0, 10);
        if (daily[dt]) {
          daily[dt].contacts++;
          daily[dt].calls++;
        }
      });
    } catch (e) {}

    // 미팅 기록
    try {
      const hist = JSON.parse(localStorage.getItem('purples_meeting_history_' + m.id) || '[]');
      hist.forEach(h => {
        const dt = (h.date || '').slice(0, 10);
        if (daily[dt] && h.status !== '예약' && h.status !== '취소') {
          daily[dt].meetings++;
        }
      });
    } catch (e) {}
  });

  // 방문 데이터 (가입 관련)
  try {
    const visitData = JSON.parse(localStorage.getItem('purples_visit_data') || '[]');
    visitData.filter(v => v.consultant === managerName).forEach(v => {
      const dt = (v.date || '').slice(0, 10);
      if (daily[dt] && v.result === '가입') {
        daily[dt].joins++;
        daily[dt].amount += (v.amount || 0);
      }
    });
  } catch (e) {}

  const rows = dates.map(dt => daily[dt]).reverse(); // 최근순
  const totals = rows.reduce((t, r) => ({
    contacts: t.contacts + r.contacts,
    calls: t.calls + r.calls,
    meetings: t.meetings + r.meetings,
    joins: t.joins + r.joins,
    amount: t.amount + r.amount,
  }), { contacts: 0, calls: 0, meetings: 0, joins: 0, amount: 0 });

  return { rows, totals, branch, dbCount };
}

/* ── 날짜 헬퍼 ── */
function today() { return new Date().toISOString().slice(0, 10); }
function weekStart() {
  const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1);
  return d.toISOString().slice(0, 10);
}
function monthStart() {
  const d = new Date(); d.setDate(1);
  return d.toISOString().slice(0, 10);
}

/* ── 렌더 ── */
function render() {
  const todayStr = today();
  document.title = `${managerName} 성과 상세 - 퍼플스 인트라넷`;

  content.innerHTML = `
    <!-- 뒤로가기 -->
    <a class="cd-back-btn" href="javascript:void(0)" id="btn-back">← 상담현황 목록</a>

    <!-- 매니저 기본정보 -->
    <div class="cd-info">
      <h2 class="cd-info__name">${managerName}</h2>
      <span class="cd-info__meta" id="info-branch">-</span>
      <span class="cd-info__meta">보유DB: <strong id="info-db">0</strong>명</span>
    </div>

    <!-- 기간 필터 -->
    <table class="search-table">
      <tbody>
        <tr>
          <th class="search-table__th">기간</th>
          <td class="search-table__td">
            <input type="date" id="f-from" value="${todayStr}" class="form-input form-input--sm fi" style="width:140px">
            <span class="text-muted">~</span>
            <input type="date" id="f-to" value="${todayStr}" class="form-input form-input--sm fi" style="width:140px">
            <div class="period-quick-btns" style="margin-left:8px">
              <button class="btn btn--ghost btn--sm" id="btn-today">오늘</button>
              <button class="btn btn--ghost btn--sm" id="btn-week">이번주</button>
              <button class="btn btn--ghost btn--sm" id="btn-month">이번달</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="search-actions">
      <button class="btn btn--sm search-btn" id="btn-search">검색</button>
      <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
    </div>

    <!-- 기간별 성과 테이블 -->
    <div class="list-section">
      <div class="list-section__header">
        <h3 class="list-section__title">기간별 성과 추이</h3>
        <span class="list-section__meta" id="period-label">${todayStr}</span>
      </div>
      <div class="list-section__body">
        <table class="std-table">
          <thead>
            <tr>
              <th style="width:110px">날짜</th>
              <th>컨텍수</th>
              <th>콜수</th>
              <th>방문미팅</th>
              <th>가입건수</th>
              <th style="width:130px">가입금액</th>
            </tr>
          </thead>
          <tbody id="perf-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- 관리 회원 목록 -->
    <div class="list-section" style="margin-top:24px">
      <div class="list-section__header">
        <h3 class="list-section__title">관리 회원 목록</h3>
        <span class="list-section__meta" id="member-count">0명</span>
      </div>
      <div class="list-section__body">
        <table class="std-table">
          <thead>
            <tr>
              <th style="width:40px">No</th>
              <th style="width:70px">회원명</th>
              <th style="width:60px">성별</th>
              <th style="width:50px">나이</th>
              <th style="width:80px">지역</th>
              <th style="width:110px">연락처</th>
              <th style="width:100px">회원상태</th>
              <th style="width:100px">등록일</th>
            </tr>
          </thead>
          <tbody id="member-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- 상담 기록 -->
    <div class="list-section" style="margin-top:24px">
      <div class="list-section__header">
        <h3 class="list-section__title">상담 기록</h3>
        <span class="list-section__meta" id="log-count">0건</span>
      </div>
      <div class="list-section__body">
        <table class="std-table">
          <thead>
            <tr>
              <th style="width:40px">No</th>
              <th style="width:100px">상담일</th>
              <th style="width:70px">회원명</th>
              <th style="width:110px">연락처</th>
              <th>상담내용</th>
              <th style="width:100px">회원상태</th>
            </tr>
          </thead>
          <tbody id="log-tbody"></tbody>
        </table>
      </div>
    </div>
  `;

  // 스타일 삽입
  const style = document.createElement('style');
  style.textContent = `
    .cd-back-btn { display:inline-flex; align-items:center; gap:4px; font-size:12px;
      color:var(--text-secondary); text-decoration:none; padding:6px 12px;
      border:1px solid var(--border-light); transition:all .15s; margin-bottom:16px; }
    .cd-back-btn:hover { background:var(--accent-bg); border-color:var(--accent); color:var(--accent); }
    .cd-info { display:flex; align-items:center; gap:16px; padding:16px 0; margin-bottom:8px;
      border-bottom:1px solid var(--border-light); }
    .cd-info__name { font-size:18px; font-weight:800; margin:0; color:var(--text-primary); }
    .cd-info__meta { font-size:12px; color:var(--text-muted); }
    .cd-info__meta strong { color:var(--accent); font-weight:700; }
  `;
  content.prepend(style);

  // 이벤트 바인딩
  document.getElementById('btn-back').addEventListener('click', () => { window.close(); });
  document.getElementById('btn-search').addEventListener('click', updateTable);
  document.getElementById('btn-reset').addEventListener('click', () => {
    document.getElementById('f-from').value = todayStr;
    document.getElementById('f-to').value = todayStr;
    updateTable();
  });
  document.getElementById('btn-today').addEventListener('click', () => {
    document.getElementById('f-from').value = todayStr;
    document.getElementById('f-to').value = todayStr;
    updateTable();
  });
  document.getElementById('btn-week').addEventListener('click', () => {
    document.getElementById('f-from').value = weekStart();
    document.getElementById('f-to').value = todayStr;
    updateTable();
  });
  document.getElementById('btn-month').addEventListener('click', () => {
    document.getElementById('f-from').value = monthStart();
    document.getElementById('f-to').value = todayStr;
    updateTable();
  });

  updateTable();
  renderMembers();
  renderLogs();
}

/* ── 테이블 업데이트 ── */
function updateTable() {
  const from = document.getElementById('f-from').value;
  const to = document.getElementById('f-to').value;
  const { rows, totals, branch, dbCount } = calcDailyStats(from, to);

  // 기본 정보 갱신
  document.getElementById('info-branch').textContent = branch;
  document.getElementById('info-db').textContent = dbCount;

  // 기간 레이블
  document.getElementById('period-label').textContent = from === to ? from : `${from} ~ ${to}`;

  const tbody = document.getElementById('perf-tbody');

  function numCell(val) {
    return `<td class="tc" style="color:${val > 0 ? 'var(--text-primary)' : 'var(--text-muted)'}">${val}</td>`;
  }
  function moneyCell(val) {
    return `<td class="tr" style="color:${val > 0 ? 'var(--text-primary)' : 'var(--text-muted)'}">${val > 0 ? val.toLocaleString() : '0'}</td>`;
  }

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">데이터가 없습니다.</td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(r => `<tr>
    <td class="tc">${r.date}</td>
    ${numCell(r.contacts)}
    ${numCell(r.calls)}
    ${numCell(r.meetings)}
    ${numCell(r.joins)}
    ${moneyCell(r.amount)}
  </tr>`).join('') + `<tr style="background:var(--bg-secondary);font-weight:700;border-top:1px solid var(--border-light)">
    <td class="tc">합계</td>
    <td class="tc">${totals.contacts}</td>
    <td class="tc">${totals.calls}</td>
    <td class="tc">${totals.meetings}</td>
    <td class="tc">${totals.joins}</td>
    <td class="tr">${totals.amount > 0 ? totals.amount.toLocaleString() : '0'}</td>
  </tr>`;
}

/* ── 관리 회원 목록 렌더 ── */
function renderMembers() {
  const data = getManagerData().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  document.getElementById('member-count').textContent = `${data.length}명`;
  const tbody = document.getElementById('member-tbody');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="tc" style="padding:40px;color:var(--text-muted)">관리 회원이 없습니다.</td></tr>';
    return;
  }
  tbody.innerHTML = data.map((m, i) => `<tr>
    <td class="tc col-no">${i + 1}</td>
    <td class="tc"><a href="detail.html?id=${m.id}" target="_blank" class="col-link">${m.name}</a></td>
    <td class="tc">${m.gender || '-'}</td>
    <td class="tc">${m.age || '-'}</td>
    <td class="tc">${m.region || '-'}</td>
    <td class="tc">${Formatters.phone(m.phone)}</td>
    <td class="tc" style="white-space:nowrap">${m.status || '-'}</td>
    <td class="tc">${m.createdAt ? m.createdAt.slice(0, 10) : '-'}</td>
  </tr>`).join('');
}

/* ── 상담 기록 렌더 ── */
function renderLogs() {
  const data = getManagerData();
  const logs = [];
  data.forEach(m => {
    (m.contactHistory || []).forEach(h => {
      logs.push({
        date: h.date || h.createdAt,
        memberName: m.name,
        memberId: m.id,
        phone: m.phone,
        content: h.content || '-',
        status: m.status,
      });
    });
    try {
      JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]').forEach(h => {
        logs.push({
          date: h.date || h.createdAt,
          memberName: m.name,
          memberId: m.id,
          phone: m.phone,
          content: h.content || '-',
          status: m.status,
        });
      });
    } catch (e) {}
  });
  logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = logs.slice(0, 50);

  document.getElementById('log-count').textContent = `${logs.length}건`;
  const tbody = document.getElementById('log-tbody');
  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="tc" style="padding:40px;color:var(--text-muted)">상담 기록이 없습니다.</td></tr>';
    return;
  }
  tbody.innerHTML = recent.map((l, i) => {
    const dt = l.date ? new Date(l.date) : null;
    const dateStr = dt && !isNaN(dt) ? `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}` : '-';
    return `<tr>
      <td class="tc col-no">${i + 1}</td>
      <td class="tc">${dateStr}</td>
      <td class="tc"><a href="detail.html?id=${l.memberId}" target="_blank" class="col-link">${l.memberName}</a></td>
      <td class="tc">${Formatters.phone(l.phone)}</td>
      <td class="tl" style="max-width:400px">${l.content}</td>
      <td class="tc" style="white-space:nowrap">${l.status || '-'}</td>
    </tr>`;
  }).join('');
}

/* ── 초기화 ── */
if (!managerName) {
  content.innerHTML = `<div style="padding:60px;text-align:center">
    <div style="font-size:24px;margin-bottom:12px">⚠️</div>
    <div style="font-size:16px;font-weight:600">매니저를 선택해 주세요.</div>
    <a href="consult-status.html" style="color:var(--accent);margin-top:12px;display:inline-block">상담현황 목록으로</a>
  </div>`;
} else {
  render();
}
