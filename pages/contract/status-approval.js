/* ========================================
   보류/상태 변경 승인
   회원의 상태 변경 내역 조회 및 팀장급 전자 승인 대기열
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { Modal } from '@components/Modal.js';
import { MockRegulars, MATCH_MANAGERS, CONSULTANTS } from '@mock/regulars.js';

initLayout({ pageId: 'contract-status', breadcrumbs: ['정회원 관리', '계약 관리', '보류/상태 변경 승인'] });

var content = document.getElementById('content');

// Mock 승인 대기열
var approvalQueue = [];
var changeTypes = [
  { from: '활동', to: '임시보류', reason: '건강 문제로 일시 중단 요청' },
  { from: '활동', to: '장기보류', reason: '해외 출장 6개월' },
  { from: '임시보류', to: '활동', reason: '보류 해제 요청' },
  { from: '활동', to: '강제보류', reason: '민원 접수 건으로 강제 보류' },
  { from: '활동대기', to: '활동', reason: '서류 인증 완료' },
  { from: '인증중', to: '활동대기', reason: '인증 승인' },
  { from: '활동', to: '약정보류', reason: '약정 기간 만료 전 보류' },
  { from: '장기보류', to: '만료', reason: '보류 기간 초과 자동 만료' },
];
var approvalStatuses = ['대기','대기','대기','승인','승인','반려','대기','승인'];
var approvalColors = { '대기': 'amber', '승인': 'green', '반려': 'red' };

for (var i = 0; i < 12; i++) {
  var ct = changeTypes[i % changeTypes.length];
  approvalQueue.push({
    id: i + 1,
    name: MockRegulars[i % MockRegulars.length].name,
    memberId: MockRegulars[i % MockRegulars.length].memberId,
    from: ct.from,
    to: ct.to,
    reason: ct.reason,
    requestDate: new Date(Date.now() - i * 86400000).toISOString(),
    requester: CONSULTANTS[i % CONSULTANTS.length],
    approval: approvalStatuses[i % approvalStatuses.length],
    approver: approvalStatuses[i % approvalStatuses.length] !== '대기' ? MATCH_MANAGERS[i % MATCH_MANAGERS.length] : '-',
  });
}

var pendingCount = approvalQueue.filter(function(a){return a.approval==='대기'}).length;

content.innerHTML =
  '<div class="page-header">'
  + '  <div><h1 class="page-header__title">보류/상태 변경 승인</h1>'
  + '    <p class="page-header__subtitle">회원 상태(임시보류, 장기보류 등) 변경 내역 조회 및 팀장급 전자 승인 대기열</p></div>'
  + '</div>'

  // KPI
  + '<div class="kpi-grid">'
  + '  <div class="kpi-card kpi-card--gold"><div class="kpi-card__icon">⏳</div><div><div class="kpi-card__value">' + pendingCount + '</div><div class="kpi-card__label">승인 대기</div></div></div>'
  + '  <div class="kpi-card kpi-card--green"><div class="kpi-card__icon">✅</div><div><div class="kpi-card__value">' + approvalQueue.filter(function(a){return a.approval==='승인'}).length + '</div><div class="kpi-card__label">승인 완료</div></div></div>'
  + '  <div class="kpi-card kpi-card--purple"><div class="kpi-card__icon">🔄</div><div><div class="kpi-card__value">' + approvalQueue.length + '</div><div class="kpi-card__label">전체 요청</div></div></div>'
  + '  <div class="kpi-card kpi-card--blue"><div class="kpi-card__icon">❌</div><div><div class="kpi-card__value">' + approvalQueue.filter(function(a){return a.approval==='반려'}).length + '</div><div class="kpi-card__label">반려</div></div></div>'
  + '</div>'

  // 테이블
  + '<div class="card"><div class="card__header"><div class="card__title">상태 변경 요청 내역</div><div class="card__actions"><span class="badge badge--amber" style="font-size:12px">대기 ' + pendingCount + '건</span></div></div>'
  + '<div class="card__body" style="overflow-x:auto">'
  + '<table class="data-table"><thead><tr>'
  + '<th>No</th><th>회원명</th><th>회원번호</th><th>변경 전</th><th>변경 후</th><th>사유</th><th>요청일</th><th>요청자</th><th>상태</th><th>승인자</th><th>관리</th>'
  + '</tr></thead><tbody>'
  + approvalQueue.map(function(a) {
    return '<tr' + (a.approval === '대기' ? ' style="background:var(--status-amber-bg)"' : '') + '>'
      + '<td>' + a.id + '</td>'
      + '<td class="member-name">' + a.name + '</td>'
      + '<td style="font-family:monospace;font-size:12px">' + a.memberId + '</td>'
      + '<td><span class="badge badge--gray">' + a.from + '</span></td>'
      + '<td><span class="badge badge--purple">' + a.to + '</span></td>'
      + '<td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="' + a.reason + '">' + a.reason + '</td>'
      + '<td>' + Formatters.date(a.requestDate) + '</td>'
      + '<td>' + a.requester + '</td>'
      + '<td><span class="badge badge--' + approvalColors[a.approval] + '">' + a.approval + '</span></td>'
      + '<td>' + a.approver + '</td>'
      + '<td>' + (a.approval === '대기' ? '<button class="btn btn--green btn--sm btn-approve" data-id="' + a.id + '">승인</button> <button class="btn btn--danger btn--sm btn-reject" data-id="' + a.id + '">반려</button>' : '-') + '</td>'
      + '</tr>';
  }).join('')
  + '</tbody></table></div></div>';

document.querySelectorAll('.btn-approve').forEach(function(btn) {
  btn.addEventListener('click', function() { Toast.show('요청 #' + btn.dataset.id + '이 승인되었습니다.', 'success'); });
});
document.querySelectorAll('.btn-reject').forEach(function(btn) {
  btn.addEventListener('click', function() { Toast.show('요청 #' + btn.dataset.id + '이 반려되었습니다.', 'info'); });
});
