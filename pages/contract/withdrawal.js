/* ========================================
   탈회 및 환불 현황
   탈회 접수, 정산팀 환불 처리 모니터링
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars, CONSULTANTS, BRANCHES } from '@mock/regulars.js';

initLayout({ pageId: 'contract-withdrawal', breadcrumbs: ['정회원 관리', '계약 관리', '탈회 및 환불 현황'] });

var content = document.getElementById('content');
var wdStatuses = ['탈회접수','정산검토','환불진행','환불완료','탈회완료'];
var wdColors = { '탈회접수':'amber','정산검토':'blue','환불진행':'purple','환불완료':'green','탈회완료':'gray' };
var wdReasons = ['개인 사유','서비스 불만','매칭 불만족','타사 이용','결혼','기타'];

var withdrawals = [];
for (var i = 0; i < 10; i++) {
  var totalPaid = 5000000 + Math.floor(Math.random() * 10000000);
  var refund = Math.floor(totalPaid * (0.3 + Math.random() * 0.4));
  withdrawals.push({
    id: i + 1, name: MockRegulars[i % MockRegulars.length].name,
    memberId: MockRegulars[i % MockRegulars.length].memberId,
    branch: MockRegulars[i % MockRegulars.length].branch,
    reason: wdReasons[i % wdReasons.length],
    status: wdStatuses[i % wdStatuses.length],
    requestDate: new Date(Date.now() - i * 5 * 86400000).toISOString(),
    totalPaid: totalPaid, refundAmount: refund,
    handler: CONSULTANTS[i % CONSULTANTS.length],
  });
}

var pendingRefund = withdrawals.filter(function(w){return w.status==='환불진행'||w.status==='정산검토'});
var totalRefund = withdrawals.filter(function(w){return w.status==='환불완료'}).reduce(function(s,w){return s+w.refundAmount},0);

content.innerHTML =
  '<div class="page-header"><div><h1 class="page-header__title">탈회 및 환불 현황</h1>'
  + '<p class="page-header__subtitle">탈회 접수, 정산팀 환불 완료 처리 상황을 모니터링합니다</p></div></div>'
  + '<div class="kpi-grid">'
  + '<div class="kpi-card kpi-card--gold"><div class="kpi-card__icon">!</div><div><div class="kpi-card__value">' + withdrawals.filter(function(w){return w.status==='탈회접수'}).length + '</div><div class="kpi-card__label">탈회 접수</div></div></div>'
  + '<div class="kpi-card kpi-card--blue"><div class="kpi-card__icon">$</div><div><div class="kpi-card__value">' + pendingRefund.length + '</div><div class="kpi-card__label">환불 진행중</div></div></div>'
  + '<div class="kpi-card kpi-card--green"><div class="kpi-card__icon">O</div><div><div class="kpi-card__value">' + Formatters.currency(totalRefund) + '</div><div class="kpi-card__label">환불 완료액</div></div></div>'
  + '<div class="kpi-card kpi-card--purple"><div class="kpi-card__icon">#</div><div><div class="kpi-card__value">' + withdrawals.length + '</div><div class="kpi-card__label">전체 건수</div></div></div></div>'

  // 파이프라인
  + '<div class="pipeline" style="grid-template-columns:repeat(5,1fr);margin-bottom:24px">'
  + wdStatuses.map(function(st) {
    var cnt = withdrawals.filter(function(w){return w.status===st}).length;
    var colors = { '탈회접수':'gold','정산검토':'purple','환불진행':'pink','환불완료':'green','탈회완료':'gray' };
    var bgKey = colors[st] || 'purple';
    return '<div class="pipeline__stage"><div class="pipeline__header pipeline__header--' + bgKey + '" style="background:var(--' + (bgKey==='gray'?'status-gray':'status-'+bgKey) + ')">' + st + ' <span class="pipeline__count">' + cnt + '</span></div>'
      + (cnt > 0 ? '<div class="pipeline__card"><div style="text-align:center;padding:12px"><div style="font-size:24px;font-weight:800">' + cnt + '건</div></div></div>' : '<div class="pipeline__empty">없음</div>') + '</div>';
  }).join('') + '</div>'

  // 테이블
  + '<div class="card"><div class="card__header"><div class="card__title">탈회/환불 내역</div></div><div class="card__body" style="overflow-x:auto">'
  + '<table class="data-table"><thead><tr><th>No</th><th>회원명</th><th>회원번호</th><th>지사</th><th>사유</th><th>납입액</th><th>환불액</th><th>상태</th><th>접수일</th><th>담당</th></tr></thead><tbody>'
  + withdrawals.map(function(w) {
    return '<tr><td>' + w.id + '</td><td class="member-name">' + w.name + '</td>'
      + '<td style="font-family:monospace;font-size:12px">' + w.memberId + '</td><td>' + w.branch + '</td><td>' + w.reason + '</td>'
      + '<td style="text-align:right">' + Formatters.currency(w.totalPaid) + '</td>'
      + '<td style="text-align:right;color:var(--status-red);font-weight:600">' + Formatters.currency(w.refundAmount) + '</td>'
      + '<td><span class="badge badge--' + wdColors[w.status] + '">' + w.status + '</span></td>'
      + '<td>' + Formatters.date(w.requestDate) + '</td><td>' + w.handler + '</td></tr>';
  }).join('') + '</tbody></table></div></div>';
