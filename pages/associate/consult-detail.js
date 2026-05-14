/* ========================================
   매니저 개별 상담현황 (Consult Detail)
   
   상담현황 목록에서 매니저 이름 클릭 시 표시
   - 날짜 + 매니저 상담현황 요약 (컨텍수, 전화, SMS 등)
   - 당일 미팅
   - 당일 미팅예약
   - 상담 내역 로그
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { Modal } from '@components/Modal.js';
import { MockAssociates } from '@mock/associates.js';

const params = new URLSearchParams(window.location.search);
const managerName = params.get('manager') || '';
const dateParam = params.get('date') || new Date().toISOString().slice(0, 10);

initLayout({ pageId: 'associate-consult-status', breadcrumbs: ['준회원 관리', '상담현황', managerName] });
const content = document.getElementById('content');

/* ── 상태 분류 헬퍼 ── */
function classifyStatus(status) {
  const map = {
    '컨텍전': 'inflow', '부재중(미컨텍)': 'missed',
    '낮음(컨텍)': 'consulting', '보통(컨텍)': 'consulting', '높음(컨텍)': 'consulting',
    '장기상담(컨텍)': 'consulting', '가입보류(컨텍)': 'consulting',
    '방문상담': 'meeting', '가입중': 'contract', '가입완료': 'contract',
  };
  return map[status] || 'pending';
}

/* ── 데이터 가져오기 ── */
function getManagerData() {
  let data = [...MockAssociates];
  try {
    const u = JSON.parse(localStorage.getItem('purples_status_updates') || '{}');
    data = data.map(x => u[x.id] ? { ...x, status: typeof u[x.id] === 'string' ? u[x.id] : u[x.id].status || x.status } : x);
  } catch (e) {}
  return data.filter(m => m.consultant === managerName);
}

/* ── 당일 미팅 조회 ── */
function getTodayMeetings(data) {
  const meetings = [];
  data.forEach(m => {
    try {
      const hist = JSON.parse(localStorage.getItem('purples_meeting_history_' + m.id) || '[]');
      hist.forEach(h => {
        if (h.date && h.date.startsWith(dateParam) && h.status !== '예약') {
          meetings.push({ ...h, memberName: m.name, memberId: m.id, consultant: m.consultant });
        }
      });
    } catch (e) {}
  });
  meetings.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  return meetings;
}

/* ── 당일 미팅 예약 조회 ── */
function getTodayReservations(data) {
  const reservations = [];
  data.forEach(m => {
    try {
      const hist = JSON.parse(localStorage.getItem('purples_meeting_history_' + m.id) || '[]');
      hist.forEach(h => {
        if (h.date && h.date.startsWith(dateParam) && h.status === '예약') {
          reservations.push({ ...h, memberName: m.name, memberId: m.id, consultant: m.consultant });
        }
      });
    } catch (e) {}
  });
  reservations.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  return reservations;
}

/* ── 상담 로그 수집 ── */
function getConsultLogs(data) {
  const logs = [];
  data.forEach(m => {
    // contactHistory
    (m.contactHistory || []).forEach(h => {
      logs.push({
        consultant: m.consultant,
        memberName: m.name,
        memberId: m.id,
        date: h.date || h.createdAt,
        type: h.type || '통화',
        content: h.content || '-',
        result: h.result || '-',
      });
    });
    // localStorage 전화상담
    try {
      const callHist = JSON.parse(localStorage.getItem('purples_call_history_' + m.id) || '[]');
      callHist.forEach(h => {
        logs.push({
          consultant: h.consultant || m.consultant,
          memberName: m.name,
          memberId: m.id,
          date: h.date || h.createdAt,
          type: '통화',
          content: h.content || '-',
          result: h.result || '-',
        });
      });
    } catch (e) {}
  });
  logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  return logs;
}

/* ── 요약 통계 산출 ── */
function calcSummary(data, logs) {
  const today = dateParam;
  const todayLogs = logs.filter(l => l.date && l.date.startsWith(today));
  const totalMembers = data.length;

  // 전체 수치 (괄호 안)
  const totalContacts = logs.filter(l => l.type === '통화' || l.type === '전화').length;
  const totalSms = logs.filter(l => l.type === 'SMS' || l.type === '문자').length;
  const totalMail = logs.filter(l => l.type === 'Mail' || l.type === '이메일').length;

  // 당일 수치
  const todayContacts = todayLogs.filter(l => l.type === '통화' || l.type === '전화').length;
  const todaySms = todayLogs.filter(l => l.type === 'SMS' || l.type === '문자').length;
  const todayMail = todayLogs.filter(l => l.type === 'Mail' || l.type === '이메일').length;

  // 미팅 관련
  let totalMeetings = 0, todayMeetingCount = 0;
  let totalVisits = 0, totalTrips = 0;
  let totalReservations = 0, todayReservations = 0;
  let totalCancels = 0, totalChanges = 0;
  let totalContracts = 0, todayContracts = 0;
  let totalAmount = 0;

  data.forEach(m => {
    try {
      const hist = JSON.parse(localStorage.getItem('purples_meeting_history_' + m.id) || '[]');
      hist.forEach(h => {
        totalMeetings++;
        if (h.date && h.date.startsWith(today)) todayMeetingCount++;
        if (h.status === '예약') { totalReservations++; if (h.date && h.date.startsWith(today)) todayReservations++; }
        if (h.status === '취소') totalCancels++;
      });
    } catch (e) {}

    if (m.status === '가입완료' || m.status === '가입중') {
      totalContracts++;
    }
  });

  return {
    contact: { today: todayContacts, total: totalContacts },
    phone: { today: todayContacts, total: totalContacts },
    sms: { today: todaySms, total: totalSms },
    mail: { today: todayMail, total: totalMail },
    meeting: { today: todayMeetingCount, total: totalMeetings },
    visit: { today: 0, total: totalVisits },
    trip: { today: 0, total: totalTrips },
    reservation: { today: todayReservations, total: totalReservations },
    cancel: { today: 0, total: totalCancels },
    dateChange: { today: 0, total: totalChanges },
    contract: { today: todayContracts, total: totalContracts },
    amount: { today: 0, total: totalAmount },
  };
}

/* ── 포맷 날짜 헤더 ── */
function formatDateHeader(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}년 ${m}월 ${day}일`;
}

/* ── 렌더 ── */
function render() {
  const data = getManagerData();
  const logs = getConsultLogs(data);
  const summary = calcSummary(data, logs);
  const todayMeetings = getTodayMeetings(data);
  const todayReservations = getTodayReservations(data);

  // 상담 로그를 날짜별로 정렬 (최근순)
  const recentLogs = logs.slice(0, 30);

  document.title = `${managerName} 상담현황 - 퍼플스 인트라넷`;

  content.innerHTML = `
    <style>
      .cd-header { text-align:center; padding:16px 20px; background:var(--bg-primary); 
                   border:1px solid var(--border-light); margin-bottom:20px; border-radius:var(--radius-lg); }
      .cd-header__title { font-size:var(--font-size-lg); font-weight:700; color:var(--text-primary); }
      .cd-header__date-nav { display:flex; align-items:center; justify-content:center; gap:12px; margin-top:8px; }

      /* 요약 테이블 */
      .cd-summary { width:100%; border-collapse:collapse; margin-bottom:24px; }
      .cd-summary th { padding:8px 6px; background:var(--bg-secondary); border:1px solid var(--border-light);
                       font-size:11px; font-weight:700; text-align:center; color:var(--text-secondary); 
                       white-space:nowrap; }
      .cd-summary td { padding:10px 6px; border:1px solid var(--border-light); text-align:center;
                       font-size:13px; font-weight:700; color:var(--text-primary); }
      .cd-summary td .cd-total { font-size:10px; font-weight:500; color:var(--text-muted); }

      /* 섹션 */
      .cd-section { margin-bottom:24px; }
      .cd-section__title { font-size:13px; font-weight:700; color:var(--text-primary); 
                          padding-bottom:8px; border-bottom:2px solid var(--accent); margin-bottom:0; }
      .cd-section__title--meeting { border-bottom-color:#3b82f6; }
      .cd-section__title--reservation { border-bottom-color:#f59e0b; }
      .cd-section__title--log { border-bottom-color:#10b981; }

      /* 데이터 테이블 공통 */
      .cd-table { width:100%; border-collapse:collapse; font-size:12px; }
      .cd-table th { padding:7px 10px; background:var(--bg-secondary); border:1px solid var(--border-light);
                     font-size:11px; font-weight:700; text-align:center; color:var(--text-secondary); 
                     white-space:nowrap; }
      .cd-table td { padding:6px 10px; border:1px solid var(--border-light); vertical-align:top; }
      .cd-table tbody tr:hover { background:var(--accent-bg); }
      .cd-table .cd-no { text-align:center; width:40px; color:var(--text-muted); }
      .cd-table .cd-center { text-align:center; }

      /* 상담내용 로그 스타일 */
      .cd-log-content { font-size:12px; line-height:1.6; color:var(--text-primary); 
                        max-width:600px; word-break:break-all; white-space:pre-wrap; }
      .cd-empty { padding:24px; text-align:center; color:var(--text-muted); font-size:12px;
                  background:var(--bg-secondary); border:1px solid var(--border-light); }

      /* 날짜 네비 */
      .cd-date-btn { background:none; border:1px solid var(--border-light); padding:4px 10px;
                     font-size:12px; cursor:pointer; border-radius:var(--radius-md); 
                     color:var(--text-secondary); transition:all var(--transition-fast); }
      .cd-date-btn:hover { background:var(--accent-bg); border-color:var(--accent); color:var(--accent); }
      .cd-back-btn { display:inline-flex; align-items:center; gap:4px; font-size:12px;
                     color:var(--text-secondary); text-decoration:none; padding:6px 12px;
                     border:1px solid var(--border-light); border-radius:var(--radius-md);
                     transition:all var(--transition-fast); margin-bottom:16px; }
      .cd-back-btn:hover { background:var(--accent-bg); border-color:var(--accent); color:var(--accent); }
    </style>

    <!-- 뒤로가기 -->
    <a class="cd-back-btn" href="consult-status.html">← 상담현황 목록</a>

    <!-- 헤더 -->
    <div class="cd-header">
      <div class="cd-header__title">${formatDateHeader(dateParam)} ${managerName} 상담현황</div>
      <div class="cd-header__date-nav">
        <button class="cd-date-btn" id="btn-prev">◀ 전일</button>
        <input type="date" id="date-picker" value="${dateParam}" class="form-input form-input--sm" style="width:auto">
        <button class="cd-date-btn" id="btn-next">익일 ▶</button>
      </div>
    </div>

    <!-- 요약 통계 -->
    <table class="cd-summary">
      <thead>
        <tr>
          <th>총 컨텍수</th>
          <th>전화</th>
          <th>Sms</th>
          <th>Mail</th>
          <th>미팅 건수</th>
          <th>방문 건수</th>
          <th>출장 건수</th>
          <th>미팅 예약</th>
          <th>미팅 취소</th>
          <th>미팅일 변경</th>
          <th>정회원 가입</th>
          <th>가입 금액</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${summary.contact.today} <span class="cd-total">(${summary.contact.total})</span></td>
          <td>${summary.phone.today} <span class="cd-total">(${summary.phone.total})</span></td>
          <td>${summary.sms.today} <span class="cd-total">(${summary.sms.total})</span></td>
          <td>${summary.mail.today} <span class="cd-total">(${summary.mail.total})</span></td>
          <td>${summary.meeting.today} <span class="cd-total">(${summary.meeting.total})</span></td>
          <td>${summary.visit.today} <span class="cd-total">(${summary.visit.total})</span></td>
          <td>${summary.trip.today} <span class="cd-total">(${summary.trip.total})</span></td>
          <td>${summary.reservation.today} <span class="cd-total">(${summary.reservation.total})</span></td>
          <td>${summary.cancel.today} <span class="cd-total">(${summary.cancel.total})</span></td>
          <td>${summary.dateChange.today} <span class="cd-total">(${summary.dateChange.total})</span></td>
          <td>${summary.contract.today} <span class="cd-total">(${summary.contract.total})</span></td>
          <td>${summary.amount.today ? Formatters.money(summary.amount.today) : '0'}원 <span class="cd-total">(원)</span></td>
        </tr>
      </tbody>
    </table>

    <!-- 당일 미팅 -->
    <div class="cd-section">
      <div class="cd-section__title cd-section__title--meeting">-당일 미팅</div>
      ${todayMeetings.length > 0 ? `
        <table class="cd-table">
          <thead>
            <tr>
              <th>No</th>
              <th>매니저</th>
              <th>회원명</th>
              <th>날짜</th>
              <th>Type</th>
              <th>내용</th>
              <th>결과</th>
              <th>결과내용</th>
            </tr>
          </thead>
          <tbody>
            ${todayMeetings.map((m, i) => `
              <tr>
                <td class="cd-no">${i + 1}</td>
                <td class="cd-center">${m.consultant}</td>
                <td class="cd-center">${m.memberName}</td>
                <td class="cd-center">${Formatters.date(m.date)}${m.time ? ' ' + m.time : ''}</td>
                <td class="cd-center">4</td>
                <td>${m.content || '-'}</td>
                <td class="cd-center">${m.status || '-'}</td>
                <td>${m.resultNote || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div class="cd-empty">당일 미팅 내역이 없습니다.</div>'}
    </div>

    <!-- 당일 미팅예약 -->
    <div class="cd-section">
      <div class="cd-section__title cd-section__title--reservation">-당일 미팅예약</div>
      ${todayReservations.length > 0 ? `
        <table class="cd-table">
          <thead>
            <tr>
              <th>No</th>
              <th>매니저</th>
              <th>회원명</th>
              <th>날짜</th>
              <th>Type</th>
              <th>내용</th>
              <th>결과</th>
              <th>결과내용</th>
            </tr>
          </thead>
          <tbody>
            ${todayReservations.map((m, i) => `
              <tr>
                <td class="cd-no">${i + 1}</td>
                <td class="cd-center">${m.consultant}</td>
                <td class="cd-center">${m.memberName}</td>
                <td class="cd-center">${Formatters.date(m.date)}${m.time ? ' ' + m.time : ''}</td>
                <td class="cd-center">4</td>
                <td>${m.content || '-'}</td>
                <td class="cd-center">${m.status || '-'}</td>
                <td>${m.resultNote || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div class="cd-empty">당일 미팅예약 내역이 없습니다.</div>'}
    </div>

    <!-- 상담 내역 로그 -->
    <div class="cd-section">
      <div class="cd-section__title cd-section__title--log">-상담 내역</div>
      ${recentLogs.length > 0 ? `
        <table class="cd-table">
          <thead>
            <tr>
              <th style="width:40px">번호</th>
              <th style="width:140px">상담일</th>
              <th style="width:80px">회원명</th>
              <th>상담 내용</th>
            </tr>
          </thead>
          <tbody>
            ${recentLogs.map((l, i) => `
              <tr>
                <td class="cd-no">${recentLogs.length - i}</td>
                <td class="cd-center">${formatDateTime(l.date)}</td>
                <td class="cd-center">
                  <a href="detail.html?id=${l.memberId}" target="_blank" 
                     style="color:var(--accent);font-weight:600;text-decoration:none">${l.memberName}</a>
                </td>
                <td class="cd-log-content">${l.content}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div class="cd-empty">상담 내역이 없습니다.</div>'}
    </div>
  `;

  // 날짜 네비게이션 이벤트
  document.getElementById('btn-prev')?.addEventListener('click', () => navigateDate(-1));
  document.getElementById('btn-next')?.addEventListener('click', () => navigateDate(1));
  document.getElementById('date-picker')?.addEventListener('change', (e) => {
    window.location.href = `consult-detail.html?manager=${encodeURIComponent(managerName)}&date=${e.target.value}`;
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}

function navigateDate(offset) {
  const d = new Date(dateParam);
  d.setDate(d.getDate() + offset);
  const newDate = d.toISOString().slice(0, 10);
  window.location.href = `consult-detail.html?manager=${encodeURIComponent(managerName)}&date=${newDate}`;
}

if (!managerName) {
  content.innerHTML = `<div style="padding:60px;text-align:center">
    <div style="font-size:24px;margin-bottom:12px">⚠️</div>
    <div style="font-size:16px;font-weight:600">매니저를 선택해 주세요.</div>
    <a href="consult-status.html" style="color:var(--accent);margin-top:12px;display:inline-block">상담현황 목록으로</a>
  </div>`;
} else {
  render();
}
