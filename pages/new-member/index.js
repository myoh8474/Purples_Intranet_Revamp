/* ========================================
   신규회원 통합관리 — 계약~프로필발송 진행 추적
   ======================================== */
import { initLayout } from '@core/layout.js';
import { DataTable } from '@components/DataTable.js';
import { Formatters } from '@utils/formatters.js';
import { BRANCHES, CONSULTANTS } from '@config/constants.js';
import { BRANDS, MATCH_MANAGERS } from '@mock/regulars.js';

initLayout({ pageId: 'new-member', breadcrumbs: ['신규회원 통합관리'] });
const content = document.getElementById('content');

/* ── (브랜드·지사는 각각 독립 드롭다운으로 제공) ── */

/* ── Mock 데이터 생성 ── */
function randomPick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function fmtDateStr(d) { return d.toISOString().substring(0, 10); }
function addDays(d, n) { return new Date(d.getTime() + n * 86400000); }

const NAMES_M = ['박서준','이정훈','정민호','한성민','김도현','강준혁','오시환','윤태민','조현우','송재원','김하늘','임지호'];
const NAMES_F = ['김하늘','최수아','한유진','조윤서','서다인','강예린','임소율','한나윤','박지유','송하린','오서윤','배민지'];

function generateMockData() {
  const data = [];
  for (let i = 0; i < 40; i++) {
    const gender = Math.random() > 0.45 ? '여' : '남';
    const names = gender === '남' ? NAMES_M : NAMES_F;
    const name = randomPick(names);
    const brand = randomPick(BRANDS);
    const branch = randomPick(BRANCHES.map(b => b.name));
    const consultMgr = randomPick(CONSULTANTS);
    const matchMgr = randomPick(MATCH_MANAGERS);

    // 계약일 기준으로 후속 날짜 자동 산출
    const contractDate = randomDate(new Date(2026, 3, 1), new Date(2026, 6, 1));
    const depositDate = addDays(contractDate, Math.floor(Math.random() * 5) + 1);
    const welcomeSmsDate = addDays(depositDate, Math.floor(Math.random() * 2) + 1);
    const dataRegDate = addDays(welcomeSmsDate, Math.floor(Math.random() * 3) + 1);

    // 1차/2차 인증 — 일부만 완료
    const cert1Done = Math.random() > 0.25;
    const cert1Date = cert1Done ? fmtDateStr(addDays(dataRegDate, Math.floor(Math.random() * 5) + 2)) : null;
    const cert2Done = cert1Done && Math.random() > 0.35;
    const cert2Date = cert2Done ? fmtDateStr(addDays(new Date(cert1Date), Math.floor(Math.random() * 5) + 2)) : null;

    // 배정인사
    const greetDone = cert2Done && Math.random() > 0.3;
    const greetDate = greetDone ? fmtDateStr(addDays(new Date(cert2Date), Math.floor(Math.random() * 3) + 1)) : null;

    // 프로필 발송
    const profileSent = greetDone && Math.random() > 0.35;
    const profileDate = profileSent ? fmtDateStr(addDays(new Date(greetDate), Math.floor(Math.random() * 5) + 1)) : null;

    // 소요기간 계산
    let leadDays = null;
    if (profileDate) {
      const diff = Math.round((new Date(profileDate) - contractDate) / 86400000);
      leadDays = diff;
    }

    data.push({
      id: i + 1,
      brand,
      branch,
      name,
      gender,
      consultManager: consultMgr,
      matchManager: matchMgr,
      contractDate: fmtDateStr(contractDate),
      depositDate: fmtDateStr(depositDate),
      welcomeSmsDate: fmtDateStr(welcomeSmsDate),
      dataRegDate: fmtDateStr(dataRegDate),
      cert1Date,
      cert2Date,
      greetDate,
      profileDate,
      leadDays,
    });
  }
  return data;
}

const allData = generateMockData();

/* ── 기간 프리셋 헬퍼 ── */
function getPresetRange(type) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  switch (type) {
    case 'day':
      return { start: fmtDateStr(now), end: fmtDateStr(now) };
    case 'week': {
      const dow = now.getDay();
      const mon = new Date(y, m, d - (dow === 0 ? 6 : dow - 1));
      const sun = addDays(mon, 6);
      return { start: fmtDateStr(mon), end: fmtDateStr(sun) };
    }
    case 'month':
      return { start: `${y}-${String(m + 1).padStart(2, '0')}-01`, end: fmtDateStr(new Date(y, m + 1, 0)) };
    case 'year':
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    default:
      return { start: '', end: '' };
  }
}

/* ── 렌더링 ── */
let table = null;
let currentFiltered = [...allData];

function render() {
  content.innerHTML = `
<div class="page-header" style="margin-bottom:16px">
  <div>
    <h1 class="page-header__title">신규회원 통합관리</h1>
    <p class="page-header__subtitle">계약 체결부터 프로필 발송까지의 진행 현황을 추적합니다</p>
  </div>
</div>

<!-- 검색 필터 -->
<table class="std-table" id="filter-bar" style="margin-bottom:0;table-layout:fixed">
  <colgroup>
    <col style="width:55px"><col style="width:105px"><col style="width:40px"><col style="width:95px">
    <col style="width:40px"><col><col style="width:55px"><col style="width:400px">
  </colgroup>
  <tbody>
    <tr>
      <th>브랜드</th>
      <td>
        <select class="form-select form-input--sm" id="f-brand" style="width:100%">
          <option value="">전체</option>
          ${BRANDS.map(b => `<option value="${b}">${b}</option>`).join('')}
        </select>
      </td>
      <th>지사</th>
      <td>
        <select class="form-select form-input--sm" id="f-branch" style="width:100%">
          <option value="">전체</option>
          ${BRANCHES.map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
        </select>
      </td>
      <th>기간</th>
      <td>
        <div style="display:flex;gap:3px;align-items:center;white-space:nowrap">
          <select class="form-select form-input--sm" id="f-date-type" style="width:68px">
            <option value="contractDate">계약일</option>
            <option value="depositDate">입금일</option>
            <option value="dataRegDate">등록일</option>
          </select>
          <input type="date" class="form-input form-input--sm" id="f-date-start" style="width:118px">
          <span style="color:var(--text-muted);font-size:11px">~</span>
          <input type="date" class="form-input form-input--sm" id="f-date-end" style="width:118px">
          <button class="btn btn--ghost btn--sm preset-btn" data-preset="day">일</button>
          <button class="btn btn--ghost btn--sm preset-btn" data-preset="week">주</button>
          <button class="btn btn--ghost btn--sm preset-btn" data-preset="month">월</button>
          <button class="btn btn--ghost btn--sm preset-btn" data-preset="year">년</button>
        </div>
      </td>
      <th>키워드</th>
      <td>
        <div style="display:flex;gap:4px;align-items:center">
          <select class="form-select form-input--sm" id="f-keyword-type" style="width:90px">
            <option value="consultManager">상담매니저</option>
            <option value="matchManager">매칭매니저</option>
            <option value="name">회원이름</option>
          </select>
          <input type="text" class="form-input form-input--sm" id="f-keyword" placeholder="검색어 입력" style="flex:1">
        </div>
      </td>
    </tr>
  </tbody>
</table>
<div style="background:#fff;border:1px solid var(--border-light);border-top:none;padding:4px 12px;display:flex;justify-content:center;align-items:center;gap:12px">
  <button class="btn btn--secondary btn--sm" id="btn-search">검색</button>
  <button class="btn btn--reset btn--sm" id="btn-reset">초기화</button>
</div>

<!-- 건수 + 엑셀 -->
<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0 6px">
  <div style="font-size:13px;font-weight:600;color:var(--text-secondary)">검색결과 <span id="member-count" style="color:var(--accent)">0</span>명</div>
  <button class="btn btn--outline btn--sm" id="btn-excel">📥 엑셀 다운로드</button>
</div>

<!-- 테이블 -->
<div id="tbl"></div>

<style>
.preset-btn { min-width:48px; font-size:11px !important; padding:3px 8px !important; border:1px solid var(--border-light) !important; background:#fff !important; color:var(--text-secondary) !important; cursor:pointer; }
.preset-btn:hover { border-color:var(--accent) !important; color:var(--accent) !important; }
.preset-btn.active { background:var(--accent) !important; color:#fff !important; border-color:var(--accent) !important; }
.lead-badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:600; }
.lead-badge--done { background:#e8f5e9; color:#2e7d32; }
.lead-badge--wait { background:#fff3e0; color:#e65100; }
</style>`;

  updateCount(allData.length);
  renderTable(allData);
  bindEvents();
}

function updateCount(n) { document.getElementById('member-count').textContent = n; }

function renderTable(data) {
  currentFiltered = data;
  table = DataTable.render('tbl', {
    columns: [
      { key: '_no', label: '번호', width: '42px', render: (v, r, i) => i + 1, sortable: false },
      { key: 'brand', label: '브랜드', width: '65px' },
      { key: 'name', label: '회원명', width: '72px', render: (v, r) => `<a href="/pages/regular/detail.html?id=${r.id}" target="_blank" style="font-weight:600;color:var(--accent);text-decoration:none" onclick="event.stopPropagation()">${v}</a>` },
      { key: 'consultManager', label: '상담매니저', width: '72px' },
      { key: 'matchManager', label: '매칭매니저', width: '72px' },
      { key: 'contractDate', label: '계약일', width: '88px', render: v => `<span class="fmt-date">${v}</span>`, sortable: true },
      { key: 'depositDate', label: '입금일', width: '88px', render: v => `<span class="fmt-date">${v}</span>`, sortable: true },
      { key: 'welcomeSmsDate', label: '웰컴문자', width: '88px', render: v => `<span class="fmt-date">${v}</span>`, sortable: true },
      { key: 'dataRegDate', label: 'Data등록일', width: '88px', render: v => `<span class="fmt-date">${v}</span>`, sortable: true },
      { key: 'cert1Date', label: '1차인증', width: '88px', render: v => v ? `<span class="fmt-date">${v}</span>` : '<span style="color:var(--text-muted)">-</span>', sortable: true },
      { key: 'cert2Date', label: '2차인증', width: '88px', render: v => v ? `<span class="fmt-date">${v}</span>` : '<span style="color:var(--text-muted)">-</span>', sortable: true },
      { key: 'greetDate', label: '배정인사', width: '88px', render: v => v ? `<span class="fmt-date">${v}</span>` : '<span style="color:var(--text-muted)">-</span>', sortable: true },
      { key: 'leadDays', label: '프로필발송<br>소요기간', width: '85px', render: (v, r) => {
        if (r.profileDate) return `<span class="lead-badge lead-badge--done">${v}일</span>`;
        return `<span class="lead-badge lead-badge--wait">발송대기</span>`;
      }, sortable: true },
    ],
    data,
    pageSize: 20,
    onRowClick: r => { window.open(`/pages/regular/detail.html?id=${r.id}`, '_blank'); },
  });
}

function applyFilters() {
  let d = [...allData];

  // 1) 브랜드
  const brand = document.getElementById('f-brand').value;
  if (brand) d = d.filter(x => x.brand === brand);

  // 2) 지사
  const branch = document.getElementById('f-branch').value;
  if (branch) d = d.filter(x => x.branch === branch);

  // 2) 날짜 범위
  const dateType = document.getElementById('f-date-type').value;
  const ds = document.getElementById('f-date-start').value;
  const de = document.getElementById('f-date-end').value;
  if (ds) d = d.filter(x => x[dateType] >= ds);
  if (de) d = d.filter(x => x[dateType] <= de);

  // 3) 키워드
  const kwType = document.getElementById('f-keyword-type').value;
  const kw = (document.getElementById('f-keyword').value || '').trim().toLowerCase();
  if (kw) d = d.filter(x => (x[kwType] || '').toLowerCase().includes(kw));

  renderTable(d);
  updateCount(d.length);
}

function bindEvents() {
  // 검색
  document.getElementById('btn-search').onclick = () => applyFilters();
  document.getElementById('f-keyword').onkeydown = e => { if (e.key === 'Enter') applyFilters(); };

  // 초기화
  document.getElementById('btn-reset').onclick = () => {
    document.getElementById('f-brand').value = '';
    document.getElementById('f-branch').value = '';
    document.getElementById('f-date-type').value = 'contractDate';
    document.getElementById('f-date-start').value = '';
    document.getElementById('f-date-end').value = '';
    document.getElementById('f-keyword-type').value = 'consultManager';
    document.getElementById('f-keyword').value = '';
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    renderTable(allData);
    updateCount(allData.length);
  };

  // 기간 프리셋
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const { start, end } = getPresetRange(btn.dataset.preset);
      document.getElementById('f-date-start').value = start;
      document.getElementById('f-date-end').value = end;
      applyFilters();
    };
  });

  // 엑셀 다운로드
  document.getElementById('btn-excel').onclick = () => downloadExcel();
}

/* ── 엑셀 다운로드 ── */
async function downloadExcel() {
  try {
    const XLSX = await import('xlsx');
    const headers = ['번호','브랜드','회원명','상담매니저','매칭매니저','계약일','입금일','웰컴문자 발송일','Data등록일','1차인증','2차인증','배정인사','프로필발송 소요기간'];
    const rows = [headers];
    currentFiltered.forEach((r, i) => {
      rows.push([
        i + 1,
        r.brand,
        r.name,
        r.consultManager,
        r.matchManager,
        r.contractDate,
        r.depositDate,
        r.welcomeSmsDate,
        r.dataRegDate,
        r.cert1Date || '-',
        r.cert2Date || '-',
        r.greetDate || '-',
        r.profileDate ? `${r.leadDays}일` : '발송대기',
      ]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
      { wch: 11 }, { wch: 11 }, { wch: 13 }, { wch: 11 },
      { wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, '신규회원');
    XLSX.writeFile(wb, `신규회원_통합관리_${fmtDateStr(new Date())}.xlsx`);
  } catch (e) {
    console.error('엑셀 다운로드 실패:', e);
    alert('엑셀 다운로드에 실패했습니다.');
  }
}

render();
