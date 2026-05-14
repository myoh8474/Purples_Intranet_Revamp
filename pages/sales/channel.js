/* ========================================
   마케팅 채널 분석
   PRD 4.2 - 채널별 전환율, LTV
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Chart } from '@components/Chart.js';

initLayout({ pageId: 'sales-channel', breadcrumbs: ['매출 및 통계 관리', '경영/전략', '마케팅 채널 분석'] });

var content = document.getElementById('content');

var channels = [
  { name:'메타(페이스북/인스타)', icon:'📱', leads:520, converted:42, amount:315000000, cpa:35000, color:'#1877F2' },
  { name:'카카오 싱크', icon:'💬', leads:380, converted:35, amount:262500000, cpa:28000, color:'#FEE500' },
  { name:'네이버 폼', icon:'🔍', leads:290, converted:22, amount:165000000, cpa:42000, color:'#03C75A' },
  { name:'CPA 제휴', icon:'🤝', leads:210, converted:15, amount:112500000, cpa:55000, color:'#6366f1' },
  { name:'자사 랜딩페이지', icon:'🌐', leads:180, converted:18, amount:135000000, cpa:22000, color:'#7c3aed' },
  { name:'오프라인/소개', icon:'👥', leads:95, converted:12, amount:90000000, cpa:0, color:'#374151' },
];

var totalLeads = channels.reduce(function(s,c){return s+c.leads},0);
var totalConverted = channels.reduce(function(s,c){return s+c.converted},0);
var totalAmount = channels.reduce(function(s,c){return s+c.amount},0);

content.innerHTML =
  '<div class="page-header"><div><h1 class="page-header__title">마케팅 채널 분석</h1>'
  +'<p class="page-header__subtitle">Webhook 기반 채널별 DB 전환율 및 LTV 분석</p></div></div>'

  +'<div class="kpi-grid" style="margin-bottom:16px">'
  +'<div class="kpi-card" style="border-left:4px solid var(--accent)"><div class="kpi-card__icon">📥</div><div class="kpi-card__body"><div class="kpi-card__value">'+totalLeads.toLocaleString()+'</div><div class="kpi-card__label">총 유입 DB</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #43a047"><div class="kpi-card__icon">✅</div><div class="kpi-card__body"><div class="kpi-card__value">'+totalConverted+'</div><div class="kpi-card__label">전환 (정회원)</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #1565c0"><div class="kpi-card__icon">📊</div><div class="kpi-card__body"><div class="kpi-card__value">'+Math.round(totalConverted/totalLeads*100)+'%</div><div class="kpi-card__label">전환율</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #7c3aed"><div class="kpi-card__icon">💰</div><div class="kpi-card__body"><div class="kpi-card__value">'+(totalAmount/100000000).toFixed(1)+'억</div><div class="kpi-card__label">총 LTV</div></div></div>'
  +'</div>'

  +'<div class="dashboard-grid">'
  +'<div class="dashboard-grid__left">'
  +'<div class="card"><div class="card__header"><div class="card__title">📊 채널별 상세 비교</div></div>'
  +'<div class="card__body" style="overflow-x:auto;padding:0">'
  +'<table class="data-table data-table--compact" style="font-size:11px"><thead><tr>'
  +'<th>채널</th><th>유입</th><th>전환</th><th>전환율</th><th>LTV</th><th>CPA</th><th>효율</th>'
  +'</tr></thead><tbody>'
  + channels.map(function(c){
    var rate = Math.round(c.converted / c.leads * 100);
    var ltv = Math.round(c.amount / c.converted / 10000);
    var rateColor = rate >= 10 ? '#2e7d32' : rate >= 5 ? '#e65100' : '#c62828';
    var barPct = Math.round(c.leads / channels[0].leads * 100);
    return '<tr>'
      +'<td style="font-weight:600;white-space:nowrap">'+c.icon+' '+c.name+'</td>'
      +'<td>'+c.leads.toLocaleString()+'</td>'
      +'<td style="font-weight:700;color:#2e7d32">'+c.converted+'</td>'
      +'<td style="font-weight:700;color:'+rateColor+'">'+rate+'%</td>'
      +'<td style="text-align:right;font-weight:700;color:var(--accent)">'+(c.amount/10000).toLocaleString()+'만</td>'
      +'<td style="text-align:right">'+(c.cpa ? c.cpa.toLocaleString()+'원' : '-')+'</td>'
      +'<td style="width:80px"><div style="background:var(--bg-secondary);border-radius:4px;height:14px;overflow:hidden"><div style="width:'+barPct+'%;height:100%;background:'+c.color+';border-radius:4px"></div></div></td>'
      +'</tr>';
  }).join('')
  +'</tbody></table></div></div>'
  +'</div>'

  +'<div class="dashboard-grid__right">'
  +'<div class="card"><div class="card__header"><div class="card__title">📈 채널별 유입 비율</div></div>'
  +'<div class="card__body" id="channel-donut"></div></div>'
  +'<div class="card"><div class="card__header"><div class="card__title">🔗 Webhook 상태</div></div>'
  +'<div class="card__body" style="font-size:12px">'
  + channels.slice(0,4).map(function(c,i){
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-light)">'
      +'<span>'+c.icon+' '+c.name+'</span>'
      +'<span class="badge badge--green" style="font-size:9px">연동됨</span></div>';
  }).join('')
  +'</div></div>'
  +'</div></div>';

Chart.renderDonut('channel-donut', channels.map(function(c){
  return { label: c.name.split('(')[0].trim(), value: c.leads, color: c.color };
}), { centerLabel: totalLeads, centerSub: '총 유입' });
