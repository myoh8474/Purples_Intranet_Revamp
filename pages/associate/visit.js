/* ========================================
   방문예약 관리
   탭1: 방문 일정표 (캘린더 + 당일 예약)
   탭2: 방문상담 현황 (필터 + 리스트)
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, BRANCHES } from '@config/constants.js';
import { ManagerPicker, renderManagerPickerHTML, getManagerPickerStyles } from '@components/ManagerPicker.js';

initLayout({ pageId: 'associate-visit', breadcrumbs: ['준회원 관리', '방문상담 관리'] });
const content = document.getElementById('content');

const branchMap = {};
BRANCHES.forEach(b => { branchMap[b.code] = b.name; });

const VISIT_RESULTS = ['기타','취소','변경','보류','가입'];

/* ── Mock 방문상담 데이터 (조회 전용 — 등록은 개별 회원 상세페이지에서만 가능) ── */
function generateVisitData() {
  const stored = localStorage.getItem('purples_visit_data');
  if (stored) { try { return JSON.parse(stored); } catch (e) {} }
  const visits = [];
  const members = [...MockAssociates].filter(m => m.consultant);
  const now = new Date();
  const thisMonth = now.getMonth(), thisYear = now.getFullYear();
  const places = ['강남 본사','서초 상담실','잠실 라운지','여의도 상담실','판교 지사','본사 VIP룸','홍대 상담실'];
  const memos = [
    '첫 방문 상담, 프로필 작성 예정','재방문 - 매칭 결과 상담','가입 상담 진행 예정',
    '프로그램 안내 및 비용 상담','매칭 후 피드백 상담','VIP 프로그램 소개',
    '가입 의사 높음, 결제 상담 예정','기존 회원 재상담','소개 후 피드백 면담',
    '오후 방문 예정','실시간 상담 후 방문 확정','1차 상담 후 2차 방문'
  ];
  const resultNotes = {
    '가입': ['골드 프로그램 가입 완료','플래티넘 가입 결정','실버 프로그램 계약 체결','VIP 가입 완료'],
    '보류': ['비용 검토 후 재방문 예정','일정 조율 필요','2주 후 재상담 예정','가족 상의 후 결정'],
    '취소': ['개인 사정으로 취소','일정 변경 요청','No-show','연락 두절'],
    '변경': ['다음 주 화요일로 변경','오후 시간대로 변경','매니저 변경 요청','장소 변경'],
    '기타': ['전화 상담으로 전환','온라인 상담 진행','추가 자료 요청','']
  };
  let id = 1;

  // 이번 달 + 지난 달 데이터 생성
  for (let monthOffset = -1; monthOffset <= 0; monthOffset++) {
    const m = thisMonth + monthOffset;
    const y = m < 0 ? thisYear - 1 : thisYear;
    const mm = m < 0 ? m + 12 : m;
    const daysInMonth = new Date(y, mm + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dow = new Date(y, mm, day).getDay();
      if (dow === 0) continue; // 일요일 제외
      const count = dow === 6 ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 5) + 1;
      for (let j = 0; j < count; j++) {
        const mem = members[Math.floor(Math.random() * members.length)];
        const hours = [9,10,10,11,11,13,14,14,15,15,16,17,19][Math.floor(Math.random()*13)];
        const mins = [0,0,0,30,30][Math.floor(Math.random()*5)];
        const date = new Date(y, mm, day, hours, mins);
        const isPast = date <= now;
        const result = VISIT_RESULTS[Math.floor(Math.random()*5)];
        const visitStatus = isPast
          ? (result === '취소' ? '방문취소' : (Math.random() > 0.1 ? '방문완료' : 'No-show'))
          : (Math.random() > 0.2 ? '방문예정' : '방문미정');
        const place = places[Math.floor(Math.random() * places.length)];
        const amount = result === '가입' ? [2000000,3000000,3500000,5000000][Math.floor(Math.random()*4)] : 0;
        const rNotes = resultNotes[result] || [''];

        visits.push({
          id: id++, branch: mem.branch, consultant: mem.consultant,
          memberName: mem.name, memberId: mem.id, date: date.toISOString(),
          time: `${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}`,
          place, visitStatus,
          content: memos[Math.floor(Math.random() * memos.length)],
          result, resultNote: rNotes[Math.floor(Math.random() * rNotes.length)],
          amount
        });
      }
    }
  }

  visits.sort((a, b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem('purples_visit_data', JSON.stringify(visits));
  return visits;
}

let currentYear, currentMonth, selectedDate;
let allVisits = [];
let visitMgrPicker = null;
let visitPage = 1;
const VISIT_PAGE_SIZE = 20;

function init() {
  const now = new Date();
  currentYear = now.getFullYear(); currentMonth = now.getMonth();
  selectedDate = now.toISOString().slice(0, 10);
  // 더미 데이터 갱신 (v2)
  localStorage.removeItem('purples_visit_data');
  allVisits = generateVisitData();
}

/* ── 배지 ── */
function resultBadge(r) {
  if (!r) return '';
  return r;
}

/* ── 캘린더 ── */
function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const mn = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const todayStr = new Date().toISOString().slice(0, 10);

  // 날짜별 방문 데이터 그룹핑
  const dayMap = {};
  allVisits.forEach(v => {
    const d = new Date(v.date);
    const calBranch = document.getElementById('f-cal-branch')?.value || '';
    const calResult = document.getElementById('f-cal-result')?.value || '';
    if (calBranch && v.branch !== calBranch) return;
    if (calResult && v.result !== calResult) return;
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const key = d.getDate();
      if (!dayMap[key]) dayMap[key] = [];
      dayMap[key].push(v);
    }
  });

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += '<div class="cal-cell cal-cell--empty"></div>';

  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dow = new Date(currentYear, currentMonth, d).getDay();
    const isToday = ds === todayStr;
    const visits = (dayMap[d] || []).sort((a,b) => a.time.localeCompare(b.time));

    let cls = 'cal-cell';
    if (isToday) cls += ' cal-cell--today';
    if (dow === 0) cls += ' cal-cell--sun';
    if (dow === 6) cls += ' cal-cell--sat';

    const maxShow = 3;
    let items = '';
    visits.slice(0, maxShow).forEach(v => {
      const dotColor = v.result === '가입' ? '#059669' : v.result === '취소' ? '#ef4444' : v.result === '변경' ? '#f59e0b' : '#3b82f6';
      items += `<div class="cal-item" title="${v.consultant} - ${v.memberName}">
        <span class="cal-item__dot" style="background:${dotColor}"></span>
        <span class="cal-item__time">${v.time}</span>
        <span class="cal-item__name">${v.memberName}</span>
        ${resultBadge(v.result)}
      </div>`;
    });
    if (visits.length > maxShow) {
      items += `<div class="cal-item cal-item--more">+${visits.length - maxShow}건</div>`;
    }

    cells += `<div class="${cls}">
      <div class="cal-cell__header">
        <span class="cal-cell__day">${d}</span>
        ${visits.length ? `<span class="cal-cell__count">${visits.length}</span>` : ''}
      </div>
      <div class="cal-cell__body">${items}</div>
    </div>`;
  }

  return `
    <div class="cal-header">
      <button class="mini-cal__nav" id="cal-prev">◀ ${currentMonth === 0 ? '12월' : mn[currentMonth-1]}</button>
      <span class="cal-header__title">${currentYear}년 ${mn[currentMonth]}</span>
      <button class="mini-cal__nav" id="cal-next">${currentMonth === 11 ? '1월' : mn[currentMonth+1]} ▶</button>
    </div>
    <div class="cal-grid">
      <div class="cal-head cal-head--sun">일</div><div class="cal-head">월</div>
      <div class="cal-head">화</div><div class="cal-head">수</div>
      <div class="cal-head">목</div><div class="cal-head">금</div>
      <div class="cal-head cal-head--sat">토</div>
      ${cells}
    </div>`;
}


/* ── 하단 리스트 ── */
function renderListTable() {
  const gv = id => document.getElementById(id)?.value || '';
  let data = [...allVisits];
  if (gv('f-date-from')) data = data.filter(v => v.date.slice(0,10) >= gv('f-date-from'));
  if (gv('f-date-to')) data = data.filter(v => v.date.slice(0,10) <= gv('f-date-to'));
  if (gv('f-result')) data = data.filter(v => v.result === gv('f-result'));
  if (gv('f-branch')) data = data.filter(v => v.branch === gv('f-branch'));
  const selMgrs = visitMgrPicker ? visitMgrPicker.getSelected() : [];
  if (selMgrs.length > 0) data = data.filter(v => selMgrs.includes(v.consultant));
  data.sort((a, b) => new Date(b.date) - new Date(a.date));

  document.getElementById('list-count').textContent = `${data.length}건`;
  const totalPages = Math.max(1, Math.ceil(data.length / VISIT_PAGE_SIZE));
  if (visitPage > totalPages) visitPage = totalPages;
  const start = (visitPage - 1) * VISIT_PAGE_SIZE;
  const pageData = data.slice(start, start + VISIT_PAGE_SIZE);

  const statusBadge = (s) => {
    const m = {'방문완료':'green','방문예정':'blue','방문미정':'amber','방문취소':'red','No-show':'red'};
    return `<span class="badge badge--${m[s]||'gray'}" style="font-size:10px">${s}</span>`;
  };
  document.getElementById('list-tbody').innerHTML = pageData.map((v, i) => `<tr>
    <td class="tc col-no">${data.length - start - i}</td>
    <td class="tc" style="white-space:nowrap">${branchMap[v.branch] || v.branch}</td>
    <td class="tc col-name"><a href="consult-detail.html?manager=${encodeURIComponent(v.consultant)}&date=${v.date.slice(0,10)}" target="_blank" class="col-link" style="text-decoration:none">${v.consultant}</a></td>
    <td class="tc"><a href="detail.html?id=${v.memberId}" target="_blank" class="col-link" style="text-decoration:none">${v.memberName}</a></td>
    <td class="tc">${v.date.slice(0,10)}</td>
    <td class="tc">${v.time}</td>
    <td class="tc" style="white-space:nowrap">${v.place||'-'}</td>
    <td class="tc">${statusBadge(v.visitStatus)}</td>
    <td class="tl ellipsis">${v.content||'-'}</td>
    <td class="tc">${resultBadge(v.result)||'<span class="text-muted">-</span>'}</td>
    <td class="tl ellipsis">${v.resultNote||'-'}</td>
  </tr>`).join('') || '<tr><td colspan="11" style="text-align:center;padding:30px" class="text-muted">해당 기간 방문상담 내역이 없습니다.</td></tr>';

  // 페이지네이션
  const pagArea = document.getElementById('visit-pagination');
  if (!pagArea) return;
  if (totalPages <= 1) { pagArea.innerHTML = ''; return; }
  let btns = `<button class="pagination__btn" ${visitPage <= 1 ? 'disabled' : ''} data-p="${visitPage - 1}">‹</button>`;
  const maxBtns = 5;
  let s = Math.max(1, visitPage - Math.floor(maxBtns / 2));
  let e = Math.min(totalPages, s + maxBtns - 1);
  if (e - s < maxBtns - 1) s = Math.max(1, e - maxBtns + 1);
  for (let p = s; p <= e; p++) {
    btns += `<button class="pagination__btn ${p === visitPage ? 'active' : ''}" data-p="${p}">${p}</button>`;
  }
  btns += `<button class="pagination__btn" ${visitPage >= totalPages ? 'disabled' : ''} data-p="${visitPage + 1}">›</button>`;
  pagArea.innerHTML = btns;
  pagArea.querySelectorAll('.pagination__btn').forEach(b => {
    b.addEventListener('click', () => { visitPage = parseInt(b.dataset.p); renderListTable(); });
  });
}

/* ── 이벤트 ── */
window.__selectDate = null; // 사용하지 않음

function bindCalendarEvents() {
  document.getElementById('cal-prev')?.addEventListener('click', () => {
    currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    document.getElementById('cal-area').innerHTML = renderCalendar();
    bindCalendarEvents();
  });
  document.getElementById('cal-next')?.addEventListener('click', () => {
    currentMonth++; if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    document.getElementById('cal-area').innerHTML = renderCalendar();
    bindCalendarEvents();
  });
}

/* ── 탭 전환 ── */
function switchTab(tabId) {
  document.querySelectorAll('.std-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
  document.querySelectorAll('.std-tab-panel').forEach(p => p.classList.toggle('active', p.id === tabId));

  if (tabId === 'tab-list') renderListTable();
}

/* ── 메인 렌더 ── */
function render() {
  init();
  const today = new Date().toISOString().slice(0, 10);
  const consultants = [...new Set(allVisits.map(v => v.consultant))].sort();
  const branches = [...new Set(allVisits.map(v => v.branch))].sort();

  content.innerHTML = `
    <style>
      .cal-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:var(--bg-secondary); border:1px solid var(--border-light); border-bottom:none; border-radius:var(--radius-lg) var(--radius-lg) 0 0; }
      .cal-header__title { font-size:16px; font-weight:700; color:var(--text-primary); }
      .cal-grid { display:grid; grid-template-columns:repeat(7,1fr); border:1px solid var(--border-light); border-top:none; border-radius:0 0 var(--radius-lg) var(--radius-lg); overflow:hidden; background:var(--bg-primary); }
      .cal-head { padding:8px 4px; text-align:center; font-size:11px; font-weight:700; color:var(--text-muted); background:var(--bg-secondary); border-bottom:1px solid var(--border-light); }
      .cal-head--sun { color:var(--status-red); }
      .cal-head--sat { color:var(--status-blue); }
      .cal-cell { min-height:100px; padding:4px 6px; border-bottom:1px solid var(--border-light); border-right:1px solid var(--border-light); display:flex; flex-direction:column; }
      .cal-cell:nth-child(7n+8) { border-right:none; }
      .cal-cell--empty { background:var(--bg-secondary); min-height:40px; }
      .cal-cell--today { box-shadow:inset 0 0 0 2px var(--accent); }
      .cal-cell--sun .cal-cell__day { color:var(--status-red); }
      .cal-cell--sat .cal-cell__day { color:var(--status-blue); }
      .cal-cell__header { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
      .cal-cell__day { font-size:12px; font-weight:600; color:var(--text-primary); }
      .cal-cell__count { font-size:9px; font-weight:700; background:var(--accent); color:#fff; padding:1px 5px; border-radius:8px; line-height:1.4; }
      .cal-cell__body { flex:1; display:flex; flex-direction:column; gap:2px; overflow:hidden; }
      .cal-item { display:flex; align-items:center; gap:3px; font-size:10px; padding:2px 4px; border-radius:3px; background:var(--bg-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.4; }
      .cal-item:hover { background:var(--border-light); }
      .cal-item__dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
      .cal-item__time { font-weight:600; color:var(--text-secondary); flex-shrink:0; }
      .cal-item__name { color:var(--text-primary); overflow:hidden; text-overflow:ellipsis; }
      .cal-item--more { color:var(--accent); font-weight:600; background:var(--accent-bg); justify-content:center; }
      @media(max-width:900px) { .cal-cell { min-height:60px; } .cal-item__name { display:none; } }
    </style>

    <div class="page-header">
      <div><h1 class="page-header__title">방문상담 관리</h1>
      <p class="page-header__subtitle">준회원 방문상담 일정 조회 (조회 전용 — 등록은 개별 상세페이지에서 진행)</p></div>
    </div>

    <!-- 탭 -->
    <div class="std-tabs" id="visit-tabs">
      <button class="std-tab active" data-tab="tab-calendar">방문 일정표</button>
      <button class="std-tab" data-tab="tab-list">방문상담 현황</button>
    </div>

    <!-- 탭1: 대형 캘린더 -->
    <div class="std-tab-panel active" id="tab-calendar">
      <div style="margin-bottom:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <label style="font-size:12px;font-weight:600;color:var(--text-secondary)">지사</label>
        <select class="form-select form-input--sm" id="f-cal-branch" style="width:120px;font-size:12px">
          <option value="">전체</option>
          ${BRANCHES.map(b => `<option value="${b.code}">${b.name}</option>`).join('')}
        </select>
        <label style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-left:12px">방문결과</label>
        <select class="form-select form-input--sm" id="f-cal-result" style="width:120px;font-size:12px">
          <option value="">전체</option>
          <option>변경</option>
          <option>취소</option>
          <option>가입</option>
          <option>보류</option>
        </select>
      </div>
      <div id="cal-area">${renderCalendar()}</div>
    </div>

    <!-- 탭2: 방문상담 현황 -->
    <div class="std-tab-panel" id="tab-list">
      <table class="std-table" style="margin-bottom:0;table-layout:fixed">
        <colgroup>
          <col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col><col style="width:80px"><col>
        </colgroup>
        <tbody>
          <tr>
            <th>기간</th>
            <td colspan="3">
              <div style="display:flex;align-items:center;gap:6px">
                <input type="date" id="f-date-from" class="form-input form-input--sm" style="width:140px">
                <span class="text-muted">~</span>
                <input type="date" id="f-date-to" class="form-input form-input--sm" style="width:140px">
              </div>
            </td>
            <th>지사</th>
            <td>
              <select class="form-select form-input--sm" id="f-branch" style="width:100%;font-size:12px"><option value="">지사 전체</option>${branches.map(b=>`<option>${b}</option>`).join('')}</select>
            </td>
            <th>방문결과</th>
            <td>
              <select class="form-select form-input--sm" id="f-result" style="width:100%;font-size:12px"><option value="">결과 전체</option>${VISIT_RESULTS.map(r=>`<option>${r}</option>`).join('')}</select>
            </td>
          </tr>
          <tr>
            <th>매니저</th>
            <td colspan="7">
              ${renderManagerPickerHTML('vmgr')}
            </td>
          </tr>
        </tbody>
      </table>
      <div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px">
        <button class="btn btn--secondary btn--sm" id="btn-list-search">검색</button>
        <button class="btn btn--reset btn--sm" id="btn-list-reset">초기화</button>
      </div>

      <div class="list-section">
        <div class="list-section__header">
          <h3 class="list-section__title">방문상담 현황</h3>
          <span class="list-section__meta" style="font-weight:600;color:var(--accent)" id="list-count">0건</span>
        </div>
        <div class="list-section__body">
          <table class="std-table">
            <thead><tr>
              <th style="width:40px">번호</th><th>지사</th><th>매니저</th><th>회원명</th>
              <th>일자</th><th>시간</th><th>장소</th><th>방문형태</th><th>내용</th>
              <th>결과</th><th>결과내용</th>
            </tr></thead>
            <tbody id="list-tbody"></tbody>
          </table>
        </div>
        <div style="display:flex;justify-content:center;margin-top:12px">
          <div class="pagination" id="visit-pagination"></div>
        </div>
      </div>
    </div>
    <style>${getManagerPickerStyles()}</style>
  `;

  // 초기 렌더
  bindCalendarEvents();

  // 캘린더 지사 필터
  document.getElementById('f-cal-branch')?.addEventListener('change', () => {
    document.getElementById('cal-area').innerHTML = renderCalendar();
    bindCalendarEvents();
  });
  document.getElementById('f-cal-result')?.addEventListener('change', () => {
    document.getElementById('cal-area').innerHTML = renderCalendar();
    bindCalendarEvents();
  });

  // 탭 이벤트
  document.querySelectorAll('.std-tab').forEach(t => {
    t.addEventListener('click', () => switchTab(t.dataset.tab));
  });

  // 리스트 필터 이벤트
  document.getElementById('btn-list-search').addEventListener('click', () => { visitPage = 1; renderListTable(); });
  document.getElementById('btn-list-reset').addEventListener('click', () => {
    ['f-date-from','f-date-to','f-branch','f-result'].forEach(id => { document.getElementById(id).value = ''; });
    if (visitMgrPicker) visitMgrPicker.reset();
    visitPage = 1; renderListTable();
  });

  // 매니저 Picker 초기화
  visitMgrPicker = new ManagerPicker({
    inputId: 'vmgr-search-input',
    modalBtnId: 'vmgr-open-modal',
    tagsId: 'vmgr-tags',
    consultants: consultants,
    onChange: () => renderListTable()
  });
}

render();
