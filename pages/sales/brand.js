/* ========================================
   브랜드 통합 현황
   PRD 4.1 - 3브랜드 통합 + 6개 생애주기 그룹
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Chart } from '@components/Chart.js';

initLayout({ pageId: 'sales-brand', breadcrumbs: ['매출 및 통계 관리', '경영/전략', '브랜드 통합 현황'] });

var content = document.getElementById('content');

var BRANDS = [
  { code:'PUR', name:'퍼플스', color:'#7c3aed', members:320, sales:28500, active:180 },
  { code:'DNO', name:'디노블', color:'#1565c0', members:210, sales:19200, active:120 },
  { code:'LEM', name:'르매리', color:'#d81b60', members:150, sales:12800, active:85 },
];
var totalMembers = BRANDS.reduce(function(s,b){return s+b.members},0);
var totalSales = BRANDS.reduce(function(s,b){return s+b.sales},0);

var lifecycle = [
  { group:'준회원/영업', count:245, color:'#3b82f6', statuses:'컨텍전, 부재중, 높음/보통/낮음, 장기상담, 가입보류' },
  { group:'결제/인증', count:68, color:'#8b5cf6', statuses:'가입중, 가입완료, 신규, 인증중, 활동대기' },
  { group:'정회원/활동', count:385, color:'#10b981', statuses:'활동, 임시보류, 강제보류, 장기보류, 약정보류' },
  { group:'교제 관리', count:42, color:'#ec4899', statuses:'교제, 임시교제, 약정교제, 외부교제' },
  { group:'만료/탈회', count:89, color:'#f59e0b', statuses:'만료, 기타만료, 자동만료, 탈회진행, 탈회' },
  { group:'성혼/CS', count:31, color:'#ef4444', statuses:'결혼예정, 성혼, 외부결혼, 소송중, 리콜' },
];
var totalLC = lifecycle.reduce(function(s,r){return s+r.count},0);

content.innerHTML =
  '<div class="page-header"><div><h1 class="page-header__title">브랜드 통합 현황</h1>'
  +'<p class="page-header__subtitle">퍼플스(PUR) / 디노블(DNO) / 르매리(LEM) 3개 브랜드 통합 관제</p></div></div>'

  +'<div class="kpi-grid" style="margin-bottom:16px">'
  + BRANDS.map(function(b){
    return '<div class="kpi-card" style="border-left:4px solid '+b.color+'"><div class="kpi-card__icon" style="font-size:18px">'+b.name.charAt(0)+'</div><div class="kpi-card__body">'
      +'<div class="kpi-card__value" style="color:'+b.color+'">'+b.members+'명</div>'
      +'<div class="kpi-card__label">'+b.name+' ('+b.code+')</div></div>'
      +'<div class="kpi-card__trend" style="font-size:11px">매출 '+(b.sales/10000).toFixed(1)+'억</div></div>';
  }).join('')
  +'<div class="kpi-card" style="border-left:4px solid #374151"><div class="kpi-card__icon">🏢</div><div class="kpi-card__body"><div class="kpi-card__value">'+totalMembers+'</div><div class="kpi-card__label">전체 통합</div></div></div>'
  +'</div>'

  +'<div class="dashboard-grid">'
  +'<div class="dashboard-grid__left">'

  // 브랜드별 매출 비교
  +'<div class="card"><div class="card__header"><div class="card__title">💰 브랜드별 매출 비교</div></div>'
  +'<div class="card__body" id="brand-chart"></div></div>'

  // 생애주기 그룹
  +'<div class="card"><div class="card__header"><div class="card__title">📊 6개 생애주기 그룹 (41개 상태값)</div></div>'
  +'<div class="card__body" style="padding:0">'
  +'<table class="data-table data-table--compact" style="font-size:11px"><thead><tr>'
  +'<th>그룹</th><th>인원</th><th>비중</th><th>분포</th><th>포함 상태값</th>'
  +'</tr></thead><tbody>'
  + lifecycle.map(function(r){
    var pct = Math.round(r.count / totalLC * 100);
    return '<tr><td style="font-weight:700"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+r.color+';margin-right:4px"></span>'+r.group+'</td>'
      +'<td style="font-weight:700">'+r.count+'</td>'
      +'<td>'+pct+'%</td>'
      +'<td style="width:120px"><div style="background:var(--bg-secondary);border-radius:4px;height:14px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:'+r.color+';border-radius:4px"></div></div></td>'
      +'<td style="font-size:10px;color:var(--text-muted)">'+r.statuses+'</td>'
      +'</tr>';
  }).join('')
  +'</tbody></table></div></div>'
  +'</div>'

  // 우측
  +'<div class="dashboard-grid__right">'
  +'<div class="card"><div class="card__header"><div class="card__title">🔄 회원 상태 분포</div></div>'
  +'<div class="card__body" id="lifecycle-donut"></div></div>'

  +'<div class="card"><div class="card__header"><div class="card__title">🔒 RLS 보안 정책</div></div>'
  +'<div class="card__body" style="font-size:12px">'
  +'<div style="padding:8px;background:var(--bg-secondary);border-radius:6px;margin-bottom:8px"><strong>brand_code</strong> 강제 파라미터<br><span style="color:var(--text-muted)">모든 인서트/조회 시 브랜드 코드 필수</span></div>'
  +'<div style="padding:8px;background:var(--bg-secondary);border-radius:6px;margin-bottom:8px"><strong>Row-Level Security</strong><br><span style="color:var(--text-muted)">매니저 소속 브랜드 외 데이터 원천 차단</span></div>'
  +'<div style="padding:8px;background:var(--bg-secondary);border-radius:6px"><strong>UID 중심 통합</strong><br><span style="color:var(--text-muted)">N차 계약 매핑 (1가입/2가입/재가입)</span></div>'
  +'</div></div>'
  +'</div></div>';

// 차트
Chart.renderBar('brand-chart', BRANDS.map(function(b){
  return { label: b.name, value: b.sales, color: b.color };
}), { format: function(v){ return (v/10000).toFixed(1)+'억'; } });

Chart.renderDonut('lifecycle-donut', lifecycle.map(function(r){
  return { label: r.group, value: r.count, color: r.color };
}), { centerLabel: totalLC, centerSub: '전체 회원' });
