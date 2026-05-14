/* ========================================
   방문상담 관리 (표준 디자인 시스템)
   통합: 약속관리 + 방문상담현황
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS } from '@config/constants.js';

initLayout({ pageId: 'associate-visit', breadcrumbs: ['준회원 관리', '방문상담 관리'] });
const content = document.getElementById('content');

const BRANCHES = ['본사','경기','부산','대구','대전','광주'];
const VISIT_RESULTS = ['기타','취소','변경','보류','가입'];

/* ── Mock 방문상담 데이터 ── */
function generateVisitData() {
  const stored = localStorage.getItem('purples_visit_data');
  if (stored) { try { return JSON.parse(stored); } catch (e) {} }
  const visits = [];
  const members = [...MockAssociates];
  const now = new Date();
  const thisMonth = now.getMonth(), thisYear = now.getFullYear();
  let id = 1;
  for (let day = 1; day <= 30; day++) {
    const count = Math.floor(Math.random() * 4);
    for (let j = 0; j < count; j++) {
      const m = members[Math.floor(Math.random() * members.length)];
      const hours = [9,10,11,13,14,15,16,17,19][Math.floor(Math.random()*9)];
      const mins = [0,0,30,30][Math.floor(Math.random()*4)];
      const date = new Date(thisYear, thisMonth, day, hours, mins);
      const isPast = date <= now;
      const result = isPast ? ['기타','취소','변경','보류','가입'][Math.floor(Math.random()*5)] : '';
      visits.push({ id: id++, branch: m.branch, consultant: m.consultant,
        memberName: m.name, memberId: m.id, date: date.toISOString(),
        time: `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`,
        visitStatus: isPast ? '방문예정' : (Math.random() > 0.3 ? '방문예정' : '방문미정'),
        content: ['1시경필 기로함','방문예정','보고 싶은 여성','실시간상담','오후방문 예정',''][Math.floor(Math.random()*6)],
        result, resultNote: result === '가입' ? '골드 가입 완료' : result === '취소' ? '미팅취소' : '',
        amount: result === '가입' ? [2000000,3000000,5000000][Math.floor(Math.random()*3)] : 0 });
    }
  }
  visits.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem('purples_visit_data', JSON.stringify(visits));
  return visits;
}

let currentYear, currentMonth, selectedDate;
let allVisits = [];

function init() {
  const now = new Date();
  currentYear = now.getFullYear(); currentMonth = now.getMonth();
  selectedDate = now.toISOString().slice(0, 10);
  allVisits = generateVisitData();
}

/* ── 캘린더 (표준 mini-cal 클래스) ── */
function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const mn = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const dayCounts = {};
  allVisits.forEach(v => {
    const d = new Date(v.date);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) dayCounts[d.getDate()] = (dayCounts[d.getDate()]||0)+1;
  });

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div class="mini-cal__cell mini-cal__cell--empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dow = new Date(currentYear, currentMonth, d).getDay();
    const cls = [
      'mini-cal__cell',
      ds === selectedDate ? 'mini-cal__cell--selected' : '',
      ds === new Date().toISOString().slice(0,10) ? 'mini-cal__cell--today' : ''
    ].filter(Boolean).join(' ');
    const dayCls = dow === 0 ? 'mini-cal__day mini-cal__day--sun' : dow === 6 ? 'mini-cal__day mini-cal__day--sat' : 'mini-cal__day';
    cells += `<div class="${cls}" data-date="${ds}" onclick="window.__selectDate('${ds}')">
      <span class="${dayCls}">${d}</span>
      ${dayCounts[d] ? `<span class="mini-cal__badge">${dayCounts[d]}건</span>` : ''}
    </div>`;
  }

  return `<div class="mini-cal">
    <div class="mini-cal__header">
      <button class="mini-cal__nav" id="cal-prev">◀ ${currentMonth === 0 ? '12월' : mn[currentMonth-1]}</button>
      <span class="mini-cal__title">${currentYear}년 ${mn[currentMonth]}</span>
      <button class="mini-cal__nav" id="cal-next">${currentMonth === 11 ? '1월' : mn[currentMonth+1]} ▶</button>
    </div>
    <div class="mini-cal__grid">
      <div class="mini-cal__head mini-cal__head--sun">일</div><div class="mini-cal__head">월</div>
      <div class="mini-cal__head">화</div><div class="mini-cal__head">수</div>
      <div class="mini-cal__head">목</div><div class="mini-cal__head">금</div>
      <div class="mini-cal__head mini-cal__head--sat">토</div>
      ${cells}
    </div>
  </div>`;
}

/* ── 요약 (표준 stat-summary 클래스) ── */
function renderSummary() {
  const mv = allVisits.filter(v => { const d = new Date(v.date); return d.getFullYear()===currentYear && d.getMonth()===currentMonth; });
  const s = { 미팅수:mv.length, 출장:0, 방문:mv.filter(v=>v.visitStatus!=='방문미정').length,
    취소:mv.filter(v=>v.result==='취소').length, 변경:mv.filter(v=>v.result==='변경').length,
    가입:mv.filter(v=>v.result==='가입').length,
    가입금액:mv.filter(v=>v.result==='가입').reduce((a,v)=>a+(v.amount||0),0) };
  const row = (l,v) => `<tr><td class="stat-summary__label">${l}</td><td class="stat-summary__value">${l==='가입금액'?v.toLocaleString()+'원':v}</td></tr>`;
  return `<div class="stat-summary"><div class="stat-summary__title">월간 요약</div>
    <table class="stat-summary__table"><tbody>${row('미팅수',s.미팅수)}${row('출장',s.출장)}${row('방문',s.방문)}${row('취소',s.취소)}${row('변경',s.변경)}${row('가입',s.가입)}${row('가입금액',s.가입금액)}</tbody></table></div>`;
}

/* ── 배지 ── */
function resultBadge(r) {
  if (!r) return '<span class="text-muted">-</span>';
  const map = {'기타':'gray','취소':'red','변경':'amber','보류':'purple','가입':'green'};
  return `<span class="badge badge--${map[r]||'gray'}">${r}</span>`;
}
function visitStatusBadge(s) {
  const map = {'방문예정':'blue','방문미정':'amber','방문완료':'green'};
  return `<span class="badge badge--${map[s]||'gray'}">${s}</span>`;
}

/* ── 테이블 ── */
function renderTable() {
  const gv = id => document.getElementById(id)?.value || '';
  let data = [...allVisits];
  if (gv('f-date-from')) data = data.filter(v => v.date.slice(0,10) >= gv('f-date-from'));
  if (gv('f-date-to')) data = data.filter(v => v.date.slice(0,10) <= gv('f-date-to'));
  if (gv('f-consultant')) data = data.filter(v => v.consultant === gv('f-consultant'));
  if (gv('f-branch')) data = data.filter(v => v.branch === gv('f-branch'));
  if (gv('f-result')) data = data.filter(v => v.result === gv('f-result'));
  data.sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById('visit-tbody').innerHTML = data.map((v, i) => `<tr>
    <td class="tc col-no">${data.length-i}</td><td class="tc">${v.branch}</td>
    <td class="tc col-name">${v.consultant}</td>
    <td class="tc"><a href="detail.html?id=${v.memberId}" target="_blank" class="col-link" style="text-decoration:none">${v.memberName}</a></td>
    <td class="tc">${v.date.slice(0,10)}</td><td class="tc">${v.time}</td>
    <td class="tc">${visitStatusBadge(v.visitStatus)}</td>
    <td class="tl ellipsis">${v.content||'-'}</td>
    <td class="tc">${resultBadge(v.result)}</td>
    <td class="tl ellipsis">${v.resultNote||'-'}</td>
    <td class="tc">${v.amount ? v.amount.toLocaleString()+'원' : '-'}</td>
  </tr>`).join('') || '<tr><td colspan="11" style="text-align:center;padding:30px" class="text-muted">해당 기간 방문상담 내역이 없습니다.</td></tr>';
  document.getElementById('visit-count').textContent = `${data.length}건`;
}

window.__selectDate = function(dateStr) {
  selectedDate = dateStr;
  document.getElementById('f-date-from').value = dateStr;
  document.getElementById('f-date-to').value = dateStr;
  document.getElementById('cal-area').innerHTML = renderCalendar();
  bindCalendarEvents(); renderTable();
};

function bindCalendarEvents() {
  document.getElementById('cal-prev')?.addEventListener('click', () => {
    currentMonth--; if (currentMonth < 0) { currentMonth=11; currentYear--; }
    document.getElementById('cal-area').innerHTML = renderCalendar();
    document.getElementById('summary-area').innerHTML = renderSummary();
    bindCalendarEvents();
  });
  document.getElementById('cal-next')?.addEventListener('click', () => {
    currentMonth++; if (currentMonth > 11) { currentMonth=0; currentYear++; }
    document.getElementById('cal-area').innerHTML = renderCalendar();
    document.getElementById('summary-area').innerHTML = renderSummary();
    bindCalendarEvents();
  });
}

function render() {
  init();
  const today = new Date().toISOString().slice(0,10);
  const consultants = [...new Set(allVisits.map(v => v.consultant))].sort();

  content.innerHTML = `
    <style>
      .visit-top{display:grid;grid-template-columns:1fr 240px;gap:16px;margin-bottom:20px}
      @media(max-width:900px){.visit-top{grid-template-columns:1fr}}
    </style>

    <div class="page-header">
      <div><h1 class="page-header__title">방문상담 관리</h1>
      <p class="page-header__subtitle">준회원 방문상담 예약 및 결과 관리</p></div>
      <div class="page-header__actions"><button class="btn btn--primary btn--sm" id="btn-new-visit">+ 방문상담 등록</button></div>
    </div>

    <div class="visit-top">
      <div id="cal-area">${renderCalendar()}</div>
      <div id="summary-area">${renderSummary()}</div>
    </div>

    <div class="filter-bar"><div class="filter-bar__row">
      <div class="filter-bar__item"><label>기간</label>
        <div style="display:flex;gap:4px;align-items:center">
          <input type="date" id="f-date-from" value="${today}" class="form-input form-input--sm" style="width:auto">
          <span class="text-muted">~</span>
          <input type="date" id="f-date-to" value="${today}" class="form-input form-input--sm" style="width:auto">
        </div>
      </div>
      <div class="filter-bar__item"><label>지사</label>
        <select class="form-select form-input--sm" id="f-branch"><option value="">전체</option>${BRANCHES.map(b=>`<option>${b}</option>`).join('')}</select>
      </div>
      <div class="filter-bar__item"><label>컨설턴트</label>
        <select class="form-select form-input--sm" id="f-consultant"><option value="">전체</option>${consultants.map(c=>`<option>${c}</option>`).join('')}</select>
      </div>
      <div class="filter-bar__item"><label>결과</label>
        <select class="form-select form-input--sm" id="f-result"><option value="">전체</option>${VISIT_RESULTS.map(r=>`<option>${r}</option>`).join('')}</select>
      </div>
      <button class="btn btn--primary btn--sm" id="btn-filter">검색</button>
      <button class="btn btn--secondary btn--sm" id="btn-reset">초기화</button>
    </div></div>

    <div class="card">
      <div class="card__header"><h3 class="card__title" style="font-size:14px">방문상담 현황</h3>
      <span style="font-size:12px;font-weight:600;color:var(--accent)" id="visit-count">0건</span></div>
      <div class="card__body" style="padding:0;overflow-x:auto">
        <table class="std-table"><thead><tr>
          <th style="width:45px">번호</th><th>지사</th><th>매니저</th><th>회원명</th>
          <th>일자</th><th>시간</th><th>방문상태</th><th>내용</th>
          <th>결과</th><th>결과내용</th><th>가입금액</th>
        </tr></thead><tbody id="visit-tbody"></tbody></table>
      </div>
    </div>
  `;

  renderTable(); bindCalendarEvents();
  document.getElementById('btn-filter').addEventListener('click', renderTable);
  document.getElementById('btn-reset').addEventListener('click', () => {
    ['f-date-from','f-date-to','f-consultant','f-branch','f-result'].forEach(id => { document.getElementById(id).value = ''; });
    selectedDate = '';
    document.getElementById('cal-area').innerHTML = renderCalendar();
    bindCalendarEvents(); renderTable();
  });
  document.getElementById('btn-new-visit').addEventListener('click', () => Toast.show('방문상담 등록 기능은 추후 구현 예정입니다.', 'info'));
}

render();
