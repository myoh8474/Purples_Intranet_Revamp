/* ========================================
   통합 클레임 관리
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Formatters } from '@utils/formatters.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars, CONSULTANTS } from '@mock/regulars.js';

initLayout({ pageId: 'contract-claim', breadcrumbs: ['정회원 관리', '계약 관리', '통합 클레임 관리'] });

var content = document.getElementById('content');
var claimTypes = ['서비스 불만','매칭 불만','매니저 불만','결제 이의','환불 요청','기타'];
var priorities = ['긴급','높음','보통','낮음'];
var claimStatuses = ['접수','처리중','완료','보류'];
var pColors = { '긴급':'red','높음':'amber','보통':'blue','낮음':'gray' };
var sColors = { '접수':'amber','처리중':'blue','완료':'green','보류':'gray' };

var claims = [];
for (var i = 0; i < 12; i++) {
  claims.push({
    id: 'CLM-' + (2026001 + i), name: MockRegulars[i % MockRegulars.length].name,
    branch: MockRegulars[i % MockRegulars.length].branch,
    type: claimTypes[i % claimTypes.length], priority: priorities[i % priorities.length],
    status: claimStatuses[i % claimStatuses.length],
    date: new Date(Date.now() - i * 2 * 86400000).toISOString(),
    handler: CONSULTANTS[i % CONSULTANTS.length],
  });
}

content.innerHTML =
  '<div class="page-header"><div><h1 class="page-header__title">통합 클레임 관리</h1>'
  + '<p class="page-header__subtitle">클레임 접수부터 처리 완료까지 통합 관리</p></div>'
  + '<div class="page-header__actions"><button class="btn btn--primary" id="btn-new-claim">+ 클레임 접수</button></div></div>'
  + '<div class="kpi-grid">'
  + '<div class="kpi-card kpi-card--gold"><div class="kpi-card__icon">!</div><div><div class="kpi-card__value">' + claims.filter(function(c){return c.status==='접수'}).length + '</div><div class="kpi-card__label">신규 접수</div></div></div>'
  + '<div class="kpi-card kpi-card--blue"><div class="kpi-card__icon">~</div><div><div class="kpi-card__value">' + claims.filter(function(c){return c.status==='처리중'}).length + '</div><div class="kpi-card__label">처리중</div></div></div>'
  + '<div class="kpi-card kpi-card--green"><div class="kpi-card__icon">O</div><div><div class="kpi-card__value">' + claims.filter(function(c){return c.status==='완료'}).length + '</div><div class="kpi-card__label">완료</div></div></div>'
  + '<div class="kpi-card kpi-card--purple"><div class="kpi-card__icon">*</div><div><div class="kpi-card__value">' + claims.filter(function(c){return c.priority==='긴급'}).length + '</div><div class="kpi-card__label">긴급</div></div></div></div>'
  + '<div class="card"><div class="card__header"><div class="card__title">클레임 내역</div></div><div class="card__body" style="overflow-x:auto">'
  + '<table class="data-table"><thead><tr><th>ID</th><th>회원명</th><th>지사</th><th>유형</th><th>우선순위</th><th>상태</th><th>접수일</th><th>담당</th><th>관리</th></tr></thead><tbody>'
  + claims.map(function(c) {
    return '<tr><td style="font-family:monospace;font-size:12px">' + c.id + '</td><td class="member-name">' + c.name + '</td><td>' + c.branch + '</td><td>' + c.type + '</td>'
      + '<td><span class="badge badge--' + pColors[c.priority] + '">' + c.priority + '</span></td>'
      + '<td><span class="badge badge--' + sColors[c.status] + '">' + c.status + '</span></td>'
      + '<td>' + Formatters.date(c.date) + '</td><td>' + c.handler + '</td>'
      + '<td><button class="btn btn--outline btn--sm">상세</button></td></tr>';
  }).join('') + '</tbody></table></div></div>';

document.getElementById('btn-new-claim').addEventListener('click', function() { Toast.show('클레임 접수 모달 구현 예정', 'info'); });
