/* ========================================
   정산 현황
   PRD 2.3 - 환불/위약금 자동산정, 정산 승인 리스트
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MATCH_MANAGERS } from '@mock/regulars.js';

initLayout({ pageId: 'sales-settlement', breadcrumbs: ['매출 및 통계 관리', '재무/정산', '정산 현황'] });

var content = document.getElementById('content');

var statusMap = { '대기':'amber', '승인':'green', '반려':'red', '처리중':'blue' };
var items = [];
for (var i = 0; i < 15; i++) {
  var d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 20));
  var dateStr = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  var types = ['환불','위약금','성혼비','정산'];
  var statuses = ['대기','승인','반려','처리중'];
  var amt = (100 + Math.floor(Math.random() * 500)) * 10000;
  items.push({
    id: i+1, date: dateStr, member: ['김서연','박지은','이준호','최민수','한소영','강준혁','조유서'][i%7],
    type: types[i%4], amount: amt, penalty: i%4===1 ? Math.round(amt*0.3) : 0,
    refund: i%4===0 ? Math.round(amt*0.7) : 0,
    manager: MATCH_MANAGERS[i%MATCH_MANAGERS.length], status: statuses[i%4],
    slaDay: Math.floor(Math.random()*7)+1,
  });
}

function formatM(v){return (v/10000).toLocaleString()+'만';}

var pending = items.filter(function(r){return r.status==='대기'}).length;
var totalRefund = items.filter(function(r){return r.type==='환불'}).reduce(function(s,r){return s+r.refund},0);

content.innerHTML =
  '<div class="page-header"><div><h1 class="page-header__title">정산 현황</h1>'
  +'<p class="page-header__subtitle">환불/위약금 자동 산정 및 정산팀 승인 관리 (SLA: 7영업일)</p></div></div>'

  +'<div class="kpi-grid" style="margin-bottom:16px">'
  +'<div class="kpi-card" style="border-left:4px solid #f9a825"><div class="kpi-card__icon">⏳</div><div class="kpi-card__body"><div class="kpi-card__value">'+pending+'</div><div class="kpi-card__label">승인 대기</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #e53935"><div class="kpi-card__icon">💸</div><div class="kpi-card__body"><div class="kpi-card__value">'+formatM(totalRefund)+'</div><div class="kpi-card__label">환불 예정액</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #43a047"><div class="kpi-card__icon">✅</div><div class="kpi-card__body"><div class="kpi-card__value">'+items.filter(function(r){return r.status==='승인'}).length+'</div><div class="kpi-card__label">처리 완료</div></div></div>'
  +'</div>'

  +'<div class="card"><div class="card__header"><div class="card__title">정산 내역</div></div>'
  +'<div class="card__body" style="overflow-x:auto;padding:0">'
  +'<table class="data-table data-table--compact" style="font-size:11px"><thead><tr>'
  +'<th>No</th><th>날짜</th><th>회원</th><th>유형</th><th>계약금액</th><th>위약금</th><th>환불액</th><th>담당</th><th>SLA</th><th>상태</th>'
  +'</tr></thead><tbody>'
  +items.map(function(r,i){
    var slaColor = r.slaDay > 5 ? 'color:#c62828;font-weight:700' : '';
    return '<tr>'
      +'<td>'+(i+1)+'</td><td>'+r.date+'</td><td style="font-weight:600">'+r.member+'</td>'
      +'<td><span class="badge badge--blue" style="font-size:9px">'+r.type+'</span></td>'
      +'<td style="text-align:right">'+formatM(r.amount)+'</td>'
      +'<td style="text-align:right;color:#c62828">'+(r.penalty?formatM(r.penalty):'-')+'</td>'
      +'<td style="text-align:right;color:#2e7d32;font-weight:700">'+(r.refund?formatM(r.refund):'-')+'</td>'
      +'<td>'+r.manager+'</td>'
      +'<td style="'+slaColor+'">D+'+r.slaDay+'</td>'
      +'<td><span class="badge badge--'+statusMap[r.status]+'">'+r.status+'</span></td>'
      +'</tr>';
  }).join('')
  +'</tbody></table></div></div>';
