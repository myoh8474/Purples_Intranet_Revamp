/* 매칭정보 탭 — 좌: 메모장+특이사항+미팅리스트 / 우: 소개장 */
import { Formatters } from '@utils/formatters.js';
import { MockRegulars } from '@mock/regulars.js';
import { Toast } from '@components/Toast.js';
import { Modal } from '@components/Modal.js';
import { PlaceSearch } from '@components/PlaceSearch.js';
import { Auth } from '@core/auth.js';

var CS = 'text-align:center;white-space:nowrap;vertical-align:middle';
var LBL = 'background:var(--bg-secondary);font-weight:600;color:#888;text-align:center';

/* ── 소개장 뱃지 ── */
function resultBadge(r) {
  if (!r || r === '대기중') return '<span class="badge badge--gray">대기중</span>';
  var m = { '수락': 'green', '거절': 'red', '보류': 'amber' };
  return '<span class="badge badge--' + (m[r] || 'gray') + '">' + r + '</span>';
}
function profileBadge(status, date, resend, result) {
  if (!status || status === '프로필발송') return '<button class="btn btn--primary btn--xs btn-profile-send" style="padding:2px 8px;font-size:12px">✉ 프로필발송</button>';
  if (status === '발송완료') {
    // 재발송 안 함 + 7일 경과 + 결과 대기중 → 재발송 버튼
    if (resend !== 'Y' && result === '대기중' && date) {
      var sent = new Date(date);
      var now = new Date();
      var diff = (now - sent) / (1000 * 60 * 60 * 24);
      if (diff >= 7) return '<button class="btn btn--outline btn--xs btn-profile-resend" style="padding:2px 8px;font-size:12px">✉ 프로필재발송</button>';
    }
    return '<span style="color:#10b981;font-weight:600">발송완료</span>' + (date ? '<span style="display:block;font-size:12px;color:var(--text-muted)">' + date + '</span>' : '');
  }
  if (status === '재발송완료') return '<span style="color:#f59e0b;font-weight:600">재발송완료</span>' + (date ? '<span style="display:block;font-size:12px;color:var(--text-muted)">' + date + '</span>' : '');
  return '<button class="btn btn--primary btn--xs btn-profile-send" style="padding:2px 8px;font-size:12px">✉ ' + status + '</button>';
}

/* ── 메모 카테고리 정의 ── */
var MEMO_CATS = {
  '통화':     { color: '#3b82f6', icon: '', auto: false },
  'SMS':      { color: '#8b5cf6', icon: '', auto: true },
  '신규인사':  { color: '#10b981', icon: '', auto: true },
  '협의상담':  { color: '#f59e0b', icon: '', auto: false },
  '서류':     { color: '#6366f1', icon: '', auto: false },
  '클레임':   { color: '#ef4444', icon: '', auto: false },
  '탈회':     { color: '#dc2626', icon: '', auto: false },
  '상태변경':  { color: '#64748b', icon: '', auto: true },
};

/* ── 메모장 더미 (20건+) ── */
function genMemos(m) {
  return [
    { id:1,  date:'2026.05.28 14:22', writer:'오영수', type:'통화', content:'지식원소개 - 관심 높음, 프로필 발송 요청', pinned:true },
    { id:2,  date:'2026.05.27 11:05', writer:'오영수', type:'통화', content:'김경호 선소개 - 나이대 맞고 직업군 선호', pinned:true },
    { id:3,  date:'2026.05.26 09:30', writer:'시스템', type:'SMS', content:'[프로필발송] 김영희님 프로필이 발송되었습니다.', pinned:false },
    { id:4,  date:'2026.05.25 16:40', writer:'이혜영', type:'통화', content:'전배우자 정씨라 "정"씨 성을 가진분 기피함. 메모 필수.', pinned:false },
    { id:5,  date:'2026.05.24 10:15', writer:'시스템', type:'상태변경', content:'활동대기 → 활동 (인증완료)', pinned:false },
    { id:6,  date:'2026.05.23 17:38', writer:'오영수', type:'통화', content:'이석윤 선소개 - 주말 미팅 가능여부 확인', pinned:false },
    { id:7,  date:'2026.05.22 14:20', writer:'시스템', type:'신규인사', content:'[신규인사] 안녕하세요, 퍼플스입니다. 담당 매니저 오영수입니다.', pinned:false },
    { id:8,  date:'2026.05.21 13:54', writer:'오영수', type:'협의상담', content:'상의해서 곽정호 황남철 정주두 소개 진행키로 함', pinned:false },
    { id:9,  date:'2026.05.20 11:30', writer:'김인증', type:'서류', content:'졸업증명서 원본 수령 완료, 재직증명서 추가 요청', pinned:false },
    { id:10, date:'2026.05.19 09:45', writer:'시스템', type:'SMS', content:'[미팅안내] 5/22(목) 오후2시 롯데호텔 라운지', pinned:false },
    { id:11, date:'2026.05.18 16:25', writer:'오영수', type:'통화', content:'황남철 정주두 김진우 선소개 - 3명 동시 진행', pinned:false },
    { id:12, date:'2026.05.17 14:10', writer:'박상담', type:'클레임', content:'프로필 사진 불만 - 실물과 다르다는 피드백', pinned:true },
    { id:13, date:'2026.05.16 10:00', writer:'시스템', type:'상태변경', content:'신규 → 인증중 (서류접수)', pinned:false },
    { id:14, date:'2026.05.15 15:33', writer:'오영수', type:'협의상담', content:'본인 키 173cm 이상 희망 → 170cm로 조정 합의', pinned:false },
    { id:15, date:'2026.05.14 11:20', writer:'시스템', type:'SMS', content:'[소개장수락] 임지호님이 프로필을 수락하였습니다.', pinned:false },
    { id:16, date:'2026.05.13 09:15', writer:'김인증', type:'서류', content:'소득증빙 서류 미비 - 재제출 요청 발송', pinned:false },
    { id:17, date:'2026.05.12 17:00', writer:'오영수', type:'통화', content:'주말 미팅 일정 조율 - 토요일 오후 선호', pinned:false },
    { id:18, date:'2026.05.11 13:45', writer:'시스템', type:'신규인사', content:'[가입환영] 퍼플스 가입을 환영합니다. 서류 안내 발송.', pinned:false },
    { id:19, date:'2026.05.10 10:30', writer:'이혜영', type:'통화', content:'어머니 통화 - 아들 매칭 진행상황 문의', pinned:false },
    { id:20, date:'2026.05.09 16:50', writer:'박상담', type:'탈회', content:'탈회 의사 문의 - 일시 보류 전환으로 설득 완료', pinned:false },
    { id:21, date:'2026.05.08 14:15', writer:'시스템', type:'상태변경', content:'보류 → 활동 (보류 해제)', pinned:false },
    { id:22, date:'2026.05.07 11:00', writer:'오영수', type:'통화', content:'소개장 발송 전 선호도 재확인', pinned:false },
  ];
}

/* ── 소개장 더미 ── */
function genIntros(m) {
  var femNames = ['김영희','박서연','이지은','한소희','윤지아','최민아','정다은','오수진','임하윤','송예린'];
  var malNames = ['이영수','임지호','정우진','김도윤','오태현','박민수','최성준','한재원','강현우','윤시우'];
  var profiles = ['프로필발송','발송완료','발송완료','재발송완료','발송완료','프로필발송','발송완료','발송완료','프로필발송','발송완료'];
  var resultPool = ['대기중','수락','거절','대기중','수락','대기중','보류','수락','대기중','거절'];
  var list = [];
  for (var i = 1; i <= 20; i++) {
    var d = new Date(2026, 0, 15 + i);
    var ds = d.getFullYear() + '.' + ('0'+(d.getMonth()+1)).slice(-2) + '.' + ('0'+d.getDate()).slice(-2);
    var p1 = profiles[i % 10], p2 = profiles[(i+3) % 10];
    var r1 = resultPool[i % 10], r2 = resultPool[(i+1) % 10];
    var pd1 = (p1 === '발송완료' || p1 === '재발송완료') ? '2026.0' + (1 + i%3) + '.' + ('0'+(10+i%15)).slice(-2) : '';
    var pd2 = (p2 === '발송완료' || p2 === '재발송완료') ? '2026.0' + (1 + i%3) + '.' + ('0'+(12+i%15)).slice(-2) : '';
    var rs1 = p1 === '재발송완료' ? 'Y' : 'N';
    var rs2 = p2 === '재발송완료' ? 'Y' : 'N';
    var rd1 = r1 !== '대기중' ? '2026.0' + (2 + i%3) + '.' + ('0'+(5+i%20)).slice(-2) : '';
    var rd2 = r2 !== '대기중' ? '2026.0' + (2 + i%3) + '.' + ('0'+(7+i%20)).slice(-2) : '';
    // 3건은 양측 수락으로 설정
    if (i === 1 || i === 8 || i === 15) { r1 = '수락'; r2 = '수락'; p1 = '발송완료'; p2 = '발송완료'; pd1 = '2026.02.01'; pd2 = '2026.02.01'; rd1 = '2026.02.10'; rd2 = '2026.02.12'; }
    list.push({ id: i, regDate: ds, rows: [
      { name: femNames[i % 10], profile: p1, profileDate: pd1, resend: rs1, result: r1, resultDate: rd1 },
      { name: malNames[i % 10], profile: p2, profileDate: pd2, resend: rs2, result: r2, resultDate: rd2 }
    ]});
  }
  return list;
}

/* ── 특이사항 더미 ── */
function genSpecialNotes(m) {
  var notes = m.specialNotes || [];
  return notes.slice(0, 6);
}

/* ── 미팅 리스트 더미 ── */
function genMeetings(m) {
  var names = ['김미봉','최서연','박하은','이지아','정수민','한예진','오다은','윤서영','장민지','송지우'];
  var places = ['롯데호텔 부산','하얏트 서울','신라호텔 라운지','JW메리어트 카페','힐튼 로비','인터컨티넨탈 라운지','그랜드 워커힐','포시즌스 카페','웨스틴 조선 라운지','반얀트리 서울'];
  var results = ['호감','비호감','호감','보류','호감','비호감','호감','호감','보류','호감'];
  var reviews = [
    '성격도 매너도 너무 좋아요~^^','생각보다 소극적이셨어요','대화가 잘 통해서 좋았습니다','조금 더 생각해보겠습니다',
    '밝고 유머감각이 좋으세요','스타일이 안 맞는 것 같아요','다시 만나고 싶어요','매우 인상이 좋았습니다',
    '좀 더 알아가고 싶어요','첫인상이 좋았어요'
  ];
  var list = [];
  // 5가입 차수별 미팅 분배: 1~4 → 5가입(현재), 5~10 → 4가입, 11~16 → 3가입, 17~22 → 2가입, 23~30 → 1가입
  var seqRanges = [{max:4,seq:5},{max:10,seq:4},{max:16,seq:3},{max:22,seq:2},{max:30,seq:1}];
  for (var i = 1; i <= 30; i++) {
    var d = new Date(2025, 11, 30 - i);
    var ds = d.getFullYear().toString().slice(2) + '년 ' + (d.getMonth()+1) + '월 ' + d.getDate() + '일';
    var n1 = names[i % 10], n2 = names[(i + 3) % 10];
    var rd = d.toISOString().slice(0,10);
    var seq = 1;
    for (var si = 0; si < seqRanges.length; si++) { if (i <= seqRanges[si].max) { seq = seqRanges[si].seq; break; } }
    list.push({ id: i, enrollmentSeq: seq, registrant: ['이다솜','서다현','강보라','정유리','최은별'][i%5], regDate: rd,
      dateTime: ds + ' 오후 ' + (1 + i%4) + '시', place: places[i%10],
      members: [
        { name: n1, result: results[i%10], review: reviews[i%10], reviewDate: rd },
        { name: n2, result: results[(i+1)%10], review: reviews[(i+1)%10], reviewDate: rd }
      ]
    });
  }
  return list;
}
/* ── 메모 테이블 행 렌더 ── */
function renderMemoRow(memo, isPinned) {
  var cat = MEMO_CATS[memo.type] || { color: '#666', auto: false };
  var rowStyle = isPinned ? 'background:#fff7ed;' : '';
  var h = '<tr class="memo-row" data-type="' + memo.type + '" data-id="' + memo.id + '" style="' + rowStyle + '">';
  h += '<td style="text-align:center;padding:4px 6px;vertical-align:middle;white-space:nowrap"><span style="color:' + cat.color + ';font-weight:600">' + memo.type + '</span></td>';
  h += '<td style="text-align:center;padding:4px 6px;vertical-align:middle;white-space:nowrap">' + memo.writer + '</td>';
  h += '<td style="padding:4px 8px;vertical-align:middle;line-height:1.4">' + memo.content + '</td>';
  h += '<td style="text-align:center;padding:4px 6px;vertical-align:middle;white-space:nowrap;color:#aaa;font-size:12px">' + memo.date + '</td>';
  h += '</tr>';
  return h;
}

/* ── 메모 테이블 생성 ── */
function buildMemoTable(pinned, normal, maxNormal) {
  var h = '<table class="data-table data-table--bordered data-table--no-outer data-table--keep-bottom" id="tbl-memo" style="table-layout:fixed;width:100%">';
  h += '<colgroup><col style="width:80px"><col style="width:60px"><col><col style="width:140px"></colgroup>';
  h += '<thead><tr>';
  h += '<th style="' + LBL + '">구분</th>';
  h += '<th style="' + LBL + '">작성자</th>';
  h += '<th style="' + LBL + '">내용</th>';
  h += sortableHeader('일시', 'tbl-memo', 3, 'date');
  h += '</tr></thead><tbody>';
  pinned.forEach(function(x) { h += renderMemoRow(x, true); });
  normal.slice(0, maxNormal).forEach(function(x) { h += renderMemoRow(x, false); });
  if (pinned.length === 0 && normal.length === 0) {
    h += '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted)">해당 카테고리의 메모가 없습니다.</td></tr>';
  }
  h += '</tbody></table>';
  return h;
}

/* ── 공통 정렬 유틸 ── */
function sortableHeader(text, tableId, colIdx, type) {
  // type: 'num' | 'date' | 'text'
  var defaultDir = type === 'date' ? 'desc' : '';
  var defaultArrow = type === 'date' ? '▼' : '';
  return '<th style="' + LBL + ';cursor:pointer;user-select:none" class="sortable-th" data-table="' + tableId + '" data-col="' + colIdx + '" data-type="' + type + '"' + (defaultDir ? ' data-dir="' + defaultDir + '"' : '') + '>' + text + ' <span class="sort-arrow" style="font-size:8px;color:' + (defaultArrow ? '#666' : '#aaa') + '">' + defaultArrow + '</span></th>';
}

function bindSortableHeaders() {
  document.querySelectorAll('.sortable-th').forEach(function(th) {
    th.addEventListener('click', function() {
      var tblId = th.dataset.table;
      var colIdx = parseInt(th.dataset.col);
      var type = th.dataset.type;
      var dir = th.dataset.dir === 'asc' ? 'desc' : 'asc';
      // 같은 테이블의 다른 헤더 초기화
      document.querySelectorAll('.sortable-th[data-table="' + tblId + '"]').forEach(function(h) {
        h.dataset.dir = ''; h.querySelector('.sort-arrow').textContent = '';
      });
      th.dataset.dir = dir;
      th.querySelector('.sort-arrow').textContent = dir === 'asc' ? '▲' : '▼';
      var tbody = document.querySelector('#' + tblId + ' tbody');
      if (!tbody) return;
      var rows = Array.from(tbody.querySelectorAll('tr'));
      // rowspan 그룹화
      var groups = [];
      for (var i = 0; i < rows.length;) {
        var tds = rows[i].querySelectorAll('td');
        var firstTd = tds[0];
        var span = firstTd ? parseInt(firstTd.getAttribute('rowspan')) || 1 : 1;
        var cell = tds[colIdx];
        // data-sort-val 속성이 있으면 우선 사용
        var val = cell ? (cell.getAttribute('data-sort-val') || cell.textContent.trim()) : '';
        var group = [];
        for (var j = 0; j < span && (i + j) < rows.length; j++) group.push(rows[i + j]);
        groups.push({ val: val, rows: group });
        i += span;
      }
      // 날짜 파싱 헬퍼
      function parseDateVal(s) {
        if (!s) return 0;
        // ISO 형식 (2025-12-29) 우선 체크
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s).getTime() || 0;
        var clean = s.replace(/[년월일]/g, '.').replace(/\s+/g, ' ').trim();
        var parts = clean.split(' ');
        var datePart = parts[0].split('.');
        if (datePart.length < 3) return 0;
        var y = parseInt(datePart[0]); var mo = parseInt(datePart[1]); var d = parseInt(datePart[2]);
        if (y < 100) y += 2000;
        var h = 0, mi = 0;
        if (parts[1]) { var tp = parts[1].split(':'); h = parseInt(tp[0]) || 0; mi = parseInt(tp[1]) || 0; }
        return new Date(y, mo - 1, d, h, mi).getTime();
      }
      groups.sort(function(a, b) {
        if (type === 'num') { var na = parseInt(a.val)||0, nb = parseInt(b.val)||0; return dir === 'asc' ? na - nb : nb - na; }
        if (type === 'date') {
          var da = parseDateVal(a.val), db = parseDateVal(b.val);
          return dir === 'asc' ? da - db : db - da;
        }
        return dir === 'asc' ? a.val.localeCompare(b.val) : b.val.localeCompare(a.val);
      });
      groups.forEach(function(g) { g.rows.forEach(function(r) { tbody.appendChild(r); }); });
    });
  });
}

/* ══════════════════════════════════════
   메인 렌더
   ══════════════════════════════════════ */
export function renderMatchingInfo(m) {
  var memos = genMemos(m);
  var intros = genIntros(m);
  var specials = genSpecialNotes(m);
  var meetings = genMeetings(m);

  var CARD = 'mcard';
  var CARD_HDR = 'mcard__header';
  var CARD_BODY = 'mcard__body';

  var html = '<div style="display:grid;grid-template-columns:3fr 2fr;gap:16px;align-items:stretch">';

  /* ── 메모장 (좌상) ── */
  html += '<div class="' + CARD + '">';
  html += '<div class="' + CARD_HDR + '">';
  html += '<span class="mcard__title">메모장</span>';
  html += '<div style="display:flex;gap:4px">';
  html += '<button class="btn btn--outline btn--sm" id="btn-memo-add" style="padding:2px 8px;font-size:11px">+ 등록</button>';
  html += '<button class="btn btn--outline btn--sm" id="btn-memo-all" style="padding:2px 8px;font-size:11px">전체보기</button>';
  html += '</div></div>';
  // 필터 행
  html += '<div class="mcard__filter">';
  html += '<select class="form-input" id="memo-filter-select" style="padding:3px 6px;width:100px;font-size:12px">';
  html += '<option value="전체">구분: 전체</option>';
  Object.keys(MEMO_CATS).forEach(function(cat) { html += '<option value="' + cat + '">' + cat + '</option>'; });
  html += '</select>';
  html += '<input type="date" class="form-input" id="memo-date-from" style="padding:3px 4px;width:120px;font-size:11px">';
  html += '<span style="color:var(--text-muted);font-size:11px">~</span>';
  html += '<input type="date" class="form-input" id="memo-date-to" style="padding:3px 4px;width:120px;font-size:11px">';
  html += '<button class="btn btn--primary btn--sm" id="btn-memo-search" style="padding:2px 8px;font-size:11px">검색</button>';
  html += '</div>';

  // 메모 테이블 (고정항목 + 일반 10건, 스크롤)
  var pinnedMemos = memos.filter(function(x) { return x.pinned; });
  var normalMemos = memos.filter(function(x) { return !x.pinned; });

  html += '<div class="' + CARD_BODY + '" id="memo-timeline">';
  html += buildMemoTable(pinnedMemos, normalMemos, 10);
  html += '</div>';
  html += '</div>';

  /* ── 특이사항 (우상) ── */
  html += '<div class="' + CARD + '">';
  html += '<div class="' + CARD_HDR + '">';
  html += '<span class="mcard__title">특이사항</span>';
  html += '<button class="btn btn--outline btn--sm" id="btn-add-special-note" style="font-size:11px;padding:2px 10px">등록</button>';
  html += '</div>';
  // 필터 행 (메모장과 동일 형태)
  html += '<div class="mcard__filter">';
  html += '<select class="form-input" id="sn-filter-select" style="padding:3px 6px;width:100px;font-size:12px">';
  html += '<option value="전체">구분: 전체</option>';
  ['관리','상담','매칭'].forEach(function(t) { html += '<option value="' + t + '">' + t + '</option>'; });
  html += '</select>';
  html += '<input type="date" class="form-input" id="sn-date-from" style="padding:3px 4px;width:120px;font-size:11px">';
  html += '<span style="color:var(--text-muted);font-size:11px">~</span>';
  html += '<input type="date" class="form-input" id="sn-date-to" style="padding:3px 4px;width:120px;font-size:11px">';
  html += '<button class="btn btn--primary btn--sm" id="btn-sn-search" style="padding:2px 8px;font-size:11px">검색</button>';
  html += '</div>';
  html += '<div class="' + CARD_BODY + '">';
  html += '<table class="data-table data-table--bordered data-table--no-outer data-table--keep-bottom" id="tbl-special-notes" style="table-layout:fixed;width:100%">';
  html += '<colgroup><col style="width:8%"><col style="width:12%"><col style="width:8%"><col style="width:16%"><col style="width:56%"></colgroup>';
  html += '<thead><tr>' + sortableHeader('번호', 'tbl-special-notes', 0, 'num') + '<th style="' + LBL + '">작성자</th><th style="' + LBL + '">구분</th>' + sortableHeader('일시', 'tbl-special-notes', 3, 'date') + '<th style="' + LBL + '">내용</th></tr></thead><tbody>';
  specials.forEach(function(n, i) {
    html += '<tr class="sn-row" data-sn-type="' + (n.type || '') + '" data-sn-date="' + (n.rawDate || n.date || '') + '">';
    html += '<td style="text-align:center">' + (i + 1) + '</td>';
    html += '<td style="text-align:center">' + (n.writer || '-') + '</td>';
    html += '<td style="text-align:center;font-weight:600;color:' + (n.type === '관리' ? '#3b82f6' : n.type === '상담' ? '#10b981' : '#f59e0b') + '">' + (n.type || '-') + '</td>';
    html += '<td style="text-align:center;white-space:nowrap;font-size:12px;color:#666">' + (n.date || '-') + '</td>';
    html += '<td style="line-height:1.5">' + (n.content || '-') + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  html += '</div>';
  html += '</div>';

  /* ── 미팅 리스트 (좌하) ── */
  html += '<div class="' + CARD + '">';
  html += '<div class="' + CARD_HDR + '">';
  html += '<span class="mcard__title">미팅 리스트</span>';
  html += '</div>';
  html += '<div class="' + CARD_BODY + '" style="overflow-x:auto">';
  html += '<table class="data-table data-table--bordered data-table--no-outer data-table--keep-bottom" id="tbl-meeting" style="table-layout:fixed;width:100%;min-width:700px">';
  html += '<colgroup><col style="width:36px"><col style="width:36px"><col style="width:70px"><col style="width:160px"><col style="width:56px"><col style="width:56px"><col style="width:150px"><col style="width:100px"><col style="width:50px"></colgroup>';
  html += '<thead><tr>';
  html += sortableHeader('번호', 'tbl-meeting', 0, 'num');
  html += '<th style="' + LBL + '">차수</th>';
  html += sortableHeader('등록자', 'tbl-meeting', 2, 'date');
  ['미팅일시 및 장소','회원명','만남결과','만남 후기','후기등록일','관리'].forEach(function(t) {
    html += '<th style="' + LBL + '">' + t + '</th>';
  });
  html += '</tr></thead><tbody>';

  if (meetings.length === 0) {
    html += '<tr><td colspan="9" style="text-align:center;padding:20px;color:var(--text-muted)">등록된 미팅이 없습니다.</td></tr>';
  } else {
    var curSeq = 5;
    meetings.forEach(function(mt) {
      var rowspan = mt.members.length;
      var seqText = mt.enrollmentSeq + '가입';
      var seqColors = {1:'#94a3b8', 2:'#8b5cf6', 3:'#f59e0b', 4:'#10b981', 5:'#3b82f6'};
      var seqColor = seqColors[mt.enrollmentSeq] || '#64748b';
      mt.members.forEach(function(mem, mi) {
        html += '<tr>';
        if (mi === 0) {
          html += '<td rowspan="' + rowspan + '" style="' + CS + ';font-weight:700">' + mt.id + '</td>';
          html += '<td rowspan="' + rowspan + '" style="' + CS + ';font-size:11px;font-weight:600;color:' + seqColor + '">' + seqText + '</td>';
          html += '<td rowspan="' + rowspan + '" style="' + CS + ';line-height:1.2" data-sort-val="' + mt.regDate + '">' + mt.registrant + '<span style="display:block;color:#aaa;font-size:12px;margin-top:1px">' + Formatters.date(mt.regDate) + '</span></td>';
          html += '<td rowspan="' + rowspan + '" style="vertical-align:middle">' + mt.dateTime + '<br>' + mt.place + '</td>';
        }
        html += '<td style="' + CS + ';font-weight:600">' + mem.name + '</td>';
        html += '<td style="' + CS + '">' + (mem.result || '-') + '</td>';
        html += '<td style="line-height:1.4">' + (mem.review || '-') + '</td>';
        html += '<td style="' + CS + ';font-size:12px">' + (mem.reviewDate ? Formatters.date(mem.reviewDate) : '-') + '</td>';
        if (mi === 0) {
          html += '<td rowspan="' + rowspan + '" style="' + CS + '"><button class="btn btn--outline btn--xs btn-meeting-manage" data-idx="' + (mt.id - 1) + '" style="padding:2px 6px">관리</button></td>';
        }
        html += '</tr>';
      });
    });
  }

  html += '</tbody></table>';

  html += '</div>';
  html += '</div>';


  /* ── 소개장 (우하) ── */
  html += '<div class="' + CARD + '">';
  html += '<div class="' + CARD_HDR + '">';
  html += '<span class="mcard__title">소개장</span>';
  html += '<div style="display:flex;gap:4px;align-items:center">';
  html += '<button class="btn btn--sm" id="btn-intro-delete" style="font-size:11px;padding:2px 10px;background:#ef4444;color:#fff;border:none" disabled>삭제</button>';
  html += '<button class="btn btn--outline btn--sm" id="btn-add-intro" style="font-size:11px;padding:2px 10px">소개등록</button>';
  html += '</div>';
  html += '</div>';
  html += '<div class="' + CARD_BODY + '">';
  html += '<table class="data-table data-table--bordered data-table--no-outer data-table--keep-bottom" id="tbl-intro" style="table-layout:fixed;width:100%">';
  html += '<colgroup><col style="width:5%"><col style="width:6%"><col style="width:14%"><col style="width:12%"><col style="width:24%"><col style="width:23%"><col style="width:16%"></colgroup>';
  html += '<thead><tr>';
  html += '<th style="' + LBL + '"><input type="checkbox" id="intro-chk-all"></th>';
  html += sortableHeader('번호', 'tbl-intro', 1, 'num');
  html += sortableHeader('등록일', 'tbl-intro', 2, 'date');
  ['회원명','프로필발송','결과','관리'].forEach(function(t) {
    html += '<th style="' + LBL + '">' + t + '</th>';
  });
  html += '</tr></thead><tbody>';

  intros.forEach(function(intro) {
    var allAccepted = intro.rows.every(function(r) { return r.result === '수락'; });
    var rowBg = allAccepted ? 'background:#eff6ff;' : '';
    intro.rows.forEach(function(row, ri) {
      html += '<tr style="' + rowBg + (ri === intro.rows.length - 1 ? 'border-bottom:2px solid var(--border-color)' : '') + '">';
      if (ri === 0) {
        html += '<td rowspan="' + intro.rows.length + '" style="text-align:center;vertical-align:middle;padding:0;border-bottom:2px solid var(--border-color)"><input type="checkbox" class="intro-chk" data-intro-id="' + intro.id + '" style="margin:0"></td>';
        html += '<td rowspan="' + intro.rows.length + '" style="' + CS + ';font-weight:700;vertical-align:middle;border-bottom:2px solid var(--border-color)">' + intro.id + '</td>';
        html += '<td rowspan="' + intro.rows.length + '" style="' + CS + ';vertical-align:middle;border-bottom:2px solid var(--border-color)"><span style="font-size:12px">' + intro.regDate + '</span></td>';
      }
      html += '<td style="' + CS + ';font-weight:600">' + row.name + '</td>';
      html += '<td style="' + CS + '">' + profileBadge(row.profile, row.profileDate, row.resend, row.result) + '</td>';
      // 결과 + 날짜
      var resultHtml = resultBadge(row.result);
      if (row.resultDate) resultHtml += '<span style="display:block;font-size:12px;color:var(--text-muted)">' + row.resultDate + '</span>';
      html += '<td style="' + CS + '">' + resultHtml + '</td>';
      if (ri === 0) {
        html += '<td rowspan="' + intro.rows.length + '" style="text-align:center;vertical-align:middle;border-bottom:2px solid var(--border-color)"><button class="btn btn--outline btn--xs btn-intro-manage" data-intro-id="' + intro.id + '" style="padding:2px 8px;font-size:11px">관리</button></td>';
      }
      html += '</tr>';
    });
  });

  html += '</tbody></table>';
  html += '</div>'; // 스크롤 wrapper
  html += '</div>'; // 소개장 끝

  html += '</div>'; // grid 끝

  setTimeout(function() { bindEvents(m); }, 100);
  return html;
}

/* ── 이벤트 바인딩 ── */
function bindEvents(m) {
  var allMemos = genMemos(m);

  // 통합 필터 함수
  function applyMemoFilter() {
    var catVal = (document.getElementById('memo-filter-select') || {}).value || '전체';
    var fromVal = (document.getElementById('memo-date-from') || {}).value || '';
    var toVal = (document.getElementById('memo-date-to') || {}).value || '';
    var filtered = allMemos.filter(function(x) {
      if (catVal !== '전체' && x.type !== catVal) return false;
      if (fromVal || toVal) {
        // 날짜 파싱: "26.05.28 14:22" → "2026-05-28"
        var parts = x.date.split(' ')[0].split('.');
        if (parts.length >= 3) {
          var d = '20' + parts[0] + '-' + parts[1] + '-' + parts[2];
          if (fromVal && d < fromVal) return false;
          if (toVal && d > toVal) return false;
        }
      }
      return true;
    });
    var timeline = document.getElementById('memo-timeline');
    if (!timeline) return;
    var pinned = filtered.filter(function(x) { return x.pinned; });
    var normal = filtered.filter(function(x) { return !x.pinned; });
    timeline.innerHTML = buildMemoTable(pinned, normal, 10);
    bindSortableHeaders();
  }

  // 필터 이벤트 바인딩
  var filterSelect = document.getElementById('memo-filter-select');
  if (filterSelect) filterSelect.addEventListener('change', applyMemoFilter);
  var searchBtn = document.getElementById('btn-memo-search');
  if (searchBtn) searchBtn.addEventListener('click', applyMemoFilter);

  // ── 특이사항 필터 ──
  function applySnFilter() {
    var catVal = (document.getElementById('sn-filter-select') || {}).value || '전체';
    var fromVal = (document.getElementById('sn-date-from') || {}).value || '';
    var toVal = (document.getElementById('sn-date-to') || {}).value || '';
    var rows = document.querySelectorAll('.sn-row');
    var num = 0;
    rows.forEach(function(row) {
      var type = row.getAttribute('data-sn-type') || '';
      var dateStr = row.getAttribute('data-sn-date') || '';
      var show = true;
      if (catVal !== '전체' && type !== catVal) show = false;
      if (show && fromVal && dateStr) {
        var d = dateStr.replace(/\./g, '-');
        if (d.length === 8) d = '20' + d;
        if (d < fromVal) show = false;
      }
      if (show && toVal && dateStr) {
        var d2 = dateStr.replace(/\./g, '-');
        if (d2.length === 8) d2 = '20' + d2;
        if (d2 > toVal) show = false;
      }
      row.style.display = show ? '' : 'none';
      if (show) num++;
    });
  }
  var snFilterSelect = document.getElementById('sn-filter-select');
  if (snFilterSelect) snFilterSelect.addEventListener('change', applySnFilter);
  var snSearchBtn = document.getElementById('btn-sn-search');
  if (snSearchBtn) snSearchBtn.addEventListener('click', applySnFilter);

  // 메모 등록
  var addBtn = document.getElementById('btn-memo-add');
  if (addBtn) addBtn.addEventListener('click', function() {
    var catOpts = Object.keys(MEMO_CATS).filter(function(k) { return !MEMO_CATS[k].auto; }).map(function(k) {
      return '<option value="' + k + '">' + k + '</option>';
    }).join('');
    Modal.show({
      title: '메모 등록',
      size: 'md',
      content: '<div style="display:grid;gap:12px">'
        + '<div><label style="display:block;margin-bottom:4px">구분</label><select class="form-input" id="memo-new-cat" style="width:100%">' + catOpts + '</select></div>'
        + '<div><label style="display:block;margin-bottom:4px">내용</label><textarea class="form-input" id="memo-new-content" rows="4" style="width:100%;resize:vertical" placeholder="내용을 입력하세요..."></textarea></div>'
        + '<div><label style="cursor:pointer"><input type="checkbox" id="memo-new-pin" style="margin-right:4px"> 상단 고정</label></div>'
        + '<div style="text-align:right"><button class="btn btn--ghost btn--sm" id="memo-new-cancel" style="margin-right:6px">취소</button><button class="btn btn--primary btn--sm" id="memo-new-submit">등록</button></div>'
        + '</div>',
    });
    setTimeout(function() {
      var cancelBtn = document.getElementById('memo-new-cancel');
      if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });
      var submitBtn = document.getElementById('memo-new-submit');
      if (submitBtn) submitBtn.addEventListener('click', function() {
        var content = document.getElementById('memo-new-content').value.trim();
        if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }
        Modal.hide();
        Toast.show('메모가 등록되었습니다.', 'success');
      });
    }, 100);
  });

  // 전체보기 모달 (20건 페이징)
  var allBtn = document.getElementById('btn-memo-all');
  if (allBtn) allBtn.addEventListener('click', function() {
    showMemoFullModal(allMemos, 1);
  });


  // 미팅 관리 버튼 → 약속관리 + 미팅등록 2탭 모달
  var allMeetings = genMeetings(m);
  document.querySelectorAll('.btn-meeting-manage').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(this.dataset.idx);
      var mt = allMeetings[idx];
      if (mt) showMeetingManageModal(mt, m);
    });
  });

  // ── 공통 정렬 바인딩 ──
  bindSortableHeaders();

  // ── 특이사항 등록 버튼 ──
  var snAddBtn = document.getElementById('btn-add-special-note');
  if (snAddBtn) snAddBtn.addEventListener('click', function() {
    showSpecialNoteModal(m);
  });

  // ── 소개장 체크박스 & 삭제 ──
  var introDelBtn = document.getElementById('btn-intro-delete');
  var introChkAll = document.getElementById('intro-chk-all');
  function updateIntroDeleteBtn() {
    var cnt = document.querySelectorAll('.intro-chk:checked').length;
    if (introDelBtn) introDelBtn.disabled = cnt === 0;
  }
  if (introChkAll) introChkAll.addEventListener('change', function() {
    document.querySelectorAll('.intro-chk').forEach(function(c) { c.checked = introChkAll.checked; });
    updateIntroDeleteBtn();
  });
  document.querySelectorAll('.intro-chk').forEach(function(chk) {
    chk.addEventListener('change', updateIntroDeleteBtn);
  });
  if (introDelBtn) introDelBtn.addEventListener('click', function() {
    var ids = [];
    document.querySelectorAll('.intro-chk:checked').forEach(function(c) { ids.push(c.dataset.introId); });
    if (ids.length === 0) return;
    if (!confirm(ids.length + '건의 소개장을 삭제하시겠습니까?')) return;
    Toast.show(ids.length + '건의 소개장이 삭제되었습니다.', 'success');
  });

  // ── 소개장 관리 버튼 ──
  document.querySelectorAll('.btn-intro-manage').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var introId = btn.dataset.introId;
      var intros = genIntros(m);
      var intro = intros.find(function(x) { return x.id === parseInt(introId); });
      if (intro) showIntroManageModal(intro, m);
    });
  });

  // ── 소개등록 ──
  var introBtn = document.getElementById('btn-add-intro');
  if (introBtn) introBtn.addEventListener('click', function() {
    // 검색 가능한 더미 회원 목록
    var searchPool = [
      { id: 101, name: '박서연', manager: '서다현', status: '활동', gender: 'F', age: 28 },
      { id: 102, name: '최민수', manager: '정유리', status: '활동', gender: 'M', age: 33 },
      { id: 103, name: '이지은', manager: '강보라', status: '활동대기', gender: 'F', age: 30 },
      { id: 104, name: '정우진', manager: '서다현', status: '활동', gender: 'M', age: 35 },
      { id: 105, name: '한소희', manager: '최은별', status: '임시보류', gender: 'F', age: 27 },
      { id: 106, name: '김도윤', manager: '정유리', status: '활동', gender: 'M', age: 31 },
      { id: 107, name: '윤지아', manager: '강보라', status: '활동', gender: 'F', age: 29 },
      { id: 108, name: '오태현', manager: '서다현', status: '활동', gender: 'M', age: 34 },
    ];

    var modalContent = '<div style="display:flex;flex-direction:column;gap:12px">'
      + '<div style="display:flex;gap:6px;align-items:center">'
      + '<input type="text" class="form-input" id="intro-search-input" placeholder="회원명 검색" style="flex:1;padding:5px 8px">'
      + '<button class="btn btn--primary btn--sm" id="intro-search-btn" style="padding:4px 12px;white-space:nowrap">검색</button>'
      + '</div>'
      + '<div id="intro-search-result" style="max-height:280px;overflow-y:auto;border:1px solid #e2e8f0;border-radius:4px">'
      + '<div style="padding:20px;text-align:center;color:#94a3b8">회원명을 입력하고 검색하세요.</div>'
      + '</div>'
      + '<div style="text-align:right">'
      + '<button class="btn btn--ghost btn--sm" id="intro-cancel-btn" style="margin-right:6px">취소</button>'
      + '<button class="btn btn--primary btn--sm" id="intro-submit-btn" disabled>소개등록</button>'
      + '</div>'
      + '</div>';

    Modal.show({ title: '소개 회원 검색', size: 'md', content: modalContent });

    var selectedMember = null;

    setTimeout(function() {
      var cancelBtn = document.getElementById('intro-cancel-btn');
      if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

      function doSearch() {
        var keyword = (document.getElementById('intro-search-input') || {}).value.trim();
        var resultDiv = document.getElementById('intro-search-result');
        if (!resultDiv) return;

        var results = keyword ? searchPool.filter(function(p) { return p.name.indexOf(keyword) >= 0; }) : searchPool;
        if (results.length === 0) {
          resultDiv.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8">검색 결과가 없습니다.</div>';
          return;
        }

        var html = '<table style="width:100%;border-collapse:collapse">';
        html += '<thead><tr style="background:#f8fafc">';
        html += '<th style="padding:6px 10px;text-align:center;border-bottom:1px solid #e2e8f0;width:30px"></th>';
        html += '<th style="padding:6px 10px;text-align:left;border-bottom:1px solid #e2e8f0">회원명</th>';
        html += '<th style="padding:6px 10px;text-align:center;border-bottom:1px solid #e2e8f0">담당매니저</th>';
        html += '<th style="padding:6px 10px;text-align:center;border-bottom:1px solid #e2e8f0">상태</th>';
        html += '</tr></thead><tbody>';
        results.forEach(function(p) {
          html += '<tr class="intro-search-row" data-id="' + p.id + '" style="cursor:pointer">';
          html += '<td style="padding:5px 10px;text-align:center;border-bottom:1px solid #f1f5f9"><input type="radio" name="intro-select" value="' + p.id + '" class="intro-radio"></td>';
          html += '<td style="padding:5px 10px;border-bottom:1px solid #f1f5f9"><a href="#" class="intro-member-link" data-id="' + p.id + '" style="color:#3b82f6;font-weight:600;text-decoration:none">' + p.name + '</a></td>';
          html += '<td style="padding:5px 10px;text-align:center;border-bottom:1px solid #f1f5f9">' + p.manager + '</td>';
          html += '<td style="padding:5px 10px;text-align:center;border-bottom:1px solid #f1f5f9">' + Formatters.statusBadge(p.status, 'regular') + '</td>';
          html += '</tr>';
        });
        html += '</tbody></table>';
        resultDiv.innerHTML = html;

        // 라디오 선택
        resultDiv.querySelectorAll('.intro-radio').forEach(function(radio) {
          radio.addEventListener('change', function() {
            selectedMember = results.find(function(p) { return p.id === parseInt(radio.value); });
            var submitBtn = document.getElementById('intro-submit-btn');
            if (submitBtn) submitBtn.disabled = false;
          });
        });

        // 행 클릭 시 라디오 선택
        resultDiv.querySelectorAll('.intro-search-row').forEach(function(row) {
          row.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' || e.target.tagName === 'INPUT') return;
            var radio = row.querySelector('.intro-radio');
            if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change')); }
          });
        });

        // 회원명 클릭 → 새 탭
        resultDiv.querySelectorAll('.intro-member-link').forEach(function(link) {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('/pages/regular/detail.html?id=' + link.dataset.id, '_blank');
          });
        });
      }

      var searchBtnEl = document.getElementById('intro-search-btn');
      if (searchBtnEl) searchBtnEl.addEventListener('click', doSearch);
      var searchInput = document.getElementById('intro-search-input');
      if (searchInput) searchInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') doSearch(); });

      // 소개등록 처리
      var submitBtn = document.getElementById('intro-submit-btn');
      if (submitBtn) submitBtn.addEventListener('click', function() {
        if (!selectedMember) return;
        Modal.hide();
        Toast.show(selectedMember.name + ' 회원에게 소개장이 등록되었습니다.', 'success');
      });
    }, 100);
  });
}

/* ── 전체보기 모달 (페이징) ── */
function showMemoFullModal(memos, page) {
  var perPage = 20;
  var totalPages = Math.ceil(memos.length / perPage);
  var start = (page - 1) * perPage;
  var pageMemos = memos.slice(start, start + perPage);
  var pinned = pageMemos.filter(function(x) { return x.pinned; });
  var normal = pageMemos.filter(function(x) { return !x.pinned; });

  var tableHtml = buildMemoTable(pinned, normal, normal.length);

  var pagingHtml = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px">';
  pagingHtml += '<button class="btn btn--ghost btn--sm memo-page-btn" data-page="' + Math.max(1, page - 1) + '" ' + (page <= 1 ? 'disabled style="opacity:0.4"' : '') + '>◀ 이전</button>';
  for (var i = 1; i <= totalPages; i++) {
    var activeStyle = i === page ? 'background:var(--primary);color:#fff;' : '';
    pagingHtml += '<button class="btn btn--ghost btn--sm memo-page-btn" data-page="' + i + '" style="min-width:28px;padding:3px 6px;border-radius:4px;' + activeStyle + '">' + i + '</button>';
  }
  pagingHtml += '<button class="btn btn--ghost btn--sm memo-page-btn" data-page="' + Math.min(totalPages, page + 1) + '" ' + (page >= totalPages ? 'disabled style="opacity:0.4"' : '') + '>다음 ▶</button>';
  pagingHtml += '</div>';

  Modal.show({
    title: '메모장 전체보기 (총 ' + memos.length + '건)',
    size: 'lg',
    content: '<div style="max-height:500px;overflow-y:auto">' + tableHtml + '</div>' + pagingHtml,
  });

  setTimeout(function() {
    document.querySelectorAll('.memo-page-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var p = parseInt(this.dataset.page);
        if (p && p !== page) showMemoFullModal(memos, p);
      });
    });
  }, 100);
}

function refreshMatchingTab(m) {
  var panel = document.getElementById('panel-matching');
  if (panel) { panel.innerHTML = renderMatchingInfo(m); }
}

/* ═══════════════════════════════════════════
   미팅 등록 모달 (소개장 → 미팅등록)
   ═══════════════════════════════════════════ */

/* 공휴일 목록 (2026년 기준) */
var PUBLIC_HOLIDAYS = [
  '2026-01-01','2026-01-26','2026-01-27','2026-01-28',  // 신정, 설날
  '2026-03-01','2026-05-05','2026-05-24',                // 삼일절, 어린이날, 석가탄신일
  '2026-06-06','2026-08-15','2026-09-24','2026-09-25','2026-09-26', // 현충일, 광복절, 추석
  '2026-10-03','2026-10-09','2026-12-25'                  // 개천절, 한글날, 성탄절
];

/** 특정 날짜가 영업일(평일 + 비공휴일)인지 판별 */
function isBusinessDay(d) {
  var day = d.getDay();
  if (day === 0 || day === 6) return false; // 토/일
  var iso = d.toISOString().slice(0, 10);
  return PUBLIC_HOLIDAYS.indexOf(iso) < 0;
}

/** D-1 발송 예정일 계산: 미팅일 하루 전 → 영업일이 아니면 직전 영업일로 이동 */
function calcSmsSendDate(meetingDateStr) {
  var d = new Date(meetingDateStr);
  d.setDate(d.getDate() - 1); // D-1
  // 영업일이 아닐 경우 직전 영업일 탐색 (최대 10일 전까지)
  var limit = 10;
  while (!isBusinessDay(d) && limit-- > 0) {
    d.setDate(d.getDate() - 1);
  }
  return d;
}

/** 날짜 포맷: Date → 'M월 D일 (요일)' */
function formatDateKr(d) {
  var days = ['일','월','화','수','목','금','토'];
  return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + days[d.getDay()] + ')';
}

/** SMS 미리보기 텍스트 생성 */
function buildSmsPreview(targetName, birthYear, meetDate, meetHour, meetMin, placeName, placeAddr) {
  var hourNum = parseInt(meetHour) || 14;
  var minNum = parseInt(meetMin) || 0;
  var ampm = hourNum < 12 ? '오전' : '오후';
  var dispHour = hourNum > 12 ? hourNum - 12 : (hourNum === 0 ? 12 : hourNum);
  var timeStr = ampm + ' ' + dispHour + '시' + (minNum > 0 ? ' ' + minNum + '분' : '');
  var d = new Date(meetDate);
  var dateStr = (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + ['일','월','화','수','목','금','토'][d.getDay()] + ')';
  var yearStr = birthYear ? '(' + birthYear.toString().slice(-2) + '년)' : '';

  var msg = '[퍼플스] ' + targetName + '님' + yearStr + ' 안심번호:070-XXXX-XXXX / ';
  msg += dateStr + ' ' + timeStr + ' ';
  msg += (placeName || '장소미정') + '/ ';
  msg += (placeAddr || '') + ' ';
  msg += '* 안내드린 안심번호가 후스콜, T전화, 단말기 자체에서 차단이 되어있는 경우에는 서비스 이용이 불가하오니 차단 유무를 확인해 주시기 바랍니다.';
  return msg;
}

function showMeetingRegisterModal(introId, name1, name2, tgtMgr, m) {
  var LB = 'background:var(--bg-secondary);font-weight:600;width:90px;text-align:center;white-space:nowrap';
  var VL = 'padding:6px 12px';
  var body = '';

  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:90px"><col><col style="width:90px"><col></colgroup>';
  body += '<tbody>';

  // ── 회원 정보 ──
  body += '<tr><td style="' + LB + '">회원당사자</td>';
  body += '<td style="' + VL + ';font-weight:700;color:var(--primary)">' + (m.name || '본인') + '</td>';
  body += '<td style="' + LB + '">담당매니저</td>';
  body += '<td style="' + VL + '">' + (m.matchingManager || '-') + '</td></tr>';

  body += '<tr><td style="' + LB + '">상대회원</td>';
  body += '<td style="' + VL + ';font-weight:700;color:#ef4444">' + name2 + '</td>';
  body += '<td style="' + LB + '">담당매니저</td>';
  body += '<td style="' + VL + '">' + (tgtMgr || '-') + '</td></tr>';

  // ── 미팅일시 ──
  body += '<tr><td style="' + LB + '">미팅일</td>';
  body += '<td style="' + VL + '"><input type="date" class="form-input" id="mr-date" style="font-size:12px;padding:4px 8px;width:100%"></td>';
  body += '<td style="' + LB + '">미팅시간</td>';
  body += '<td style="' + VL + '"><div style="display:flex;gap:4px;align-items:center">';
  body += '<input type="number" class="form-input" id="mr-hour" value="14" min="0" max="23" style="font-size:12px;padding:4px 6px;width:50px;text-align:center">';
  body += '<span style="color:var(--text-muted)">시</span>';
  body += '<input type="number" class="form-input" id="mr-min" value="00" min="0" max="59" step="10" style="font-size:12px;padding:4px 6px;width:50px;text-align:center">';
  body += '<span style="color:var(--text-muted)">분</span>';
  body += '</div></td></tr>';

  // ── 장소 ──
  body += '<tr><td style="' + LB + '">미팅장소</td>';
  body += '<td colspan="3" style="' + VL + '"><div style="display:flex;gap:6px;align-items:center">';
  body += '<input type="text" class="form-input" id="mr-place-name" placeholder="장소명 (검색 후 자동입력)" style="font-size:12px;padding:4px 8px;flex:1" readonly>';
  body += '<button type="button" class="btn btn--outline btn--sm" id="mr-place-search" style="font-size:11px;white-space:nowrap">장소검색</button>';
  body += '</div></td></tr>';

  body += '<tr><td style="' + LB + '">주소</td>';
  body += '<td colspan="3" style="' + VL + '">';
  body += '<input type="text" class="form-input" id="mr-place-addr" placeholder="장소 검색 시 자동 입력" style="font-size:11px;padding:4px 8px;width:100%;color:var(--text-muted)" readonly>';
  body += '<input type="hidden" id="mr-place-data">';
  body += '</td></tr>';

  // ── 안심번호 ──
  body += '<tr><td style="' + LB + '">안심번호</td>';
  body += '<td style="' + VL + '"><label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="checkbox" id="mr-safe-num" checked> 안심번호 사용</label></td>';
  body += '<td style="' + LB + '">자동발송</td>';
  body += '<td style="' + VL + '"><label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="checkbox" id="mr-exclude-auto"> 자동발송 제외</label></td></tr>';

  body += '</tbody></table>';

  // ── 발송 예정일 안내 ──
  body += '<div id="mr-send-info" style="padding:10px 12px;background:var(--bg-secondary);border-radius:var(--radius-sm);font-size:11px;line-height:1.6;color:var(--text-secondary);margin-top:12px">';
  body += '<span style="color:var(--text-muted)">미팅일을 선택하면 문자 발송 예정일이 표시됩니다.</span>';
  body += '</div>';

  // ── SMS 미리보기 ──
  body += '<div id="mr-sms-preview" style="margin-top:10px;display:none">';
  body += '<div style="font-size:10px;font-weight:600;color:var(--text-muted);margin-bottom:4px">문자 미리보기</div>';
  body += '<div id="mr-sms-text" style="padding:10px 12px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:var(--radius-sm);font-size:11px;line-height:1.6;color:#0c4a6e;word-break:break-all"></div>';
  body += '</div>';

  // ── 하단 버튼 ──
  body += '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px">';
  body += '<button class="btn btn--ghost btn--sm" id="mr-cancel" style="font-size:12px">취소</button>';
  body += '<button class="btn btn--primary btn--sm" id="mr-submit" style="font-size:12px;padding:6px 20px">미팅 등록</button>';
  body += '</div>';

  Modal.show({
    title: '미팅 등록',
    size: 'lg',
    content: body
  });

  // ── 이벤트 바인딩 ──
  setTimeout(function() {
    var selectedPlace = null;

    // 발송 예정일 업데이트 함수
    function updateSendInfo() {
      var dateVal = document.getElementById('mr-date').value;
      var infoEl = document.getElementById('mr-send-info');
      var previewWrap = document.getElementById('mr-sms-preview');
      var smsTextEl = document.getElementById('mr-sms-text');
      var excludeAuto = document.getElementById('mr-exclude-auto').checked;
      var useSafe = document.getElementById('mr-safe-num').checked;

      if (!dateVal) {
        infoEl.innerHTML = '<span style="color:var(--text-muted)">미팅일을 선택하면 문자 발송 예정일이 표시됩니다.</span>';
        previewWrap.style.display = 'none';
        return;
      }

      if (excludeAuto) {
        infoEl.innerHTML = '<span style="color:var(--status-amber);font-weight:600">자동발송 제외</span> — 수동으로 문자를 발송해야 합니다.';
        previewWrap.style.display = 'none';
        return;
      }

      var sendDate = calcSmsSendDate(dateVal);
      var meetDate = new Date(dateVal);
      var d1 = new Date(dateVal);
      d1.setDate(d1.getDate() - 1);
      var isHolidayD1 = !isBusinessDay(d1);

      var html = '';
      if (useSafe) {
        html += '<div style="margin-bottom:4px"><span style="color:var(--primary);font-weight:700">발송 예정일: ' + sendDate.toISOString().slice(0, 10) + ' (' + formatDateKr(sendDate) + ')</span></div>';
        html += '<div style="color:var(--text-muted);font-size:10px">미팅일 D-1 기준 자동 발송 (안심번호 포함)</div>';
        if (isHolidayD1) {
          html += '<div style="margin-top:4px;padding:4px 8px;background:#fef3c7;border-radius:4px;color:#92400e;font-size:10px;font-weight:600">';
          html += '미팅일 전날이 휴일이므로 직전 영업일(' + formatDateKr(sendDate) + ')에 발송됩니다.';
          html += '</div>';
        }
      } else {
        html += '<span style="color:var(--text-muted)">안심번호 미사용 — 일반 안내문자만 발송됩니다.</span>';
      }
      infoEl.innerHTML = html;

      // SMS 미리보기 업데이트
      if (useSafe && !excludeAuto) {
        var hourVal = document.getElementById('mr-hour').value;
        var minVal = document.getElementById('mr-min').value;
        var pName = selectedPlace ? selectedPlace.name : (document.getElementById('mr-place-name').value || '');
        var pAddr = selectedPlace ? selectedPlace.addr : (document.getElementById('mr-place-addr').value || '');
        var smsText = buildSmsPreview(name2, null, dateVal, hourVal, minVal, pName, pAddr);
        smsTextEl.textContent = smsText;
        previewWrap.style.display = 'block';
      } else {
        previewWrap.style.display = 'none';
      }
    }

    // 미팅일 변경 시 발송 예정일 업데이트
    var dateInput = document.getElementById('mr-date');
    if (dateInput) dateInput.addEventListener('change', updateSendInfo);

    // 시/분 변경 시 SMS 미리보기 업데이트
    var hourInput = document.getElementById('mr-hour');
    var minInput = document.getElementById('mr-min');
    if (hourInput) hourInput.addEventListener('change', updateSendInfo);
    if (minInput) minInput.addEventListener('change', updateSendInfo);

    // 안심번호 / 자동발송 체크 변경 시
    var safeChk = document.getElementById('mr-safe-num');
    var excludeChk = document.getElementById('mr-exclude-auto');
    if (safeChk) safeChk.addEventListener('change', updateSendInfo);
    if (excludeChk) excludeChk.addEventListener('change', updateSendInfo);

    // 장소 검색
    var placeSearchBtn = document.getElementById('mr-place-search');
    if (placeSearchBtn) placeSearchBtn.addEventListener('click', function() {
      PlaceSearch.open(function(sel) {
        selectedPlace = sel;
        document.getElementById('mr-place-name').value = sel.name;
        document.getElementById('mr-place-addr').value = sel.addr;
        document.getElementById('mr-place-data').value = JSON.stringify(sel);
        updateSendInfo();
      }, document.getElementById('mr-place-name').value || '');
    });

    // 취소
    var cancelBtn = document.getElementById('mr-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

    // 미팅 등록
    var submitBtn = document.getElementById('mr-submit');
    if (submitBtn) submitBtn.addEventListener('click', function() {
      var dateVal = document.getElementById('mr-date').value;
      var hourVal = document.getElementById('mr-hour').value.padStart(2, '0');
      var minVal = document.getElementById('mr-min').value.padStart(2, '0');
      var placeName = document.getElementById('mr-place-name').value.trim();

      if (!dateVal) { Toast.show('미팅일을 선택해주세요.', 'warning'); return; }
      if (!placeName) { Toast.show('미팅 장소를 선택해주세요.', 'warning'); return; }

      var useSafe = document.getElementById('mr-safe-num').checked;
      var excludeAuto = document.getElementById('mr-exclude-auto').checked;
      var sendDate = calcSmsSendDate(dateVal);
      var placeAddr = document.getElementById('mr-place-addr').value;

      Modal.hide();
      Toast.show('미팅이 등록되었습니다. (소개장 ' + introId + '번)', 'success');

      if (useSafe && !excludeAuto) {
        setTimeout(function() {
          Toast.show('📱 안심번호 문자가 ' + formatDateKr(sendDate) + '에 자동 발송됩니다.', 'info');
        }, 800);
      }
    });
  }, 120);
}

/* ═══════════════════════════════════════════
   소개관리 모달 (소개장 → 관리)
   ═══════════════════════════════════════════ */
function showIntroManageModal(intro, m) {
  var LB = 'background:var(--bg-secondary);font-weight:600;text-align:center;white-space:nowrap';
  var VL = 'padding:6px 10px';
  var ANSWER_OPTS = '<option value="">선택</option><option value="보류">보류</option><option value="미소개">미소개</option><option value="의논후결정">의논후 결정</option><option value="일정조율">일정조율</option><option value="소개용">소개용</option>';

  var body = '';
  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:70px"><col style="width:80px"><col style="width:100px"><col style="width:100px"><col style="width:110px"><col></colgroup>';
  body += '<thead><tr>';
  body += '<th style="' + LB + '">회원구분</th>';
  body += '<th style="' + LB + '">회원명</th>';
  body += '<th style="' + LB + '">소개장등록일</th>';
  body += '<th style="' + LB + '">답변일</th>';
  body += '<th style="' + LB + '">답변선택</th>';
  body += '<th style="' + LB + '">비고</th>';
  body += '</tr></thead><tbody>';

  intro.rows.forEach(function(row, ri) {
    var memberType = ri === 0 ? '회원당사자' : '상대회원';
    // 소개일 = 프로필 발송일로 자동 저장
    var introDate = row.profileDate || intro.regDate || '-';
    var resultDate = row.resultDate || '';
    var curResult = row.result || '';
    // 답변선택 매핑: 수락→일정조율, 거절→미소개, 보류→보류, 대기중→빈값
    var answerMap = { '수락': '일정조율', '거절': '미소개', '보류': '보류', '대기중': '' };
    var selAnswer = answerMap[curResult] || '';

    body += '<tr>';
    body += '<td style="' + VL + ';text-align:center;font-weight:600;color:' + (ri === 0 ? 'var(--primary)' : '#ef4444') + '">' + memberType + '</td>';
    body += '<td style="' + VL + ';text-align:center;font-weight:600">' + row.name + '</td>';
    body += '<td style="' + VL + ';text-align:center;font-size:11px;color:var(--text-secondary)">' + introDate + '</td>';
    body += '<td style="' + VL + ';text-align:center"><input type="date" class="form-input intro-mg-answer-date" data-row="' + ri + '" value="' + (resultDate ? resultDate.replace(/\./g, '-') : '') + '" style="font-size:11px;padding:3px 6px;width:100%"></td>';
    body += '<td style="' + VL + ';text-align:center"><select class="form-input intro-mg-answer-sel" data-row="' + ri + '" style="font-size:11px;padding:3px 6px;width:100%">' + ANSWER_OPTS.replace('value="' + selAnswer + '"', 'value="' + selAnswer + '" selected') + '</select></td>';
    body += '<td style="' + VL + '"><input type="text" class="form-input intro-mg-note" data-row="' + ri + '" placeholder="비고 입력" style="font-size:11px;padding:3px 6px;width:100%"></td>';
    body += '</tr>';
  });

  body += '</tbody></table>';

  // 하단 버튼
  body += '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px">';
  body += '<button class="btn btn--ghost btn--sm" id="intro-mg-cancel" style="font-size:12px">취소</button>';
  body += '<button class="btn btn--primary btn--sm" id="intro-mg-save" style="font-size:12px;padding:6px 20px">저장</button>';
  body += '</div>';

  Modal.show({
    title: '소개관리 (' + intro.id + '번)',
    size: 'lg',
    content: body
  });

  setTimeout(function() {
    var cancelBtn = document.getElementById('intro-mg-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

    var saveBtn = document.getElementById('intro-mg-save');
    if (saveBtn) saveBtn.addEventListener('click', function() {
      Modal.hide();
      Toast.show('소개관리가 저장되었습니다.', 'success');
    });
  }, 100);
}

/* ═══════════════════════════════════════════
   미팅관리 모달 (미팅리스트 → 관리)
   약속관리 + 미팅등록 2탭
   ═══════════════════════════════════════════ */
var MGR_MAP = {'김영희':'서다현','박서연':'정유리','이지은':'강보라','한소희':'최은별','윤지아':'서다현','최민아':'정유리','정다은':'강보라','오수진':'최은별','임하윤':'서다현','송예린':'정유리','이영수':'박지영','임지호':'서다현','정우진':'정유리','김도윤':'강보라','오태현':'최은별','박민수':'서다현','최성준':'정유리','한재원':'강보라','강현우':'최은별','윤시우':'서다현','김미봉':'서다현','최서연':'정유리','박하은':'강보라','이지아':'최은별','정수민':'서다현','한예진':'정유리','오다은':'강보라','윤서영':'최은별','장민지':'서다현','송지우':'정유리'};

function showMeetingManageModal(mt, m) {
  var LB = 'background:var(--bg-secondary);font-weight:600;width:90px;text-align:center;white-space:nowrap';
  var VL = 'padding:6px 12px';
  var name1 = mt.members[0].name;
  var name2 = mt.members[1].name;
  var tgtMgr = MGR_MAP[name2] || '-';

  var body = '';

  // ── 탭 네비게이션 ──
  body += '<div style="display:flex;border-bottom:2px solid var(--border-color);margin-bottom:16px">';
  body += '<button class="mm-tab active" data-target="mm-tab-appt" style="flex:1;padding:10px 0;font-size:13px;font-weight:700;border:none;background:none;cursor:pointer;border-bottom:2px solid var(--primary);margin-bottom:-2px;color:var(--primary)">미팅전 약속확인</button>';
  body += '<button class="mm-tab" data-target="mm-tab-reg" style="flex:1;padding:10px 0;font-size:13px;font-weight:700;border:none;background:none;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;color:var(--text-muted)">미팅등록</button>';
  body += '</div>';

  // ══════ 탭1: 미팅전 약속확인 ══════
  body += '<div id="mm-tab-appt" class="mm-tab-panel">';

  // 회원 정보 헤더
  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed;margin-bottom:12px">';
  body += '<colgroup><col style="width:70px"><col><col style="width:70px"><col></colgroup>';
  body += '<tbody>';
  body += '<tr><td style="' + LB + '">본인</td><td style="' + VL + ';font-weight:700;color:var(--primary)">' + name1 + '</td>';
  body += '<td style="' + LB + '">상대회원</td><td style="' + VL + ';font-weight:700;color:#ef4444">' + name2 + '</td></tr>';
  body += '</tbody></table>';

  // 통신 유형 라디오
  body += '<div style="display:flex;gap:16px;align-items:center;margin-bottom:12px;padding:8px 12px;background:var(--bg-secondary);border-radius:var(--radius-sm)">';
  body += '<label style="font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="radio" name="mm-comm-type" value="tel" checked> 전화 확인</label>';
  body += '<label style="font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="radio" name="mm-comm-type" value="sms"> SMS 발송</label>';
  body += '<label style="font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="radio" name="mm-comm-type" value="etc"> 비고</label>';
  body += '</div>';

  // 입력 폼 (테이블)
  var myPhone = m.phone || '010-0000-0000';
  body += '<table class="data-table data-table--bordered" id="mm-appt-form" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:80px"><col></colgroup>';
  body += '<tbody>';

  // 받는이
  body += '<tr><td style="' + LB + '">받는이</td>';
  body += '<td style="' + VL + '">';
  body += '<div style="display:flex;gap:8px;align-items:center">';
  body += '<input type="text" class="form-input" id="mm-recv-phone" value="' + myPhone + '" style="font-size:12px;padding:4px 8px;width:160px" readonly>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-recv-type" value="본인" checked> 본인</label>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-recv-type" value="기타"> 기타</label>';
  body += '</div></td></tr>';

  // CallBack 번호
  body += '<tr class="mm-sms-row"><td style="' + LB + '">CallBack</td>';
  body += '<td style="' + VL + '">';
  body += '<div style="display:flex;gap:8px;align-items:center">';
  body += '<input type="text" class="form-input" id="mm-callback" value="02-518-9160" style="font-size:12px;padding:4px 8px;width:160px" readonly>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-cb-type" value="사무실" checked> 사무실</label>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-cb-type" value="법인폰"> 법인폰</label>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-cb-type" value="전국대표"> 전국대표</label>';
  body += '</div></td></tr>';

  // 전송방법
  body += '<tr class="mm-sms-row"><td style="' + LB + '">전송방법</td>';
  body += '<td style="' + VL + '">';
  body += '<div style="display:flex;gap:8px;align-items:center">';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-send-method" value="즉시" checked> 즉시</label>';
  body += '<label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="mm-send-method" value="예약"> 예약</label>';
  body += '<input type="datetime-local" class="form-input" id="mm-send-reserve" style="font-size:11px;padding:3px 6px;width:180px;display:none">';
  body += '</div></td></tr>';

  // 내용
  body += '<tr><td style="' + LB + '">내 용</td>';
  body += '<td style="' + VL + '"><textarea class="form-input" id="mm-appt-content" rows="3" style="font-size:12px;padding:6px 8px;width:100%;resize:vertical" placeholder="내용을 입력하세요"></textarea></td></tr>';

  body += '</tbody></table>';

  // 등록 버튼
  body += '<div style="display:flex;justify-content:center;padding:12px 0">';
  body += '<button class="btn btn--primary btn--sm" id="mm-appt-register" style="font-size:12px;padding:6px 24px">등 록 하 기</button>';
  body += '</div>';

  // ── 발송이력 히스토리 ──
  body += '<div style="border-top:2px solid var(--border-color);padding-top:12px">';
  body += '<table class="data-table data-table--bordered" id="mm-appt-history" style="font-size:11px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:30px"><col style="width:40px"><col style="width:55px"><col><col style="width:95px"></colgroup>';
  body += '<thead><tr>';
  body += '<th style="' + LB + ';font-size:11px">No</th>';
  body += '<th style="' + LB + ';font-size:11px">구분</th>';
  body += '<th style="' + LB + ';font-size:11px">등록자</th>';
  body += '<th style="' + LB + ';font-size:11px">내용</th>';
  body += '<th style="' + LB + ';font-size:11px">등록일</th>';
  body += '</tr></thead><tbody id="mm-appt-history-body">';

  // 더미 이력 데이터
  var dummyHistory = [
    { no: 6, type: 'etc', writer: m.matchingManager || '조성의', content: '사진보다 괜찮은분은 처음', date: '05.27 10:42' },
    { no: 5, type: 'sms', writer: m.matchingManager || '조성의', content: '[퍼플스] ' + name2 + '님 안심번호:070-4501-3015 / ' + mt.dateTime + ' ' + mt.place, date: '05.26 11:03' },
    { no: 4, type: 'tel', writer: m.matchingManager || '조성의', content: '미팅 컨펌 완료, 일정 확정', date: '05.26 11:03' },
    { no: 3, type: 'sms', writer: m.matchingManager || '조성의', content: '[퍼플스] ' + name2 + '님 안심번호:070-4501-3015 / ' + mt.dateTime + ' ' + mt.place, date: '05.21 11:25' },
    { no: 2, type: 'sms', writer: m.matchingManager || '조성의', content: '[퍼플스] ' + name2 + '님 안심번호:070-4501-3015 / ' + mt.dateTime + ' ' + mt.place, date: '05.21 11:25' },
    { no: 1, type: 'tel', writer: m.matchingManager || '조성의', content: '미팅 일정 확인 통화 완료', date: '05.21 11:25' },
  ];
  var typeMap = { tel: '전화', sms: 'SMS', etc: '비고' };
  var typeColor = { tel: '#3b82f6', sms: '#10b981', etc: '#f59e0b' };
  dummyHistory.forEach(function(h) {
    body += '<tr>';
    body += '<td style="text-align:center">' + h.no + '</td>';
    body += '<td style="text-align:center;font-weight:600;color:' + (typeColor[h.type] || '#666') + '">' + (typeMap[h.type] || h.type) + '</td>';
    body += '<td style="text-align:center">' + h.writer + '</td>';
    body += '<td style="padding:4px 8px;line-height:1.4;word-break:break-all">' + h.content + '</td>';
    body += '<td style="text-align:center;white-space:nowrap;color:var(--text-muted)">' + h.date + '</td>';
    body += '</tr>';
  });

  body += '</tbody></table>';
  body += '</div>';
  body += '</div>';

  // ══════ 탭2: 미팅등록 ══════
  body += '<div id="mm-tab-reg" class="mm-tab-panel" style="display:none">';

  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:90px"><col><col style="width:90px"><col></colgroup>';
  body += '<tbody>';

  // 회원 정보
  body += '<tr><td style="' + LB + '">회원당사자</td>';
  body += '<td style="' + VL + ';font-weight:700;color:var(--primary)">' + name1 + '</td>';
  body += '<td style="' + LB + '">담당매니저</td>';
  body += '<td style="' + VL + '">' + (m.matchingManager || '-') + '</td></tr>';
  body += '<tr><td style="' + LB + '">상대회원</td>';
  body += '<td style="' + VL + ';font-weight:700;color:#ef4444">' + name2 + '</td>';
  body += '<td style="' + LB + '">담당매니저</td>';
  body += '<td style="' + VL + '">' + tgtMgr + '</td></tr>';

  // 미팅일시
  body += '<tr><td style="' + LB + '">미팅일</td>';
  body += '<td style="' + VL + '"><input type="date" class="form-input" id="mm-date" style="font-size:12px;padding:4px 8px;width:100%"></td>';
  body += '<td style="' + LB + '">미팅시간</td>';
  body += '<td style="' + VL + '"><div style="display:flex;gap:4px;align-items:center">';
  body += '<input type="number" class="form-input" id="mm-hour" value="14" min="0" max="23" style="font-size:12px;padding:4px 6px;width:50px;text-align:center">';
  body += '<span style="color:var(--text-muted)">시</span>';
  body += '<input type="number" class="form-input" id="mm-min" value="00" min="0" max="59" step="10" style="font-size:12px;padding:4px 6px;width:50px;text-align:center">';
  body += '<span style="color:var(--text-muted)">분</span>';
  body += '</div></td></tr>';

  // 장소
  body += '<tr><td style="' + LB + '">미팅장소</td>';
  body += '<td colspan="3" style="' + VL + '"><div style="display:flex;gap:6px;align-items:center">';
  body += '<input type="text" class="form-input" id="mm-place-name" placeholder="장소명 (검색 후 자동입력)" style="font-size:12px;padding:4px 8px;flex:1" readonly>';
  body += '<button type="button" class="btn btn--outline btn--sm" id="mm-place-search" style="font-size:11px;white-space:nowrap">장소검색</button>';
  body += '</div></td></tr>';
  body += '<tr><td style="' + LB + '">주소</td>';
  body += '<td colspan="3" style="' + VL + '">';
  body += '<input type="text" class="form-input" id="mm-place-addr" placeholder="장소 검색 시 자동 입력" style="font-size:11px;padding:4px 8px;width:100%;color:var(--text-muted)" readonly>';
  body += '</td></tr>';

  // 안심번호
  body += '<tr><td style="' + LB + '">안심번호</td>';
  body += '<td style="' + VL + '"><label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="checkbox" id="mm-safe-num" checked> 안심번호 사용</label></td>';
  body += '<td style="' + LB + '">자동발송</td>';
  body += '<td style="' + VL + '"><label style="font-size:11px;cursor:pointer;display:flex;align-items:center;gap:4px"><input type="checkbox" id="mm-exclude-auto"> 자동발송 제외</label></td></tr>';

  body += '</tbody></table>';

  // 발송 예정일 안내
  body += '<div id="mm-send-info" style="padding:10px 12px;background:var(--bg-secondary);border-radius:var(--radius-sm);font-size:11px;line-height:1.6;color:var(--text-secondary);margin-top:12px">';
  body += '<span style="color:var(--text-muted)">미팅일을 선택하면 문자 발송 예정일이 표시됩니다.</span>';
  body += '</div>';

  // SMS 미리보기
  body += '<div id="mm-sms-preview" style="margin-top:10px;display:none">';
  body += '<div style="font-size:10px;font-weight:600;color:var(--text-muted);margin-bottom:4px">문자 미리보기</div>';
  body += '<div id="mm-sms-text" style="padding:10px 12px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:var(--radius-sm);font-size:11px;line-height:1.6;color:#0c4a6e;word-break:break-all"></div>';
  body += '</div>';

  // 미팅등록 하단 버튼
  body += '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px">';
  body += '<button class="btn btn--ghost btn--sm" id="mm-reg-cancel" style="font-size:12px">취소</button>';
  body += '<button class="btn btn--primary btn--sm" id="mm-reg-submit" style="font-size:12px;padding:6px 20px">미팅 등록</button>';
  body += '</div>';
  body += '</div>';

  Modal.show({
    title: '미팅관리 — ' + name1 + ' / ' + name2,
    size: 'lg',
    content: body
  });

  // ── 이벤트 바인딩 ──
  setTimeout(function() {
    // 탭 전환
    document.querySelectorAll('.mm-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.mm-tab').forEach(function(t) {
          t.style.borderBottomColor = 'transparent'; t.style.color = 'var(--text-muted)'; t.classList.remove('active');
        });
        this.style.borderBottomColor = 'var(--primary)'; this.style.color = 'var(--primary)'; this.classList.add('active');
        document.querySelectorAll('.mm-tab-panel').forEach(function(p) { p.style.display = 'none'; });
        document.getElementById(this.dataset.target).style.display = 'block';
      });
    });

    // 닫기
    var cancelBtn = document.getElementById('mm-reg-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

    // ── 미팅전 약속확인 탭 이벤트 ──
    var CB_MAP = { '사무실': '02-518-9160', '법인폰': '010-8888-9160', '전국대표': '1588-9160' };
    var apptHistoryNo = 7; // 더미 이력 다음 번호

    // 통신유형 변경 → SMS 전용 행 표시/숨김
    document.querySelectorAll('input[name="mm-comm-type"]').forEach(function(r) {
      r.addEventListener('change', function() {
        var isSms = this.value === 'sms';
        document.querySelectorAll('.mm-sms-row').forEach(function(row) {
          row.style.display = isSms ? '' : 'none';
        });
      });
    });
    // 초기: 전화확인이 기본 → SMS 행 숨기기
    document.querySelectorAll('.mm-sms-row').forEach(function(row) { row.style.display = 'none'; });

    // 받는이 본인/기타 전환
    document.querySelectorAll('input[name="mm-recv-type"]').forEach(function(r) {
      r.addEventListener('change', function() {
        var phoneInput = document.getElementById('mm-recv-phone');
        if (this.value === '본인') {
          phoneInput.value = myPhone;
          phoneInput.readOnly = true;
        } else {
          phoneInput.value = '';
          phoneInput.readOnly = false;
          phoneInput.placeholder = '번호 입력';
          phoneInput.focus();
        }
      });
    });

    // CallBack 번호 전환
    document.querySelectorAll('input[name="mm-cb-type"]').forEach(function(r) {
      r.addEventListener('change', function() {
        document.getElementById('mm-callback').value = CB_MAP[this.value] || '';
      });
    });

    // 전송방법 즉시/예약 전환
    document.querySelectorAll('input[name="mm-send-method"]').forEach(function(r) {
      r.addEventListener('change', function() {
        document.getElementById('mm-send-reserve').style.display = this.value === '예약' ? '' : 'none';
      });
    });

    // 등록하기
    var apptRegBtn = document.getElementById('mm-appt-register');
    if (apptRegBtn) apptRegBtn.addEventListener('click', function() {
      var commType = document.querySelector('input[name="mm-comm-type"]:checked').value;
      var content = document.getElementById('mm-appt-content').value.trim();
      if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }

      var typeMap = { tel: '전화', sms: 'SMS', etc: '비고' };
      var typeColor = { tel: '#3b82f6', sms: '#10b981', etc: '#f59e0b' };
      var now = new Date();
      var dateStr = (now.getMonth() + 1).toString().padStart(2, '0') + '.' + now.getDate().toString().padStart(2, '0') + ' ' + now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      var writer = m.matchingManager || '매니저';

      // 이력 테이블에 행 추가
      var tbody = document.getElementById('mm-appt-history-body');
      if (tbody) {
        var newRow = document.createElement('tr');
        newRow.style.background = '#fffbeb';
        newRow.innerHTML = '<td style="text-align:center">' + apptHistoryNo + '</td>'
          + '<td style="text-align:center;font-weight:600;color:' + (typeColor[commType] || '#666') + '">' + (typeMap[commType] || commType) + '</td>'
          + '<td style="text-align:center">' + writer + '</td>'
          + '<td style="padding:4px 8px;line-height:1.4;word-break:break-all">' + content + '</td>'
          + '<td style="text-align:center;white-space:nowrap;color:var(--text-muted)">' + dateStr + '</td>';
        tbody.insertBefore(newRow, tbody.firstChild);
        apptHistoryNo++;
      }

      document.getElementById('mm-appt-content').value = '';

      if (commType === 'sms') {
        Toast.show('SMS가 발송되었습니다.', 'success');
      } else if (commType === 'tel') {
        Toast.show('전화 확인 이력이 등록되었습니다.', 'success');
      } else {
        Toast.show('비고가 등록되었습니다.', 'success');
      }
    });

    // 장소 검색
    var selectedPlace = null;
    var placeBtn = document.getElementById('mm-place-search');
    if (placeBtn) placeBtn.addEventListener('click', function() {
      PlaceSearch.open(function(sel) {
        selectedPlace = sel;
        document.getElementById('mm-place-name').value = sel.name;
        document.getElementById('mm-place-addr').value = sel.addr;
        updateMmSendInfo();
      }, document.getElementById('mm-place-name').value || '');
    });

    // 발송 예정일 업데이트
    function updateMmSendInfo() {
      var dateVal = document.getElementById('mm-date').value;
      var infoEl = document.getElementById('mm-send-info');
      var previewWrap = document.getElementById('mm-sms-preview');
      var smsTextEl = document.getElementById('mm-sms-text');
      var excludeAuto = document.getElementById('mm-exclude-auto').checked;
      var useSafe = document.getElementById('mm-safe-num').checked;

      if (!dateVal) {
        infoEl.innerHTML = '<span style="color:var(--text-muted)">미팅일을 선택하면 문자 발송 예정일이 표시됩니다.</span>';
        previewWrap.style.display = 'none';
        return;
      }
      if (excludeAuto) {
        infoEl.innerHTML = '<span style="color:var(--status-amber);font-weight:600">자동발송 제외</span> — 수동으로 문자를 발송해야 합니다.';
        previewWrap.style.display = 'none';
        return;
      }
      var sendDate = calcSmsSendDate(dateVal);
      var d1 = new Date(dateVal); d1.setDate(d1.getDate() - 1);
      var isHolidayD1 = !isBusinessDay(d1);

      var html = '';
      if (useSafe) {
        html += '<div style="margin-bottom:4px"><span style="color:var(--primary);font-weight:700">발송 예정일: ' + sendDate.toISOString().slice(0, 10) + ' (' + formatDateKr(sendDate) + ')</span></div>';
        html += '<div style="color:var(--text-muted);font-size:10px">미팅일 D-1 기준 자동 발송 (안심번호 포함)</div>';
        if (isHolidayD1) {
          html += '<div style="margin-top:4px;padding:4px 8px;background:#fef3c7;border-radius:4px;color:#92400e;font-size:10px;font-weight:600">';
          html += '미팅일 전날이 휴일이므로 직전 영업일(' + formatDateKr(sendDate) + ')에 발송됩니다.</div>';
        }
      } else {
        html += '<span style="color:var(--text-muted)">안심번호 미사용 — 일반 안내문자만 발송됩니다.</span>';
      }
      infoEl.innerHTML = html;

      if (useSafe && !excludeAuto) {
        var hourVal = document.getElementById('mm-hour').value;
        var minVal = document.getElementById('mm-min').value;
        var pName = selectedPlace ? selectedPlace.name : '';
        var pAddr = selectedPlace ? selectedPlace.addr : '';
        smsTextEl.textContent = buildSmsPreview(name2, null, dateVal, hourVal, minVal, pName, pAddr);
        previewWrap.style.display = 'block';
      } else {
        previewWrap.style.display = 'none';
      }
    }

    // 이벤트 연결
    ['mm-date', 'mm-hour', 'mm-min', 'mm-safe-num', 'mm-exclude-auto'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('change', updateMmSendInfo);
    });

    // 미팅 등록 처리
    var submitBtn = document.getElementById('mm-reg-submit');
    if (submitBtn) submitBtn.addEventListener('click', function() {
      var dateVal = document.getElementById('mm-date').value;
      var placeName = document.getElementById('mm-place-name').value.trim();
      if (!dateVal) { Toast.show('미팅일을 선택해주세요.', 'warning'); return; }
      if (!placeName) { Toast.show('미팅 장소를 선택해주세요.', 'warning'); return; }

      var useSafe = document.getElementById('mm-safe-num').checked;
      var excludeAuto = document.getElementById('mm-exclude-auto').checked;
      var sendDate = calcSmsSendDate(dateVal);

      Modal.hide();
      Toast.show('미팅이 등록되었습니다.', 'success');

      if (useSafe && !excludeAuto) {
        setTimeout(function() {
          Toast.show('안심번호 문자가 ' + formatDateKr(sendDate) + '에 자동 발송됩니다.', 'info');
        }, 800);
      }
    });
  }, 120);
}

/* ═══════════════════════════════════════════
   특이사항 등록 모달
   ═══════════════════════════════════════════ */

/**
 * 권한별 특이사항 구분 매핑
 * - consultant(컨설턴트) → '상담' 고정
 * - manager(매니저)      → '관리' 고정 (매칭매니저일 경우 '매칭')
 * - admin / director      → 전체 선택 가능
 * - legal                 → '관리' 고정
 * - viewer                → 등록 불가
 */
var ROLE_SN_MAP = {
  consultant: '상담',
  manager: '관리',
  legal: '관리',
  viewer: null
};

function showSpecialNoteModal(m) {
  var LB = 'background:var(--bg-secondary);font-weight:600;width:80px;text-align:center;white-space:nowrap';
  var VL = 'padding:6px 12px';

  // 로그인 사용자 정보
  var user = Auth.getUser() || { name: '관리자', role: 'admin' };
  var userRole = user.role || 'admin';
  var userName = user.name || '매니저';

  // viewer는 등록 불가
  if (userRole === 'viewer') {
    Toast.show('등록 권한이 없습니다.', 'warning');
    return;
  }

  // 권한별 구분 결정
  var fixedType = ROLE_SN_MAP[userRole] || null; // null이면 전체 선택 가능 (admin/director)
  // 매칭매니저인 경우 '매칭'으로 자동 설정
  if (userRole === 'manager' && m.matchingManager && m.matchingManager === userName) {
    fixedType = '매칭';
  }
  var canSelect = !fixedType; // admin, director는 선택 가능

  var body = '';
  body += '<table class="data-table data-table--bordered" style="font-size:12px;width:100%;table-layout:fixed">';
  body += '<colgroup><col style="width:80px"><col></colgroup>';
  body += '<tbody>';

  // 작성자
  body += '<tr><td style="' + LB + '">작성자</td>';
  body += '<td style="' + VL + '">' + userName + ' <span style="color:var(--text-muted);font-size:11px">(' + userRole + ')</span></td></tr>';

  // 구분
  body += '<tr><td style="' + LB + '">구분</td>';
  body += '<td style="' + VL + '">';
  if (canSelect) {
    // admin/director: 전체 선택 가능
    body += '<div style="display:flex;gap:12px;align-items:center">';
    body += '<label style="font-size:12px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="sn-type" value="관리" checked> 관리</label>';
    body += '<label style="font-size:12px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="sn-type" value="상담"> 상담</label>';
    body += '<label style="font-size:12px;cursor:pointer;display:flex;align-items:center;gap:3px"><input type="radio" name="sn-type" value="매칭"> 매칭</label>';
    body += '</div>';
  } else {
    // 권한에 따라 고정 (readonly)
    var typeColor = { '관리': '#3b82f6', '상담': '#10b981', '매칭': '#f59e0b' };
    body += '<span style="font-weight:700;color:' + (typeColor[fixedType] || '#666') + '">' + fixedType + '</span>';
    body += '<input type="hidden" name="sn-type" value="' + fixedType + '">';
    body += '<span style="font-size:10px;color:var(--text-muted);margin-left:8px">(권한에 따라 자동 설정)</span>';
  }
  body += '</td></tr>';

  // 내용
  body += '<tr><td style="' + LB + '">내용</td>';
  body += '<td style="' + VL + '"><textarea class="form-input" id="sn-content" rows="4" style="font-size:12px;padding:6px 8px;width:100%;resize:vertical" placeholder="특이사항을 입력하세요"></textarea></td></tr>';

  body += '</tbody></table>';

  // 하단 버튼
  body += '<div style="display:flex;justify-content:flex-end;gap:8px;padding-top:12px">';
  body += '<button class="btn btn--ghost btn--sm" id="sn-cancel" style="font-size:12px">취소</button>';
  body += '<button class="btn btn--primary btn--sm" id="sn-submit" style="font-size:12px;padding:6px 20px">등록</button>';
  body += '</div>';

  Modal.show({
    title: '특이사항 등록',
    size: 'md',
    content: body
  });

  setTimeout(function() {
    var cancelBtn = document.getElementById('sn-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', function() { Modal.hide(); });

    var submitBtn = document.getElementById('sn-submit');
    if (submitBtn) submitBtn.addEventListener('click', function() {
      var content = document.getElementById('sn-content').value.trim();
      if (!content) { Toast.show('내용을 입력해주세요.', 'warning'); return; }

      // 구분 값 가져오기 (라디오 또는 hidden)
      var snTypeEl = document.querySelector('input[name="sn-type"]:checked') || document.querySelector('input[name="sn-type"]');
      var snType = snTypeEl ? snTypeEl.value : '관리';
      var writer = userName;
      var now = new Date();
      var dateStr = now.getFullYear() + '.' + ('0' + (now.getMonth() + 1)).slice(-2) + '.' + ('0' + now.getDate()).slice(-2) + ' ' + ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
      var typeColor = { '관리': '#3b82f6', '상담': '#10b981', '매칭': '#f59e0b' };

      // 테이블에 행 추가
      var tbl = document.getElementById('tbl-special-notes');
      if (tbl) {
        var tbody = tbl.querySelector('tbody');
        if (tbody) {
          var rowCount = tbody.querySelectorAll('tr').length;
          var newRow = document.createElement('tr');
          newRow.style.background = '#fffbeb';
          newRow.innerHTML = '<td style="text-align:center">' + (rowCount + 1) + '</td>'
            + '<td style="text-align:center">' + writer + '</td>'
            + '<td style="text-align:center;font-weight:600;color:' + (typeColor[snType] || '#666') + '">' + snType + '</td>'
            + '<td style="text-align:center;white-space:nowrap;font-size:12px;color:#666">' + dateStr + '</td>'
            + '<td style="line-height:1.5">' + content + '</td>';
          tbody.insertBefore(newRow, tbody.firstChild);
        }
      }

      Modal.hide();
      Toast.show('특이사항이 등록되었습니다.', 'success');
    });
  }, 100);
}
