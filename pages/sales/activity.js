/* ========================================
   활동성 지표 관리
   PRD 3.2 - DB 회전율, 장기상담 제어, 하드락 현황
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MATCH_MANAGERS } from '@mock/regulars.js';

initLayout({ pageId: 'sales-activity', breadcrumbs: ['매출 및 통계 관리', '인사/평가', '활동성 지표 관리'] });

var content = document.getElementById('content');

// Mock 매니저별 활동성 데이터
var activityData = MATCH_MANAGERS.map(function(name, i) {
  var totalDB = 20 + Math.floor(Math.random() * 30);
  var contacted = Math.floor(totalDB * (0.5 + Math.random() * 0.4));
  var absent5 = Math.floor(Math.random() * 5);
  var longConsult = Math.floor(Math.random() * 4);
  var holdPending = Math.floor(Math.random() * 3);
  var tempDate = Math.floor(Math.random() * 3);
  return {
    name: name, totalDB: totalDB, contacted: contacted,
    contactRate: Math.round(contacted / totalDB * 100),
    absent5: absent5, longConsult: longConsult,
    holdPending: holdPending, tempDate: tempDate,
    avgDays: Math.floor(Math.random() * 14) + 1,
    risk: absent5 >= 3 || longConsult >= 2 ? 'high' : holdPending >= 2 ? 'medium' : 'low',
  };
});

var riskColors = { high:'red', medium:'amber', low:'green' };
var riskLabels = { high:'위험', medium:'주의', low:'정상' };

var highRisk = activityData.filter(function(r){return r.risk==='high'}).length;
var medRisk = activityData.filter(function(r){return r.risk==='medium'}).length;

content.innerHTML =
  '<div class="page-header"><div><h1 class="page-header__title">활동성 지표 관리</h1>'
  +'<p class="page-header__subtitle">매니저 영업 성실도 및 DB 회전율 자동 관리</p></div></div>'

  +'<div class="kpi-grid" style="margin-bottom:16px">'
  +'<div class="kpi-card" style="border-left:4px solid #e53935"><div class="kpi-card__icon">🔴</div><div class="kpi-card__body"><div class="kpi-card__value">'+highRisk+'</div><div class="kpi-card__label">위험 매니저</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #f9a825"><div class="kpi-card__icon">🟡</div><div class="kpi-card__body"><div class="kpi-card__value">'+medRisk+'</div><div class="kpi-card__label">주의 매니저</div></div></div>'
  +'<div class="kpi-card" style="border-left:4px solid #43a047"><div class="kpi-card__icon">🟢</div><div class="kpi-card__body"><div class="kpi-card__value">'+(activityData.length-highRisk-medRisk)+'</div><div class="kpi-card__label">정상</div></div></div>'
  +'</div>'

  // 임계값 안내
  +'<div class="card" style="margin-bottom:16px"><div class="card__header"><div class="card__title">⚙️ 자동 회수 임계값 (Threshold)</div></div>'
  +'<div class="card__body" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;font-size:12px">'
  +'<div style="padding:10px;background:var(--bg-secondary);border-radius:6px;text-align:center"><div style="font-weight:700;color:#c62828;margin-bottom:4px">부재중 5회</div><div style="color:var(--text-muted)">기간만료(재컨텍) 전환</div></div>'
  +'<div style="padding:10px;background:var(--bg-secondary);border-radius:6px;text-align:center"><div style="font-weight:700;color:#e65100;margin-bottom:4px">14일 미컨텍</div><div style="color:var(--text-muted)">DB 권한 자동 회수</div></div>'
  +'<div style="padding:10px;background:var(--bg-secondary);border-radius:6px;text-align:center"><div style="font-weight:700;color:#f9a825;margin-bottom:4px">장기상담 90일</div><div style="color:var(--text-muted)">자동 이관 처리</div></div>'
  +'<div style="padding:10px;background:var(--bg-secondary);border-radius:6px;text-align:center"><div style="font-weight:700;color:#7c3aed;margin-bottom:4px">임시교제 21일</div><div style="color:var(--text-muted)">확정/복귀 강제 선택</div></div>'
  +'</div></div>'

  // 테이블
  +'<div class="card"><div class="card__header"><div class="card__title">매니저별 활동성 현황</div></div>'
  +'<div class="card__body" style="overflow-x:auto;padding:0">'
  +'<table class="data-table data-table--compact" style="font-size:11px"><thead><tr>'
  +'<th>매니저</th><th>보유DB</th><th>컨텍완료</th><th>컨텍율</th><th>부재5회↑</th><th>장기상담</th><th>가입보류</th><th>임시교제</th><th>평균소요</th><th>상태</th>'
  +'</tr></thead><tbody>'
  + activityData.map(function(r){
    var rateColor = r.contactRate >= 80 ? '#2e7d32' : r.contactRate >= 50 ? '#e65100' : '#c62828';
    return '<tr>'
      +'<td style="font-weight:700">'+r.name+'</td>'
      +'<td>'+r.totalDB+'</td>'
      +'<td>'+r.contacted+'</td>'
      +'<td style="font-weight:700;color:'+rateColor+'">'+r.contactRate+'%</td>'
      +'<td style="color:'+(r.absent5>=3?'#c62828':'inherit')+'">'+r.absent5+'건</td>'
      +'<td style="color:'+(r.longConsult>=2?'#e65100':'inherit')+'">'+r.longConsult+'건</td>'
      +'<td>'+r.holdPending+'건</td>'
      +'<td>'+r.tempDate+'건</td>'
      +'<td>'+r.avgDays+'일</td>'
      +'<td><span class="badge badge--'+riskColors[r.risk]+'">'+riskLabels[r.risk]+'</span></td>'
      +'</tr>';
  }).join('')
  +'</tbody></table></div></div>';
