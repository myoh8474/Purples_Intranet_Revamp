/* ========================================
   회원분배 관리 페이지 v2
   - 신규 유입 준회원을 상담매니저에게 분배
   - 소스외 자동 필터링 (학력/나이/형식/중복)
   - 알림 분배: 과거 이력 태그 노출
   - 분배현황 조회 / 수동분배
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Modal } from '@components/Modal.js';
import { Toast } from '@components/Toast.js';
import { MockAssociates } from '@mock/associates.js';
import { screenIncomingDB } from '@services/screening.service.js';

initLayout({ pageId: 'member-distribute', breadcrumbs: ['준회원 관리', '회원분배'] });

const CONSULTANTS = ['이지연','김민희','박수정','최영미','한소영','정다은','서윤아','강미래','윤하나','오세은'];

let selectedIds = [];

function addDistHistory(name, manager) {
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem('purples_dist_history') || '[]'); } catch(e) {}
  hist.push({ name, manager, date: new Date().toLocaleString('ko-KR', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) });
  if (hist.length > 50) hist = hist.slice(-50);
  try { localStorage.setItem('purples_dist_history', JSON.stringify(hist)); } catch(e) {}
}

/** 소스외 이력 저장 */
function addScreeningLog(member, screenResult) {
  let logs = [];
  try { logs = JSON.parse(localStorage.getItem('purples_screening_log') || '[]'); } catch(e) {}
  logs.push({
    memberId: member.id,
    name: member.name,
    phone: member.phone,
    action: screenResult.action,
    reasons: screenResult.reasons,
    tags: screenResult.tags,
    existingManager: screenResult.existingMember?.consultant || null,
    date: new Date().toISOString(),
  });
  if (logs.length > 200) logs = logs.slice(-200);
  try { localStorage.setItem('purples_screening_log', JSON.stringify(logs)); } catch(e) {}
}

// 모든 회원에 대해 스크리닝 결과 캐시
const screeningCache = new Map();
function getScreening(member) {
  if (screeningCache.has(member.id)) return screeningCache.get(member.id);
  const result = screenIncomingDB(member);
  screeningCache.set(member.id, result);
  return result;
}

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

// 통계 계산
function getScreeningStats() {
  let blocked = 0, alert = 0, pass = 0;
  const undist = MockAssociates.filter(m => !m.consultant || m.consultant === '-' || m.status === '컨텍전');
  undist.forEach(m => {
    const s = getScreening(m);
    if (s.action === 'block') blocked++;
    else if (s.action === 'alert') alert++;
    else pass++;
  });
  return { blocked, alert, pass, total: undist.length };
}

const content = document.getElementById('content');

const PAGE_SIZE = 20;
let currentPage = 1;
let currentTab = 'undist'; // undist | blocked | alert | dist

function render() {
  const stats = getScreeningStats();
  const totalDist = MockAssociates.filter(m => m.consultant && m.consultant !== '-' && m.status !== '컨텍전').length;

  content.innerHTML = `
    <div class="page-header" style="margin-bottom:20px">
      <div>
        <h1 class="page-header__title">회원분배</h1>
        <p class="page-header__subtitle">미분배 준회원을 상담매니저에게 배정합니다</p>
      </div>
    </div>

    <div class="summary-grid" style="margin-bottom:20px">
      <div class="summary-card summary-card--blue" style="cursor:pointer" data-tab="undist">
        <div class="summary-card__value">${stats.pass}</div>
        <div class="summary-card__label">분배 대기</div>
      </div>
      <div class="summary-card summary-card--red" style="cursor:pointer" data-tab="blocked">
        <div class="summary-card__value">${stats.blocked}</div>
        <div class="summary-card__label">소스외 차단</div>
      </div>
      <div class="summary-card summary-card--amber" style="cursor:pointer" data-tab="alert">
        <div class="summary-card__value">${stats.alert}</div>
        <div class="summary-card__label">이력 알림 분배</div>
      </div>
      <div class="summary-card summary-card--green" style="cursor:pointer" data-tab="dist">
        <div class="summary-card__value">${totalDist}</div>
        <div class="summary-card__label">분배 완료</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:0">
      <div class="card__header" style="padding-bottom:0;border-bottom:none">
        <div class="dist-tabs" id="dist-tabs">
          <button class="dist-tab${currentTab==='undist'?' active':''}" data-tab="undist">
            분배 대기 <span class="dist-tab__count">${stats.pass}</span>
          </button>
          <button class="dist-tab${currentTab==='blocked'?' active':''}" data-tab="blocked">
            소스외 차단 <span class="dist-tab__count dist-tab__count--red">${stats.blocked}</span>
          </button>
          <button class="dist-tab${currentTab==='alert'?' active':''}" data-tab="alert">
            이력 알림 <span class="dist-tab__count dist-tab__count--amber">${stats.alert}</span>
          </button>
          <button class="dist-tab${currentTab==='dist'?' active':''}" data-tab="dist">
            분배 완료 <span class="dist-tab__count dist-tab__count--green">${totalDist}</span>
          </button>
        </div>
      </div>
      <div class="card__body" style="padding:0">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border-light)">
          <div style="display:flex;gap:8px;align-items:center">
            <input type="text" class="form-input form-input--sm" id="dist-search" placeholder="이름/연락처 검색..." style="width:180px;font-size:11px">
          </div>
          <div style="display:flex;gap:6px" id="action-buttons"></div>
        </div>
        <div style="font-size:12px;font-weight:600;padding:8px 16px;color:var(--text-secondary)" id="dist-count"></div>
        <table class="data-table" style="font-size:12px">
          <thead>
            <tr id="dist-thead-row"></tr>
          </thead>
          <tbody id="dist-tbody"></tbody>
        </table>
        <div id="dist-pagination" class="pagination"></div>
      </div>
    </div>

    <style>
      .dist-tabs { display: flex; gap: 4px; }
      .dist-tab {
        padding: 8px 16px; border: none; background: none;
        font-size: 12px; font-weight: 500; color: var(--text-muted);
        cursor: pointer; border-bottom: 2px solid transparent;
        transition: all 0.15s ease; font-family: inherit;
        display: flex; align-items: center; gap: 6px;
      }
      .dist-tab:hover { color: var(--text-primary); }
      .dist-tab.active { color: var(--accent); font-weight: 700; border-bottom-color: var(--accent); }
      .dist-tab__count {
        font-size: 10px; font-weight: 600;
        background: var(--bg-tertiary); padding: 1px 6px; border-radius: 10px;
      }
      .dist-tab.active .dist-tab__count { background: var(--accent-bg); color: var(--accent); }
      .dist-tab__count--red { background: #fef2f2 !important; color: #dc2626 !important; }
      .dist-tab__count--amber { background: #fffbeb !important; color: #d97706 !important; }
      .dist-tab__count--green { background: #f0fdf4 !important; color: #16a34a !important; }
      .screening-tag {
        display: inline-flex; align-items: center; gap: 3px;
        font-size: 10px; padding: 2px 6px; border-radius: 4px;
        font-weight: 500; line-height: 1.4;
      }
      .screening-tag--block { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
      .screening-tag--alert { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
      .screening-tag--dup { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    </style>
  `;

  bindTabEvents();
  applyFilter(true);
}

function bindTabEvents() {
  // 탭 전환
  document.querySelectorAll('.dist-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentTab = tab.dataset.tab;
      document.querySelectorAll('.dist-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      applyFilter(true);
    });
  });

  // 서머리 카드 클릭도 탭 전환
  document.querySelectorAll('.summary-card[data-tab]').forEach(card => {
    card.addEventListener('click', () => {
      currentTab = card.dataset.tab;
      document.querySelectorAll('.dist-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === currentTab);
      });
      applyFilter(true);
    });
  });

  document.getElementById('dist-search').addEventListener('input', () => applyFilter(true));
}

function applyFilter(resetPage) {
  if (resetPage) currentPage = 1;
  const search = document.getElementById('dist-search').value.trim().toLowerCase();

  let filtered = [];

  if (currentTab === 'dist') {
    // 분배 완료
    filtered = MockAssociates.filter(m => {
      const isDist = m.consultant && m.consultant !== '-' && m.status !== '컨텍전';
      if (!isDist) return false;
      if (search && !m.name.toLowerCase().includes(search) && !m.phone.includes(search)) return false;
      return true;
    });
  } else {
    // 미분배 대상
    const undist = MockAssociates.filter(m => {
      if (m.consultant && m.consultant !== '-' && m.status !== '컨텍전') return false;
      if (search && !m.name.toLowerCase().includes(search) && !m.phone.includes(search)) return false;
      return true;
    });

    if (currentTab === 'blocked') {
      filtered = undist.filter(m => getScreening(m).action === 'block');
    } else if (currentTab === 'alert') {
      filtered = undist.filter(m => getScreening(m).action === 'alert');
    } else {
      // undist (분배 대기 = pass)
      filtered = undist.filter(m => getScreening(m).action === 'pass');
    }
  }

  renderTable(filtered);
  renderActionButtons();
}

function renderActionButtons() {
  const btnArea = document.getElementById('action-buttons');
  if (!btnArea) return;

  if (currentTab === 'undist' || currentTab === 'alert') {
    btnArea.innerHTML = `<button class="btn btn--sm" id="btn-manual" style="font-size:11px;background:#0369a1;color:#fff;border:none">✋ 수동분배</button>`;
    document.getElementById('btn-manual').addEventListener('click', handleManualDist);
  } else if (currentTab === 'blocked') {
    btnArea.innerHTML = `<button class="btn btn--sm" id="btn-export-blocked" style="font-size:11px;background:#fff;border:1px solid #ccc;color:#333">📋 소스외 내역 다운로드</button>`;
    document.getElementById('btn-export-blocked').addEventListener('click', () => {
      Toast.show('소스외 내역이 다운로드됩니다. (프로토타입)', 'info');
    });
  } else {
    btnArea.innerHTML = '';
  }
}

function renderTable(filtered) {
  const thead = document.getElementById('dist-thead-row');
  const tbody = document.getElementById('dist-tbody');
  const countEl = document.getElementById('dist-count');
  if (!thead || !tbody) return;

  const tabLabels = { undist: '분배 대기', blocked: '소스외 차단', alert: '이력 알림 분배', dist: '분배 완료' };
  if (countEl) countEl.textContent = `${tabLabels[currentTab]} ${filtered.length}건`;

  // 헤더 구성
  if (currentTab === 'blocked') {
    thead.innerHTML = `
      <th style="width:40px">No</th><th>이름</th><th>성별</th><th>나이</th>
      <th>연락처</th><th>유입경로</th><th>등록일</th><th>차단 사유</th>
    `;
  } else if (currentTab === 'alert') {
    thead.innerHTML = `
      <th style="width:30px"><input type="checkbox" id="dist-check-all"></th>
      <th style="width:40px">No</th><th>이름</th><th>성별</th><th>나이</th>
      <th>연락처</th><th>유입경로</th><th>등록일</th><th>과거 이력</th>
    `;
  } else if (currentTab === 'dist') {
    thead.innerHTML = `
      <th style="width:40px">No</th><th>이름</th><th>성별</th><th>나이</th>
      <th>연락처</th><th>유입경로</th><th>등록일</th><th>담당매니저</th><th>분배상태</th>
    `;
  } else {
    thead.innerHTML = `
      <th style="width:30px"><input type="checkbox" id="dist-check-all"></th>
      <th style="width:40px">No</th><th>이름</th><th>성별</th><th>나이</th>
      <th>연락처</th><th>유입경로</th><th>등록일</th><th>분배상태</th>
    `;
  }

  if (filtered.length === 0) {
    const colSpan = currentTab === 'blocked' || currentTab === 'dist' ? 9 : 10;
    tbody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center;padding:40px;color:var(--text-muted)">조건에 맞는 회원이 없습니다.</td></tr>`;
    document.getElementById('dist-pagination').innerHTML = '';
    return;
  }

  // 페이징
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  tbody.innerHTML = paged.map((m, i) => {
    const screening = getScreening(m);
    const no = start + i + 1;

    if (currentTab === 'blocked') {
      const reasonHtml = screening.reasons.map(r =>
        `<span class="screening-tag screening-tag--block">🚫 ${r}</span>`
      ).join(' ');
      const dupInfo = screening.existingMember
        ? `<span class="screening-tag screening-tag--dup">→ 기존: ${screening.existingMember.consultant || '-'}</span>`
        : '';
      return `<tr style="background:#fef2f2">
        <td style="text-align:center">${no}</td>
        <td><a href="dist-detail.html?id=${m.id}" target="_blank" style="font-weight:600;color:#333;text-decoration:underline;cursor:pointer" onclick="event.stopPropagation()">${m.name}</a></td>
        <td style="text-align:center">${m.gender}</td>
        <td style="text-align:center">${m.age}세</td>
        <td>${Formatters.phone(m.phone)}</td>
        <td style="font-size:11px">${m.channel || '-'}</td>
        <td>${Formatters.date(m.registeredAt)}</td>
        <td style="max-width:250px">${reasonHtml} ${dupInfo}</td>
      </tr>`;
    }

    if (currentTab === 'alert') {
      const tagHtml = screening.tags.map(t =>
        `<span class="screening-tag screening-tag--alert">⚠️ ${t.label}</span>`
      ).join(' ');
      return `<tr style="background:#fffbeb">
        <td style="text-align:center"><input type="checkbox" class="dist-check" value="${m.id}"></td>
        <td style="text-align:center">${no}</td>
        <td><a href="dist-detail.html?id=${m.id}" target="_blank" style="font-weight:600;color:#333;text-decoration:underline;cursor:pointer" onclick="event.stopPropagation()">${m.name}</a></td>
        <td style="text-align:center">${m.gender}</td>
        <td style="text-align:center">${m.age}세</td>
        <td>${Formatters.phone(m.phone)}</td>
        <td style="font-size:11px">${m.channel || '-'}</td>
        <td>${Formatters.date(m.registeredAt)}</td>
        <td style="max-width:250px">${tagHtml}</td>
      </tr>`;
    }

    if (currentTab === 'dist') {
      return `<tr style="background:#f0f9ff;opacity:0.8">
        <td style="text-align:center">${no}</td>
        <td><a href="dist-detail.html?id=${m.id}" target="_blank" style="font-weight:600;color:#0369a1;text-decoration:underline;cursor:pointer" onclick="event.stopPropagation()">${m.name}</a></td>
        <td style="text-align:center">${m.gender}</td>
        <td style="text-align:center">${m.age}세</td>
        <td>${Formatters.phone(m.phone)}</td>
        <td style="font-size:11px">${m.channel || '-'}</td>
        <td>${Formatters.date(m.registeredAt)}</td>
        <td><span style="font-weight:600;color:#0369a1">${m.consultant}</span></td>
        <td style="text-align:center"><span class="badge badge--green" style="font-size:10px;padding:2px 8px">분배완료</span></td>
      </tr>`;
    }

    // undist (분배 대기)
    return `<tr>
      <td style="text-align:center"><input type="checkbox" class="dist-check" value="${m.id}"></td>
      <td style="text-align:center">${no}</td>
      <td><a href="dist-detail.html?id=${m.id}" target="_blank" style="font-weight:600;color:var(--accent);text-decoration:underline;cursor:pointer" onclick="event.stopPropagation()">${m.name}</a></td>
      <td style="text-align:center">${m.gender}</td>
      <td style="text-align:center">${m.age}세</td>
      <td>${Formatters.phone(m.phone)}</td>
      <td style="font-size:11px">${m.channel || '-'}</td>
      <td>${Formatters.date(m.registeredAt)}</td>
      <td style="text-align:center"><span class="badge badge--red" style="font-size:10px;padding:2px 8px">미분배</span></td>
    </tr>`;
  }).join('');

  // 체크박스 전체 선택
  const checkAll = document.getElementById('dist-check-all');
  if (checkAll) {
    checkAll.addEventListener('change', function() {
      document.querySelectorAll('.dist-check').forEach(c => { c.checked = this.checked; });
    });
  }

  // 페이지네이션
  const pagEl = document.getElementById('dist-pagination');
  if (totalPages <= 1) { pagEl.innerHTML = ''; return; }
  let pagHtml = `<button class="pagination__btn" ${currentPage===1?'disabled':''} data-page="${currentPage-1}">◀ 이전</button>`;
  const maxShow = 10;
  let startP = Math.max(1, currentPage - Math.floor(maxShow/2));
  let endP = Math.min(totalPages, startP + maxShow - 1);
  if (endP - startP < maxShow - 1) startP = Math.max(1, endP - maxShow + 1);
  for (let p = startP; p <= endP; p++) {
    pagHtml += `<button class="pagination__btn${p===currentPage?' active':''}" data-page="${p}">${p}</button>`;
  }
  pagHtml += `<button class="pagination__btn" ${currentPage===totalPages?'disabled':''} data-page="${currentPage+1}">다음 ▶</button>`;
  pagEl.innerHTML = pagHtml;
  pagEl.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => { currentPage = parseInt(btn.dataset.page); applyFilter(); });
  });
}

function handleManualDist() {
  const checks = document.querySelectorAll('.dist-check:checked');
  selectedIds = [];
  checks.forEach(c => selectedIds.push(parseInt(c.value)));
  if (selectedIds.length === 0) { Toast.show('분배할 회원을 선택하세요.', 'warning'); return; }

  const selected = MockAssociates.filter(m => selectedIds.includes(m.id));
  const screening = selected.map(m => getScreening(m));
  const hasAlerts = screening.some(s => s.action === 'alert');

  Modal.show({
    title: `✋ 수동 회원분배 (${selected.length}명)`,
    size: 'lg',
    content: `
      ${hasAlerts ? `
        <div style="padding:10px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;margin-bottom:14px;font-size:11px;color:#92400e">
          ⚠️ 과거 이력이 있는 회원이 포함되어 있습니다. 매니저에게 이력 태그가 함께 전달됩니다.
        </div>
      ` : ''}
      <div style="margin-bottom:16px">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px">선택된 회원 (${selected.length}명)</div>
        <div style="max-height:180px;overflow-y:auto">
          <table class="data-table" style="font-size:11px"><thead><tr><th>No</th><th>이름</th><th>성별</th><th>나이</th><th>유입경로</th><th>이력</th></tr></thead>
          <tbody>${selected.map((m, i) => {
            const s = getScreening(m);
            const tagHtml = s.tags.length > 0
              ? s.tags.map(t => `<span class="screening-tag screening-tag--alert" style="font-size:9px">⚠️</span>`).join('')
              : '-';
            return `<tr><td>${i+1}</td><td>${m.name}</td><td>${m.gender}</td><td>${m.age}세</td><td>${m.channel || '-'}</td><td>${tagHtml}</td></tr>`;
          }).join('')}</tbody></table>
        </div>
      </div>
      <div style="padding:16px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px">
        <div style="font-size:12px;font-weight:600;margin-bottom:8px">배정할 매니저</div>
        <input type="text" id="dist-mgr-search" class="form-input form-input--sm" placeholder="매니저 이름 검색..." style="font-size:11px;margin-bottom:8px">
        <div style="max-height:200px;overflow-y:auto">
          <table class="data-table" style="font-size:11px">
            <thead><tr><th style="width:30px"></th><th>매니저</th><th style="text-align:center">보유 DB</th></tr></thead>
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

          // 알림 분배 태그가 있으면 이력 저장
          const s = getScreening(m);
          if (s.tags.length > 0) {
            addScreeningLog(m, s);
          }
        });
        screeningCache.clear(); // 캐시 초기화
        document.getElementById('modal-root').innerHTML = '';
        Toast.show(`${selected.length}명이 ${manager} 매니저에게 분배되었습니다.`, 'success');
        render(); // 전체 재렌더
      });
    }
  }, 100);
}

render();
