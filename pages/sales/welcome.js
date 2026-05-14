/* ========================================
   Welcome 통계 / 리스크 관제
   PRD 4.2 - 계약→프로필발송 소요기간, 클레임, 결혼예정 30일 경고
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Chart } from '@components/Chart.js';

initLayout({ pageId: 'sales-welcome', breadcrumbs: ['매출 및 통계 관리', '경영/전략', 'Welcome/리스크 통계'] });

var content = document.getElementById('content');

// Welcome 통계 (계약→첫 프로필발송 소요기간)
var welcomeData = [
  { range:'3일 이내', count:18, color:'#10b981' },
  { range:'4~7일', count:25, color:'#3b82f6' },
  { range:'8~14일', count:12, color:'#f59e0b' },
  { range:'15~30일', count:6, color:'#ef4444' },
  { range:'30일 초과', count:3, color:'#7f1d1d' },
];
var totalWelcome = welcomeData.reduce(function(s,r){return s+r.count},0);
var avgDays = 8.3;

// 결혼예정 30일 경과 (리스크)
var weddingRisk = [
  { name:'김서연', daysOver:45, amount:5000000, status:'미납' },
  { name:'이준호', daysOver:38, amount:3000000, status:'부분납' },
  { name:'박지은', daysOver:32, amount:5000000, status:'미납' },
];

// 클레임 사유별 통계
var claimStats = [
  { reason:'매칭 불만', count:15, pct:32 },
  { reason:'서비스 지연', count:10, pct:21 },
  { reason:'환불 요청', count:8, pct:17 },
  { reason:'프로필 불일치', count:7, pct:15 },
  { reason:'노쇼/펑크', count:4, pct:9 },
  { reason:'기타', count:3, pct:6 },
];

content.innerHTML =
  '<div class="page-header"><div><h1 class="page-header__title">Welcome 통계 / 리스크 관제</h1>'
  +'<p class="page-header__subtitle">서비스 병목 구간 모니터링 및 경영진 리스크 알림</p></div></div>'

  // KPI
  +'<div class="kpi-grid" style="margin-bottom:16px">'
  +'<div class="kpi-card" style="border-left:4px solid #3b82f6"><div class="kpi-card__icon">⏱️</div><div class="kpi-card__body"><div class="kpi-card__value">'+avgDays+'일</div><div class="kpi-card__label">평균 Welcome 소요</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #e53935"><div class="kpi-card__icon">🚨</div><div class="kpi-card__body"><div class="kpi-card__value" style="color:#c62828">'+weddingRisk.length+'</div><div class="kpi-card__label">결혼예정 30일↑ 미납</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #f59e0b"><div class="kpi-card__icon">⚠️</div><div class="kpi-card__body"><div class="kpi-card__value">'+claimStats.reduce(function(s,r){return s+r.count},0)+'</div><div class="kpi-card__label">전체 클레임</div></div></div>'
  +'</div>'

  +'<div class="dashboard-grid">'
  +'<div class="dashboard-grid__left">'

  // Welcome 통계
  +'<div class="card"><div class="card__header"><div class="card__title">⏱️ Welcome 소요기간 분포</div><div class="card__actions" style="font-size:11px;color:var(--text-muted)">계약 체결 → 첫 프로필 발송</div></div>'
  +'<div class="card__body">'
  + welcomeData.map(function(r){
    var pct = Math.round(r.count / totalWelcome * 100);
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
      +'<span style="width:80px;font-size:12px;font-weight:600">'+r.range+'</span>'
      +'<div style="flex:1;height:22px;background:var(--bg-secondary);border-radius:4px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:'+r.color+';border-radius:4px;display:flex;align-items:center;padding-left:6px"><span style="font-size:10px;color:#fff;font-weight:700">'+r.count+'건</span></div></div>'
      +'<span style="width:35px;text-align:right;font-size:11px;font-weight:700">'+pct+'%</span>'
      +'</div>';
  }).join('')
  +'</div></div>'

  // 클레임 사유
  +'<div class="card"><div class="card__header"><div class="card__title">📊 클레임 사유별 분석</div></div>'
  +'<div class="card__body" id="claim-chart"></div></div>'
  +'</div>'

  // 우측
  +'<div class="dashboard-grid__right">'

  // 결혼예정 30일 경과 리스크
  +'<div class="card"><div class="card__header"><div class="card__title">🚨 결혼예정 30일↑ 미납 경고</div><span class="badge badge--red">최우선</span></div>'
  +'<div class="card__body">'
  +'<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:10px;margin-bottom:12px;font-size:11px;color:#991b1b">'
  +'⚠️ 결혼예정 상태에서 30일 이상 성혼비 미납 건입니다. 경영진 즉시 확인이 필요합니다.'
  +'</div>'
  + weddingRisk.map(function(r){
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg-secondary);border-radius:6px;margin-bottom:6px;border-left:3px solid #e53935">'
      +'<div><div style="font-weight:700;font-size:13px">'+r.name+'</div><div style="font-size:11px;color:var(--text-muted)">경과 '+r.daysOver+'일 | 성혼비 '+(r.amount/10000).toLocaleString()+'만원</div></div>'
      +'<span class="badge badge--red">'+r.status+'</span></div>';
  }).join('')
  +'</div></div>'

  // 서비스 품질 KPI
  +'<div class="card"><div class="card__header"><div class="card__title">📋 서비스 품질 지표</div></div>'
  +'<div class="card__body" style="font-size:12px">'
  +'<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-light)"><span>3일내 Welcome 비율</span><span style="font-weight:700;color:#2e7d32">28.1%</span></div>'
  +'<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-light)"><span>7일내 Welcome 비율</span><span style="font-weight:700;color:#2e7d32">67.2%</span></div>'
  +'<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-light)"><span>클레임 처리율</span><span style="font-weight:700;color:#1565c0">82.3%</span></div>'
  +'<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-light)"><span>탈회 SLA 준수율</span><span style="font-weight:700;color:#e65100">74.5%</span></div>'
  +'<div style="display:flex;justify-content:space-between;padding:8px 0"><span>회원 만족도</span><span style="font-weight:700;color:#7c3aed">4.2 / 5.0</span></div>'
  +'</div></div>'

  +'</div></div>';

Chart.renderBar('claim-chart', claimStats.map(function(r){
  return { label: r.reason, value: r.count, color: '#ef4444' };
}), { format: function(v){ return v+'건'; } });
