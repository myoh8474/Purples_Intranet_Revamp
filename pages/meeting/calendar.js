/* ========================================
   약속조회 - 풀사이즈 캘린더 + 클릭 시 모달
   ======================================== */
import { initLayout } from '@core/layout.js';
import { Toast } from '@components/Toast.js';
import { Modal } from '@components/Modal.js';
import { MockRegulars, MATCH_MANAGERS, BRANCHES } from '@mock/regulars.js';

initLayout({ pageId: 'meeting-calendar', breadcrumbs: ['정회원 관리', '약속 및 미팅 관리', '약속/미팅 조회'] });

var content = document.getElementById('content');
var today = new Date();
var currentYear = today.getFullYear();
var currentMonth = today.getMonth();

// Mock 약속 데이터
var placeNames = ['강남 카페A','서초 레스토랑B','종로 라운지C','홍대 카페D','여의도 호텔E','압구정 카페F','분당 레스토랑G','판교 라운지H'];
var statuses = ['확정','확정','확정','대기','확정','확정','대기','확정','취소','확정'];
var statusColors = { '확정': 'green', '대기': 'amber', '취소': 'red' };
var allAppointments = [];

for (var i = 0; i < 35; i++) {
  var day = Math.floor(Math.random() * 28) + 1;
  var hour = 10 + Math.floor(Math.random() * 10);
  var min = Math.random() > 0.5 ? '00' : '30';
  var mIdx = (i * 3) % MockRegulars.length;
  var fIdx = (i * 3 + 7) % MockRegulars.length;
  allAppointments.push({
    id: i + 1,
    date: currentYear + '-' + String(currentMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0'),
    time: String(hour).padStart(2, '0') + ':' + min,
    memberA: MockRegulars[mIdx].name, genderA: MockRegulars[mIdx].gender,
    memberB: MockRegulars[fIdx].name, genderB: MockRegulars[fIdx].gender,
    place: placeNames[i % placeNames.length],
    status: statuses[i % statuses.length],
    manager: MATCH_MANAGERS[i % MATCH_MANAGERS.length],
  });
}

function getApptMap() {
  var map = {};
  allAppointments.forEach(function(a) { if (!map[a.date]) map[a.date] = []; map[a.date].push(a); });
  return map;
}

function renderCalendar(year, month) {
  var apptMap = getApptMap();
  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  var todayStr = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');

  var nav = '<div class="cal-nav">'
    + '<button class="btn btn--outline btn--sm" id="cal-prev">◀</button>'
    + '<span class="cal-title">' + year + '년 ' + monthNames[month] + '</span>'
    + '<button class="btn btn--outline btn--sm" id="cal-next">▶</button>'
    + '<button class="btn btn--outline btn--sm" id="cal-today" style="margin-left:12px">오늘</button>'
    + '</div>';

  var html = '<div class="cal-grid">';
  ['일','월','화','수','목','금','토'].forEach(function(d, idx) {
    var c = idx===0?'color:#d32f2f':idx===6?'color:#1565c0':'';
    html += '<div class="cal-header" style="'+c+'">'+d+'</div>';
  });
  for (var b = 0; b < firstDay; b++) html += '<div class="cal-cell cal-cell--empty"></div>';

  for (var d = 1; d <= daysInMonth; d++) {
    var ds = year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    var dow = new Date(year,month,d).getDay();
    var appts = apptMap[ds] || [];
    var cls = 'cal-cell';
    if (ds === todayStr) cls += ' cal-cell--today';
    if (appts.length > 0) cls += ' cal-cell--has-event';
    var dc = dow===0?'color:#d32f2f':dow===6?'color:#1565c0':'';

    html += '<div class="'+cls+'" data-date="'+ds+'">';
    html += '<div class="cal-day" style="'+dc+'">'+d+'</div>';
    if (appts.length > 0) {
      appts.sort(function(a,b){return a.time.localeCompare(b.time)});
      var show = appts.slice(0, 3);
      html += '<div class="cal-events">';
      show.forEach(function(a) {
        var ck = a.status==='확정'?'green':a.status==='대기'?'amber':'red';
        html += '<div class="cal-ev cal-ev--'+ck+'">'
          + '<span class="cal-ev-time">'+a.time+'</span> '
          + '<span class="cal-ev-name">'+a.memberA+'↔'+a.memberB+'</span>'
          + ' <span class="cal-ev-place">'+a.place+'</span>'
          + '</div>';
      });
      if (appts.length > 3) html += '<div class="cal-ev-more">+'+(appts.length-3)+'건 더보기</div>';
      html += '</div>';
    }
    html += '</div>';
  }
  html += '</div>';
  return nav + html;
}

// 스타일
var css = '<style>'
  + '.cal-nav { display:flex; align-items:center; gap:12px; margin-bottom:16px; }'
  + '.cal-title { font-size:20px; font-weight:700; min-width:160px; text-align:center; }'
  + '.cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:1px; background:var(--border-color); border:1px solid var(--border-color); border-radius:var(--radius-sm); overflow:hidden; }'
  + '.cal-header { padding:10px 4px; text-align:center; font-size:13px; font-weight:700; background:var(--bg-secondary); }'
  + '.cal-cell { min-height:110px; padding:6px 8px; background:var(--bg-primary); cursor:pointer; transition:background .15s; }'
  + '.cal-cell:hover { background:var(--bg-hover,#f0f4ff); }'
  + '.cal-cell--empty { background:var(--bg-secondary); cursor:default; }'
  + '.cal-cell--empty:hover { background:var(--bg-secondary); }'
  + '.cal-cell--today { background:#e8f5e9 !important; }'
  + '.cal-cell--today:hover { background:#c8e6c9 !important; }'
  + '.cal-cell--today .cal-day { background:#2e7d32; color:#fff; }'
  + '.cal-day { font-size:13px; font-weight:700; margin-bottom:4px; display:inline-block; width:24px; height:24px; line-height:24px; text-align:center; border-radius:50%; }'
  + '.cal-events { display:flex; flex-direction:column; gap:2px; }'
  + '.cal-ev { font-size:11px; padding:2px 5px; border-radius:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; border-left:3px solid transparent; line-height:1.4; }'
  + '.cal-ev--green { background:#e8f5e9; border-left-color:#43a047; color:#2e7d32; }'
  + '.cal-ev--amber { background:#fff8e1; border-left-color:#f9a825; color:#e65100; }'
  + '.cal-ev--red { background:#ffebee; border-left-color:#e53935; color:#c62828; }'
  + '.cal-ev-time { font-weight:700; }'
  + '.cal-ev-name { }'
  + '.cal-ev-place { font-size:9px; color:var(--text-muted); }'
  + '.cal-ev-more { font-size:10px; color:var(--primary); padding:2px 5px; cursor:pointer; font-weight:600; }'
  + '</style>';

content.innerHTML = css
  + '<div class="page-header"><div><h1 class="page-header__title">약속/미팅 조회</h1>'
  + '<p class="page-header__subtitle">캘린더에서 약속 및 미팅 현황을 한눈에 확인합니다. 날짜 클릭 시 상세 조회.</p></div>'
  + '<div class="page-header__actions"><button class="btn btn--outline" id="btn-place-manage" style="font-size:12px">약속장소 관리</button></div></div>'
  + '<div class="card"><div class="card__body" id="calendar-area">' + renderCalendar(currentYear, currentMonth) + '</div></div>';

function bindAll() {
  document.getElementById('cal-prev').onclick = function(){ currentMonth--; if(currentMonth<0){currentMonth=11;currentYear--;} refresh(); };
  document.getElementById('cal-next').onclick = function(){ currentMonth++; if(currentMonth>11){currentMonth=0;currentYear++;} refresh(); };
  document.getElementById('cal-today').onclick = function(){ currentYear=today.getFullYear(); currentMonth=today.getMonth(); refresh(); };
  document.querySelectorAll('.cal-cell[data-date]').forEach(function(c){
    c.onclick = function(){ showDayModal(c.dataset.date); };
  });
}
function refresh() {
  document.getElementById('calendar-area').innerHTML = renderCalendar(currentYear, currentMonth);
  bindAll();
}
bindAll();

// 날짜 클릭 모달
function showDayModal(dateStr) {
  var dayNames = ['일','월','화','수','목','금','토'];
  var dt = new Date(dateStr);
  var appts = allAppointments.filter(function(a){return a.date===dateStr});
  appts.sort(function(a,b){return a.time.localeCompare(b.time)});
  var confirmed = appts.filter(function(a){return a.status==='확정'}).length;
  var pending = appts.filter(function(a){return a.status==='대기'}).length;

  var summary = '<div style="display:flex;gap:8px;margin-bottom:12px">'
    + '<span class="badge badge--green" style="font-size:11px;padding:4px 10px">확정 '+confirmed+'</span>'
    + '<span class="badge badge--amber" style="font-size:11px;padding:4px 10px">대기 '+pending+'</span>'
    + '<span style="flex:1"></span><span style="font-size:12px;color:var(--text-muted)">총 <strong>'+appts.length+'</strong>건</span></div>';

  var body = appts.length === 0
    ? '<div style="text-align:center;padding:30px;color:var(--text-muted)">등록된 약속이 없습니다.</div>'
    : '<table class="data-table data-table--compact" style="font-size:12px"><thead><tr><th>시간</th><th>회원 A</th><th>회원 B</th><th>장소</th><th>상태</th><th>담당</th></tr></thead><tbody>'
      + appts.map(function(a){
        var rs = a.status==='취소'?' style="opacity:.5;text-decoration:line-through"':'';
        return '<tr'+rs+'><td style="font-weight:700;color:var(--accent)">'+a.time+'</td>'
          +'<td style="white-space:nowrap">'+a.memberA+' <span class="badge badge--'+(a.genderA==='남'?'blue':'pink')+'">'+a.genderA+'</span></td>'
          +'<td style="white-space:nowrap">'+a.memberB+' <span class="badge badge--'+(a.genderB==='남'?'blue':'pink')+'">'+a.genderB+'</span></td>'
          +'<td>'+a.place+'</td><td><span class="badge badge--'+statusColors[a.status]+'">'+a.status+'</span></td><td>'+a.manager+'</td></tr>';
      }).join('') + '</tbody></table>';

  Modal.show({ title: dateStr+' ('+dayNames[dt.getDay()]+') 약속 현황', size:'xl', content: summary+body,
    footer:'<button class="btn btn--outline" id="modal-day-close">닫기</button>' });
  setTimeout(function(){ var b=document.getElementById('modal-day-close'); if(b)b.onclick=function(){Modal.hide()}; },50);
}

/* === 약속장소 관리 모달 === */
var REGIONS = ['강남','서초','송파','강동','마포','종로','용산','영등포','여의도','분당','판교','일산','기타'];
var meetingPlaces = [
  { id:1,branch:'본사',region:'강남',name:'카페 드 파리',phone:'02-598-0017',address:'서울 서초구 서초대로74길 11',hours:'10:00~22:00',parking:true,meal:false },
  { id:2,branch:'본사',region:'강남',name:'라 베로나',phone:'02-3481-1281',address:'강남역 5번출구 노루목빌딩',hours:'11:00~21:30',parking:false,meal:true },
  { id:3,branch:'본사',region:'강남',name:'1886',phone:'02/555-6794',address:'강남구 7번 출구 cgv건물 5층',hours:'11:00~22:00',parking:true,meal:true },
  { id:4,branch:'본사',region:'서초',name:'아티제',phone:'02-3474-1180',address:'서초역 4번출구 교보빌딩 1층',hours:'08:00~22:00',parking:true,meal:false },
];

function showPlaceListModal() {
  var tbl = '<table class="data-table data-table--compact" style="font-size:11px"><thead><tr><th>지사</th><th>지역</th><th>상호명</th><th>연락처</th><th>주소</th><th>영업시간</th><th>주차</th><th>식사</th></tr></thead><tbody>'
    + meetingPlaces.map(function(p){return '<tr><td><span class="badge badge--blue" style="font-size:10px">'+p.branch+'</span></td><td><span class="badge badge--purple" style="font-size:10px">'+p.region+'</span></td><td style="font-weight:600">'+p.name+'</td><td style="font-family:monospace;font-size:10px">'+p.phone+'</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+p.address+'">'+p.address+'</td><td style="font-size:10px">'+p.hours+'</td><td style="text-align:center">'+(p.parking?'O':'X')+'</td><td style="text-align:center">'+(p.meal?'O':'X')+'</td></tr>'}).join('')
    + '</tbody></table>';
  Modal.show({ title:'약속장소 관리', size:'xl', content:tbl, footer:'<button class="btn btn--outline" id="modal-close-btn">닫기</button>' });
  setTimeout(function(){ var b=document.getElementById('modal-close-btn'); if(b)b.onclick=function(){Modal.hide()}; },50);
}
document.getElementById('btn-place-manage').addEventListener('click', showPlaceListModal);
