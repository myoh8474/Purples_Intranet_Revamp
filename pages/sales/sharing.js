/* ========================================
   실매출 및 쉐어링 관리
   PRD 2.2 - 입금액 × 비율(%) = 실매출액, N분할
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MATCH_MANAGERS } from '@mock/regulars.js';

initLayout({ pageId: 'sales-sharing', breadcrumbs: ['매출 및 통계 관리', '재무/정산', '실매출 및 쉐어링'] });

var content = document.getElementById('content');

// Mock 쉐어링 데이터
var sharingData = [];
for (var i = 0; i < 20; i++) {
  var d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 30));
  var dateStr = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  var totalAmt = (500 + Math.floor(Math.random() * 1000)) * 10000;
  // N분할 (2~3명)
  var shareCount = 2 + (i % 2);
  var shares = [];
  var remaining = 100;
  for (var j = 0; j < shareCount; j++) {
    var pct = j === shareCount - 1 ? remaining : Math.floor(remaining / (shareCount - j)) + (Math.floor(Math.random() * 10) - 5);
    if (pct < 10) pct = 10;
    if (pct > remaining) pct = remaining;
    remaining -= pct;
    shares.push({ manager: MATCH_MANAGERS[(i * 3 + j) % MATCH_MANAGERS.length], pct: pct, amount: Math.round(totalAmt * pct / 100) });
  }
  sharingData.push({ id: i+1, date: dateStr, member: '김'+['서연','지은','하린','민수','준호','태우','유서','준서'][i%8], total: totalAmt, shares: shares });
}
sharingData.sort(function(a,b){return b.date.localeCompare(a.date)});

function formatMoney(v){ return (v/10000).toLocaleString()+'만원'; }

// 매니저별 실매출 합계
var mgrTotals = {};
sharingData.forEach(function(r){
  r.shares.forEach(function(s){
    if (!mgrTotals[s.manager]) mgrTotals[s.manager] = 0;
    mgrTotals[s.manager] += s.amount;
  });
});
var mgrRanking = Object.keys(mgrTotals).map(function(k){ return {name:k, total:mgrTotals[k]}; })
  .sort(function(a,b){return b.total-a.total});

var totalReal = mgrRanking.reduce(function(s,r){return s+r.total},0);

content.innerHTML =
  '<div class="page-header"><div><h1 class="page-header__title">실매출 및 쉐어링 관리</h1>'
  +'<p class="page-header__subtitle">입금액 × 설정 비율(%) = 실매출액 (N분할 설정)</p></div></div>'

  // KPI
  +'<div class="kpi-grid" style="margin-bottom:16px">'
  +'<div class="kpi-card" style="border-left:4px solid var(--accent)"><div class="kpi-card__icon">💰</div><div class="kpi-card__body"><div class="kpi-card__value">'+formatMoney(totalReal)+'</div><div class="kpi-card__label">총 실매출</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #43a047"><div class="kpi-card__icon">👥</div><div class="kpi-card__body"><div class="kpi-card__value">'+mgrRanking.length+'명</div><div class="kpi-card__label">참여 매니저</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #1565c0"><div class="kpi-card__icon">📋</div><div class="kpi-card__body"><div class="kpi-card__value">'+sharingData.length+'</div><div class="kpi-card__label">쉐어링 건수</div></div></div>'
  +'</div>'

  // 2단 그리드
  +'<div class="dashboard-grid">'
  +'<div class="dashboard-grid__left">'

  // 쉐어링 내역
  +'<div class="card"><div class="card__header"><div class="card__title">쉐어링 내역</div></div>'
  +'<div class="card__body" style="overflow-x:auto;padding:0">'
  +'<table class="data-table data-table--compact" style="font-size:11px"><thead><tr>'
  +'<th>날짜</th><th>회원</th><th>총 입금액</th><th>쉐어링 분배</th>'
  +'</tr></thead><tbody>'
  + sharingData.map(function(r){
    var sharesHtml = r.shares.map(function(s){
      return '<span style="display:inline-flex;align-items:center;gap:3px;margin-right:8px;font-size:10px">'
        +'<strong>'+s.manager+'</strong> '
        +'<span class="badge badge--purple" style="font-size:9px">'+s.pct+'%</span> '
        +'<span style="color:var(--accent);font-weight:700">'+formatMoney(s.amount)+'</span>'
        +'</span>';
    }).join('');
    return '<tr>'
      +'<td style="white-space:nowrap">'+r.date+'</td>'
      +'<td style="font-weight:600">'+r.member+'</td>'
      +'<td style="font-weight:700;text-align:right">'+formatMoney(r.total)+'</td>'
      +'<td>'+sharesHtml+'</td>'
      +'</tr>';
  }).join('')
  +'</tbody></table></div></div>'
  +'</div>'

  // 우: 실매출순위
  +'<div class="dashboard-grid__right">'
  +'<div class="card"><div class="card__header"><div class="card__title">📊 실매출 순위</div></div>'
  +'<div class="card__body" style="padding:0">'
  +'<table class="data-table data-table--compact" style="font-size:12px"><thead><tr>'
  +'<th>순위</th><th>매니저</th><th style="text-align:right">실매출</th><th>비중</th>'
  +'</tr></thead><tbody>'
  + mgrRanking.slice(0,10).map(function(r,i){
    var pct = Math.round(r.total / totalReal * 100);
    var medals = ['🥇','🥈','🥉'];
    return '<tr>'
      +'<td style="text-align:center;font-weight:700">'+(i<3 ? medals[i] : (i+1))+'</td>'
      +'<td style="font-weight:600">'+r.name+'</td>'
      +'<td style="text-align:right;font-weight:700;color:var(--accent)">'+formatMoney(r.total)+'</td>'
      +'<td style="width:100px"><div style="background:var(--bg-secondary);border-radius:4px;height:14px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:#7c3aed;border-radius:4px"></div></div></td>'
      +'</tr>';
  }).join('')
  +'</tbody></table></div></div>'
  +'</div></div>';
