/* ========================================
   대시보드 페이지 — CMS 스타일 레이아웃
   첨부 디자인 참조: 업무현황 + 캘린더 + 공지 + 알림
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { MockAssociates } from '@mock/associates.js';
import { MockMonthlySales, MockTodos, MockStats, MockNotifications } from '@mock/stats.js';

// 레이아웃 초기화
initLayout({ pageId: 'dashboard', breadcrumbs: ['대시보드'] });

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

// ── 페이지 렌더링 ──
const content = document.getElementById('content');
content.innerHTML = `
  <!-- 상단: 월 업무 현황 -->
  <div class="page-header" style="margin-bottom:16px">
    <div>
      <h1 class="page-header__title">${monthLabel} 업무 현황</h1>
      <p class="page-header__subtitle">기준일시 ${now.toLocaleDateString('ko-KR')} ${now.toLocaleTimeString('ko-KR', {hour:'2-digit',minute:'2-digit'})}</p>
    </div>
    <div class="page-header__date">${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</div>
  </div>

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
