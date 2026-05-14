/* ========================================
   매출 통계 대시보드
   브랜드별·분할매출별·가입순서별·남성수당별·매니저별 통계
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';
import { MockRegulars, MATCH_MANAGERS, getManagerBrand } from '@mock/regulars.js';

initLayout({ pageId: 'sales-stats', breadcrumbs: ['매출 및 통계 관리', '매출 통계', '매출 통계 대시보드'] });

var content = document.getElementById('content');

var BRANDS = ['퍼플스','디노블','르매리'];
var SPLIT_TYPES = ['일시불','계약금','중도금','잔금','업그레이드'];
var JOIN_ORDERS = ['1가입','2가입'];

var splitColors = { '일시불':'green','계약금':'blue','중도금':'amber','잔금':'purple','업그레이드':'accent' };
var joinColors = { '1가입':'green','2가입':'amber' };

function formatMoney(n) {
  if (n === null || n === undefined) return '-';
  return n.toLocaleString() + '원';
}

// Mock 데이터 생성
var salesData = [];
for (var i = 0; i < 30; i++) {
  var d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 30));
  var dateStr = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  var cd = new Date(d); cd.setDate(cd.getDate() - Math.floor(Math.random() * 5));
  var cdStr = cd.getFullYear()+'-'+String(cd.getMonth()+1).padStart(2,'0')+'-'+String(cd.getDate()).padStart(2,'0');
  var brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
  var split = SPLIT_TYPES[Math.floor(Math.random() * SPLIT_TYPES.length)];
  var join = JOIN_ORDERS[Math.floor(Math.random() * 2)];
  var maleOpts = [null, null, null, '전문직','재력가','프로모션'];
  var maleType = maleOpts[Math.floor(Math.random() * maleOpts.length)];
  var amount = (Math.floor(Math.random() * 15) + 3) * 100000;
  var mgr = MATCH_MANAGERS[Math.floor(Math.random() * MATCH_MANAGERS.length)];
  var hasShare = Math.random() > 0.7;
  var shareMgr = hasShare ? MATCH_MANAGERS[Math.floor(Math.random() * MATCH_MANAGERS.length)] : null;
  var shareRatio = hasShare ? [30,40,50][Math.floor(Math.random()*3)] : 0;
  var member = MockRegulars[Math.floor(Math.random() * MockRegulars.length)];
  var confirmed = Math.random() > 0.4;
  var mainMgr = mgr;
  var mainBrand = getManagerBrand(mainMgr);
  var shareBrandVal = hasShare ? getManagerBrand(shareMgr) : '';
  salesData.push({
    id: i+1, payDate: dateStr, contractDate: cdStr, brand: mainBrand,
    splitType: split, joinOrder: join, maleType: maleType,
    amount: amount, manager: mainMgr, managerBrand: mainBrand,
    shareManager: shareMgr, shareBrand: shareBrandVal, shareRatio: shareRatio,
    member: member.name,
    finalAmount: confirmed ? amount + (Math.random() > 0.5 ? Math.floor(Math.random()*200000) : 0) : amount,
    confirmed: confirmed
  });
}

var now = new Date();

// 통계 계산
function calcStats(data) {
  var stats = {
    total: { count: 0, amount: 0 },
    brand: {},
    split: {},
    join: {},
    male: { '전문직':0, '재력가':0, '프로모션':0 },
    manager: {}
  };
  BRANDS.forEach(function(b){ stats.brand[b] = { count:0, amount:0 }; });
  SPLIT_TYPES.forEach(function(s){ stats.split[s] = { count:0, amount:0 }; });
  JOIN_ORDERS.forEach(function(j){ stats.join[j] = 0; });

  data.forEach(function(r){
    var amt = r.finalAmount !== null ? r.finalAmount : r.amount;
    stats.total.count++;
    stats.total.amount += amt;

    // 크로스 브랜드 쉐어: 비율대로 브랜드 매출 분배
    var hasShare = r.shareManager && r.shareRatio;
    if (hasShare && r.managerBrand !== r.shareBrand) {
      // 크로스 브랜드 쉐어
      var mainAmt = Math.round(amt * (100 - r.shareRatio) / 100);
      var shareAmt = amt - mainAmt;
      if (stats.brand[r.managerBrand]) { stats.brand[r.managerBrand].count++; stats.brand[r.managerBrand].amount += mainAmt; }
      if (stats.brand[r.shareBrand]) { stats.brand[r.shareBrand].amount += shareAmt; }
    } else {
      // 단독 또는 동일 브랜드 쉐어
      if (stats.brand[r.managerBrand]) { stats.brand[r.managerBrand].count++; stats.brand[r.managerBrand].amount += amt; }
    }

    if (stats.split[r.splitType]) { stats.split[r.splitType].count++; stats.split[r.splitType].amount += amt; }
    if (stats.join[r.joinOrder] !== undefined) stats.join[r.joinOrder]++;
    if (r.maleType && stats.male[r.maleType] !== undefined) stats.male[r.maleType]++;
    // 매니저별 실적 (쉐어 비율 반영)
    if (hasShare) {
      var mainReal = Math.round(amt * (100 - r.shareRatio) / 100);
      var shareReal = amt - mainReal;
      if (!stats.manager[r.manager]) stats.manager[r.manager] = { count:0, amount:0, brand: r.managerBrand };
      stats.manager[r.manager].count++;
      stats.manager[r.manager].amount += mainReal;
      if (!stats.manager[r.shareManager]) stats.manager[r.shareManager] = { count:0, amount:0, brand: r.shareBrand };
      stats.manager[r.shareManager].amount += shareReal;
    } else {
      if (!stats.manager[r.manager]) stats.manager[r.manager] = { count:0, amount:0, brand: r.managerBrand };
      stats.manager[r.manager].count++;
      stats.manager[r.manager].amount += amt;
    }
  });
  return stats;
}

function renderStats(data) {
  var s = calcStats(data);
  var crdS = 'border:1px solid var(--border-light);border-radius:10px;padding:20px 24px;background:var(--bg-card)';
  var thS = 'font-size:12px;color:var(--text-muted);padding:8px 14px;text-align:center;white-space:nowrap';
  var tdS = 'font-size:13px;padding:8px 14px;text-align:right;white-space:nowrap';

  var html = '';

  // ── 상단 요약 카드 ──
  html += '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px">';
  html += '<div style="'+crdS+';flex:1;min-width:180px;text-align:center">'
    +'<div style="font-size:13px;color:var(--text-muted);margin-bottom:6px">총 매출건수</div>'
    +'<div style="font-size:28px;font-weight:700;color:var(--primary)">'+s.total.count+'<span style="font-size:15px;color:var(--text-muted)">건</span></div>'
    +'</div>';
  html += '<div style="'+crdS+';flex:1;min-width:180px;text-align:center">'
    +'<div style="font-size:13px;color:var(--text-muted);margin-bottom:6px">총 매출액</div>'
    +'<div style="font-size:28px;font-weight:700;color:var(--accent)">'+formatMoney(s.total.amount)+'</div>'
    +'</div>';
  // 브랜드별 요약
  var brandColors = { '퍼플스':'purple','디노블':'blue','르매리':'amber' };
  BRANDS.forEach(function(b){
    var bs = s.brand[b];
    html += '<div style="'+crdS+';flex:1;min-width:180px;text-align:center">'
      +'<div style="font-size:13px;margin-bottom:6px"><span class="badge badge--'+(brandColors[b]||'gray')+'" style="font-size:10px">'+b+'</span></div>'
      +'<div style="font-size:22px;font-weight:700">'+formatMoney(bs.amount)+'</div>'
      +'<div style="font-size:12px;color:var(--text-muted);margin-top:2px">'+bs.count+'건</div>'
      +'</div>';
  });
  html += '</div>';

  // ── 2행: 분할매출 + 가입순서 + 남성수당 ──
  html += '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px;align-items:stretch">';

  // 분할매출 소계 테이블
  html += '<div style="flex:1;min-width:300px;display:flex;flex-direction:column">'
    +'<div style="font-size:14px;font-weight:700;margin-bottom:8px">분할매출 소계</div>'
    +'<div style="'+crdS+';flex:1;display:flex;align-items:center">'
    +'<table style="width:100%;border-collapse:collapse"><thead><tr>';
  SPLIT_TYPES.forEach(function(st){
    html += '<th style="'+thS+'"><span class="badge badge--'+(splitColors[st]||'gray')+'" style="font-size:10px">'+st+'</span></th>';
  });
  html += '<th style="'+thS+'"></th></tr></thead><tbody>';
  html += '<tr>';
  SPLIT_TYPES.forEach(function(st){ html += '<td style="'+tdS+';font-weight:700">'+formatMoney(s.split[st].amount)+'</td>'; });
  html += '</tr>';
  html += '</tbody></table></div></div>';

  // 가입순서
  html += '<div style="flex:1;min-width:160px;display:flex;flex-direction:column">'
    +'<div style="font-size:14px;font-weight:700;margin-bottom:8px">가입순서</div>'
    +'<div style="'+crdS+';flex:1;display:flex;align-items:center;justify-content:center">'
    +'<div style="display:flex;gap:16px">';
  JOIN_ORDERS.forEach(function(j){
    html += '<div style="text-align:center">'
      +'<span class="badge badge--'+(joinColors[j]||'gray')+'" style="font-size:9px">'+j+'</span>'
      +'<div style="font-size:20px;font-weight:700;margin-top:4px">'+s.join[j]+'<span style="font-size:11px;color:var(--text-muted)">건</span></div>'
      +'</div>';
  });
  html += '</div></div></div>';

  // 남성수당
  var maleColors = { '전문직':'blue','재력가':'amber','프로모션':'purple' };
  html += '<div style="flex:1;min-width:200px;display:flex;flex-direction:column">'
    +'<div style="font-size:14px;font-weight:700;margin-bottom:8px">남성수당</div>'
    +'<div style="'+crdS+';flex:1;display:flex;align-items:center;justify-content:center">'
    +'<div style="display:flex;gap:12px">';
  ['전문직','재력가','프로모션'].forEach(function(m){
    html += '<div style="text-align:center">'
      +'<span class="badge badge--'+(maleColors[m]||'gray')+'" style="font-size:9px">'+m+'</span>'
      +'<div style="font-size:20px;font-weight:700;margin-top:4px">'+s.male[m]+'<span style="font-size:11px;color:var(--text-muted)">건</span></div>'
      +'</div>';
  });
  html += '</div></div></div>';
  html += '</div>';

  // ── 3행: 매니저별 실적 순위 ──
  var mgrArr = Object.keys(s.manager).map(function(k){ return { name:k, count:s.manager[k].count, amount:s.manager[k].amount, brand:s.manager[k].brand||'퍼플스' }; });
  mgrArr.sort(function(a,b){ return b.amount - a.amount; });

  html += '<div>'
    +'<div style="font-size:14px;font-weight:700;margin-bottom:8px">매니저별 실적 순위</div>'
    +'<div style="'+crdS+'">'
    +'<table class="data-table data-table--compact" style="width:100%;font-size:11px"><thead><tr>'
    +'<th style="text-align:center;width:40px">순위</th>'
    +'<th style="text-align:center">매니저</th>'
    +'<th style="text-align:center">건수</th>'
    +'<th style="text-align:center">매출액</th>'
    +'<th style="text-align:left;width:40%">비율</th>'
    +'</tr></thead><tbody>';
  var maxAmt = mgrArr.length > 0 ? mgrArr[0].amount : 1;
  mgrArr.forEach(function(m, i){
    var pct = Math.round(m.amount / s.total.amount * 100);
    var barW = Math.round(m.amount / maxAmt * 100);
    var rankColor = i === 0 ? 'color:#FFD700' : i === 1 ? 'color:#C0C0C0' : i === 2 ? 'color:#CD7F32' : 'color:var(--text-muted)';
    var rankIcon = i < 3 ? '🥇🥈🥉'[i] || '' : '';
      var brandColors = { '퍼플스':'purple','디노블':'blue','르매리':'amber' };
      var mgrBrandBadge = '<span class="badge badge--'+(brandColors[m.brand]||'gray')+'" style="font-size:8px;margin-left:4px">'+m.brand+'</span>';
      html += '<tr>'
        +'<td style="text-align:center;font-weight:700;'+rankColor+'">'+(i < 3 ? ['🥇','🥈','🥉'][i] : (i+1))+'</td>'
        +'<td style="text-align:center">'+m.name+mgrBrandBadge+'</td>'
        +'<td style="text-align:center">'+m.count+'건</td>'
        +'<td style="text-align:center;font-weight:700">'+formatMoney(m.amount)+'</td>'
      +'<td><div style="display:flex;align-items:center;gap:8px">'
        +'<div style="flex:1;height:14px;background:var(--border-light);border-radius:7px;overflow:hidden">'
        +'<div style="width:'+barW+'%;height:100%;background:var(--primary);border-radius:7px;transition:width 0.3s"></div>'
        +'</div>'
        +'<span style="font-size:10px;color:var(--text-muted);min-width:30px">'+pct+'%</span>'
      +'</div></td>'
      +'</tr>';
  });
  html += '</tbody></table></div></div>';

  return html;
}

// 페이지 렌더
var monthStart = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-01';
var today = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');

content.innerHTML =
  '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'
  +'<h2 style="font-size:14px;font-weight:700">매출 통계</h2>'
  +'<button class="btn btn--outline" id="btn-excel" style="font-size:11px">📥 엑셀 다운로드</button>'
  +'</div>'

  // 기간 필터
  +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:10px 16px;background:var(--bg-secondary);border-radius:8px">'
  +'<span style="font-size:12px;font-weight:600;color:var(--text-secondary);white-space:nowrap">기간</span>'
  +'<input class="form-input" type="date" id="sf-from" value="'+monthStart+'" style="width:140px;font-size:12px">'
  +'<span style="color:var(--text-muted)">~</span>'
  +'<input class="form-input" type="date" id="sf-to" value="'+today+'" style="width:140px;font-size:12px">'
  +'<div style="display:flex;gap:4px;margin-left:8px">'
  +'<button class="btn btn--sm btn--outline" id="sf-thismonth" style="font-size:10px;padding:3px 8px">이번달</button>'
  +'<button class="btn btn--sm btn--outline" id="sf-lastmonth" style="font-size:10px;padding:3px 8px">지난달</button>'
  +'<button class="btn btn--sm btn--outline" id="sf-3months" style="font-size:10px;padding:3px 8px">최근3개월</button>'
  +'<button class="btn btn--sm btn--outline" id="sf-all" style="font-size:10px;padding:3px 8px">전체</button>'
  +'</div>'
  +'</div>'

  +'<div id="stats-content">'+renderStats(salesData)+'</div>';

// 기간 필터 로직
function applyDateFilter() {
  var from = document.getElementById('sf-from').value;
  var to = document.getElementById('sf-to').value;
  var filtered = salesData;
  if (from || to) {
    filtered = salesData.filter(function(r) {
      if (from && r.payDate < from) return false;
      if (to && r.payDate > to) return false;
      return true;
    });
  }
  document.getElementById('stats-content').innerHTML = renderStats(filtered);
}

document.getElementById('sf-from').addEventListener('change', applyDateFilter);
document.getElementById('sf-to').addEventListener('change', applyDateFilter);

// 빠른 기간 버튼
document.getElementById('sf-thismonth').addEventListener('click', function() {
  var d = new Date();
  document.getElementById('sf-from').value = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01';
  document.getElementById('sf-to').value = today;
  applyDateFilter();
});
document.getElementById('sf-lastmonth').addEventListener('click', function() {
  var d = new Date(); d.setMonth(d.getMonth() - 1);
  var lastStart = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01';
  var lastEnd = new Date(d.getFullYear(), d.getMonth()+1, 0);
  document.getElementById('sf-from').value = lastStart;
  document.getElementById('sf-to').value = lastEnd.getFullYear()+'-'+String(lastEnd.getMonth()+1).padStart(2,'0')+'-'+String(lastEnd.getDate()).padStart(2,'0');
  applyDateFilter();
});
document.getElementById('sf-3months').addEventListener('click', function() {
  var d = new Date(); d.setMonth(d.getMonth() - 2);
  document.getElementById('sf-from').value = d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-01';
  document.getElementById('sf-to').value = today;
  applyDateFilter();
});
document.getElementById('sf-all').addEventListener('click', function() {
  document.getElementById('sf-from').value = '';
  document.getElementById('sf-to').value = '';
  applyDateFilter();
});

document.getElementById('btn-excel').addEventListener('click', function(){
  Toast.show('엑셀 다운로드 기능은 추후 연동 예정입니다','info');
});
