/* ========================================
   회원분배 관리 페이지
   - 신규 유입 준회원을 상담매니저에게 분배
   - 분배현황 조회 / 수동분배 / 자동분배
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { MockAssociates } from '@mock/associates.js';

initLayout({ pageId: 'member-distribute', breadcrumbs: ['준회원 관리', '회원분배'] });

const CONSULTANTS = ['이지연','김민희','박수정','최영미','한소영','정다은','서윤아','강미래','윤하나','오세은'];
const BRANCHES = ['본사','경기','부산','대구','대전','광주'];

let selectedIds = [];

function getDistHistory() {
  try { return JSON.parse(localStorage.getItem('purples_dist_history') || '[]').slice(-10).reverse(); }
  catch(e) { return []; }
}
function addDistHistory(name, manager) {
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem('purples_dist_history') || '[]'); } catch(e) {}
  hist.push({ name, manager, date: new Date().toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) });
  if (hist.length > 50) hist = hist.slice(-50);
  try { localStorage.setItem('purples_dist_history', JSON.stringify(hist)); } catch(e) {}
}
function getDupHistory() {
  try { return JSON.parse(localStorage.getItem('purples_dup_history') || '[]'); } catch(e) { return []; }
}

const undistributed = MockAssociates.filter(m => !m.consultant || m.consultant === '-' || m.status === '컨텍전');
const distributed = MockAssociates.filter(m => m.consultant && m.consultant !== '-' && m.status !== '컨텍전');

function getManagerStats() {
  const stats = {};
  CONSULTANTS.forEach(c => { stats[c] = { total: 0 }; });
  MockAssociates.forEach(m => {
    if (m.consultant && m.consultant !== '-' && stats[m.consultant]) {
      stats[m.consultant].total++;
    }
  });
  return stats;
}

const content = document.getElementById('content');
content.innerHTML = `
  <div class="page-header" style="margin-bottom:24px">
    <div>
      <h1 class="page-header__title">회원분배</h1>
      <p class="page-header__subtitle">미분배 준회원을 상담매니저에게 배정합니다</p>
    </div>
  </div>

  <div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:12px 16px;background:#fff;border:1px solid var(--border-light);border-radius:8px">
      <div style="display:flex;gap:8px;align-items:center">
        <select class="form-select form-input--sm" id="dist-filter-status" style="width:auto;font-size:11px">
          <option value="all">전체 상태</option>
          <option value="undist" selected>미분배</option>
          <option value="dist">분배완료</option>
        </select>
        <input type="text" class="form-input form-input--sm" id="dist-search" placeholder="이름/연락처 검색..." style="width:150px;font-size:11px">
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn--sm" id="btn-manual" style="font-size:11px;background:#0369a1;color:#fff;border:none">✋ 수동분배</button>
      </div>
    </div>

    <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--text-secondary)" id="dist-count"></div>

    <div style="background:#fff;border:1px solid var(--border-light);border-radius:8px;overflow:hidden">
      <table class="data-table" style="font-size:12px">
        <thead>
          <tr>
            <th style="width:30px"><input type="checkbox" id="dist-check-all"></th>
            <th style="width:40px">No</th><th>이름</th><th>성별</th><th>나이</th>
            <th>연락처</th><th>유입경로</th><th>등록일</th><th>담당매니저</th><th>분배상태</th>
          </tr>
        </thead>
        <tbody id="dist-tbody"></tbody>
      </table>
    </div>
    <div id="dist-pagination" class="pagination"></div>
  </div>
`;

// 페이징
const PAGE_SIZE = 20;
let currentPage = 1;

// 테이블 렌더링
function applyFilter(resetPage) {
  if (resetPage) currentPage = 1;
  const status = document.getElementById('dist-filter-status').value;
  const search = document.getElementById('dist-search').value.trim().toLowerCase();

  let filtered = MockAssociates.filter(m => {
    const isDist = m.consultant && m.consultant !== '-' && m.status !== '컨텍전';
    if (status === 'undist' && isDist) return false;
    if (status === 'dist' && !isDist) return false;
    if (search && !m.name.toLowerCase().includes(search) && !m.phone.includes(search)) return false;
    return true;
  });

  const tbody = document.getElementById('dist-tbody');
  if (!tbody) return;

  // 건수 업데이트
  const countEl = document.getElementById('dist-count');
  const statusLabel = status === 'undist' ? '미분배' : status === 'dist' ? '분배완료' : '전체';
  if (countEl) countEl.textContent = `${statusLabel} ${filtered.length}건`;

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:30px;color:var(--text-muted)">조건에 맞는 회원이 없습니다.</td></tr>';
    document.getElementById('dist-pagination').innerHTML = '';
    return;
  }

  // 페이징 계산
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = paged.map((m, i) => {
    const isDist = m.consultant && m.consultant !== '-' && m.status !== '컨텍전';
    const badge = isDist
      ? '<span class="badge badge--green" style="font-size:10px;padding:2px 8px">분배완료</span>'
      : '<span class="badge badge--red" style="font-size:10px;padding:2px 8px">미분배</span>';
    return `<tr style="${isDist ? 'background:#f0f9ff;opacity:0.7' : ''}">
      <td style="text-align:center"><input type="checkbox" class="dist-check" value="${m.id}" ${isDist ? 'disabled' : ''}></td>
      <td style="text-align:center">${start + i + 1}</td>
      <td style="font-weight:600">${m.name}</td>
      <td style="text-align:center">${m.gender}</td>
      <td style="text-align:center">${m.age}세</td>
      <td>${Formatters.phone(m.phone)}</td>
      <td style="font-size:11px">${m.channel || '-'}</td>
      <td>${Formatters.date(m.registeredAt)}</td>
      <td>${isDist ? `<span style="font-weight:600;color:#0369a1">${m.consultant}</span>` : '<span style="color:#94a3b8">-</span>'}</td>
      <td style="text-align:center">${badge}</td>
    </tr>`;
  }).join('');

  // 페이지네이션 렌더링
  const pagEl = document.getElementById('dist-pagination');
  if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
  let pagHtml = `<button class="pagination__btn" ${currentPage===1?'disabled':''} data-page="${currentPage-1}">◀ 이전</button>`;
  for (let p = 1; p <= totalPages; p++) {
    pagHtml += `<button class="pagination__btn${p===currentPage?' active':''}" data-page="${p}">${p}</button>`;
  }
  pagHtml += `<button class="pagination__btn" ${currentPage===totalPages?'disabled':''} data-page="${currentPage+1}">다음 ▶</button>`;
  pagEl.innerHTML = pagHtml;
  pagEl.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); applyFilter(); });
  });
}

applyFilter(true);

// 이벤트 바인딩
document.getElementById('dist-filter-status').addEventListener('change', () => applyFilter(true));
document.getElementById('dist-search').addEventListener('input', () => applyFilter(true));
document.getElementById('dist-check-all').addEventListener('change', function() {
  document.querySelectorAll('.dist-check:not(:disabled)').forEach(c => { c.checked = this.checked; });
});



document.getElementById('btn-manual').addEventListener('click', () => {
  const checks = document.querySelectorAll('.dist-check:checked');
  selectedIds = [];
  checks.forEach(c => selectedIds.push(parseInt(c.value)));
  if (selectedIds.length === 0) { Toast.show('분배할 회원을 선택하세요.', 'warning'); return; }

  const selected = MockAssociates.filter(m => selectedIds.includes(m.id));
  Modal.show({
    title: `✋ 수동 회원분배 (${selected.length}명)`,
    size: 'lg',
    content: `
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px">선택된 회원 (${selected.length}명)</div>
        <div style="max-height:200px;overflow-y:auto">
          <table class="data-table" style="font-size:11px"><thead><tr><th>No</th><th>이름</th><th>성별</th><th>나이</th><th>유입경로</th></tr></thead>
          <tbody>${selected.map((m, i) => `<tr><td>${i+1}</td><td>${m.name}</td><td>${m.gender}</td><td>${m.age}세</td><td>${m.channel || '-'}</td></tr>`).join('')}</tbody></table>
        </div>
      </div>
      <div style="padding:16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px">배정할 매니저</div>
        <input type="text" id="dist-mgr-search" class="form-input form-input--sm" placeholder="매니저 이름 검색..." style="font-size:11px;margin-bottom:8px">
        <div style="max-height:250px;overflow-y:auto">
          <table class="data-table" style="font-size:11px">
            <thead><tr><th style="width:30px"></th><th>매니저</th><th style="text-align:center">분배회원수</th></tr></thead>
            <tbody id="dist-mgr-tbody">
              ${CONSULTANTS.map(c => {
                const stats = getManagerStats();
                const cnt = stats[c] ? stats[c].total : 0;
                return `<tr data-mgr="${c}"><td style="text-align:center"><input type="radio" name="dist-mgr-radio" value="${c}"></td><td style="font-weight:600">${c}</td><td style="text-align:center">${cnt}명</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `,
    footer: `<button class="btn btn--secondary" onclick="document.getElementById('modal-root').innerHTML=''">취소</button>
             <button class="btn btn--primary" id="btn-exec-manual">분배 실행</button>`,
  });

  setTimeout(() => {
    // 매니저 검색 필터
    const mgrSearch = document.getElementById('dist-mgr-search');
    if (mgrSearch) {
      mgrSearch.addEventListener('input', function() {
        const q = this.value.trim().toLowerCase();
        document.querySelectorAll('#dist-mgr-tbody tr').forEach(tr => {
          const name = tr.getAttribute('data-mgr') || '';
          tr.style.display = name.toLowerCase().includes(q) ? '' : 'none';
        });
      });
    }

    const execBtn = document.getElementById('btn-exec-manual');
    if (execBtn) {
      execBtn.addEventListener('click', () => {
        const radio = document.querySelector('input[name="dist-mgr-radio"]:checked');
        const manager = radio ? radio.value : '';
        if (!manager) { Toast.show('매니저를 선택하세요.', 'warning'); return; }
        selected.forEach(m => {
          m.consultant = manager;
          if (m.status === '컨텍전') m.status = '부재중(미컨텍)';
          addDistHistory(m.name, manager);
        });
        document.getElementById('modal-root').innerHTML = '';
        Toast.show(`${selected.length}명이 ${manager} 매니저에게 분배되었습니다.`, 'success');
        applyFilter();
      });
    }
  }, 100);
});
