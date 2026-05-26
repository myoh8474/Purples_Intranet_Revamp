/* ========================================
   유입DB 상세 페이지 (새탭 전용)
   - distribute.js와 동일한 Vite 모듈 데이터 소스 사용
   - 준회원 상세와 동일한 디자인 (info-table, section)
   - 사이드바 없이 독립 페이지로 새탭에서 열림
   ======================================== */
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { MockAssociates } from '@mock/associates.js';

// URL 파라미터에서 회원 ID 가져오기
const params = new URLSearchParams(window.location.search);
const memberId = params.get('id');

// Supabase에서 직접 해당 회원 1건 조회
function fetchMemberFromSupabase(id) {
  const SUPABASE_URL = 'https://zjqeveciussillyvzyzz.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcWV2ZWNpdXNzaWxseXZ5enp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTYyNjQsImV4cCI6MjA5NDY5MjI2NH0.HnCHN6Z0YfsLOUTm7gHhr3wVaieYImm3sfab6jMepM0';

  return fetch(SUPABASE_URL + '/rest/v1/associate_mem?id=eq.' + id + '&select=*', {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
  })
  .then(res => res.json())
  .then(data => {
    if (data && data.length > 0) {
      const row = data[0];
      return {
        id: row.id, name: row.uname, phone: row.tel_hand, phone2: row.tel_eto || '',
        gender: row.sex, birthDate: row.birthday,
        age: row.birthday ? Formatters.age(row.birthday) : '',
        education: row.school, school: row.school_name,
        job: row.job_name, company: row.office,
        region: row.live_local, branch: row.branch, brand: row.brand,
        maritalStatus: row.married, status: row.state, channel: row.etc,
        consultant: row.course, registeredAt: row.find_date,
        distributedAt: row.input_date, lastContactAt: row.last_counsel,
        email: row.email || '', telHome: row.tel_home || '', telOffice: row.tel_office || '',
        height: row.height || 0, weight: row.weight || 0, bloodType: row.bloodtype || '',
        children: row.children || '', religion: row.religion || '',
        hobby: row.hobby || '', hope: row.hope || '', memo: row.memo,
      };
    }
    return null;
  });
}

// 등록일 포맷
function formatRegDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const ampm = d.getHours() >= 12 ? '오후' : '오전';
  const h12 = d.getHours() % 12 || 12;
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${ampm} ${h12}:${mi}:${ss}`;
}

// 주민번호 마스킹
function maskSSN(birthDate) {
  if (!birthDate) return '-';
  const d = new Date(birthDate);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return yy + mm + dd + '-';
}

// 팀장 의견 저장
window.saveOpinion = function() {
  const opinionText = document.getElementById('opinion-text').value.trim();
  const key = 'purples_dist_opinion_' + memberId;
  localStorage.setItem(key, opinionText);
  Toast.show('담당 팀장 의견이 저장되었습니다.', 'success');
};

// 페이지 초기화
function initPage(m) {
  const content = document.getElementById('detail-content');
  if (!m) {
    content.innerHTML =
      '<div style="padding:60px;text-align:center">' +
        '<div style="font-size:24px;margin-bottom:12px;color:var(--text-muted)">!</div>' +
        '<div style="font-size:16px;font-weight:600">회원을 찾을 수 없습니다.</div>' +
        '<p style="margin-top:8px">ID: ' + (memberId || '없음') + '</p>' +
        '<a href="distribute.html" style="display:inline-block;margin-top:16px;color:var(--accent)">← 회원분배 목록</a>' +
      '</div>';
  } else {
    document.title = '유입DB 상세 - ' + m.name + ' | 퍼플스 인트라넷';
    renderDetail(m, content);
  }
}

/* ── 상세 렌더 ── */
function renderDetail(m, container) {
  const opinionKey = 'purples_dist_opinion_' + m.id;
  const savedOpinion = localStorage.getItem(opinionKey) || '';
  const inquiry = m.memo || '랜딩페이지 나의 이상형 만나러 갈까요?, 연애 할때 포기 못하는 것=성격, 나의 최종 학력=' + (m.education || '-') + ', 지역=' + (m.region || '-');

  // 재컨텍 여부 판별
  const isRecontact = m.channel === '기간만료(재컨텍)';
  const typeBadgeHtml = isRecontact
    ? '<span style="font-size:11px;padding:2px 8px;border-radius:4px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;margin-left:8px">재컨텍</span>'
    : '<span style="font-size:11px;padding:2px 8px;border-radius:4px;background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;margin-left:8px">신규</span>';

  // 재컨텍 이전 가입이력 — 별도 섹션으로 표시
  let prevSectionHtml = '';
  if (isRecontact) {
    const cleaned = (m.phone || '').replace(/[^0-9]/g, '');
    const prevRecords = MockAssociates.filter(x => {
      if (x.id === m.id) return false;
      const xPhone = (x.phone || '').replace(/[^0-9]/g, '');
      return xPhone === cleaned;
    });

    const prev = prevRecords.length > 0 ? prevRecords[0] : null;
    const programs = ['실버(에메랄드) A', '골드(사파이어) B', '플래티늄(루비) C', '다이아몬드 A'];
    const prevProgram = prev ? programs[Math.floor(Math.random() * programs.length)] : '-';
    const expireDate = prev && prev.registeredAt
      ? (() => { const d = new Date(prev.registeredAt); d.setMonth(d.getMonth() + 24); return Formatters.date(d.toISOString()); })()
      : '-';

    prevSectionHtml = `
    <div class="section">
      <div class="section__title" style="color:#1d4ed8">이전 가입이력 (정회원 기간만료 재유입)</div>
      <table class="info-table">
        <tbody>
          <tr>
            <td class="label">이전 담당매니져</td><td>${prev ? (prev.consultant || '-') : '-'}</td>
            <td class="label">이전 회원상태</td><td>${prev ? (prev.status || '-') : '-'}</td>
            <td class="label">가입 프로그램</td><td>${prevProgram}</td>
            <td class="label">서비스 형태</td><td>기간제 (24개월)</td>
          </tr>
          <tr>
            <td class="label">최초 가입일</td><td>${prev && prev.registeredAt ? Formatters.date(prev.registeredAt) : '-'}</td>
            <td class="label">만료일</td><td>${expireDate}</td>
            <td class="label">이전 유입경로</td><td>${prev ? (prev.channel || '-') : '-'}</td>
            <td class="label">만료/탈회 사유</td><td>기간만료</td>
          </tr>
          <tr>
            <td class="label">이전 결제금액</td><td>${prev ? Formatters.money(Math.floor(Math.random() * 5000000) + 3000000) : '-'}</td>
            <td class="label">미팅 횟수</td><td>${Math.floor(Math.random() * 15) + 3}회</td>
            <td class="label">이전 지역</td><td>${prev ? (prev.region || '-') : '-'}</td>
            <td class="label">이전 브랜드</td><td>${prev ? (prev.brand || '퍼플스') : '-'}</td>
          </tr>
          <tr>
            <td class="label" style="vertical-align:top">비 고</td>
            <td colspan="7" style="color:var(--text-muted)">${prev ? '정회원 기간만료 후 재유입. 이전 이력 기반으로 재상담 필요.' : '이전 가입 상세 이력은 정회원 DB에서 확인해 주세요.'}</td>
          </tr>
        </tbody>
      </table>
    </div>`;
  }

  // 중복 이력 체크
  let dupHistoryHtml = '';
  const cleaned2 = (m.phone || '').replace(/[^0-9]/g, '');
  const dupMembers = MockAssociates.filter(x => {
    if (x.id === m.id) return false;
    const xPhone = (x.phone || '').replace(/[^0-9]/g, '');
    return xPhone === cleaned2 && ['컨텍전', '높음(컨텍)', '보통', '낮음', '정회원'].indexOf(x.status) > -1;
  });

  if (dupMembers.length > 0) {
    const dupInfo = dupMembers.map(d =>
      `담당: <strong>${d.consultant || '-'}</strong> / 상태: <strong>${d.status}</strong> / 등록: ${Formatters.date(d.registeredAt)}`
    ).join('<br>');
    dupHistoryHtml = `<tr style="background:#fef2f2">
      <td class="label" style="vertical-align:top;background:#fee2e2;color:#dc2626">중복이력</td>
      <td colspan="7" style="line-height:1.8">
        <strong style="color:#dc2626">기존 회원 존재 (${dupMembers.length}건)</strong><br>${dupInfo}
      </td>
    </tr>`;
  } else {
    dupHistoryHtml = `<tr>
      <td class="label">중복이력</td>
      <td colspan="7" style="color:var(--text-muted)">중복 이력 없음</td>
    </tr>`;
  }

  container.innerHTML = `
    <!-- 헤더 -->
    <div class="detail-header">
      <div class="detail-header__left">
        <div class="detail-header__name">${m.name}</div>
        <div class="detail-header__meta">${m.gender} · ${m.age || ''}세 · ${m.region || '-'}</div>
        ${typeBadgeHtml}
      </div>
      <div class="detail-header__actions">
        <button class="btn btn--sm" style="font-size:11px;background:#fff;border:1px solid #ccc;color:#333" onclick="window.location.href='distribute.html'">← 회원분배 목록</button>
      </div>
    </div>

    <!-- 유입DB 상세정보 -->
    <div class="section">
      <div class="section__title">유입DB 상세정보</div>
      <table class="info-table">
        <tbody>
          <tr>
            <td class="label">이 름</td><td>${m.name} (${m.gender})</td>
            <td class="label">주민번호</td><td>${maskSSN(m.birthDate)}</td>
            <td class="label">생년월일</td><td>${Formatters.date(m.birthDate)} (${m.age || ''}세)</td>
            <td class="label">결혼여부</td><td>${m.maritalStatus || '-'}</td>
          </tr>
          <tr>
            <td class="label">현거주지</td><td>${m.region || '-'}</td>
            <td class="label">주 소</td><td colspan="5">-</td>
          </tr>
          <tr>
            <td class="label">휴대전화</td><td>${m.phone ? Formatters.phone(m.phone) : '-'}</td>
            <td class="label">유선전화</td><td>- -</td>
            <td class="label">이메일</td><td colspan="3">-</td>
          </tr>
          <tr>
            <td class="label">최종학력</td><td>${m.education || '-'}</td>
            <td class="label">학 교</td><td>${m.school || '-'}</td>
            <td class="label">직 업</td><td>${m.job || '-'}</td>
            <td class="label">직장명</td><td>${m.company || '-'}</td>
          </tr>
          <tr>
            <td class="label">신 장</td><td>0</td>
            <td class="label">체 중</td><td>0</td>
            <td class="label">혈액형</td><td>-</td>
            <td class="label">자 녀</td><td>-</td>
          </tr>
          <tr>
            <td class="label">취 미</td><td>-</td>
            <td class="label">종 교</td><td>-</td>
            <td class="label">요청 매니져</td><td>-</td>
            <td class="label">유입경로</td><td>${m.channel || '-'}</td>
          </tr>
          <tr>
            <td class="label">등록일</td><td>${formatRegDate(m.registeredAt)}</td>
            <td class="label">담당 매니져</td><td>${m.consultant || '-'}</td>
            <td class="label">분배상태</td><td>${m.consultant ? '분배완료' : '미분배'}</td>
            <td class="label">분배일</td><td>${m.distributedAt ? Formatters.date(m.distributedAt) : '-'}</td>
          </tr>
          ${dupHistoryHtml}
          <tr>
            <td class="label" style="vertical-align:top">문의사항</td>
            <td colspan="7" style="line-height:1.6">${inquiry}</td>
          </tr>
          <tr>
            <td class="label" style="vertical-align:top">담당 팀장<br>의견</td>
            <td colspan="7">
              <textarea id="opinion-text" style="width:100%;min-height:100px;border:1px solid var(--border-light);padding:8px 10px;font-size:13px;font-family:inherit;resize:vertical;box-sizing:border-box" placeholder="의견을 입력하세요...">${savedOpinion}</textarea>
            </td>
          </tr>
        </tbody>
      </table>
      <div style="text-align:center;margin-top:16px">
        <button class="btn btn--primary" onclick="saveOpinion()" style="padding:8px 48px">확 인</button>
      </div>
    </div>

    <!-- 재컨텍: 이전 가입이력 별도 섹션 -->
    ${prevSectionHtml}
  `;
}

// ── 데이터 로드 & 페이지 초기화 ──
const isUUID = memberId && memberId.length > 10 && memberId.indexOf('-') > -1;

if (isUUID) {
  fetchMemberFromSupabase(memberId)
    .then(m => initPage(m))
    .catch(err => {
      console.error('Supabase 조회 실패:', err);
      const found = MockAssociates.find(x => String(x.id) === memberId);
      initPage(found || null);
    });
} else {
  // Mock 숫자 ID 검색
  const numId = parseInt(memberId);
  const found = MockAssociates.find(x => x.id === numId);
  initPage(found || null);
}
