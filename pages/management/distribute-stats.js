/* ========================================
   DB분배 통계 페이지
   - 기간별 분배 건수 통계
   - 지사별·매체별·상담사별 조회
   - 요구사항: 1차리뷰 #15, 2차리뷰 #7/#8/#10
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MockAssociates } from '@mock/associates.js';
import { CONSULTANTS, BRANCHES, CONSULTANT_BRANCH } from '@config/constants.js';

initLayout({ pageId: 'distribute-stats', breadcrumbs: ['회원분배', 'DB분배 통계'] });

/* ── 기간 유틸 ── */
function getToday() {
  return new Date().toISOString().slice(0, 10);
}
function getWeekStart() {
  const d = new Date(); d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}
function getMonthStart() {
  const d = new Date(); d.setDate(1);
  return d.toISOString().slice(0, 10);
}

/* ── 렌더 ── */
function render() {
  const app = document.getElementById('app');
  const main = app.querySelector('main') || app;
  const container = main.querySelector('.content-area') || main;

  const today = getToday();

  container.innerHTML = `
    <div class="page-header">
      <h2 class="page-header__title">DB분배 통계</h2>
      <p class="page-header__desc">기간별 분배 건수·매체별·지사별·상담사별 통계를 조회합니다.</p>
    </div>

    <!-- 검색 필터 -->
    <table class="std-table" id="filter-bar" style="margin-bottom:0;table-layout:fixed">
      <colgroup>
        <col style="width:80px"><col><col style="width:80px"><col>
      </colgroup>
      <tbody>
        <tr>
          <th>분배일</th>
          <td colspan="3">
            <div style="display:flex;gap:4px;align-items:center">
              <input type="date" class="form-input form-input--sm" id="s-from" value="${getMonthStart()}" style="width:140px">
              <span style="font-size:11px;color:#94a3b8">~</span>
              <input type="date" class="form-input form-input--sm" id="s-to" value="${today}" style="width:140px">
              <div class="period-quick-btns" style="margin-left:8px">
                <button class="btn btn--outline btn--sm" data-period="today">오늘</button>
                <button class="btn btn--outline btn--sm" data-period="week">이번주</button>
                <button class="btn btn--outline btn--sm" data-period="month">이번달</button>
              </div>
              <button class="btn btn--secondary btn--sm" id="btn-search" style="margin-left:12px">검색</button>
              <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- KPI 카드 -->
    <div class="list-section" style="margin-top:20px">
      <div class="list-section__header">
        <h3 class="list-section__title">분배 통계</h3>
        <span class="list-section__meta" id="stat-period"></span>
      </div>
      <div class="list-section__body">
        <div class="kpi-stat-grid kpi-stat-grid--5" id="kpi-area"></div>
      </div>
    </div>

    <!-- 지사별 분배 현황 -->
    <div class="list-section" style="margin-top:16px">
      <div class="list-section__header">
        <h3 class="list-section__title">지사별 분배 현황</h3>
      </div>
      <div class="list-section__body">
        <table class="std-table" style="white-space:nowrap">
          <thead>
            <tr>
              <th>지사</th><th>분배건수</th><th>자동분배</th><th>수동분배</th><th style="color:#c62828">포기(불가)</th><th style="color:#e65100">변경</th>
            </tr>
          </thead>
          <tbody id="branch-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- 매체별 분배 현황 -->
    <div class="list-section" style="margin-top:16px">
      <div class="list-section__header">
        <h3 class="list-section__title">매체(유입경로)별 분배 현황</h3>
      </div>
      <div class="list-section__body">
        <table class="std-table" style="white-space:nowrap">
          <thead>
            <tr>
              <th>유입경로</th><th>분배건수</th><th>자동분배</th><th>수동분배</th>
            </tr>
          </thead>
          <tbody id="channel-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- 상담사별 분배 현황 -->
    <div class="list-section" style="margin-top:16px">
      <div class="list-section__header">
        <h3 class="list-section__title">상담사별 분배 현황</h3>
      </div>
      <div class="list-section__body">
        <table class="std-table" style="white-space:nowrap">
          <thead>
            <tr>
              <th style="width:40px">No.</th><th>지사</th><th>상담사</th><th>분배건수</th><th>자동분배</th><th>수동분배</th><th style="color:#c62828">포기(불가)</th><th style="color:#e65100">변경</th>
            </tr>
          </thead>
          <tbody id="consultant-tbody"></tbody>
        </table>
      </div>
    </div>

    <style>
      .page-header { margin-bottom: 20px; }
      .page-header__title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 4px; }
      .page-header__desc { font-size: 13px; color: var(--text-muted); margin: 0; }
      #filter-bar, #filter-bar th, #filter-bar td { font-size: 13px; }
    </style>
  `;

  bindEvents();
  applyFilter();
}

/* ── 데이터 필터링 ── */
function applyFilter() {
  const from = document.getElementById('s-from')?.value || '';
  const to = document.getElementById('s-to')?.value || '';

  // 분배된 회원만 (매니저 배정됨 + 컨텍전 아님)
  let filtered = MockAssociates.filter(m => {
    if (!(m.consultant && m.consultant !== '-' && m.status !== '컨텍전')) return false;
    if (from && (m.distributedAt || '') < from) return false;
    if (to && (m.distributedAt || '') > to + 'T23:59:59') return false;
    return true;
  });

  renderStats(filtered, from, to);
}

/* ── 통계 렌더링 ── */
function renderStats(filtered, from, to) {
  // 브랜치 이름 맵
  const branchNameMap = {};
  BRANCHES.forEach(b => { branchNameMap[b.code] = b.name; });

  // ── KPI 계산 ──
  const totalDist = filtered.length;
  const autoDist = filtered.filter(m => (m.distMethod || '수동분배') === '자동분배').length;
  const manualDist = totalDist - autoDist;
  const abandoned = filtered.filter(m => (m.status || '').includes('불가')).length;
  const changed = filtered.filter(m => m.status === '변경').length;

  // 기간 표시
  const periodEl = document.getElementById('stat-period');
  if (periodEl) {
    periodEl.textContent = (from || to) ? `${from || '~'} ~ ${to || '~'}` : '전체 기간';
  }

  // KPI 카드
  const kpiArea = document.getElementById('kpi-area');
  if (kpiArea) {
    const kpiData = [
      { label: '총 분배건수', value: totalDist, unit: '건', color: '#374151' },
      { label: '자동분배', value: autoDist, unit: '건', color: '#1d4ed8' },
      { label: '수동분배', value: manualDist, unit: '건', color: '#a16207' },
      { label: '포기(불가)', value: abandoned, unit: '건', color: '#c62828' },
      { label: '변경', value: changed, unit: '건', color: '#e65100' },
    ];
    kpiArea.innerHTML = kpiData.map(k => `
      <div class="kpi-stat-card">
        <div class="kpi-stat-card__label">${k.label}</div>
        <div class="kpi-stat-card__value" style="color:${k.color}">${k.value.toLocaleString()}<span class="kpi-stat-card__unit">${k.unit}</span></div>
      </div>
    `).join('');
  }

  // ── 지사별 현황 ──
  const branchGroups = {};
  filtered.forEach(m => {
    const br = branchNameMap[CONSULTANT_BRANCH[m.consultant]] || '미지정';
    if (!branchGroups[br]) branchGroups[br] = { total: 0, auto: 0, manual: 0, abandoned: 0, changed: 0 };
    branchGroups[br].total++;
    if ((m.distMethod || '수동분배') === '자동분배') branchGroups[br].auto++;
    else branchGroups[br].manual++;
    if ((m.status || '').includes('불가')) branchGroups[br].abandoned++;
    if (m.status === '변경') branchGroups[br].changed++;
  });

  const branchTbody = document.getElementById('branch-tbody');
  if (branchTbody) {
    branchTbody.innerHTML = Object.entries(branchGroups).map(([br, s]) => `<tr>
      <td class="tc" style="font-weight:600">${br}</td>
      <td class="tc">${s.total}</td>
      <td class="tc" style="color:#1d4ed8">${s.auto}</td>
      <td class="tc" style="color:#a16207">${s.manual}</td>
      <td class="tc" style="color:#c62828">${s.abandoned}</td>
      <td class="tc" style="color:#e65100">${s.changed}</td>
    </tr>`).join('') + `<tr style="background:var(--bg-secondary);font-weight:700;border-top:1px solid var(--border-light)">
      <td class="tc">합계</td>
      <td class="tc">${totalDist}</td>
      <td class="tc" style="color:#1d4ed8">${autoDist}</td>
      <td class="tc" style="color:#a16207">${manualDist}</td>
      <td class="tc" style="color:#c62828">${abandoned}</td>
      <td class="tc" style="color:#e65100">${changed}</td>
    </tr>`;
  }

  // ── 매체(유입경로)별 현황 ──
  const channelGroups = {};
  filtered.forEach(m => {
    const ch = m.channel || '미분류';
    if (!channelGroups[ch]) channelGroups[ch] = { total: 0, auto: 0, manual: 0 };
    channelGroups[ch].total++;
    if ((m.distMethod || '수동분배') === '자동분배') channelGroups[ch].auto++;
    else channelGroups[ch].manual++;
  });

  const channelTbody = document.getElementById('channel-tbody');
  if (channelTbody) {
    const channelEntries = Object.entries(channelGroups).sort((a, b) => b[1].total - a[1].total);
    channelTbody.innerHTML = channelEntries.map(([ch, s]) => `<tr>
      <td class="tc">${ch}</td>
      <td class="tc">${s.total}</td>
      <td class="tc" style="color:#1d4ed8">${s.auto}</td>
      <td class="tc" style="color:#a16207">${s.manual}</td>
    </tr>`).join('') + `<tr style="background:var(--bg-secondary);font-weight:700;border-top:1px solid var(--border-light)">
      <td class="tc">합계</td>
      <td class="tc">${totalDist}</td>
      <td class="tc" style="color:#1d4ed8">${autoDist}</td>
      <td class="tc" style="color:#a16207">${manualDist}</td>
    </tr>`;
  }

  // ── 상담사별 현황 ──
  const consultantGroups = {};
  filtered.forEach(m => {
    const name = m.consultant || '미배정';
    const br = branchNameMap[CONSULTANT_BRANCH[name]] || '미지정';
    if (!consultantGroups[name]) consultantGroups[name] = { branch: br, total: 0, auto: 0, manual: 0, abandoned: 0, changed: 0 };
    consultantGroups[name].total++;
    if ((m.distMethod || '수동분배') === '자동분배') consultantGroups[name].auto++;
    else consultantGroups[name].manual++;
    if ((m.status || '').includes('불가')) consultantGroups[name].abandoned++;
    if (m.status === '변경') consultantGroups[name].changed++;
  });

  const consultantTbody = document.getElementById('consultant-tbody');
  if (consultantTbody) {
    const entries = Object.entries(consultantGroups).sort((a, b) => b[1].total - a[1].total);
    consultantTbody.innerHTML = entries.map(([name, s], i) => `<tr>
      <td class="tc">${i + 1}</td>
      <td class="tc">${s.branch}</td>
      <td class="tc" style="font-weight:600">${name}</td>
      <td class="tc">${s.total}</td>
      <td class="tc" style="color:#1d4ed8">${s.auto}</td>
      <td class="tc" style="color:#a16207">${s.manual}</td>
      <td class="tc" style="color:#c62828">${s.abandoned}</td>
      <td class="tc" style="color:#e65100">${s.changed}</td>
    </tr>`).join('') + `<tr style="background:var(--bg-secondary);font-weight:700;border-top:1px solid var(--border-light)">
      <td class="tc" colspan="3">합계 (${entries.length}명)</td>
      <td class="tc">${totalDist}</td>
      <td class="tc" style="color:#1d4ed8">${autoDist}</td>
      <td class="tc" style="color:#a16207">${manualDist}</td>
      <td class="tc" style="color:#c62828">${abandoned}</td>
      <td class="tc" style="color:#e65100">${changed}</td>
    </tr>`;
  }
}

/* ── 이벤트 바인딩 ── */
function bindEvents() {
  // 퀵 버튼
  document.querySelectorAll('[data-period]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.period;
      const today = getToday();
      if (p === 'today') {
        document.getElementById('s-from').value = today;
        document.getElementById('s-to').value = today;
      } else if (p === 'week') {
        document.getElementById('s-from').value = getWeekStart();
        document.getElementById('s-to').value = today;
      } else if (p === 'month') {
        document.getElementById('s-from').value = getMonthStart();
        document.getElementById('s-to').value = today;
      }
      applyFilter();
    });
  });

  // 검색
  document.getElementById('btn-search')?.addEventListener('click', () => applyFilter());

  // 초기화
  document.getElementById('btn-reset')?.addEventListener('click', () => {
    document.getElementById('s-from').value = getMonthStart();
    document.getElementById('s-to').value = getToday();
    applyFilter();
  });

  // 날짜 변경 시 자동 갱신
  ['s-from', 's-to'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => applyFilter());
  });
}

render();
