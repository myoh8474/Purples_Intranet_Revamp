/* ========================================
   통합 상담관리 — 상담현황 + 방문상담 + 매니저상세 통합
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { Modal } from '@components/Modal.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, CONSULTANT_BRANCH, BRANCHES } from '@config/constants.js';

const branchMap = {};
BRANCHES.forEach(b => { branchMap[b.code] = b.name; });
function branchName(code) { return branchMap[code] || code || '-'; }

initLayout({ pageId: 'associate-consult', breadcrumbs: ['준회원 관리', '상담 관리'] });
const content = document.getElementById('content');

const CONSULT_TYPES = ['전화','방문','SMS','기타'];
const CONSULT_RESULTS = ['부재중','낮음(컨텍)','보통(컨텍)','높음(컨텍)','장기상담(컨텍)','방문상담','가입보류(컨텍)','가입중','가입완료'];

/* ── 상태 데이터 반영 ── */
function getStatusData() {
  let d = [...MockAssociates];
  try {
    const u = JSON.parse(localStorage.getItem('purples_status_updates') || '{}');
    d = d.map(x => u[x.id] ? { ...x, status: typeof u[x.id] === 'string' ? u[x.id] : u[x.id].status || x.status } : x);
  } catch (e) {}
  return d;
}

/* ── 전체 상담 기록 수집 ── */
function collectAllLogs() {
  const data = getStatusData();
  const logs = [];

  data.forEach(m => {
    if (!m.consultant) return;

    // Mock contactHistory
    (m.contactHistory || []).forEach(h => {
      logs.push({
        id: h.id || Date.now() + Math.random(),
        memberId: m.id, memberName: m.name, phone: m.phone,
        consultant: m.consultant, branch: m.branch, brand: m.brand,
        date: h.date || h.createdAt, type: h.type || '전화',
        content: h.content || '-', result: h.result || '-',
        status: m.status, gender: m.gender, age: m.age,
      });
    });

    // localStorage 전화상담
    try {
      const callHist = JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]');
      callHist.forEach(h => {
        logs.push({
          id: h.id || Date.now() + Math.random(),
          memberId: m.id, memberName: m.name, phone: m.phone,
          consultant: h.consultant || m.consultant, branch: m.branch, brand: m.brand,
          date: h.date || h.createdAt, type: '전화',
          content: h.content || '-', result: h.result || '-',
          status: m.status, gender: m.gender, age: m.age,
        });
      });
    } catch (e) {}

    // localStorage 미팅
    try {
      const meetHist = JSON.parse(localStorage.getItem('purples_meeting_history_' + m.id) || '[]');
      meetHist.forEach(h => {
        logs.push({
          id: h.id || Date.now() + Math.random(),
          memberId: m.id, memberName: m.name, phone: m.phone,
          consultant: h.consultant || m.consultant, branch: m.branch, brand: m.brand,
          date: h.date, type: '방문',
          content: h.content || `${h.place || ''} ${h.time || ''} ${h.status || ''}`.trim() || '-',
          result: h.status || '-',
          status: m.status, gender: m.gender, age: m.age,
        });
      });
    } catch (e) {}
  });

  // 날짜순 정렬 (최신 먼저)
  logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  return logs;
}

/* ── 요약 통계 ── */
function calcSummary(logs, data) {
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter(l => l.date && l.date.slice(0, 10) === today);
  return {
    total: logs.length,
    todayTotal: todayLogs.length,
    todayCall: todayLogs.filter(l => l.type === '전화').length,
    todayVisit: todayLogs.filter(l => l.type === '방문').length,
    todaySms: todayLogs.filter(l => l.type === 'SMS').length,
    consultants: [...new Set(logs.map(l => l.consultant))].length,
  };
}

/* ── 배지 헬퍼 ── */
function typeBadge(t) {
  const c = { '전화': '#3b82f6', '방문': '#8b5cf6', 'SMS': '#f59e0b', '기타': '#6b7280' };
  const color = c[t] || '#6b7280';
  return `<span style="display:inline-block;padding:2px 8px;font-size:10px;font-weight:600;border-radius:3px;background:${color}15;color:${color};border:1px solid ${color}30">${t}</span>`;
}
function resultBadge(r) {
  if (!r || r === '-') return '<span style="color:var(--text-muted)">-</span>';
  const c = { '부재중': '#ef4444', '상담중': '#3b82f6', '완료': '#10b981', '방문상담': '#8b5cf6',
    '낮음(컨텍)': '#f59e0b', '보통(컨텍)': '#3b82f6', '높음(컨텍)': '#10b981',
    '장기상담(컨텍)': '#6366f1', '가입보류(컨텍)': '#f97316', '가입중': '#0ea5e9',
    '가입완료': '#059669', '예약': '#3b82f6', '취소': '#ef4444' };
  const color = c[r] || '#6b7280';
  return `<span style="display:inline-block;padding:2px 8px;font-size:10px;font-weight:600;border-radius:3px;background:${color}15;color:${color};border:1px solid ${color}30">${r}</span>`;
}

/* ── 페이지네이션 ── */
let currentPage = 1;
const PAGE_SIZE = 20;

/* ── 필터 적용 ── */
function applyFilters(logs) {
  const gv = id => document.getElementById(id)?.value || '';
  let filtered = [...logs];

  // 기간
  const from = gv('f-date-from'), to = gv('f-date-to');
  if (from) filtered = filtered.filter(l => l.date && l.date.slice(0, 10) >= from);
  if (to) filtered = filtered.filter(l => l.date && l.date.slice(0, 10) <= to);

  // 컨설턴트
  const consultant = gv('f-consultant');
  if (consultant) filtered = filtered.filter(l => l.consultant === consultant);

  // 지사
  const branch = gv('f-branch');
  if (branch) filtered = filtered.filter(l => l.branch === branch);



  // 상담결과
  const result = gv('f-result');
  if (result) filtered = filtered.filter(l => l.result === result);

  // 키워드
  const keyword = gv('f-keyword').trim().toLowerCase();
  if (keyword) {
    filtered = filtered.filter(l =>
      (l.memberName || '').toLowerCase().includes(keyword) ||
      (l.phone || '').includes(keyword) ||
      (l.content || '').toLowerCase().includes(keyword)
    );
  }

  return filtered;
}

/* ── 테이블 렌더 ── */
function renderTable(logs) {
  const filtered = applyFilters(logs);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageData = filtered.slice(start, start + PAGE_SIZE);

  // 건수
  document.getElementById('log-count').textContent = `${filtered.length}건`;

  // 테이블 바디
  const tbody = document.getElementById('log-tbody');
  if (!pageData.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted)">상담 내역이 없습니다.</td></tr>';
  } else {
    tbody.innerHTML = pageData.map((l, i) => `<tr style="cursor:pointer" data-mid="${l.memberId}">
      <td class="tc col-no">${filtered.length - start - i}</td>
      <td class="tc">${branchName(l.branch)}</td>
      <td class="tc">${formatDT(l.date)}</td>
      <td class="tc"><a href="detail.html?id=${l.memberId}" target="_blank" class="col-link">${l.memberName}</a></td>
      <td class="tc">${l.consultant}</td>
      <td class="tc">${Formatters.phone(l.phone)}</td>
      <td class="tl ellipsis" style="max-width:400px">${l.content}</td>
      <td class="tc" style="white-space:nowrap">${l.status || '-'}</td>
    </tr>`).join('');
  }

  // 페이지네이션
  const pagArea = document.getElementById('pagination');
  if (totalPages <= 1) { pagArea.innerHTML = ''; return; }
  let btns = '';
  btns += `<button class="pagination__btn" ${currentPage <= 1 ? 'disabled' : ''} data-p="${currentPage - 1}">‹</button>`;
  const maxBtns = 5;
  let s = Math.max(1, currentPage - Math.floor(maxBtns / 2));
  let e = Math.min(totalPages, s + maxBtns - 1);
  if (e - s < maxBtns - 1) s = Math.max(1, e - maxBtns + 1);
  for (let p = s; p <= e; p++) {
    btns += `<button class="pagination__btn ${p === currentPage ? 'active' : ''}" data-p="${p}">${p}</button>`;
  }
  btns += `<button class="pagination__btn" ${currentPage >= totalPages ? 'disabled' : ''} data-p="${currentPage + 1}">›</button>`;
  pagArea.innerHTML = btns;
  pagArea.querySelectorAll('.pagination__btn').forEach(b => {
    b.addEventListener('click', () => { currentPage = parseInt(b.dataset.p); renderTable(logs); });
  });
}

function formatDT(d) {
  if (!d) return '-';
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
}



/* ── 상담 등록 모달 ── */
function showAddModal(logs) {
  const data = getStatusData().filter(m => m.consultant);
  const today = new Date().toISOString().slice(0, 10);
  Modal.show({ title: '상담 기록 등록', size: 'lg',
    content: `<div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:600">회원 검색 *</label>
        <div><input type="text" id="add-member-search" class="form-input" placeholder="이름 또는 전화번호" style="width:100%">
        <div id="add-member-list" style="max-height:120px;overflow-y:auto;border:1px solid var(--border-light);display:none;margin-top:4px"></div></div>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:600">상담일 *</label>
        <input type="date" id="add-date" value="${today}" class="form-input">
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:600">상담유형 *</label>
        <select id="add-type" class="form-select">${CONSULT_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:center">
        <label style="font-size:12px;font-weight:600">상담결과 *</label>
        <select id="add-result" class="form-select"><option value="">-- 선택 --</option>${CONSULT_RESULTS.map(r => `<option>${r}</option>`).join('')}</select>
      </div>
      <div style="display:grid;grid-template-columns:90px 1fr;gap:8px;align-items:start">
        <label style="font-size:12px;font-weight:600">상담내용</label>
        <textarea id="add-content" class="form-input" rows="4" placeholder="상담 내용을 입력하세요"></textarea>
      </div>
    </div>`,
    footer: '<button class="btn btn--secondary" onclick="document.getElementById(\'modal-root\').innerHTML=\'\'">취소</button><button class="btn btn--primary" id="btn-add-ok">등록</button>'
  });

  let selectedMember = null;
  setTimeout(() => {
    const searchInput = document.getElementById('add-member-search');
    const listDiv = document.getElementById('add-member-list');
    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (q.length < 1) { listDiv.style.display = 'none'; return; }
      const matches = data.filter(m => m.name.toLowerCase().includes(q) || m.phone.includes(q)).slice(0, 10);
      if (!matches.length) { listDiv.style.display = 'none'; return; }
      listDiv.style.display = 'block';
      listDiv.innerHTML = matches.map(m => `<div style="padding:6px 10px;cursor:pointer;font-size:12px;border-bottom:1px solid var(--border-light)" data-id="${m.id}">${m.name} (${Formatters.phone(m.phone)}) - ${m.consultant}</div>`).join('');
      listDiv.querySelectorAll('div').forEach(d => d.addEventListener('click', () => {
        selectedMember = data.find(x => x.id === parseInt(d.dataset.id));
        searchInput.value = `${selectedMember.name} (${Formatters.phone(selectedMember.phone)})`;
        listDiv.style.display = 'none';
      }));
    });

    document.getElementById('btn-add-ok')?.addEventListener('click', () => {
      if (!selectedMember) { Toast.show('회원을 선택해 주세요.', 'warning'); return; }
      const result = document.getElementById('add-result')?.value;
      if (!result) { Toast.show('상담결과를 선택해 주세요.', 'warning'); return; }
      const rec = {
        id: Date.now(), date: document.getElementById('add-date').value,
        consultant: selectedMember.consultant, result,
        content: document.getElementById('add-content')?.value?.trim() || `${result} - 상담 진행`,
        type: document.getElementById('add-type').value,
        createdAt: new Date().toISOString()
      };
      const key = 'purples_call_history_' + selectedMember.id;
      const hist = JSON.parse(localStorage.getItem(key) || '[]');
      hist.unshift(rec);
      localStorage.setItem(key, JSON.stringify(hist));
      Toast.show('상담 기록이 등록되었습니다.', 'success');
      document.getElementById('modal-root').innerHTML = '';
      // 새로고침
      const newLogs = collectAllLogs();

      renderTable(newLogs);
    });
  }, 100);
}

/* ── 메인 렌더 ── */
function render() {
  const data = getStatusData();
  const allLogs = collectAllLogs();
  const branches = [...new Set(data.map(m => m.branch))].sort();
  const consultants = [...new Set(data.filter(m => m.consultant).map(m => m.consultant))].sort();
  const branchMap = {};
  BRANCHES.forEach(b => { branchMap[b.code] = b.name; });

  content.innerHTML = `
    <!-- 페이지 헤더 -->
    <div class="page-header">
      <div>
        <h1 class="page-header__title">상담내역 조회</h1>
        <p class="page-header__subtitle">전체 상담 기록 통합 조회 · 전화 / 방문 / SMS</p>
      </div>
      <div class="page-header__actions">
        <button class="btn btn--primary btn--sm" id="btn-add-consult">+ 상담 기록 등록</button>
      </div>
    </div>

    <!-- 요약 카드 (공통 kpi-stat) -->


    <!-- 검색 필터 (공통 search-table) -->
    <table class="search-table">
      <tbody>
        <tr>
          <th class="search-table__th">기간</th>
          <td class="search-table__td">
            <input type="date" id="f-date-from" class="form-input form-input--sm fi" style="width:140px">
            <span class="text-muted">~</span>
            <input type="date" id="f-date-to" class="form-input form-input--sm fi" style="width:140px">
          </td>
        </tr>
        <tr>
          <th class="search-table__th">상세검색</th>
          <td class="search-table__td">
            <select class="form-input form-input--sm fi" id="f-consultant" style="width:120px">
              <option value="">컨설턴트 전체</option>
              ${consultants.map(c => `<option>${c}</option>`).join('')}
            </select>
            <select class="form-input form-input--sm fi" id="f-branch" style="width:100px">
              <option value="">지사 전체</option>
              ${branches.map(b => `<option value="${b}">${branchMap[b] || b}</option>`).join('')}
            </select>

            <select class="form-input form-input--sm fi" id="f-result" style="width:120px">
              <option value="">결과 전체</option>
              ${CONSULT_RESULTS.map(r => `<option>${r}</option>`).join('')}
            </select>
            <input type="text" id="f-keyword" class="form-input form-input--sm fi" placeholder="이름/전화/내용" style="width:160px">
          </td>
        </tr>
      </tbody>
    </table>
    <div class="search-actions">
      <button class="btn btn--sm search-btn" id="btn-search">검색</button>
      <button class="btn btn--sm filter-reset-btn" id="btn-reset">초기화</button>
    </div>

    <!-- 테이블 -->
    <div class="list-section">
      <div class="list-section__header">
        <h3 class="list-section__title">상담 기록</h3>
        <span class="list-section__meta" style="font-weight:600;color:var(--accent)" id="log-count">0건</span>
      </div>
      <div class="list-section__body">
        <table class="std-table">
          <thead><tr>
            <th style="width:50px">No</th>
            <th style="width:60px">지사</th>
            <th style="width:100px">상담일</th>
            <th style="width:70px">회원명</th>
            <th style="width:80px">상담매니저</th>
            <th style="width:110px">연락처</th>
            <th>상담내용</th>
            <th style="width:100px">회원상태</th>
          </tr></thead>
          <tbody id="log-tbody"></tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:center;margin-top:12px">
        <div class="pagination" id="pagination"></div>
      </div>
    </div>
  `;


  renderTable(allLogs);

  // 이벤트
  document.getElementById('btn-search').addEventListener('click', () => { currentPage = 1; renderTable(allLogs); });
  document.getElementById('btn-reset').addEventListener('click', () => {
    ['f-date-from','f-date-to','f-consultant','f-branch','f-result','f-keyword'].forEach(id => { document.getElementById(id).value = ''; });
    currentPage = 1; renderTable(allLogs);
  });
  document.getElementById('btn-add-consult').addEventListener('click', () => showAddModal(allLogs));
}

render();
