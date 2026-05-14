/* ========================================
   미팅 현황
   회원별 약정 대비 미팅 횟수 모니터링
   - 계약유형: 기간제 / 횟수제
   - 빨간색: 약정기간 미팅 없음 (경고)
   - 핑크: 약정 관련 컬럼
   - 노란색: 기간 관련 컬럼
   ======================================== */
import { initLayout } from '@core/layout.js';
import { MockRegulars, MATCH_MANAGERS, BRANCHES, PROGRAMS } from '@mock/regulars.js';

initLayout({ pageId: 'meeting-stats', breadcrumbs: ['정회원 관리', '약속 및 미팅 관리', '미팅 현황'] });

var content = document.getElementById('content');

// 계약 유형 / 프로그램 데이터
var CONTRACT_TYPES = ['기간제', '횟수제'];

// Mock: 회원별 미팅 현황 데이터
var memberMeetingData = MockRegulars.map(function(m, idx) {
  var contractType = idx % 3 === 0 ? '횟수제' : '기간제';

  // 기간제: 약정 개월수 / 횟수제: 약정 횟수
  var contractMonths = contractType === '기간제' ? [6, 12, 12, 24, 6, 12, 18, 12][idx % 8] : 0;
  var contractCount = contractType === '횟수제' ? [5, 8, 10, 15, 20][idx % 5] : 0;

  // 계약 시작일 (Mock)
  var startOffset = (idx * 37 + 10) % 360;
  var contractStart = new Date(Date.now() - startOffset * 86400000);
  var contractStartStr = contractStart.getFullYear() + '-' + String(contractStart.getMonth()+1).padStart(2,'0') + '-' + String(contractStart.getDate()).padStart(2,'0');

  // 기간제: 만료일 계산
  var elapsedDays = Math.floor((Date.now() - contractStart.getTime()) / 86400000);
  var expireDate = null;
  var expireDateStr = '-';
  var isExpired = false;
  if (contractType === '기간제') {
    expireDate = new Date(contractStart.getTime() + contractMonths * 30 * 86400000);
  } else {
    // 횟수제: 계약일로부터 1개월 후
    expireDate = new Date(contractStart.getTime() + 30 * 86400000);
  }
  expireDateStr = expireDate.getFullYear() + '-' + String(expireDate.getMonth()+1).padStart(2,'0') + '-' + String(expireDate.getDate()).padStart(2,'0');
  isExpired = expireDate.getTime() < Date.now();

  // 미팅 횟수 (Mock)
  var totalMeetings = Math.floor(Math.random() * 7);
  // 일부는 미팅 0회로 설정 (경고 테스트용)
  if (idx % 7 === 0) totalMeetings = 0;

  // 미팅 날짜 (최신순 최대 5건)
  var meetDates = [];
  for (var j = 0; j < Math.min(totalMeetings, 5); j++) {
    var d = new Date(Date.now() - (j * 25 + Math.floor(Math.random() * 20)) * 86400000);
    meetDates.push(d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'));
  }

  // 최근 미팅일
  var lastMeetDate = meetDates.length > 0 ? meetDates[0] : null;
  var daysSinceLastMeet = lastMeetDate ? Math.floor((Date.now() - new Date(lastMeetDate).getTime()) / 86400000) : elapsedDays;

  // 경고 판단
  var warning = '';
  if (contractType === '기간제') {
    if (totalMeetings === 0 && elapsedDays >= 60) warning = 'danger';           // 60일 이상 미팅 0
    else if (daysSinceLastMeet > 60) warning = 'warn';                          // 60일 이상 미팅 없음
  } else {
    // 횟수제
    var remainCount = contractCount - totalMeetings;
    if (totalMeetings === 0) warning = 'danger';
    else if (remainCount <= 1) warning = 'complete';                            // 거의 소진
  }

  return {
    id: idx + 1,
    memberId: m.memberId,
    name: m.name,
    gender: m.gender,
    birthDate: m.birthDate ? m.birthDate.substring(0,10) : '-',
    program: m.program,
    branch: m.branch,
    manager: m.matchingManager,
    status: m.status,
    contractType: contractType,
    contractMonths: contractMonths,
    contractCount: contractCount,
    contractStart: contractStartStr,
    expireDateStr: expireDateStr,
    isExpired: isExpired,
    totalMeetings: totalMeetings,
    meetDates: meetDates,
    daysSinceLastMeet: daysSinceLastMeet,
    warning: warning,
  };
});

// 필터 옵션
var managerSet = [];
MockRegulars.forEach(function(m) { if (managerSet.indexOf(m.matchingManager) === -1) managerSet.push(m.matchingManager); });

// 카운트
var dangerCount = memberMeetingData.filter(function(m){return m.warning === 'danger'}).length;
var warnCount = memberMeetingData.filter(function(m){return m.warning === 'warn'}).length;
var expireSortDir = ''; // '' | 'asc' | 'desc'

function buildTable(data) {
  return '<table class="data-table data-table--compact" style="font-size:12px;width:100%"><thead><tr>'
    + '<th style="width:35px">No</th>'
    + '<th>회원명</th>'
    + '<th>성별</th>'
    + '<th>생년월일</th>'
    + '<th>담당</th>'
    + '<th>상태</th>'
    + '<th>계약</th>'
    + '<th>프로그램</th>'
    + '<th style="text-align:center">미팅횟수</th>'
    + '<th>계약시작</th>'
    + '<th style="cursor:pointer;user-select:none" id="th-expire">만료일 <span id="expire-arrow" style="font-size:10px;color:var(--text-muted)"></span></th>'
    + '</tr></thead><tbody>'
    + data.map(function(m) {
      // 계약정보 (통합)
      var contractInfo = m.contractType === '기간제'
        ? '<span class="badge badge--amber" style="font-size:10px">기간제(' + m.contractMonths + '개월)</span>'
        : '<span class="badge badge--purple" style="font-size:10px">횟수제(' + m.contractCount + '회)</span>';

      // 만료일
      var expireDisplay = m.expireDateStr;
      if (m.isExpired) expireDisplay += ' <span class="badge badge--red" style="font-size:9px">만료</span>';

      // 미팅횟수 + 툴팁 + 경고 색상
      var meetDanger = m.totalMeetings === 0 && m.warning === 'danger';
      var meetStyle = meetDanger ? 'color:#d32f2f;font-weight:700;' : '';
      var meetCountText = '<strong>' + m.totalMeetings + '</strong>회';
      var tooltipDates = m.meetDates.length > 0
        ? m.meetDates.map(function(d, i){ return (i+1) + '회: ' + d; }).join('&#10;')
        : '미팅 이력 없음';
      var meetCell = '<span title="' + tooltipDates + '" style="cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px;' + meetStyle + '">'
        + meetCountText + '</span>';

      return '<tr>'
        + '<td>' + m.id + '</td>'
        + '<td style="white-space:nowrap"><a href="/pages/regular/detail.html?id=' + m.id + '" style="color:var(--primary);text-decoration:underline;font-weight:600">' + m.name + '</a> <span style="color:var(--text-muted)">' + m.memberId + '</span></td>'
        + '<td><span class="badge badge--' + (m.gender==='남'?'blue':'pink') + '">' + m.gender + '</span></td>'
        + '<td style="white-space:nowrap">' + m.birthDate + '</td>'
        + '<td style="white-space:nowrap">' + m.manager + '</td>'
        + '<td><span class="badge badge--' + (m.status==='활동'?'green': m.status==='보류'?'amber':'gray') + '">' + m.status + '</span></td>'
        + '<td style="white-space:nowrap">' + contractInfo + '</td>'
        + '<td style="white-space:nowrap">' + m.program + '</td>'
        + '<td style="text-align:center">' + meetCell + '</td>'
        + '<td style="white-space:nowrap">' + m.contractStart + '</td>'
        + '<td style="white-space:nowrap">' + expireDisplay + '</td>'
        + '</tr>';
    }).join('')
    + '</tbody></table>';
}
content.innerHTML =
  '<div class="page-header">'
  + '  <div><h1 class="page-header__title">미팅 현황</h1>'
  + '    <p class="page-header__subtitle">회원별 약정 대비 미팅 횟수를 모니터링합니다</p></div>'
  + '  <div class="page-header__actions">'
  + (dangerCount > 0 ? '<span class="badge badge--red" style="font-size:12px;padding:5px 12px">위험 ' + dangerCount + '건</span>' : '')
  + (warnCount > 0 ? '<span class="badge badge--amber" style="font-size:12px;padding:5px 12px;margin-left:6px">주의 ' + warnCount + '건</span>' : '')
  + '  </div>'
  + '</div>'

  // 필터 바
  + '<div class="filter-bar" style="margin-bottom:12px"><div class="filter-bar__row">'
  + '  <div class="filter-bar__item"><label>계약유형</label><select class="form-select" id="filter-type"><option value="">전체</option><option>기간제</option><option>횟수제</option></select></div>'
  + '  <div class="filter-bar__item"><label>담당매니저</label><select class="form-select" id="filter-manager"><option value="">전체</option>' + managerSet.map(function(m){return '<option>'+m+'</option>'}).join('') + '</select></div>'
  + '  <div class="filter-bar__item"><label>지사</label><select class="form-select" id="filter-branch"><option value="">전체</option>' + BRANCHES.map(function(b){return '<option>'+b+'</option>'}).join('') + '</select></div>'
  + '  <div class="filter-bar__item"><label>상태</label><select class="form-select" id="filter-status"><option value="">전체</option><option>활동</option><option>보류</option><option>활동대기</option></select></div>'
  + '  <div class="filter-bar__item"><label>미팅</label><select class="form-select" id="filter-meeting"><option value="">전체</option><option value="none">미팅없음</option></select></div>'
  + '  <div class="filter-bar__search"><label>회원명</label><input class="form-input" id="filter-keyword" placeholder="이름 검색"></div>'
  + '</div></div>'

  // 테이블
  + '<div class="card"><div class="card__header"><div class="card__title">회원별 미팅 현황</div>'
  + '<div class="card__actions"><span style="font-size:11px;color:var(--text-muted)">총 <strong id="stats-count">' + memberMeetingData.length + '</strong>명</span></div></div>'
  + '<div class="card__body" style="overflow-x:auto;padding:0" id="stats-table">'
  + buildTable(memberMeetingData)
  + '</div></div>';

// 필터 이벤트
function applyFilter() {
  var type = document.getElementById('filter-type').value;
  var manager = document.getElementById('filter-manager').value;
  var branch = document.getElementById('filter-branch').value;
  var status = document.getElementById('filter-status').value;
  var meeting = document.getElementById('filter-meeting').value;
  var keyword = document.getElementById('filter-keyword').value.toLowerCase();

  var filtered = memberMeetingData.filter(function(m) {
    if (type && m.contractType !== type) return false;
    if (manager && m.manager !== manager) return false;
    if (branch && m.branch !== branch) return false;
    if (status && m.status !== status) return false;
    if (meeting === 'none' && m.totalMeetings !== 0) return false;
    if (keyword && m.name.toLowerCase().indexOf(keyword) === -1) return false;
    return true;
  });

  // 만료일 정렬
  if (expireSortDir === 'asc') {
    filtered.sort(function(a, b) { return new Date(a.expireDateStr) - new Date(b.expireDateStr); });
  } else if (expireSortDir === 'desc') {
    filtered.sort(function(a, b) { return new Date(b.expireDateStr) - new Date(a.expireDateStr); });
  }

  document.getElementById('stats-table').innerHTML = buildTable(filtered);
  document.getElementById('stats-count').textContent = filtered.length;
  bindExpireSort();
}

function bindExpireSort() {
  var th = document.getElementById('th-expire');
  var arrow = document.getElementById('expire-arrow');
  if (expireSortDir === 'asc') arrow.textContent = '▲';
  else if (expireSortDir === 'desc') arrow.textContent = '▼';
  else arrow.textContent = '▲▼';
  th.onclick = function() {
    if (expireSortDir === '') expireSortDir = 'asc';
    else if (expireSortDir === 'asc') expireSortDir = 'desc';
    else expireSortDir = '';
    applyFilter();
  };
}

['filter-type','filter-manager','filter-branch','filter-status','filter-meeting'].forEach(function(id) {
  document.getElementById(id).addEventListener('change', applyFilter);
});
document.getElementById('filter-keyword').addEventListener('input', applyFilter);
bindExpireSort();
