/* ========================================
   전사 8대 랭킹
   PRD 3.1 기반 - 8개 순위표 탭 전환
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MATCH_MANAGERS } from '@mock/regulars.js';

initLayout({ pageId: 'sales-ranking', breadcrumbs: ['매출 및 통계 관리', '인사/평가', '전사 8대 랭킹'] });

var content = document.getElementById('content');

var TEAMS = ['상담1팀','상담2팀','매칭팀'];
var BRANCHES = ['본사','경기','부산','대구','대전','광주'];

var rankings = [
  { id:'sales', name:'매출순위', icon:'💰', desc:'총 유입 가입비 기준', unit:'만원' },
  { id:'real', name:'실매출순위', icon:'📊', desc:'쉐어링 비율 적용 후', unit:'만원' },
  { id:'wedding', name:'성혼비순위', icon:'💍', desc:'성혼 인센티브 매출', unit:'만원' },
  { id:'leave', name:'탈회순위', icon:'🚪', desc:'담당 회원 탈회 빈도', unit:'건' },
  { id:'male', name:'남성순위', icon:'👔', desc:'전문직/재력가 유치', unit:'건' },
  { id:'promo', name:'프로모션순위', icon:'🎉', desc:'이벤트 상품 판매', unit:'건' },
  { id:'contact', name:'컨택순위', icon:'📞', desc:'총 콜수 및 성공', unit:'건' },
  { id:'meeting', name:'환산미팅순위', icon:'🤝', desc:'유효 미팅 전환', unit:'건' },
];

// Mock 데이터 생성
function genData(unit) {
  return MATCH_MANAGERS.map(function(name, i) {
    var val = unit === '만원' ? (800 + Math.floor(Math.random() * 3000)) : (5 + Math.floor(Math.random() * 40));
    return { rank: 0, name: name, team: TEAMS[i % 3], branch: BRANCHES[i % 6], value: val };
  }).sort(function(a,b){return b.value - a.value}).map(function(r,i){ r.rank = i+1; return r; });
}

var allData = {};
rankings.forEach(function(r){ allData[r.id] = genData(r.unit); });

var activeTab = 'sales';

function buildTabs() {
  return '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px">'
    + rankings.map(function(r){
      var cls = r.id === activeTab ? 'btn btn--primary btn--sm' : 'btn btn--outline btn--sm';
      return '<button class="'+cls+' tab-btn" data-tab="'+r.id+'" style="font-size:11px">'+r.icon+' '+r.name+'</button>';
    }).join('')
    + '</div>';
}

function buildRankTable(tabId) {
  var rk = rankings.find(function(r){return r.id===tabId});
  var data = allData[tabId];
  var maxVal = data[0] ? data[0].value : 1;

  return '<div style="margin-bottom:8px;font-size:12px;color:var(--text-muted)">'+rk.icon+' '+rk.desc+'</div>'
    + '<table class="data-table data-table--compact" style="font-size:12px"><thead><tr>'
    + '<th style="width:50px">순위</th><th>매니저</th><th>소속</th><th>지사</th><th style="text-align:right">실적</th><th style="width:200px">그래프</th>'
    + '</tr></thead><tbody>'
    + data.map(function(r) {
      var medalColors = ['#FFD700','#C0C0C0','#CD7F32'];
      var rankBadge = r.rank <= 3
        ? '<span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;border-radius:50%;background:'+medalColors[r.rank-1]+';color:#fff;font-weight:800;font-size:11px">'+r.rank+'</span>'
        : '<span style="font-weight:600;color:var(--text-muted)">'+r.rank+'</span>';
      var pct = Math.round((r.value / maxVal) * 100);
      var barColor = r.rank <= 3 ? '#7c3aed' : r.rank <= 5 ? '#3b82f6' : '#94a3b8';
      return '<tr>'
        + '<td style="text-align:center">'+rankBadge+'</td>'
        + '<td style="font-weight:700">'+r.name+'</td>'
        + '<td><span class="badge badge--blue" style="font-size:9px">'+r.team+'</span></td>'
        + '<td><span class="badge badge--gray" style="font-size:9px">'+r.branch+'</span></td>'
        + '<td style="text-align:right;font-weight:700;color:var(--accent)">'+(rk.unit==='만원' ? r.value.toLocaleString()+'만' : r.value+rk.unit)+'</td>'
        + '<td><div style="background:var(--bg-secondary);border-radius:4px;height:16px;overflow:hidden"><div style="width:'+pct+'%;height:100%;background:'+barColor+';border-radius:4px;transition:width .3s"></div></div></td>'
        + '</tr>';
    }).join('')
    + '</tbody></table>';
}

// 필터
var filterHtml = '<div class="filter-bar" style="margin-bottom:12px"><div class="filter-bar__row">'
  + '<div class="filter-bar__item"><label>소속</label><select class="form-select" id="f-team"><option value="">전체</option>'+TEAMS.map(function(t){return '<option>'+t+'</option>'}).join('')+'</select></div>'
  + '<div class="filter-bar__item"><label>지사</label><select class="form-select" id="f-branch"><option value="">전체</option>'+BRANCHES.map(function(b){return '<option>'+b+'</option>'}).join('')+'</select></div>'
  + '</div></div>';

content.innerHTML =
  '<div class="page-header"><div><h1 class="page-header__title">전사 8대 랭킹</h1>'
  + '<p class="page-header__subtitle">매니저별 실적을 8가지 지표로 순위 비교합니다</p></div></div>'
  + buildTabs() + filterHtml
  + '<div class="card"><div class="card__body" style="overflow-x:auto;padding:0" id="rank-table">' + buildRankTable(activeTab) + '</div></div>';

function bindTabs() {
  document.querySelectorAll('.tab-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      activeTab = btn.dataset.tab;
      refresh();
    });
  });
}

function refresh() {
  var team = document.getElementById('f-team').value;
  var branch = document.getElementById('f-branch').value;
  // 필터 적용
  rankings.forEach(function(rk){
    var base = genData(rk.unit);
    if (team) base = base.filter(function(r){return r.team===team});
    if (branch) base = base.filter(function(r){return r.branch===branch});
    base.forEach(function(r,i){r.rank=i+1});
    allData[rk.id] = base;
  });
  // 탭/테이블 재렌더링
  var tabArea = document.querySelector('.page-header').nextElementSibling;
  if (tabArea) {
    var parent = content;
    var cardEl = document.getElementById('rank-table');
    // 탭 버튼 업데이트
    document.querySelectorAll('.tab-btn').forEach(function(btn){
      btn.className = btn.dataset.tab === activeTab ? 'btn btn--primary btn--sm tab-btn' : 'btn btn--outline btn--sm tab-btn';
    });
    if (cardEl) cardEl.innerHTML = buildRankTable(activeTab);
  }
  bindTabs();
}

bindTabs();
['f-team','f-branch'].forEach(function(id){
  document.getElementById(id).addEventListener('change', refresh);
});
