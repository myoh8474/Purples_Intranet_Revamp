/* ========================================
   대시보드 페이지 — 영업기획(상담최고관리자) 대시보드
   상담현황 + 매니저 활동 + 방문예약 + 보유DB 통합
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { MockAssociates } from '@mock/associates.js';
import { MockMonthlySales, MockTodos, MockStats, MockNotifications } from '@mock/stats.js';
import { Auth } from '@core/auth.js';
import { CONSULTANTS, CONSULTANT_BRANCH, BRANCHES } from '@config/constants.js';

// 레이아웃 초기화
initLayout({ pageId: 'dashboard', breadcrumbs: ['대시보드'] });

// ── 브랜드 셀렉터 (최고관리자 전용) ──
const BRANDS = {
  purples: { name: '퍼플스', color: '#7c3aed', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)' },
  lemarie: { name: '르매리', color: '#be185d', bg: 'linear-gradient(135deg,#be185d,#9d174d)' },
  denoble: { name: '디노블', color: '#0e7490', bg: 'linear-gradient(135deg,#0e7490,#155e75)' },
};
const user = Auth.getUser();
const isAdmin = user && user.role === 'admin';
const savedBrand = localStorage.getItem('purples_dashboard_brand') || 'purples';
let currentBrand = savedBrand;

// ── 데이터 계산 ──
const now = new Date();
const monthLabel = `${now.getMonth() + 1}월`;
const activeAssoc = MockAssociates.filter(m => !['변경','중복','불가','가입완료'].includes(m.status)).length;
const activeReg = MockStats.statusDistribution.regular.find(d => d.label === '활동')?.value || 0;
const totalReg = MockStats.statusDistribution.regular.reduce((s, d) => s + d.value, 0);
const monthSales = MockMonthlySales[MockMonthlySales.length - 1].value;
const pendingApprovals = 4;

// 성사율 계산
const matchRate = MockStats.matchingStats.successRate;

// ── 공지사항 더미 ──
const notices = [
  { id: 1, title: '2026년 상반기 매칭 정책 변경 안내', date: '2026-05-12' },
  { id: 2, title: '다이아몬드 등급 바우처 운영 기준 안내', date: '2026-05-11' },
  { id: 3, title: '5월 정기 교육 일정 안내 (전 직원 필수)', date: '2026-05-10' },
  { id: 4, title: '개인정보처리방침 개정에 따른 동의서 변경', date: '2026-05-08' },
  { id: 5, title: '신규 CRM 시스템 도입 관련 교육 안내', date: '2026-05-05' },
];

// ── 브랜드 셀렉터 HTML ──
function buildBrandSelector() {
  if (!isAdmin) return '';
  const brand = BRANDS[currentBrand];
  return `
    <div style="position:relative;display:inline-block" id="brand-selector-wrap">
      <button id="brand-selector-btn" style="
        display:flex;align-items:center;gap:8px;padding:6px 14px;
        border-radius:var(--radius-lg);border:1.5px solid ${brand.color};
        background:white;cursor:pointer;font-size:13px;font-weight:700;
        color:${brand.color};transition:all 0.2s;min-width:140px;justify-content:space-between;
      ">
        <span style="display:flex;align-items:center;gap:6px">
          <span style="width:8px;height:8px;border-radius:50%;background:${brand.color}"></span>
          ${brand.name}
        </span>
        <span style="font-size:10px;transform:rotate(0deg);transition:transform 0.2s" id="brand-arrow">▼</span>
      </button>
      <div id="brand-dropdown" style="
        display:none;position:absolute;top:calc(100% + 4px);left:0;
        background:white;border:1px solid var(--border-light);border-radius:var(--radius-lg);
        box-shadow:var(--shadow-lg);z-index:100;min-width:160px;overflow:hidden;
      ">
        ${Object.entries(BRANDS).map(([key, b]) => `
          <div class="brand-option" data-brand="${key}" style="
            display:flex;align-items:center;gap:8px;padding:10px 14px;font-size:12px;
            font-weight:${key === currentBrand ? '700' : '500'};cursor:pointer;
            color:${key === currentBrand ? b.color : 'var(--text-primary)'};
            background:${key === currentBrand ? b.color + '10' : 'transparent'};
            transition:background 0.15s;
          " onmouseover="this.style.background='${b.color}10'" onmouseout="this.style.background='${key === currentBrand ? b.color + '10' : 'transparent'}'">
            <span style="width:8px;height:8px;border-radius:50%;background:${b.color}"></span>
            ${b.name}
            ${key === currentBrand ? '<span style="margin-left:auto;font-size:10px">✓</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>`;
}

// ── 페이지 렌더링 ──
const content = document.getElementById('content');
content.innerHTML = `
  <!-- 상단: 월 업무 현황 -->
  <div class="page-header" style="margin-bottom:16px">
    <div style="display:flex;align-items:center;gap:16px">
      ${buildBrandSelector()}
      <div>
        <h1 class="page-header__title">${monthLabel} 업무 현황</h1>
        <p class="page-header__subtitle">기준일시 ${now.toLocaleDateString('ko-KR')} ${now.toLocaleTimeString('ko-KR', {hour:'2-digit',minute:'2-digit'})}</p>
      </div>
    </div>
    <div class="page-header__date">${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
  </div>
`;

// ── 캘린더 생성 ──
function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=일
  const lastDate = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isThisMonth = (today.getFullYear() === year && today.getMonth() === month);

  // 이벤트 더미 데이터 (일 → 이벤트 종류)
  const events = {
    3: ['meeting'], 5: ['meeting', 'contract'], 8: ['meeting'],
    10: ['contract'], 12: ['meeting'], 15: ['meeting', 'contract'],
    17: ['meeting'], 19: ['contract'], 22: ['meeting'], 25: ['meeting', 'contract'],
    28: ['meeting'],
  };

  const dayNames = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
  let headerHtml = dayNames.map((d, i) => {
    const cls = i === 0 ? ' mini-cal__head--sun' : i === 6 ? ' mini-cal__head--sat' : '';
    return `<div class="mini-cal__head${cls}">${d.slice(0,1)}</div>`;
  }).join('');

  let cellsHtml = '';
  // 빈 칸 (이전 달)
  for (let i = 0; i < firstDay; i++) {
    cellsHtml += `<div class="mini-cal__cell mini-cal__cell--empty"></div>`;
  }
  // 날짜
  for (let d = 1; d <= lastDate; d++) {
    const dow = (firstDay + d - 1) % 7;
    const isToday = isThisMonth && d === today.getDate();
    const todayCls = isToday ? ' mini-cal__cell--today' : '';
    const dayCls = dow === 0 ? ' mini-cal__day--sun' : dow === 6 ? ' mini-cal__day--sat' : '';
    const dayEvents = events[d] || [];
    const dots = dayEvents.map(e => {
      const color = e === 'meeting' ? 'var(--accent)' : e === 'contract' ? 'var(--status-green)' : 'var(--status-amber)';
      return `<span style="width:6px;height:6px;border-radius:50%;background:${color};display:inline-block"></span>`;
    }).join('');
    cellsHtml += `
      <div class="mini-cal__cell${todayCls}">
        <span class="mini-cal__day${dayCls}">${d}</span>
        ${dots ? `<div style="display:flex;gap:2px;justify-content:center">${dots}</div>` : ''}
      </div>`;
  }

  return `
    <div class="mini-cal">
      <div class="mini-cal__header">
        <button class="mini-cal__nav" data-dir="-1">◀</button>
        <span class="mini-cal__title">${year}년 ${month + 1}월</span>
        <button class="mini-cal__nav" data-dir="1">▶</button>
      </div>
      <div class="mini-cal__grid">
        ${headerHtml}
        ${cellsHtml}
      </div>
      <div style="display:flex;gap:16px;padding:10px 14px;font-size:11px;color:var(--text-muted);border-top:1px solid var(--border-light)">
        <span style="display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:var(--accent)"></span> 미팅</span>
        <span style="display:flex;align-items:center;gap:4px"><span style="width:6px;height:6px;border-radius:50%;background:var(--status-green)"></span> 계약</span>
      </div>
    </div>`;
}

// ── 수납률 게이지 ──
function buildGauge(rate, label) {
  const deg = (rate / 100) * 360;
  const gradient = deg <= 180
    ? `conic-gradient(var(--accent) 0deg ${deg}deg, var(--bg-tertiary) ${deg}deg 360deg)`
    : `conic-gradient(var(--accent) 0deg ${deg}deg, var(--bg-tertiary) ${deg}deg 360deg)`;
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px">
      <div style="position:relative;width:120px;height:120px;border-radius:50%;background:${gradient}">
        <div style="position:absolute;inset:15px;border-radius:50%;background:var(--bg-primary);display:flex;flex-direction:column;align-items:center;justify-content:center">
          <span style="font-size:22px;font-weight:800;color:var(--text-primary)">${rate}%</span>
          <span style="font-size:11px;color:var(--text-muted)">${label}</span>
        </div>
      </div>
      <div style="font-size:12px;color:var(--text-secondary)">전월 대비 <span style="color:var(--status-green);font-weight:700">+2.3%p</span></div>
    </div>`;
}

content.innerHTML += `
  <!-- 업무 현황 3열 카드 -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-bottom:24px;border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--border-light);box-shadow:var(--shadow-sm)">
    <!-- 회원 -->
    <div style="background:var(--bg-primary);padding:20px 24px;border-right:1px solid var(--border-light)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <span style="font-size:15px;font-weight:700;color:var(--text-primary)">회원</span>
        <span style="font-size:11px;color:var(--text-muted);margin-left:4px">전체</span>
        <span style="font-size:15px;font-weight:800;color:var(--accent);margin-left:auto">${activeAssoc + totalReg}명</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px">
          <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--status-green)"></span> 준회원 활동</span>
          <span style="font-weight:600">${activeAssoc}명</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px">
          <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--accent)"></span> 정회원 활동</span>
          <span style="font-weight:600">${activeReg}명</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px">
          <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--status-amber)"></span> 보류/만료</span>
          <span style="font-weight:600">${MockStats.statusDistribution.regular.filter(d=>['보류','만료'].includes(d.label)).reduce((s,d)=>s+d.value,0)}명</span>
        </div>
      </div>
    </div>
    <!-- 매칭 -->
    <div style="background:linear-gradient(135deg,var(--purple-800),var(--purple-600));padding:20px 24px;color:#fff;border-right:1px solid rgba(255,255,255,0.1)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <span style="font-size:15px;font-weight:700">매칭</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <div style="font-size:26px;font-weight:800;line-height:1.2">${Formatters.money(monthSales).replace('원','')}</div>
          <div style="font-size:11px;opacity:0.7;margin-top:4px">${monthLabel} 매출</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;opacity:0.7">매칭 성사율</div>
          <div style="font-size:20px;font-weight:700">${matchRate}</div>
        </div>
      </div>
    </div>
    <!-- 수납 -->
    <div style="background:var(--bg-primary);padding:20px 24px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
        <span style="font-size:15px;font-weight:700;color:var(--text-primary)">수납</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px">
          <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--status-green)"></span> 수납대기</span>
          <span style="font-weight:600">12건</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px">
          <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--accent)"></span> 완납</span>
          <span style="font-weight:600">38건</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px">
          <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:var(--status-red)"></span> 미납</span>
          <span style="font-weight:600;color:var(--status-red)">5건</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 메인 3열 레이아웃 -->
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
    <!-- 좌: 캘린더 -->
    <div>
      <div style="font-size:14px;font-weight:700;margin-bottom:10px;color:var(--text-primary)">미팅 · 계약 일정</div>
      <div id="calendar-wrap"></div>

      <!-- 오늘의 일정 -->
      <div class="card" style="margin-top:16px">
        <div class="card__header">
          <h3 class="card__title">오늘의 미팅</h3>
          <span class="badge badge--accent">7건</span>
        </div>
        <div class="card__body" style="padding:0">
          <table class="data-table data-table--compact" style="font-size:11px">
            <thead><tr><th>시간</th><th>회원A</th><th>회원B</th><th>상태</th></tr></thead>
            <tbody>
              <tr><td style="font-weight:700;color:var(--accent)">10:00</td><td>김서연</td><td>이준호</td><td><span class="badge badge--green" style="font-size:9px">확정</span></td></tr>
              <tr><td style="font-weight:700;color:var(--accent)">11:00</td><td>박지은</td><td>최민수</td><td><span class="badge badge--green" style="font-size:9px">확정</span></td></tr>
              <tr style="background:var(--accent-bg-light)"><td style="font-weight:700;color:var(--accent)">14:00</td><td>한소영</td><td>정태우</td><td><span class="badge badge--blue" style="font-size:9px">진행중</span></td></tr>
              <tr><td style="font-weight:700">15:30</td><td>윤하린</td><td>강준혁</td><td><span class="badge badge--amber" style="font-size:9px">예정</span></td></tr>
              <tr><td style="font-weight:700">17:00</td><td>조유서</td><td>배준서</td><td><span class="badge badge--amber" style="font-size:9px">예정</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 중: 수납률 + 할일 -->
    <div>
      <!-- 수납률 게이지 -->
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">수납률</h3>
          <span style="font-size:11px;color:var(--text-muted)">${monthLabel}</span>
        </div>
        <div class="card__body" style="padding:0">
          ${buildGauge(90.8, monthLabel)}
        </div>
      </div>

      <!-- 매니저 실적 -->
      <div class="card" style="margin-top:16px">
        <div class="card__header">
          <h3 class="card__title">매니저 실적 TOP 5</h3>
        </div>
        <div class="card__body" style="padding:0">
          <table class="data-table data-table--compact" style="font-size:11px">
            <thead><tr><th>순위</th><th>매니저</th><th>컨텍</th><th>미팅</th><th>전환율</th></tr></thead>
            <tbody>
              ${MockStats.managerRanking.map((m, i) => `
                <tr>
                  <td><span class="rank-badge rank-badge--${i < 3 ? ['gold','silver','bronze'][i] : 'normal'}">${i + 1}</span></td>
                  <td class="fw-600">${m.name}</td>
                  <td>${m.contacts}</td><td>${m.meetings}</td>
                  <td><span class="text-accent fw-600">${m.rate}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 우: 공지사항 + 알림 -->
    <div>
      <!-- 공지사항 -->
      <div class="card">
        <div class="card__header">
          <h3 class="card__title">공지사항</h3>
          <button class="btn btn--ghost btn--sm" style="font-size:11px">더보기 +</button>
        </div>
        <div class="card__body" style="padding:0">
          <div style="display:flex;flex-direction:column">
            ${notices.map((n, i) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid var(--border-light);font-size:12px;cursor:pointer;transition:background 0.15s" onmouseover="this.style.background='var(--accent-bg)'" onmouseout="this.style.background='transparent'">
                <div style="display:flex;align-items:center;gap:8px;min-width:0">
                  <span style="color:var(--text-muted);font-weight:600;flex-shrink:0">${i + 1}.</span>
                  <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.title}</span>
                </div>
                <span style="font-size:11px;color:var(--text-muted);flex-shrink:0;margin-left:12px">${n.date}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 실시간 알림 -->
      <div class="card" style="margin-top:16px">
        <div class="card__header">
          <h3 class="card__title">업무 알림</h3>
          <span class="badge badge--red">${MockNotifications.length}건</span>
        </div>
        <div class="card__body card__body--scroll" style="padding:0">
          <div style="display:flex;flex-direction:column">
            ${MockNotifications.map(n => `
              <div style="display:flex;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border-light);font-size:12px;align-items:flex-start">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:600;margin-bottom:2px">${n.title}</div>
                  <div style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.desc}</div>
                </div>
                <span style="font-size:10px;color:var(--text-muted);flex-shrink:0;white-space:nowrap">${n.time}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 승인 대기 -->
      <div class="card" style="margin-top:16px">
        <div class="card__header">
          <h3 class="card__title">승인 대기</h3>
          <span class="badge badge--amber">${pendingApprovals}건</span>
        </div>
        <div class="card__body card__body--scroll" style="padding:0">
          <div style="display:flex;flex-direction:column">
            <div style="display:flex;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border-light);font-size:12px;align-items:flex-start">
              <div style="flex:1"><div style="font-weight:600">김서연 — 보류 요청</div><div style="font-size:11px;color:var(--text-muted)">사유: 개인 사정 (1개월)</div></div>
              <span style="font-size:10px;color:var(--text-muted)">2일 전</span>
            </div>
            <div style="display:flex;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border-light);font-size:12px;align-items:flex-start">
              <div style="flex:1"><div style="font-weight:600">최민수 — 상태 변경</div><div style="font-size:11px;color:var(--text-muted)">활동 → 보류 전환 요청</div></div>
              <span style="font-size:10px;color:var(--text-muted)">3일 전</span>
            </div>
            <div style="display:flex;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border-light);font-size:12px;align-items:flex-start">
              <div style="flex:1"><div style="font-weight:600;color:var(--status-red)">한소영 — 탈회 요청</div><div style="font-size:11px;color:var(--text-muted)">환불 금액: 1,200,000원</div></div>
              <span style="font-size:10px;color:var(--text-muted)">1일 전</span>
            </div>
            <div style="display:flex;gap:10px;padding:10px 16px;font-size:12px;align-items:flex-start">
              <div style="flex:1"><div style="font-weight:600">윤태빈 — 보류 요청</div><div style="font-size:11px;color:var(--text-muted)">사유: 건강 문제 (2개월)</div></div>
              <span style="font-size:10px;color:var(--text-muted)">오늘</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`;

// ── 캘린더 렌더링 ──
let calYear = now.getFullYear();
let calMonth = now.getMonth();

function renderCalendar() {
  document.getElementById('calendar-wrap').innerHTML = buildCalendar(calYear, calMonth);
  // 네비게이션 바인딩
  document.querySelectorAll('.mini-cal__nav').forEach(btn => {
    btn.addEventListener('click', () => {
      calMonth += parseInt(btn.dataset.dir);
      if (calMonth < 0) { calMonth = 11; calYear--; }
      if (calMonth > 11) { calMonth = 0; calYear++; }
      renderCalendar();
    });
  });
}
renderCalendar();

// ── 브랜드 셀렉터 이벤트 (admin 전용) ──
if (isAdmin) {
  const selectorBtn = document.getElementById('brand-selector-btn');
  const dropdown = document.getElementById('brand-dropdown');
  const arrow = document.getElementById('brand-arrow');

  if (selectorBtn && dropdown) {
    selectorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';
      if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });
    document.querySelectorAll('.brand-option').forEach(opt => {
      opt.addEventListener('click', () => {
        localStorage.setItem('purples_dashboard_brand', opt.dataset.brand);
        window.location.reload();
      });
    });
    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
      if (arrow) arrow.style.transform = 'rotate(0deg)';
    });
  }
}

// ========================================
// 영업기획 상담현황 섹션 (팀장/관리자용)
// ========================================
function buildConsultStatus() {
  const data = [...MockAssociates];
  // 상태 업데이트 반영
  try {
    const u = JSON.parse(localStorage.getItem('purples_status_updates') || '{}');
    data.forEach(m => { if (u[m.id]) m.status = typeof u[m.id] === 'string' ? u[m.id] : u[m.id].status || m.status; });
  } catch (e) {}

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const branchMap = {};
  BRANCHES.forEach(b => { branchMap[b.code] = b.name; });

  // 매니저별 통계 계산
  const managerStats = CONSULTANTS.map(name => {
    const members = data.filter(m => m.consultant === name);
    const branch = branchMap[CONSULTANT_BRANCH[name]] || '-';

    // 전화 기록 수집
    let todayContacts = 0, yesterdayContacts = 0;
    let todayMeetings = 0, yesterdayMeetings = 0;
    let todayJoins = 0, yesterdayJoins = 0;
    let todayAmount = 0, yesterdayAmount = 0;

    members.forEach(m => {
      // contactHistory
      (m.contactHistory || []).forEach(h => {
        const d = (h.date || '').slice(0, 10);
        if (d === today) { todayContacts++; if (h.result === '방문상담') todayMeetings++; if (h.result === '가입완료' || h.result === '가입중') todayJoins++; }
        if (d === yesterday) { yesterdayContacts++; if (h.result === '방문상담') yesterdayMeetings++; if (h.result === '가입완료' || h.result === '가입중') yesterdayJoins++; }
      });

      // localStorage 전화
      try {
        JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]').forEach(h => {
          const d = (h.date || '').slice(0, 10);
          if (d === today) { todayContacts++; if (h.result === '방문상담') todayMeetings++; }
          if (d === yesterday) { yesterdayContacts++; if (h.result === '방문상담') yesterdayMeetings++; }
        });
      } catch (e) {}

      // localStorage 미팅
      try {
        JSON.parse(localStorage.getItem('purples_meeting_history_' + m.id) || '[]').forEach(h => {
          const d = (h.date || '').slice(0, 10);
          if (d === today) todayMeetings++;
          if (d === yesterday) yesterdayMeetings++;
        });
      } catch (e) {}
    });

    return { name, branch, db: members.length,
      todayContacts, todayMeetings, todayJoins, todayAmount,
      yesterdayContacts, yesterdayMeetings, yesterdayJoins, yesterdayAmount };
  });

  // 합계
  const totals = managerStats.reduce((t, m) => ({
    db: t.db + m.db,
    todayContacts: t.todayContacts + m.todayContacts,
    todayMeetings: t.todayMeetings + m.todayMeetings,
    todayJoins: t.todayJoins + m.todayJoins,
    yesterdayContacts: t.yesterdayContacts + m.yesterdayContacts,
    yesterdayMeetings: t.yesterdayMeetings + m.yesterdayMeetings,
    yesterdayJoins: t.yesterdayJoins + m.yesterdayJoins,
  }), { db:0, todayContacts:0, todayMeetings:0, todayJoins:0, yesterdayContacts:0, yesterdayMeetings:0, yesterdayJoins:0 });

  // 7일 추이 데이터 생성
  const trendDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const ds = d.toISOString().slice(0, 10);
    const dayLabel = `${d.getMonth()+1}/${d.getDate()}`;
    let contacts = 0;
    data.forEach(m => {
      (m.contactHistory || []).forEach(h => { if ((h.date || '').slice(0, 10) === ds) contacts++; });
    });
    // 기본 mock: 랜덤으로 변동
    if (contacts === 0) contacts = Math.floor(Math.random() * 15) + 5;
    trendDays.push({ label: dayLabel, value: contacts });
  }
  const maxTrend = Math.max(...trendDays.map(d => d.value), 1);

  // 방문예약 현황
  const visitData = [];
  try {
    const stored = JSON.parse(localStorage.getItem('purples_visit_data') || '[]');
    stored.filter(v => v.date && v.date.slice(0, 10) === today).forEach(v => visitData.push(v));
  } catch (e) {}
  // 미팅 기록에서도 수집
  data.forEach(m => {
    try {
      JSON.parse(localStorage.getItem('purples_meeting_history_' + m.id) || '[]').forEach(h => {
        if ((h.date || '').slice(0, 10) === today) {
          visitData.push({ memberName: m.name, consultant: m.consultant, branch: branchMap[m.branch] || m.branch,
            date: h.date, time: h.time || '-', content: h.content || '방문예정', status: h.status || '예약' });
        }
      });
    } catch (e) {}
  });

  return { managerStats, totals, trendDays, maxTrend, visitData };
}

// 영업기획 섹션 렌더
if (isAdmin || user?.team === '영업기획팀') {
  const cs = buildConsultStatus();
  const branchMap = {};
  BRANCHES.forEach(b => { branchMap[b.code] = b.name; });

  content.innerHTML += `
    <!-- 구분선 -->
    <div style="margin:28px 0 20px;border-top:2px solid var(--accent);padding-top:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div>
          <h2 style="font-size:17px;font-weight:800;color:var(--text-primary);margin:0">📊 상담 현황</h2>
          <p style="font-size:12px;color:var(--text-muted);margin:4px 0 0">매니저별 상담 활동 현황 · 기준일 ${new Date().toLocaleDateString('ko-KR')}</p>
        </div>
      </div>

      <!-- KPI 카드 -->
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px">
        <div style="padding:16px;background:var(--bg-primary);border:1px solid var(--border-light);border-radius:var(--radius-lg);text-align:center;border-left:3px solid #3b82f6">
          <div style="font-size:22px;font-weight:800;color:#3b82f6">${cs.totals.todayContacts}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">금일 컨텍수</div>
        </div>
        <div style="padding:16px;background:var(--bg-primary);border:1px solid var(--border-light);border-radius:var(--radius-lg);text-align:center;border-left:3px solid #8b5cf6">
          <div style="font-size:22px;font-weight:800;color:#8b5cf6">${cs.totals.todayMeetings}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">금일 미팅</div>
        </div>
        <div style="padding:16px;background:var(--bg-primary);border:1px solid var(--border-light);border-radius:var(--radius-lg);text-align:center;border-left:3px solid #10b981">
          <div style="font-size:22px;font-weight:800;color:#10b981">${cs.totals.todayJoins}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">금일 가입</div>
        </div>
        <div style="padding:16px;background:var(--bg-primary);border:1px solid var(--border-light);border-radius:var(--radius-lg);text-align:center;border-left:3px solid #f59e0b">
          <div style="font-size:22px;font-weight:800;color:#f59e0b">${cs.visitData.length}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">금일 방문예약</div>
        </div>
        <div style="padding:16px;background:var(--bg-primary);border:1px solid var(--border-light);border-radius:var(--radius-lg);text-align:center;border-left:3px solid #6366f1">
          <div style="font-size:22px;font-weight:800;color:#6366f1">${cs.totals.db}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px">보유DB 합계</div>
        </div>
      </div>

      <!-- 2열: 매니저 테이블 + 추이 그래프 -->
      <div style="display:grid;grid-template-columns:1fr 320px;gap:16px;margin-bottom:20px">
        <!-- 매니저별 상담현황 -->
        <div class="card" style="margin:0">
          <div class="card__header"><h3 class="card__title" style="font-size:13px">매니저별 상담 현황</h3>
            <span style="font-size:11px;color:var(--text-muted)">금일 / 어제</span>
          </div>
          <div class="card__body" style="padding:0;overflow-x:auto">
            <table class="std-table" style="font-size:11px">
              <thead><tr>
                <th style="width:50px">지사</th><th style="width:60px">매니저</th><th style="width:45px">보유DB</th>
                <th colspan="3" style="background:#eff6ff;text-align:center">금일</th>
                <th colspan="3" style="background:#fefce8;text-align:center">어제</th>
              </tr>
              <tr>
                <th></th><th></th><th></th>
                <th style="background:#eff6ff">컨텍</th><th style="background:#eff6ff">미팅</th><th style="background:#eff6ff">가입</th>
                <th style="background:#fefce8">컨텍</th><th style="background:#fefce8">미팅</th><th style="background:#fefce8">가입</th>
              </tr></thead>
              <tbody>
                ${cs.managerStats.map(m => `<tr>
                  <td class="tc">${m.branch}</td>
                  <td class="tc" style="font-weight:600">${m.name}</td>
                  <td class="tc">${m.db}</td>
                  <td class="tc" style="background:#f0f7ff;font-weight:${m.todayContacts ? '700' : '400'};color:${m.todayContacts ? '#2563eb' : 'var(--text-muted)'}">${m.todayContacts}</td>
                  <td class="tc" style="background:#f0f7ff;font-weight:${m.todayMeetings ? '700' : '400'};color:${m.todayMeetings ? '#7c3aed' : 'var(--text-muted)'}">${m.todayMeetings}</td>
                  <td class="tc" style="background:#f0f7ff;font-weight:${m.todayJoins ? '700' : '400'};color:${m.todayJoins ? '#059669' : 'var(--text-muted)'}">${m.todayJoins}</td>
                  <td class="tc" style="background:#fffef0">${m.yesterdayContacts}</td>
                  <td class="tc" style="background:#fffef0">${m.yesterdayMeetings}</td>
                  <td class="tc" style="background:#fffef0">${m.yesterdayJoins}</td>
                </tr>`).join('')}
                <tr style="background:var(--bg-secondary);font-weight:700">
                  <td class="tc" colspan="2">합계</td>
                  <td class="tc">${cs.totals.db}</td>
                  <td class="tc" style="color:#2563eb">${cs.totals.todayContacts}</td>
                  <td class="tc" style="color:#7c3aed">${cs.totals.todayMeetings}</td>
                  <td class="tc" style="color:#059669">${cs.totals.todayJoins}</td>
                  <td class="tc">${cs.totals.yesterdayContacts}</td>
                  <td class="tc">${cs.totals.yesterdayMeetings}</td>
                  <td class="tc">${cs.totals.yesterdayJoins}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 7일 컨텍 추이 -->
        <div class="card" style="margin:0">
          <div class="card__header"><h3 class="card__title" style="font-size:13px">컨텍 추이 (7일)</h3></div>
          <div class="card__body" style="display:flex;flex-direction:column;justify-content:flex-end;gap:0;padding:12px 16px 16px">
            <div style="display:flex;align-items:flex-end;gap:6px;height:160px">
              ${cs.trendDays.map(d => {
                const h = Math.max(8, (d.value / cs.maxTrend) * 140);
                const isToday = d === cs.trendDays[cs.trendDays.length - 1];
                return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
                  <span style="font-size:10px;font-weight:600;color:${isToday ? '#2563eb' : 'var(--text-muted)'}">${d.value}</span>
                  <div style="width:100%;height:${h}px;background:${isToday ? 'linear-gradient(180deg,#3b82f6,#2563eb)' : 'linear-gradient(180deg,#e0e7ff,#c7d2fe)'};border-radius:4px 4px 0 0;transition:height 0.3s"></div>
                  <span style="font-size:9px;color:var(--text-muted)">${d.label}</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- 오늘 방문예약 현황 -->
      <div class="card" style="margin:0">
        <div class="card__header">
          <h3 class="card__title" style="font-size:13px">금일 방문예약 현황</h3>
          <span class="badge badge--accent">${cs.visitData.length}건</span>
        </div>
        <div class="card__body" style="padding:0;overflow-x:auto">
          ${cs.visitData.length ? `
          <table class="std-table" style="font-size:11px">
            <thead><tr>
              <th style="width:40px">No</th><th>지사</th><th>매니저</th><th>회원명</th>
              <th>일자</th><th>시간</th><th>내용</th><th>상태</th>
            </tr></thead>
            <tbody>
              ${cs.visitData.map((v, i) => `<tr>
                <td class="tc">${i + 1}</td>
                <td class="tc">${v.branch || '-'}</td>
                <td class="tc">${v.consultant || '-'}</td>
                <td class="tc" style="font-weight:600">${v.memberName || '-'}</td>
                <td class="tc">${(v.date || '').slice(0, 10)}</td>
                <td class="tc">${v.time || '-'}</td>
                <td class="tl">${v.content || '-'}</td>
                <td class="tc"><span class="badge badge--${v.status === '완료' ? 'green' : v.status === '취소' ? 'red' : 'blue'}">${v.status || '예약'}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>` : `<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:12px">금일 방문예약 내역이 없습니다.</div>`}
        </div>
      </div>
    </div>
  `;
}

